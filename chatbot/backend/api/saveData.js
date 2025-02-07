const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const filePath = path.join(__dirname, "../data/userData.json");

// Lagre data til JSON-fil
router.post("/", (req, res) => {
  const { consent, data } = req.body;

  if (!consent) {
    return res.status(403).json({ error: "Samtykke kreves for lagring." });
  }

  let storedData = [];
  if (fs.existsSync(filePath)) {
    storedData = JSON.parse(fs.readFileSync(filePath));
  }

  storedData.push({ timestamp: new Date().toISOString(), ...data });

  fs.writeFileSync(filePath, JSON.stringify(storedData, null, 2));

  res.json({ message: "Data lagret." });
});

module.exports = router;