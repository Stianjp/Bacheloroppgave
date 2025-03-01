// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// RUTER
import clearDataRouter from "./api/clearData.js";
import saveDataRouter from "./api/saveData.js";
import chatRouter from "./api/chat.js"; 

dotenv.config();

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json()); // 🚨 VIKTIG! Uten dette kan ikke Express lese JSON-body
app.use("/api/clearData", saveDataRouter); // 🚨 Sletter data ved refresh

// Hvis du ikke bruker openai direkte i server.js kan du fjerne dette:
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Sørg for at "data/"-mappen eksisterer
if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

// Tømmer/oppretter userData.json ved serverstart (om du ønsker)
const filePath = path.join("data", "userData.json");
if (fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "[]", "utf-8");
  console.log("✅ userData.json tømt ved serverstart");
} else {
  fs.writeFileSync(filePath, "[]", "utf-8");
  console.log("✅ userData.json opprettet og tømt ved serverstart");
}

// 🔹 Bruk rutene du faktisk ønsker å beholde
app.use("/api/clearData", clearDataRouter);
app.use("/api/saveData", saveDataRouter);
app.use("/api/chat", chatRouter); 

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server kjører på port ${PORT}`));