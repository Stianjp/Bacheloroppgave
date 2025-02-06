export const askChatbot = async (message) => {
    try {
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
  
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Feil ved API-kall:", error);
      return "Beklager, det oppstod en feil.";
    }
  };