const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDIxCe4sb6Fho3NpxxBJR-b1SC8fXQKzTs");

const express = require("express");
const cors = require("cors");

const app = express();

let lastImageCall = 0;
let lastTextCall = 0;
const COOLDOWN = 4000; // 4 seconds

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/analyze", async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastImageCall < COOLDOWN) {
      return res.json({ result: "⏳ Skipping frame (cooldown active)" });
    }
    lastImageCall = now;

    const { image } = req.body;

    const base64Data = image.split(",")[1];

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png",
        },
      },
      "What do you see in this image? Is it safe or suspicious?",
    ]);

    const response = await result.response;
    const text = response.text();

    res.json({ result: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

app.post("/analyze-text", async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastTextCall < COOLDOWN) {
      return res.json({ result: "⏳ Please wait before next request" });
    }
    lastTextCall = now;

    const { text } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(
      `Analyze this message for scams or phishing and give a short answer: ${text}`
    );

    const response = await result.response;
    const output = response.text();

    res.json({ result: output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Text analysis failed" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});