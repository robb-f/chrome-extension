const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow CORS from any origin
app.use(express.json()); // Parse JSON requests

// Proxy request to Ollama
app.post("/api/generate", async (req, res) => {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body), // Forward request body to Ollama
    });

    const data = await response.json();
    res.json(data); // Send the response back to the client
  } catch (error) {
    res.status(500).json({ error: "Error fetching from Ollama" });
  }
});

// Start the proxy server
const PORT = 3000;
app.get("/", (req, res) => {
    res.send("Ollama Proxy Server is Running!");
  });
  
app.listen(PORT, () => console.log(`CORS Proxy running on http://localhost:${PORT}`));