// chatbotApi.js

const API_BASE_URL = "http://localhost:5001/api";

// 1) Tømmer all data i backend
export const clearBackendData = async () => {
  try {
    await fetch(`${API_BASE_URL}/clearData`, { method: "POST" });
  } catch (error) {
    console.error("❌ Feil ved tømming av data:", error);
  }
};

// 2) Lagrer brukerdata i backend (hvis samtykke)
export const saveUserData = async (consent, userData) => {
  if (!consent) return;
  try {
    await fetch(`${API_BASE_URL}/saveData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent, data: userData }),
    });
  } catch (error) {
    console.error("❌ Feil ved lagring av data:", error);
  }
};

// (Valgfritt) Du kan fjerne analyzeUserData og reanalyzeUserData 
// helt hvis du ikke skal bruke dem i det nye oppsettet.