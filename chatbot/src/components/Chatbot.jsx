import React, { useState, useEffect } from "react";
import { askChatbot } from "../utils/langchainChatbot";
import "../Styling/Chatbot.css";
import logo from "../media/logo.png";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hei! Ønsker du å godta lagring av samtalen for bedre analyse?", sender: "bot" }
  ]);
  const [consent, setConsent] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [category, setCategory] = useState(null);

  // Henter dagens dato i norsk format
  const today = new Date().toLocaleDateString("no-NO", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  // Liste over spørsmål chatboten skal stille
  const questions = [
    { key: "name", text: "Hva heter du?" },
    { key: "age", text: "Hvor gammel er du?" },
    { key: "jobStatus", text: "Er du i fast jobb, søker jobb, eller er du usikker på hva du vil?" },
    { key: "goal", text: "Hva er målet ditt med denne samtalen?" }
  ];

  // 🔹 **Tømmer backend-data når brukeren refresher**
  useEffect(() => {
    fetch("http://localhost:5001/api/clearData", { method: "POST" })
      .catch((error) => console.error("❌ Feil ved tømming av data:", error));
  }, []);

  // 🔹 **Håndter samtykkevalg og start første spørsmål**
  const handleConsent = async (userConsent) => {
    setConsent(userConsent);
    setMessages((prev) => [
      ...prev,
      { text: userConsent ? "Ja, jeg godtar." : "Nei, jeg ønsker ikke lagring.", sender: "user" },
      { text: "Takk for tilbakemeldingen!", sender: "bot" },
      { text: questions[0].text, sender: "bot" }
    ]);
  };

  // 🔹 **Håndter brukerens svar**
  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    if (currentStep < questions.length) {
      const updatedUserData = { ...userData, [questions[currentStep].key]: input };
      setUserData(updatedUserData);

      if (currentStep + 1 < questions.length) {
        setMessages((prev) => [...prev, { text: questions[currentStep + 1].text, sender: "bot" }]);
      } else {
        const summary = `
          Takk for informasjonen! Her er en oppsummering:
          - Navn: ${updatedUserData.name}
          - Alder: ${updatedUserData.age}
          - Jobbsituasjon: ${updatedUserData.jobStatus}
          - Mål: ${updatedUserData.goal}
          
          Nå analyserer jeg informasjonen din for å hjelpe deg videre...
        `;
        setMessages((prev) => [...prev, { text: summary, sender: "bot" }]);

        // **Send brukerdata til backend for lagring**
        if (consent) {
          await fetch("http://localhost:5001/api/saveData", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consent, data: updatedUserData })
          });
        }

        // **Send data til GPT for analyse**
        analyzeUserData(updatedUserData);
      }

      setCurrentStep(currentStep + 1);
    } else {
      const botResponse = await askChatbot(input);
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    }

    setInput("");
    setLoading(false);
  };

  // 🔹 **Send data til GPT og bestemme kategori**
  const analyzeUserData = async (userData) => {
    try {
      const response = await fetch("http://localhost:5001/api/analyzeUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobStatus: userData.jobStatus, goal: userData.goal })
      });

      const result = await response.json();
      setCategory(result.category);

      let nextMessage = "";
      if (result.category === "a") {
        nextMessage = "Du er i jobbsøking. Hvordan kan jeg hjelpe deg med CV og intervjuforberedelser?";
      } else if (result.category === "b") {
        nextMessage = "Du vurderer å bytte karriere. Skal vi se på hvilke muligheter som kan passe for deg?";
      } else if (result.category === "c") {
        nextMessage = "Du ønsker å utvikle karrieren din. Vil du ha tips om videreutdanning eller nye ferdigheter?";
      } else if (result.category === "d") {
        nextMessage = "Du ønsker å finne din motivasjon. La oss utforske hva som inspirerer deg!";
      }

      setMessages((prev) => [...prev, { text: nextMessage, sender: "bot" }]);

    } catch (error) {
      console.error("❌ Feil ved analyse av brukerdata:", error);
      setMessages((prev) => [...prev, { text: "Det oppstod en feil ved analyse av dataene dine.", sender: "bot" }]);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <img src={logo} alt="MeyerHaugen" className="logo" />
        <p className="chat-date">{today}</p>
      </header>

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {consent === null && (
        <div className="consent-buttons">
          <button className="accept" onClick={() => handleConsent(true)}>Godta</button>
          <button className="decline" onClick={() => handleConsent(false)}>Avslå</button>
        </div>
      )}

      {consent !== null && (
        <div className="chat-input">
          <input
            type="text"
            placeholder="Skriv melding her"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>
            ➤
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;