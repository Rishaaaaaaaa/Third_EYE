const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

let lastImageCall = 0;
let lastTextCall = 0;
const COOLDOWN = 4000; // 4 seconds

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Ollama Backend is running 🚀");
});

// 🔥 IMAGE ANALYSIS (using LLaVA)
app.post("/analyze", async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastImageCall < COOLDOWN) {
      return res.json({ result: "⏳ Skipping frame (cooldown active)" });
    }
    lastImageCall = now;

    const { image } = req.body;
    const base64Data = image.split(",")[1];

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llava",
      prompt: "Describe this image and tell if it is safe or suspicious.",
      images: [base64Data],
      stream: false
    });

    const text = response.data.response || "No response";

    res.json({ result: text });

  } catch (err) {
    console.error("Ollama Error:", err.message);
    res.status(500).json({ error: "Ollama failed" });
  }
});

// 🔥 TEXT ANALYSIS
app.post("/analyze-text", async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastTextCall < COOLDOWN) {
      return res.json({ result: "⏳ Please wait before next request" });
    }
    lastTextCall = now;

    const { text } = req.body;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llava",
      prompt: `Analyze this message for scams or phishing and give a short answer: ${text}`,
      stream: false
    });

    const output = response.data.response || "No response";

    res.json({ result: output });

  } catch (err) {
    console.error("Ollama Error:", err.message);
    res.status(500).json({ error: "Text analysis failed" });
  }
});

app.listen(3001, () => {
  console.log("Ollama Server running on http://localhost:3001");
});