import React, { useState, useEffect } from "react";
import { askChatbot } from "../utils/langchainChatbot";
import { initialMessage, questions, categoryResponses, chatgptPrompts } from "../data/chatbotPrompts";
import { clearBackendData, saveUserData, analyzeUserData } from "../api/chatbotApi";
import "../styles/Chatbot.css";
import logo from "../media/logo.png";

const Chatbot = () => {
  const [messages, setMessages] = useState([{ text: initialMessage, sender: "bot" }]);
  const [consent, setConsent] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [chatgptActive, setChatgptActive] = useState(false);

  useEffect(() => {
    clearBackendData();
  }, []);

  const handleConsent = (userConsent) => {
    setConsent(userConsent);
    setMessages((prev) => [
      ...prev,
      { text: userConsent ? "Ja, jeg godtar." : "Nei, jeg ønsker ikke lagring.", sender: "user" },
      { text: "Takk for tilbakemeldingen!", sender: "bot" },
      { text: questions[0].text, sender: "bot" }
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
  
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
  
    if (chatgptActive) {
      // Hent relevant prompt basert på brukerens kategori
      const chatGptPrompt = chatgptPrompts[category] || "Hjelp brukeren med karriereveiledning basert på tidligere svar.";
      
      // Send prompt + brukerens melding til ChatGPT
      const botResponse = await askChatbot(input, chatGptPrompt);
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    } else if (currentStep < questions.length) {
      // Fortsett med vanlige spørsmål
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
  
        await saveUserData(consent, updatedUserData);
        analyzeCategory(updatedUserData);
      }
  
      setCurrentStep(currentStep + 1);
    }
  
    setInput("");
    setLoading(false);
  };

  
  const analyzeCategory = async (userData) => {
    const result = await analyzeUserData(userData);
    setCategory(result.category);

    const nextMessage = categoryResponses[result.category] || "Det oppstod en feil ved analyse av dataene dine.";
    setMessages((prev) => [...prev, { text: nextMessage, sender: "bot" }]);

    // 🔹 **Aktiver ChatGPT for videre samtale**
    setChatgptActive(true);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <img src={logo} alt="MeyerHaugen" className="logo" />
        <p className="chat-date">
          {new Date().toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.sender === "bot" ? (
              index === messages.length - 1 ? (
                <img src={logo} alt="Bot" className="bot-avatar" />
              ) : (
                <div className="bot-avatar-placeholder"></div>
              )
            ) : null}
            <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
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
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>➤</button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;