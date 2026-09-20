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

// 🔥 IMAGE ANALYSIS
app.post("/analyze", async (req, res) => {
  try {
    const { image, force } = req.body;
    const now = Date.now();

    // ✅ Bypass cooldown if forceSpeak is triggered by the wake word
    if (!force && now - lastImageCall < COOLDOWN) {
      return res.json({ result: null });
    }
    lastImageCall = now;

    const base64Data = image.split(",")[1];

    // Improved llava prompt: Forces ultra-short, guidance-style output
      const response = await axios.post("http://localhost:11434/api/chat", {
      model: "llava",
      messages: [
        {
          role: "user",
          content: "Briefly describe the main subject in this image in one short phrase.",
          images: [base64Data]
        }
      ],
      stream: false
    });


    const text = response.data.message?.content || "No response";

    // The frontend now handles the smart filtering (Step 4), 
    // so we just return the raw, shortened text here.
    return res.json({ result: text });

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
