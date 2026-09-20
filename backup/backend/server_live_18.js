const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

let lastImageCall = 0;
let lastTextCall = 0;
const COOLDOWN = 4000; // 4 seconds

let lastResponseText = "";
let lastResponseTime = 0;
const RESPONSE_WINDOW = 60000; // 1 minute

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Ollama Backend is running 🚀");
});

// 🔥 IMAGE ANALYSIS (using LLaVA)
app.post("/analyze", async (req, res) => {
  try {
    const { image, force } = req.body;
    const now = Date.now();

    // Bypass cooldown if force is true (wake word detected)
    if (!force && now - lastImageCall < COOLDOWN) {
      return res.json({ result: null });
    }
    lastImageCall = now;

    const base64Data = image.split(",")[1];

    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "moondream",
      messages: [
        {
          role: "user",
          content: "Act as a safety assistant. Do NOT describe normal objects. Only report if something important, unusual, or risky is present. Keep response short and alert-focused.",
          images: [base64Data]
        }
      ],
      stream: false
    });

    const text = response.data.message?.content || "No response";

    const nowTime = Date.now();

    // simple importance keywords
    const importantKeywords = ["danger", "warning", "suspicious", "unsafe", "alert"];

    // check if response is important
    const isImportant = importantKeywords.some(word =>
      text.toLowerCase().includes(word)
    );

    // check if response changed significantly
    const isDifferent = text.trim() !== lastResponseText.trim();

    // decide whether to send response
    if (isImportant || isDifferent || (nowTime - lastResponseTime > RESPONSE_WINDOW)) {
      lastResponseText = text;
      lastResponseTime = nowTime;
      return res.json({ result: text });
    } else {
      return res.json({ result: null });
    }

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
      model: "moondream",
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