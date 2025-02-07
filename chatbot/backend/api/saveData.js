import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const filePath = path.join("data", "userData.json");

// **Lagre brukerdata i JSON-fil**
router.post("/", (req, res) => {
  try {
    const { consent, data } = req.body;

    if (!consent) {
      return res.status(403).json({ error: "Samtykke kreves for lagring." });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Ingen brukerdata mottatt." });
    }

    let storedData = [];

    // Hvis filen eksisterer, les eksisterende data
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath);
      storedData = JSON.parse(rawData);
    }

    // Legg til ny data
    storedData.push({
      timestamp: new Date().toISOString(),
      ...data
    });

    // Skriv til JSON-fil
    fs.writeFileSync(filePath, JSON.stringify(storedData, null, 2));

    res.json({ message: "✅ Data lagret i JSON-fil." });
  } catch (error) {
    console.error("❌ Feil ved lagring av data:", error);
    res.status(500).json({ error: "Kunne ikke lagre data." });
  }
});

export default router;