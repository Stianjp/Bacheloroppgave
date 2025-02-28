import React, { useState, useEffect, useRef } from "react";
import {
  initialMessage,
  phaseOnePrompt,
  phaseTwoPrompt,
} from "../data/chatbotPrompts"; // Tilpass stien
import {
  clearBackendData,
  saveUserData, // valgfritt om du vil lagre data
} from "../api/chatbotApi"; // Tilpass hvis du ønsker
import { askChatbot } from "../utils/langchainChatbot"; // Tilpass stien
import "../styles/Chatbot.css";
import logo from "../media/logo.png";
import miniLogo from "../media/MH_logo.png";

/*
  Chatbot.jsx:
  - Fase = 1 => GPT bruker phaseOnePrompt (5-8 spørsmål).
  - Fase = 2 => GPT bruker phaseTwoPrompt (7 spørsmål + oppsummering).
*/

const Chatbot = () => {
  // Meldingshistorikk
  const [messages, setMessages] = useState([
    { sender: "bot", text: initialMessage },
  ]);

  // Samtykke (hvis du fremdeles vil bruke det)
  const [consent, setConsent] = useState(null);

  // Brukerens input + states
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Fase-styring: 1 = kort kartlegging, 2 = dyp motivasjon
  const [phase, setPhase] = useState(1);

  // Teller antall meldinger fra GPT i hver fase
  const [assistantQuestionCount, setAssistantQuestionCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Tøm backend-data ved start
  useEffect(() => {
    clearBackendData();
  }, []);

  // Autoscroll / autofokus
  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  // Samtykke-håndtering
  const handleConsent = (userConsent) => {
    setConsent(userConsent);
    const userMsg = userConsent ? "Ja, jeg godtar." : "Nei, jeg ønsker ikke lagring.";
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMsg },
      { sender: "bot", text: "Takk for tilbakemeldingen! Da setter vi i gang. Hva heter du?" },
    ]);
  };

  // Send melding
  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    // Legg til brukermelding
    const userMessage = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    inputRef.current.style.height = "30px";

    setIsTyping(true);

    // Vent litt og kall GPT
    setTimeout(async () => {
      let botReply = "";

      // 1) Bygg hele konversasjonen i GPT-format
      const conversationMessages = buildConversationForGPT([...messages, userMessage]);

      // 2) Velg prompt basert på fase
      let systemPrompt = phaseOnePrompt;
      if (phase === 2) {
        systemPrompt = phaseTwoPrompt;
      }

      // 3) Kall GPT
      botReply = await askChatbot(conversationMessages, systemPrompt);

      // 4) TELL antall assistent-svar i denne fasen
      const newAssistantCount = countAssistantMessages([...messages, { sender: "bot", text: botReply }], phase);

      // 5) Bytt til fase 2 hvis vi er i fase 1 og GPT har passert ~5–8 meldinger
      if (phase === 1 && newAssistantCount >= 8) {
        // Legg til avslutning på kartleggingen før vi går videre til fase 2
        // botReply = "Takk for at du delte det. Jeg tror vi har kartlagt endel. Nå går vi over til dyp motivasjon.";

        // Sett fase til 2
        setPhase(2);
      }

      // 6) Oppdater meldinger med GPT-svar
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);

      setIsTyping(false);
      setLoading(false);
    }, 500);
  };

  // Autoscroll
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Juster inputfeltets høyde
  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "30px";
    e.target.style.height = `${e.target.scrollHeight}px`;
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
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender}`}>
            {msg.sender === "bot" ? (
              i === messages.length - 1 ? (
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
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading}
            rows={1}
            style={{ resize: "none", minHeight: "30px", maxHeight: "200px", overflowY: "auto" }}
          />
          <button onClick={sendMessage} disabled={loading}>
            ➤
          </button>
        </div>
      )}
    </div>
  );
};

/** 
 * Bygg et array i GPT-format: {role: "assistant"|"user", content: "..."}
 * Basert på {sender: "bot"|"user", text: "..."} 
 */
function buildConversationForGPT(allMessages) {
  return allMessages.map((m) => ({
    role: m.sender === "bot" ? "assistant" : "user",
    content: m.text,
  }));
}

/**
 * Teller hvor mange meldinger "bot" har kommet med i gjeldende fase.
 * Du kan velge å differensiere på om meldingen ble postet i currentPhase. Men i en enkel variant:
 */
function countAssistantMessages(allMessages, currentPhase) {
  let count = 0;
  for (const msg of allMessages) {
    if (msg.sender === "bot") {
      count++;
    }
  }
  return count;
}

export default Chatbot;
