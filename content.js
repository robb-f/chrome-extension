// Inject CSS for inline suggestion styling
const style = document.createElement("style");
style.textContent = `
.autocomplete-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.suggestion-span {
  position: absolute;
  top: 0;
  left: 0;
  color: #ccc;
  pointer-events: none;
  font: inherit;
  white-space: pre-wrap;
  overflow: hidden;
  visibility: hidden;
  word-wrap: break-word;
}
`;
document.head.appendChild(style);

// Function to create or update wrapper and suggestion span
function createOrUpdateElements(inputElement) {
  let wrapper = inputElement.parentElement;

  // If input isn't wrapped yet, wrap it
  if (!wrapper?.classList.contains("autocomplete-wrapper")) {
    wrapper = document.createElement("div");
    wrapper.className = "autocomplete-wrapper";
    wrapper.style.position = "relative";

    inputElement.parentNode.insertBefore(wrapper, inputElement);
    wrapper.appendChild(inputElement);
  }

  // Find or create suggestion span
  let suggestionSpan = wrapper.querySelector(".suggestion-span");
  if (!suggestionSpan) {
    suggestionSpan = document.createElement("span");
    suggestionSpan.className = "suggestion-span";
    wrapper.appendChild(suggestionSpan);
  }

  return suggestionSpan;
}

async function fetchAutocompleteSuggestion(inputText) {
  try {
    const response = await fetch("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: "mistral", 
        prompt: `You are a sentence completing AI.
          You must either autocomplete the last word, the rest of the sentence, or end the sentence naturally.
          
          Here are some examples:
          1. "When do you ne" -> "ed this by?"
          2. "You will never believe what Bob" -> " said to me last night"
          3. "Did you know that my mom " -> "said I can sleep over at your house tonight?"
          
          Return ONLY the part of the string that would complete the word/sentence/thought.
          DO NOT INCLUDE ANY EXTRANEOUS INFORMATION OR EXPLANATIONS.

          Do not include things like quotation marks UNLESS ABSOLUTELY NECESSARY (e.g., you are trying
          to autocomplete a conversation).

          Only respond with ONE suggestion, not more.
          
          Here is the input text: "${inputText}"`, 
        stream: false 
      }),
    });

    const data = await response.json();

    if (!data || !data.response) {
      throw new Error("Invalid response from Ollama: " + JSON.stringify(data));
    }

    console.log("AI Response:", data.response.trim());
    return data.response.trim();  // Ensure response is returned properly
  } catch (error) {
    console.error("Error:", error);
    return "";  // Return an empty string if an error occurs
  }
}


// Function to calculate text width
function getTextWidth(text, element) {
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = window.getComputedStyle(element).font;
  return context.measureText(text).width;
}

// Function to update autocomplete suggestion
async function updateAutocompleteSuggestion(inputElement) {
  const currentValue = inputElement.value.trim();
  if (!currentValue) return;

  const suggestionSpan = createOrUpdateElements(inputElement);

  // Fetch AI-generated autocomplete suggestion
  const suggestionText = await fetchAutocompleteSuggestion(currentValue);
  if (!suggestionText) {
    suggestionSpan.textContent = "";
    suggestionSpan.style.visibility = "hidden";
    return;
  }

  suggestionSpan.textContent = suggestionText;
  suggestionSpan.style.visibility = "visible";

  // Store suggestion data
  inputElement.dataset.suggestion = suggestionText;

  // If input is empty, clear suggestion
  if (!currentValue.trim()) {
    suggestionSpan.textContent = "";
    suggestionSpan.style.visibility = "hidden";
    return;
  }

  // Create a hidden mirror element to measure text position
  const mirror = document.createElement("div");
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.overflow = "hidden";

  // Copy input styles to the mirror
  const styles = window.getComputedStyle(inputElement);
  [
    "font", "fontSize", "fontFamily", "padding", "boxSizing", "lineHeight",
    "width", "border", "letterSpacing", "textTransform"
  ].forEach(prop => {
    mirror.style[prop] = styles[prop];
  });

  // Set mirror width to match input (excluding scrollbar width)
  mirror.style.width = `${inputElement.clientWidth}px`;

  // Copy text into mirror with a special marker at the last character
  mirror.textContent = currentValue;
  const marker = document.createElement("span");
  marker.textContent = "|";  // Invisible marker to detect position
  mirror.appendChild(marker);

  // Append mirror inside the same container to keep relative positioning
  inputElement.parentNode.appendChild(mirror);

  // Get position of the marker
  const markerRect = marker.getBoundingClientRect();
  const inputRect = inputElement.getBoundingClientRect();

  // Position the suggestion span exactly after the last character
  suggestionSpan.style.left = `${markerRect.left - inputRect.left}px`;
  suggestionSpan.style.top = `${markerRect.top - inputRect.top - 255}px`;  // Adjust for vertical misalignment
  suggestionSpan.style.visibility = "visible";

  // Remove mirror after calculation
  inputElement.parentNode.removeChild(mirror);

  // Update suggestion content
  suggestionSpan.textContent = suggestionText;
  suggestionSpan.style.visibility = "visible";

  // Store suggestion data
  inputElement.dataset.suggestion = suggestionText;
}

// Function to handle key interactions
function handleKeyDown(event) {
  const inputElement = event.target;
  const suggestionSpan = inputElement.parentElement?.querySelector(".suggestion-span");

  if (event.key === "Tab" && inputElement.dataset.suggestion) {
    event.preventDefault();
    inputElement.value += inputElement.dataset.suggestion;
    if (suggestionSpan) suggestionSpan.textContent = "";
  } else if (event.key === "Escape") {
    if (suggestionSpan) suggestionSpan.textContent = "";
  }
}

// Debounce function for performance optimization
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Function to add autocomplete to all textareas and inputs
function addAutocompleteToInputs() {
  document.querySelectorAll("textarea, input[type='text']").forEach((inputElement) => {
    if (!inputElement.hasAttribute("data-autocomplete")) {
      inputElement.setAttribute("data-autocomplete", "true");

      // Attach debounced event listener for input changes
      inputElement.addEventListener("input", (event) => {
        const suggestionSpan = inputElement.parentElement?.querySelector(".suggestion-span");
        if (suggestionSpan) {
          suggestionSpan.textContent = ""; // Clear immediately
          suggestionSpan.style.visibility = "hidden";
        }
        
        // Debounced update
        debounce(() => updateAutocompleteSuggestion(inputElement), 1000)();
      });

      // Attach keydown listener for accepting/removing suggestions
      inputElement.addEventListener("keydown", handleKeyDown);
      
      // Fix position when scrolling inside a textarea
      inputElement.addEventListener("scroll", () => updateAutocompleteSuggestion(inputElement));
    }
  });
}

// Run function when page loads
addAutocompleteToInputs();

// Observe dynamically added inputs
new MutationObserver(addAutocompleteToInputs).observe(document.body, { childList: true, subtree: true });