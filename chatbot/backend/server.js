import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config(); // Må være før OpenAI-klienten
console.log("API-nøkkel:", process.env.OPENAI_API_KEY);

const openai = new OpenAI({ // ✅ Definer `openai`-objektet riktig
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("✅ Mottatt melding fra frontend:", message);

    const completion = await openai.chat.completions.create({ // ✅ Bruk `openai`-objektet riktig
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    console.log("✅ Svar fra OpenAI:", completion.choices[0].message.content);
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ Feil i OpenAI API:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server kjører på port ${PORT}`));