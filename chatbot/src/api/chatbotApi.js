// chatbotApi.js

const API_BASE_URL = "http://localhost:5001/api";

export const clearBackendData = async () => {
  try {
    await fetch(`${API_BASE_URL}/clearData`, { method: "POST" });
  } catch (error) {
    console.error("❌ Feil ved tømming av data:", error);
  }
};

export const saveUserData = async (consent, userData) => {
  if (!consent) return;
  try {
    await fetch(`${API_BASE_URL}/saveData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent, data: userData })
    });
  } catch (error) {
    console.error("❌ Feil ved lagring av data:", error);
  }
};

export const analyzeUserData = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyzeUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobStatus: userData.jobStatus, goal: userData.goal })
    });
    return await response.json();
  } catch (error) {
    console.error("❌ Feil ved analyse av brukerdata:", error);
    return { category: null };
  }
};