export const askChatbot = async (message, prompt = "") => {
  try {
      const response = await fetch("http://localhost:5001/api/chat", { // 🚀 Endret ruten her
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, prompt }),
      });

      const textResponse = await response.text();
      console.log("🔍 Server response:", textResponse); // Debug-logg for å sjekke respons

      const data = JSON.parse(textResponse); // Prøv å tolke JSON
      return data.response;
  } catch (error) {
      console.error("❌ Feil ved API-kall:", error);
      return "Beklager, det oppstod en feil.";
  }
};