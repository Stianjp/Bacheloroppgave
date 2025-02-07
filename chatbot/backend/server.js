import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

dotenv.config(); 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// 🔹 **Oppdatert CORS-konfigurasjon for å håndtere preflight requests**
const corsOptions = {
  origin: "http://localhost:3000", // ✅ Tillat forespørsler fra frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔹 **Håndterer OPTIONS-forespørsler eksplisitt**
app.options("*", cors(corsOptions));

const PORT = process.env.PORT || 5001;
const filePath = path.join("data", "userData.json");

// Sørg for at `data`-mappen finnes
if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

// 🔹 **API-endepunkt for Chat med GPT**
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ Feil i OpenAI API:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 **API-endepunkt for lagring av data i JSON-fil**
app.post("/api/saveData", (req, res) => {
  try {
    const { consent, data } = req.body;

    if (!consent) {
      return res.status(403).json({ error: "Samtykke kreves for lagring." });
    }

    let storedData = [];

    // Hvis filen eksisterer, les eksisterende data
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath);
      storedData = JSON.parse(rawData);
    }

    // Legg til ny data
    storedData.push({ timestamp: new Date().toISOString(), ...data });

    // Skriv til JSON-fil
    fs.writeFileSync(filePath, JSON.stringify(storedData, null, 2));

    res.json({ message: "✅ Data lagret i JSON-fil." });
  } catch (error) {
    console.error("❌ Feil ved lagring av data:", error);
    res.status(500).json({ error: "Kunne ikke lagre data." });
  }
});

// **Eksplicit OPTIONS-håndtering**
app.options("/api/saveData", (req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`✅ Server kjører på port ${PORT}`));