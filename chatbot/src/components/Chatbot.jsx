import React, { useState, useEffect, useRef } from "react";
import { askChatbot } from "../utils/langchainChatbot";
import { initialMessage, questions, categoryResponses, chatgptPrompts } from "../data/chatbotPrompts";
import { clearBackendData, saveUserData, analyzeUserData } from "../api/chatbotApi";
import "../styles/Chatbot.css";
import logo from "../media/logo.png";
import miniLogo from "../media/MH_logo.png";

const Chatbot = () => {
  const [messages, setMessages] = useState([{ text: initialMessage, sender: "bot" }]);
  const [consent, setConsent] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [chatgptActive, setChatgptActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

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
    setInput("");
    inputRef.current.style.height = "30px"; // Reset høyde til én linje etter sending

    setIsTyping(true);

    setTimeout(async () => {
      let botResponse = "";

      if (chatgptActive) {
        const chatGptPrompt = chatgptPrompts[category] || "Hjelp brukeren med karriereveiledning basert på tidligere svar.";
        botResponse = await askChatbot(input, chatGptPrompt);
      } else if (currentStep < questions.length) {
        const updatedUserData = { ...userData, [questions[currentStep].key]: input };
        setUserData(updatedUserData);

        if (currentStep + 1 < questions.length) {
          botResponse = questions[currentStep + 1].text;
        } else {
          await saveUserData(consent, updatedUserData);
          await analyzeCategory(updatedUserData);
          return; // Hindrer at en tom melding blir lagt til
        }

        setCurrentStep(currentStep + 1);
      }

      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
      setIsTyping(false);
      setLoading(false);
    }, 500);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus(); // Autofokus på inputfeltet
    }
  }, [messages]);  

  const analyzeCategory = async (userData) => {
    const result = await analyzeUserData(userData);
    setCategory(result.category);

    const nextMessage = categoryResponses[result.category] || "Det oppstod en feil ved analyse av dataene dine.";
    setMessages((prev) => [...prev, { text: nextMessage, sender: "bot" }]);

    setChatgptActive(true);
    setLoading(false);
    setIsTyping(false);
  };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "30px"; // Reset høyde før justering
    e.target.style.height = `${e.target.scrollHeight}px`; // Juster til innholdets høyde
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
                <img src={miniLogo} alt="Bot" className="bot-avatar" />
              ) : (
                <div className="bot-avatar-placeholder"></div>
              )
            ) : null}
            <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="typing-bubble">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {consent === null && (
        <div className="consent-buttons">
          <button className="accept" onClick={() => handleConsent(true)}>Godta</button>
          <button className="decline" onClick={() => handleConsent(false)}>Avslå</button>
        </div>
      )}

      {consent !== null && (
        <div className="chat-input">
          <textarea
          ref={inputRef}
          placeholder="Skriv melding her"
          value={input}
          onChange={handleInputChange} // Bruk ny funksjon for auto-resizing
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={loading}
          rows={1} // Start med én rad
          style={{
            resize: "none",
            minHeight: "30px",
            maxHeight: "200px",
            overflowY: "auto"
          }}
          />
          <button onClick={sendMessage} disabled={loading}>➤</button>
        </div>
      )}
    </div>
  );
};
  export default Chatbot;
