import React, { useState, useEffect } from "react";
import axios from "axios";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeCount, setFreeCount] = useState(0);
  const [chats, setChats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [status, setStatus] = useState("🟢 Online");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) fetchChats();
  }, []);

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("https://bu-chatbot.onrender.com/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data || []);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const resetChat = () => {
    setMessages([
      { role: "assistant", text: "🎓 New session started. How can I help you today?" },
    ]);
    setFreeCount(0);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!isLoggedIn && freeCount >= 3) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "🔒 You’ve reached your free question limit. Please login or sign up to continue." },
      ]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://bu-chatbot.onrender.com/chat",
        { q: input },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const botMsg = { role: "assistant", text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
      if (!isLoggedIn) setFreeCount((c) => c + 1);
      if (isLoggedIn) fetchChats();
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Unable to process your message." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Inline Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -280px;
            transition: left 0.3s ease;
          }
          .sidebar.open {
            left: 0;
          }
          .menu-btn {
            display: block;
          }
          .main {
            margin-left: 0 !important;
          }
        }
        @media (min-width: 769px) {
          .menu-btn {
            display: none;
          }
        }
      `}</style>

      <div style={styles.container}>
        {/* ☰ Sidebar Toggle Button (Mobile Only) */}
        <button
          className="menu-btn"
          style={styles.menuButton}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`} style={styles.sidebar}>
          <div style={styles.botHeader}>
            <img src="/bot.png" alt="BU Bot" style={styles.avatar} />
            <div>
              <h2 style={{ margin: 0, color: "#16559dff" }}>BU Chatbot</h2>
              <p style={{ fontSize: "13px", margin: 0 }}>Your AI Campus Assistant</p>
              <p style={{ fontSize: "12px", margin: "4px 0", color: "#4caf50" }}>{status}</p>
            </div>
          </div>

          <button style={styles.newChatBtn} onClick={resetChat}>
            + New Chat
          </button>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>📚 Select Topic</h4>
            {["Admissions","Registration","Academics","Financial Aid","Student Life","Campus Tour","Nearby Hostels","Cafeteria"]
              .map((topic) => (
                <p key={topic} style={styles.link}>{topic}</p>
              ))}
          </div>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>🏫 University Resources</h4>
            {["Student Portal","Academic Calendar","Work Program","Hospital","Emergency Contacts"]
              .map((r) => (
                <p key={r} style={styles.link}>{r}</p>
              ))}
          </div>

          {isLoggedIn && chats.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>💬 Chat History</h4>
              <div style={styles.chatList}>
                {chats.map((c, i) => (
                  <div key={i} style={styles.chatItem}>
                    <p style={styles.chatTitle}>
                      {c.messages[0]?.text.slice(0, 25) || "Conversation"}
                    </p>
                    <p style={styles.chatTime}>
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.footer}>
            <p style={{ fontSize: "12px", color: "#999" }}>📅 Last Updated: Oct 2025</p>
            <p style={{ fontSize: "12px", color: "#999" }}>🕐 Hours: 24/7 AI Support</p>
          </div>
        </div>

        {/* Main Chat Area */}
        <div
          className="main"
          style={{
            ...styles.main,
            marginLeft: sidebarOpen ? "300px" : "0",
          }}
        >
          <div style={styles.chatWindow}>
            {messages.length === 0 && (
              <p style={{ color: "#044163ff" }}>
                 What do you like to know about Bugema university!
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.role === "user" ? "right" : "left",
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    ...styles.message,
                    background: msg.role === "user" ? "#0078ff" : "#e8f0ff",
                    color: msg.role === "user" ? "white" : "black",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <p> Typing...</p>}
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Ask about admissions, courses, or campus life..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button style={styles.button} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f4f8ff",
    position: "relative",
    overflow: "hidden",
  },
  menuButton: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "8px 12px",
    cursor: "pointer",
    zIndex: 20,
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "280px",
    height: "100%",
    background: "#f8fafaff",
    borderRight: "1px solid #83d7f8ff",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "left 0.3s ease",
    zIndex: 10,
  },
  botHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  avatar: { width: "60px", height: "60px", borderRadius: "50%" },
  newChatBtn: {
    background: "#0a59b4ff",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    marginBottom: "4px",
  },
  section: { marginBottom: "8px" },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#131392ff",
  },
  link: { fontSize: "13px", color: "#252424ff", margin: "4px 0", cursor: "pointer" },
  chatList: { maxHeight: "140px", overflowY: "auto" },
  chatItem: { borderBottom: "1px solid #eee", padding: "4px 0" },
  chatTitle: { fontSize: "13px", fontWeight: "bold" },
  chatTime: { fontSize: "11px", color: "#777" },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    height: "95vh",
    overflow: "hidden",
    transition: "margin-left 0.3s ease",
  },
  chatWindow: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "8px",
    padding: "10px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 6px hsla(211, 92%, 38%, 0.05)",
  },
  message: {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: "16px",
    maxWidth: "80%",
  },
  inputRow: { display: "flex", gap: "10px" },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #1131bdff",
  },
  button: {
    background: "#1257a5ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  footer: {
    borderTop: "1px solid #eee",
    paddingTop: "10px",
    marginTop: "auto",
  },
};

export default Chatbot;
