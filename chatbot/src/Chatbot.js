import React, { useState } from "react";
import { askChatbot } from "./langchainChatbot";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);

    const botResponse = await askChatbot(input);
    setMessages([...messages, userMessage, { text: botResponse, sender: "bot" }]);
    
    setInput("");
  };

  return (
    <div style={{ width: "300px", margin: "20px auto", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
      <div style={{ height: "300px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "5px 0" }}>
            <b>{msg.sender === "user" ? "Du" : "Bot"}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        style={{ width: "80%", padding: "5px" }}
      />
      <button onClick={sendMessage} style={{ width: "18%", padding: "5px", marginLeft: "2%" }}>Send</button>
    </div>
  );
};

export default Chatbot;