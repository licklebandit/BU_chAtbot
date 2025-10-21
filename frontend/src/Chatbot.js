import React, { useState, useEffect } from "react";
import axios from "axios";

function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "🎓 Hello! I’m Bugema University’s AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeCount, setFreeCount] = useState(0); // guest questions
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // ✅ Guest limit: max 3 messages
    if (!isLoggedIn && freeCount >= 3) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "🔒 You’ve reached your free question limit. Please log in or sign up to continue." },
      ]);
      return;
    }

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://bu-chatbot.onrender.com/chat",
        { q: input },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const botMessage = {
        role: "assistant",
        text: response.data.answer,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (!isLoggedIn) setFreeCount((count) => count + 1);
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

  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  const handleSignupRedirect = () => {
    window.location.href = "/signup";
  };

  return (
    <div style={styles.container}>
      <h2>🎓 Bugema University Chatbot</h2>

      {!isLoggedIn && (
        <div style={styles.banner}>
          <p>
            You are chatting as a <strong>guest</strong>.{" "}
            {3 - freeCount > 0 ? (
              <>You have <strong>{3 - freeCount}</strong> free questions left.</>
            ) : (
              <>No free questions left.</>
            )}
          </p>
          <button style={styles.loginBtn} onClick={handleLoginRedirect}>Login</button>
          <button style={styles.signupBtn} onClick={handleSignupRedirect}>Sign Up</button>
        </div>
      )}

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
                background: m.role === "user" ? "#4a4974ff" : "#c6cfcfff",
                color: m.role === "user" ? "white" : "black",
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
  banner: {
    padding: "10px",
    marginBottom: "15px",
    background: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: 8,
  },
  loginBtn: {
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    marginRight: 8,
    cursor: "pointer",
  },
  signupBtn: {
    background: "#00b894",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer",
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

export default Chatbot;
