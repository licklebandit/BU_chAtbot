import React, { useState, useEffect } from "react";
import axios from "axios";

// Get API base URL from environment or use production as default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://bu-chatbot.onrender.com";

// Static styles object should be defined outside the component 
// to prevent re-creation on every render, improving performance.
const styles = {
    container: { display: "flex", height: "100vh", background: "#f4f8ff", position: "relative", overflow: "hidden", fontFamily: 'Arial, sans-serif' },
    menuButton: { 
        position: "absolute", top: 10, left: 10, background: "#0a59b4ff", color: "white", border: "none", 
        borderRadius: "50%", width: "40px", height: "40px", lineHeight: "40px", textAlign: "center", 
        cursor: "pointer", zIndex: 20, fontSize: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" 
    },
    topBar: { display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "10px" },
    authButtons: { display: "flex", gap: "10px" },
    loginBtn: { 
        padding: "8px 16px", backgroundColor: "white", color: "#1257a5ff", border: "1px solid #1257a5ff", 
        borderRadius: "20px", textDecoration: "none", fontWeight: "bold", fontSize: "14px", transition: "all 0.2s ease", cursor: "pointer" 
    },
    signupBtn: { 
        padding: "8px 16px", backgroundColor: "#1257a5ff", color: "white", border: "none", borderRadius: "20px", 
        textDecoration: "none", fontWeight: "bold", fontSize: "14px", transition: "background-color 0.2s ease", cursor: "pointer" 
    },
    logoutBtn: { 
        padding: "8px 16px", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "20px", 
        fontWeight: "bold", cursor: "pointer", fontSize: "14px", transition: "background-color 0.2s ease" 
    },
    sidebar: { 
        position: "fixed", top: 0, width: "280px", height: "100%", background: "#f8fafaff", borderRight: "1px solid #83d7f8ff", 
        padding: "15px", display: "flex", flexDirection: "column", overflowY: "auto", transition: "left 0.3s ease", zIndex: 10 
    },
    botHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #eee" },
    avatar: { width: "50px", height: "50px", borderRadius: "50%" },
    newChatBtn: { 
        background: "#0a59b4ff", color: "white", border: "none", borderRadius: "10px", padding: "10px", 
        cursor: "pointer", marginBottom: "15px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
    },
    section: { marginBottom: "15px" },
    sectionTitle: { 
        fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "#131392ff", 
        borderBottom: "1px solid #f0f0f0", paddingBottom: "4px" 
    },
    link: { fontSize: "13px", color: "#252424ff", margin: "6px 0", cursor: "pointer", padding: "4px 8px", borderRadius: "4px", transition: "background-color 0.1s" },
    chatList: { maxHeight: "180px", overflowY: "auto", paddingRight: "5px" },
    chatItem: { borderBottom: "1px solid #eee", padding: "6px 0", cursor: "pointer", transition: "background-color 0.2s", borderRadius: "4px", paddingLeft: "8px", '&:hover': { backgroundColor: '#f0f0f0' } },
    chatTitle: { fontSize: "13px", fontWeight: "600", margin: 0 },
    chatTime: { fontSize: "10px", color: "#777", margin: 0, marginTop: "2px" },
    main: { flex: 1, display: "flex", flexDirection: "column", padding: "20px", height: "100vh", overflow: "hidden", transition: "margin-left 0.3s ease", 
        marginLeft: 0 
    },
    chatWindow: { flex: 1, overflowY: "auto", marginBottom: "10px", padding: "15px", background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 77, 140, 0.1)" },
    message: { display: "inline-block", padding: "10px 14px", borderRadius: "20px", maxWidth: "75%", lineHeight: "1.4" },
    inputRow: { display: "flex", gap: "10px", alignItems: "center" },
    input: { flex: 1, padding: "12px", borderRadius: "25px", border: "1px solid #1131bdff", fontSize: "16px" },
    button: { background: "#1257a5ff", color: "white", border: "none", borderRadius: "25px", padding: "12px 20px", cursor: "pointer", fontWeight: "bold", transition: "background-color 0.2s" },
};


