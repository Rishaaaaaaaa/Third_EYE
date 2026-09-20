const WebSocket = require("ws");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDIxCe4sb6Fho3NpxxBJR-b1SC8fXQKzTs",
});

const wss = new WebSocket.Server({ port: 3002 });

console.log("🔥 Live AI Server running on ws://localhost:3002");

wss.on("connection", async (ws) => {
  console.log("✅ Client connected");

  let session;

  try {
    // Create LIVE session
    session = await ai.live.connect({
      model: "gemini-3-flash-live-preview",
      config: {
        responseModalities: ["TEXT"],
      },
    });

    console.log("🤖 Gemini Live session started");

  } catch (err) {
    console.error("❌ Failed to start Gemini session:", err.message);
    ws.send("⚠️ Gemini session failed");
    return;
  }

  ws.on("message", async (message) => {
    try {
      console.log("📸 Frame received");

      const base64Data = message.toString().split(",")[1];

      // Send frame to Gemini Live
      await session.sendClientContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Analyze this image and tell if safe or suspicious",
              },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "image/png",
                },
              },
            ],
          },
        ],
      });

      // Fallback response (since streaming not working)
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Analyze this image and tell if safe or suspicious",
              },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "image/png",
                },
              },
            ],
          },
        ],
      });

      const text = response.output_text || "No response";
      console.log("🤖 AI:", text);
      ws.send(text);

    } catch (err) {
      console.error("❌ Live AI error:", err.message);
      ws.send("⚠️ AI Error");
    }
  });

  ws.on("close", async () => {
    console.log("❌ Client disconnected");
    if (session) {
      await session.close();
    }
  });
});