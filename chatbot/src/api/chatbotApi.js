// chatbotApi.js

import axios from "axios";

const API_URL = "http://localhost:5001"; // 🚨 Er dette riktig backend-url?

export const saveData = async (consent, messages) => {
  try {
      const response = await fetch("http://localhost:5001/api/saveData", { // 🚨 Bruk '/api/saveData'!
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent, data: messages }),
      });

      const result = await response.json();
      console.log("Lagringsresultat:", result);
  } catch (error) {
      console.error("Feil ved lagring:", error);
  }
};

export const clearBackendData = async () => {
  try {
      const response = await fetch("http://localhost:5001/api/clearData", { // 🚨 Bruk riktig sti!
          method: "DELETE",
      });

      const result = await response.json();
      console.log("Sletting av data:", result);
  } catch (error) {
      console.error("Feil ved sletting av data:", error);
  }
};

// (Valgfritt) Du kan fjerne analyzeUserData og reanalyzeUserData 
// helt hvis du ikke skal bruke dem i det nye oppsettet.