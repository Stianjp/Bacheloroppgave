import React, { useState } from "react";
import { askChatbot } from "./langchainChatbot";
import "./Styling/Chatbot.css"; // Importer CSS-filen
import logo from "./media/logo.png"; // Importer logo

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hei! Ønsker du å godta lagring av samtalen for bedre analyse?", sender: "bot" }
  ]);
  const [consent, setConsent] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

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
    { key: "jobStatus", text: "Er du i fast jobb, søker jobb, eller er du usikker på hva du vil?" }
  ];

  // Håndter samtykkevalg og start første spørsmål
  const handleConsent = async (userConsent) => {
    setConsent(userConsent);
    setMessages((prev) => [
      ...prev,
      { text: userConsent ? "Ja, jeg godtar." : "Nei, jeg ønsker ikke lagring.", sender: "user" },
      { text: "Takk for tilbakemeldingen!", sender: "bot" },
      { text: questions[0].text, sender: "bot" }
    ]);

    // Start lagring av JSON hvis samtykke er gitt
    if (userConsent) {
      await fetch("http://localhost:5001/api/saveData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: userConsent, data: {} })
      });
    }
  };

  // Håndter brukerens svar
  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    if (currentStep < questions.length) {
      const updatedUserData = { ...userData, [questions[currentStep].key]: input };
      setUserData(updatedUserData);
      setCurrentStep(currentStep + 1);

      if (currentStep + 1 < questions.length) {
        setMessages((prev) => [...prev, { text: questions[currentStep + 1].text, sender: "bot" }]);
      } else {
        const summary = `
          Takk for informasjonen! Her er en oppsummering:
          - Navn: ${updatedUserData.name}
          - Alder: ${updatedUserData.age}
          - Jobbsituasjon: ${updatedUserData.jobStatus}
          
          Nå kan vi gå videre og kartlegge dine styrker. Hva vil du vite mer om?
        `;
        setMessages((prev) => [...prev, { text: summary, sender: "bot" }]);

        // Lagre data i JSON-filen
        if (consent) {
          await fetch("http://localhost:5001/api/saveData", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consent, data: updatedUserData })
          });
        }
      }
    } else {
      const botResponse = await askChatbot(input);
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    }

    setInput("");
    setLoading(false);
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