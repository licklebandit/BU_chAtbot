import React, { useState } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Hello! I’m Bugema University Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        q: input
      });

      const botMessage = {
        role: "assistant",
        text: response.data.answer
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Sorry, I couldn't connect to the server." }
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  }

  return (
    <div style={{
      fontFamily: "Inter, sans-serif",
      maxWidth: 700,
      margin: "50px auto",
      padding: 20,
      border: "1px solid #ddd",
      borderRadius: 12,
      background: "#fafafa",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <h2>🎓 Bugema University Chatbot</h2>
      <div style={{
        height: "400px",
        overflowY: "auto",
        padding: 10,
        marginBottom: 10,
        background: "white",
        borderRadius: 8
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            textAlign: m.role === "user" ? "right" : "left",
            margin: "8px 0"
          }}>
            <span style={{
              display: "inline-block",
              background: m.role === "user" ? "#0084ff" : "#eee",
              color: m.role === "user" ? "white" : "black",
              padding: "8px 12px",
              borderRadius: 16,
              maxWidth: "80%"
            }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about admissions, courses, or fees..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #ccc"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "10px 16px",
            background: "#0084ff",
            color: "white",
            border: "none",
            borderRadius: 8
          }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
