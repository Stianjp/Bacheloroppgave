import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import analyzeUserRouter from "./api/analyzeUser.js";
import clearDataRouter from "./api/clearData.js";
import saveDataRouter from "./api/saveData.js"; // ✅ Importer saveData.js

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5001;
const filePath = path.join("data", "userData.json");

// **Sørg for at `data/`-mappen eksisterer**
if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

// **Tømmer `userData.json` ved serverstart**
if (fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "[]", "utf-8");
  console.log("✅ userData.json tømt ved serverstart");
} else {
  fs.writeFileSync(filePath, "[]", "utf-8");
  console.log("✅ userData.json opprettet og tømt ved serverstart");
}

// 🔹 **Bruk API-ruter**
app.use("/api/analyzeUser", analyzeUserRouter);
app.use("/api/clearData", clearDataRouter);
app.use("/api/saveData", saveDataRouter); // ✅ Legger til saveData.js

app.listen(PORT, () => console.log(`✅ Server kjører på port ${PORT}`));