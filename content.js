// Debounce function to optimize performance
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to insert or update the autocomplete suggestion
function updateAutocompleteSuggestion(inputElement) {
    const suggestion = "test!";
    const currentValue = inputElement.value;

    // Check if the input field is empty
    if (currentValue.trim() === "") {
        // Remove the suggestion if it exists
        const existingSuggestion = inputElement.nextElementSibling;
        if (existingSuggestion && existingSuggestion.classList.contains("autocomplete-suggestion")) {
            existingSuggestion.remove();
        }
        return; // Exit the function if the input is empty
    }

    // Check if the suggestion element already exists
    let suggestionElement = inputElement.nextElementSibling;
    if (!suggestionElement || !suggestionElement.classList.contains("autocomplete-suggestion")) {
        // Create a new suggestion element if it doesn't exist
        suggestionElement = document.createElement("span");
        suggestionElement.classList.add("autocomplete-suggestion");
        suggestionElement.style.color = "#ccc"; // Light gray color
        inputElement.insertAdjacentElement("afterend", suggestionElement);
    }

    // Update the suggestion text
    suggestionElement.textContent = suggestion;

    // Handle Tab key press
    inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Tab") {
            event.preventDefault(); // Prevent default Tab behavior
            inputElement.value = currentValue + suggestion;
            suggestionElement.remove(); // Remove the suggestion after autocompleting
        }
    });

    // Remove the suggestion if the user continues typing
    inputElement.addEventListener("input", () => {
        const existingSuggestion = inputElement.nextElementSibling;
        if (existingSuggestion && existingSuggestion.classList.contains("autocomplete-suggestion")) {
            existingSuggestion.remove();
        }
    });
}

// Function to check for input elements and add autocomplete
function addAutocompleteToInputs() {
    const inputElements = document.querySelectorAll("input[type='text'], textarea");
    inputElements.forEach((inputElement) => {
        inputElement.addEventListener(
            "input",
            debounce(() => updateAutocompleteSuggestion(inputElement), 300) // 300ms debounce
        );
    });
}

// Run the function when the page loads
addAutocompleteToInputs();

// Also run the function when new input elements are added dynamically
const observer = new MutationObserver(addAutocompleteToInputs);
observer.observe(document.body, { childList: true, subtree: true });