import React, { useState, useEffect, useRef } from "react";
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
  const [isTyping, setIsTyping] = useState(false);
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

    setIsTyping(true); // Vis typing-boblen

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
                botResponse = `
                    Takk for informasjonen! Her er en oppsummering:
                    - Navn: ${updatedUserData.name}
                    - Alder: ${updatedUserData.age}
                    - Jobbsituasjon: ${updatedUserData.jobStatus}
                    - Mål: ${updatedUserData.goal}

                    Nå analyserer jeg informasjonen din for å hjelpe deg videre...
                `;

                await saveUserData(consent, updatedUserData);
                analyzeCategory(updatedUserData);
            }

            setCurrentStep(currentStep + 1);
        }

        setTimeout(() => {
            setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
            setIsTyping(false); // Skjul typing-boblen etter at meldingen er lagt til
            setLoading(false);
        }, 1000); // Gir en liten ekstra forsinkelse før meldingen vises

    }, 500); // Simulerer at chatboten "skriver" i 1,5 sekunder
};

const scrollToBottom = () => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
};

useEffect(() => {
  scrollToBottom();
}, [messages]);

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
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
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
          <input
            type="text"
            placeholder="Skriv melding her"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>➤</button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;