function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeCount, setFreeCount] = useState(0);
  const [chats, setChats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 769);

  // 1. Resize Listener for Sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 769);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Initial Setup
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) fetchChats();

    setMessages([{ id: crypto.randomUUID(), role: "assistant", text: "🎓 Welcome! How can I help you today?" }]);
  }, []);

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data ? res.data.slice(-5).reverse() : []);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const loadChat = (chatMessages) => {
    // Ensure loaded messages have a unique ID for React keys
    const messagesWithIds = (chatMessages || []).map(msg => ({ 
        ...msg, 
        id: msg.id || crypto.randomUUID() 
    }));
    setMessages(messagesWithIds);
    if (window.innerWidth < 769) setSidebarOpen(false);
  };

  const resetChat = () => {
    setMessages([{ id: crypto.randomUUID(), role: "assistant", text: "New session started. How can I help you today?" }]);
    setFreeCount(0);
    if (window.innerWidth < 769) setSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!isLoggedIn && freeCount >= 3) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: "🔒 You've reached your free question limit. Please login or sign up to continue." },
      ]);
      return;
    }

    // Generate unique ID for the user message
    const userMsg = { id: crypto.randomUUID(), role: "user", text: input }; 
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.post(
        `${API_BASE_URL}/chat`,
        { q: userMsg.text },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      // Generate unique ID for the bot message
      const botMsg = { id: crypto.randomUUID(), role: "assistant", text: res.data.answer }; 
      setMessages((prev) => [...prev, botMsg]);
      
      if (!isLoggedIn) setFreeCount((c) => c + 1);
      if (isLoggedIn) fetchChats();
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: "⚠️ Unable to process your message. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { left: -300px; transition: left 0.3s ease; }
          .sidebar.open { left: 0; box-shadow: 2px 0 5px rgba(0,0,0,0.4); }
          .menu-btn { display: block; }
          .main { margin-left: 0 !important; padding-top: 50px; }
          .chat-history { max-height: 180px; }
        }
        @media (min-width: 769px) {
          .menu-btn { display: none; }
          .main-shift { margin-left: 300px !important; }
        }
        /* Improved link hover style */
        .sidebar .link:hover {
            background-color: #e6f7ff;
        }
      `}</style>

      <div style={styles.container}>
        <button
          className="menu-btn"
          style={styles.menuButton}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✖" : "☰"}
        </button>

        <div className={`sidebar ${sidebarOpen ? "open" : ""}`} style={styles.sidebar}>
          <div style={styles.botHeader}>
            <img src="/bot.png" alt="BU Bot" style={styles.avatar} />
            <div>
              <h2 style={{ margin: 0, color: "#16559dff" }}>BU Chatbot</h2>
              <p style={{ fontSize: "13px", margin: 0 }}>Your AI Campus Assistant</p>
              <p style={{ fontSize: "12px", margin: "4px 0", color: "#4caf50" }}>🟢 Online</p>
            </div>
          </div>

          <button style={styles.newChatBtn} onClick={resetChat}>
            + New Chat
          </button>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Select Topic</h4>
            {["Admissions","Registration","Academics","Financial Aid","Student Life","Campus Tour","Nearby Hostels","Cafeteria"].map((topic) => (
              <p key={topic} className="link" style={styles.link} onClick={() => setInput(topic)}>{topic}</p>
            ))}
          </div>

          {isLoggedIn && chats.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>💬 Recent Chats ({chats.length})</h4>
              <div className='chat-history' style={styles.chatList}>
                {chats.map((c, i) => (
                  <div key={c.id || c._id || i} style={styles.chatItem} onClick={() => loadChat(c.messages)}>
                    <p style={styles.chatTitle}>
                      {c.messages?.find(m => m.role === 'user')?.text?.slice(0, 30) || "Conversation"}...
                    </p>
                    <p style={styles.chatTime}>{new Date(c.updatedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>University Resources</h4>
            {["Student Portal","Academic Calendar","Work Program","Hospital","Emergency Contacts"].map((r) => (
              <p key={r} className="link" style={styles.link}>{r}</p>
            ))}
          </div>
        </div>

        <div className={`main ${sidebarOpen && window.innerWidth >= 769 ? "main-shift" : ""}`} style={styles.main}>
          <div style={styles.topBar}>
            {!isLoggedIn ? (
              <div style={styles.authButtons}>
                <a href="/login" style={styles.loginBtn}>Login</a>
                <a href="/signup" style={styles.signupBtn}>Sign Up</a>
              </div>
            ) : (
              <div style={styles.authButtons}>
                <button style={styles.logoutBtn} onClick={() => { localStorage.removeItem("token"); setIsLoggedIn(false); }}>
                  Logout
                </button>
              </div>
            )}
          </div>

          <div style={styles.chatWindow}>
            {messages.length === 0 && <p style={{ color: "#044163ff" }}>What do you like to know about Bugema University!</p>}
            {/* Map through messages - each message has a unique ID */}
            {messages.map((msg) => (
              <div key={msg.id} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: 10 }}>
                <span style={{
                  ...styles.message,
                  background: msg.role === "user" ? "#0078ff" : "#e8f0ff",
                  color: msg.role === "user" ? "white" : "black",
                }}>{msg.text}</span>
              </div>
            ))}
            {loading && <p style={{ textAlign: 'left', margin: '10px 0' }}>Typing...</p>}
            <div style={{ float:"left", clear: "both" }} />
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Ask about admissions, courses, or campus life..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button style={styles.button} onClick={sendMessage} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "#777", textAlign: "center", marginTop: "5px" }}>
            {!isLoggedIn ? `Free questions remaining: ${3 - freeCount}` : "Logged in. Unlimited access."}
          </p>
        </div>
      </div>
    </>
  );
}

export default Chatbot;