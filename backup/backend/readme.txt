TO start - 
        cd backend
        npm init -y
        npm install express cors

File - server.js 

        const express = require("express");
        const cors = require("cors");

        const app = express();

        app.use(cors());
        app.use(express.json());

        app.get("/", (req, res) => {
        res.send("Backend is running 🚀");
        });

        app.listen(5000, () => {
        console.log("Server running on http://localhost:5000");
        });

AI API - Gemini
        "npm install @google/generative-ai"