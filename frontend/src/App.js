import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "🎓 Hello! I’m Bugema University’s AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        q: input,
      });

      const botMessage = {
        role: "assistant",
        text: response.data.answer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Sorry, I couldn’t reach the server." },
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🎓 Bugema University Chatbot</h2>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                ...styles.message,
                background: m.role === "user" ? "#0078ff" : "#f1f1f1",
                color: m.role === "user" ? "white" : "black",
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="Ask about admissions, courses, or fees..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: "40px auto",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    background: "white",
    fontFamily: "Arial, sans-serif",
  },
  chatBox: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 10,
    height: "400px",
    overflowY: "auto",
    marginBottom: 10,
  },
  message: {
    display: "inline-block",
    padding: "10px 15px",
    borderRadius: 16,
    maxWidth: "80%",
    wordWrap: "break-word",
  },
  inputRow: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
  },
};

export default App;
