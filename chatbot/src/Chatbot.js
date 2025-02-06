import React, { useState } from "react";
import { askChatbot } from "./langchainChatbot";
import "./Styling/Chatbot.css"; // Importer CSS-filen

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hei! Ønsker du å godta lagring av samtalen for bedre analyse?", sender: "bot" }
  ]);
  const [consent, setConsent] = useState(null); // null = ikke valgt enda
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Funksjon for å håndtere samtykkevalg
  const handleConsent = (userConsent) => {
    setConsent(userConsent);
    setMessages((prev) => [
      ...prev,
      { text: userConsent ? "Ja, jeg godtar." : "Nei, jeg ønsker ikke lagring.", sender: "user" },
      { text: "Takk for tilbakemeldingen! Hvordan kan jeg hjelpe deg i dag?", sender: "bot" }
    ]);
  };

  // Funksjon for å sende meldinger til GPT
  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const botResponse = await askChatbot(input);
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Feil ved API-kall:", error);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <b>{msg.sender === "user" ? "Du" : "Bot"}:</b> {msg.text}
          </div>
        ))}
      </div>

      {/* Vis samtykkevalg først */}
      {consent === null && (
        <div className="consent-buttons">
          <button className="accept" onClick={() => handleConsent(true)}>Godta</button>
          <button className="decline" onClick={() => handleConsent(false)}>Avslå</button>
        </div>
      )}

      {/* Vis inputfelt kun hvis samtykke er valgt */}
      {consent !== null && (
        <div className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>
            {loading ? "Sender..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;