# 👁️ Third Eye - Real-Time AI Companion

Third Eye is a real-time AI vision and voice assistant web application. It acts as a smart environmental guide, analyzing live camera feeds locally and speaking out actionable, meaningful changes in your surroundings, while filtering out repetitive noise.

## ✨ Features

- **Live Scene Analysis:** Continuously monitors the camera feed and describes the environment.
- **Smart Filtering:** Only speaks when a new scene or important object (like a person, phone, or obstacle) is detected. Stays completely silent when there are no meaningful changes.
- **Voice Trigger:** Say *"Hey Third Eye"* or *"Hey AI"* to immediately capture the scene and force a spoken response, bypassing all cooldowns.
- **Text-to-Speech (TTS):** Reads out the AI's analysis naturally.
- **100% Local AI:** Uses Ollama and the Moondream vision model to process images locally, ensuring privacy and zero API costs.

## 🛠️ Tech Stack

- **Frontend:** React, WebRTC (Camera), Web Speech API (Voice Trigger), SpeechSynthesis (TTS)
- **Backend:** Node.js, Express, Axios
- **AI/ML:** Ollama, Moondream model

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [Ollama](https://ollama.com/) (Running locally)

You also need to pull the Moondream model via Ollama:
```bash
ollama run moondream
```

## ⚙️ Installation & Setup

### 1. Backend Setup
Navigate to your backend directory and install dependencies:
```bash
cd backend # (or whatever your backend folder is named)
npm install express cors axios
```

Start the Node.js server:
```bash
node server_live.js
```
*(The server will run on `http://localhost:3001`)*

### 2. Frontend Setup
Navigate to your React frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the React application:
```bash
npm start
```
*(The app will open in your browser, typically on `http://localhost:3000`)*

## 🎮 How to Use

1. **Grant Permissions:** Allow the browser to access your camera and microphone.
2. **Turn Camera On:** Click the button to activate your webcam.
3. **Start Live Mode:** The system will capture a frame every 4 seconds and analyze it. It will only speak if it detects something new or important.
4. **Voice Trigger:** Click "Start Voice Trigger". You can now say *"Hey Third Eye"* to force an immediate capture and description of the current scene.
5. **Mute/Unmute:** Toggle the voice output as needed.

## 🧠 How the Smart Filter Works

To prevent the AI from constantly narrating "this is an empty room," the system uses a combination of frontend and backend logic:
- **Short Prompts:** The backend forces the Moondream model to give brief, one-phrase descriptions.
- **Duplicate Checking:** The frontend caches the last spoken phrase. If the new description matches, the AI stays silent.
- **Force Flag:** Voice wake words send a special `force` flag to the backend, completely bypassing the 4-second API cooldown and the duplicate text filters.

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).