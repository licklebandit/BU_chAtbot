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
  // Set sidebarOpen to false by default on small screens for better initial view
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 769); 
  

  // Toggle sidebar on screen size change
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 769);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) fetchChats();

    // Initialize chat on load
    setMessages([
        { role: "assistant", text: "🎓 Welcome! How can I help you today?" },
    ]);
  }, []);

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("https://bu-chatbot.onrender.com/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Limit to 5 recent chats for a clean view, reverse for newest first
      setChats(res.data ? res.data.slice(-5).reverse() : []);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const loadChat = (chatMessages) => {
    setMessages(chatMessages);
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 769) setSidebarOpen(false);
  };

  const resetChat = () => {
    setMessages([
      { role: "assistant", text: "New session started. How can I help you today?" },
    ]);
    setFreeCount(0);
    // Close sidebar on mobile after starting a new chat
    if (window.innerWidth < 769) setSidebarOpen(false);
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
        { q: userMsg.text }, // Use the stored userMsg.text
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const botMsg = { role: "assistant", text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
      if (!isLoggedIn) setFreeCount((c) => c + 1);
      if (isLoggedIn) fetchChats(); // Refresh chats after sending a message
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Unable to process your message. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 💻 Responsive CSS */}
      <style>{`
        /* Mobile-first approach: Sidebar hidden by default on small screens */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -300px; /* Hidden position */
            transition: left 0.3s ease, box-shadow 0.3s ease;
            box-shadow: none; /* No shadow when hidden */
          }
          .sidebar.open {
            left: 0; /* Visible position */
            box-shadow: 2px 0 5px rgba(0,0,0,0.1); /* Shadow when open */
          }
          .menu-btn {
            display: block; /* Show menu button on mobile */
          }
          .main {
            margin-left: 0 !important; /* Main content takes full width */
            padding-top: 50px; /* Space for the menu button */
          }
          .chat-history {
            max-height: 180px; /* More space for history on mobile */
          }
        }
        /* Desktop styles (769px and up) */
        @media (min-width: 769px) {
          .menu-btn {
            display: none; /* Hide menu button on desktop */
          }
          .main-shift {
            margin-left: 300px !important; /* Shift main content when sidebar is open */
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
          {sidebarOpen ? "✖" : "☰"}
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
            <h4 style={styles.sectionTitle}> Select Topic</h4>
            {["Admissions","Registration","Academics","Financial Aid","Student Life","Campus Tour","Nearby Hostels","Cafeteria"]
              .map((topic) => (
                <p 
                  key={topic} 
                  style={styles.link}
                  onClick={() => setInput(topic)} // Pre-fill input with topic
                >
                  {topic}
                </p>
              ))}
          </div>
          
          {/* ✅ Recent Chats Section */}
          {isLoggedIn && chats.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>💬 Recent Chats ({chats.length})</h4>
              <div className='chat-history' style={styles.chatList}>
                {chats.map((c, i) => (
                  <div 
                    key={i} 
                    style={styles.chatItem}
                    onClick={() => loadChat(c.messages)} // Load the selected chat
                  >
                    <p style={styles.chatTitle}>
                      {c.messages.find(m => m.role === 'user')?.text.slice(0, 30) + '...' || "Conversation"}
                    </p>
                    <p style={styles.chatTime}>
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}> University Resources</h4>
            {["Student Portal","Academic Calendar","Work Program","Hospital","Emergency Contacts"]
              .map((r) => (
                <p key={r} style={styles.link}>{r}</p>
              ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div
          className={`main ${sidebarOpen && window.innerWidth >= 769 ? "main-shift" : ""}`}
          style={{
            ...styles.main,
            // Inline style for desktop shift is now handled by the 'main-shift' class for responsiveness
          }}
        >

          <div style={styles.topBar}>
  {!isLoggedIn ? (
    <div style={styles.authButtons}>
      <a href="/login" style={styles.loginBtn}>Login</a>
      <a href="/signup" style={styles.signupBtn}>Sign Up</a>
    </div>
  ) : (
    <div style={styles.authButtons}>
      <button
        style={styles.logoutBtn}
        onClick={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }}
      >
            Logout
            </button>
            </div>
            )}
          </div>
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
                  marginBottom: 10, // Increased margin for better spacing
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
            {loading && <p style={{ textAlign: 'left', margin: '10px 0' }}>Typing...</p>}
            {/* Scroll to bottom marker (you'd typically implement auto-scroll here with a ref) */}
            <div style={{ float:"left", clear: "both" }} /> 
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Ask about admissions, courses, or campus life..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading} // Disable input while loading
            />
            <button 
              style={styles.button} 
              onClick={sendMessage}
              disabled={loading || !input.trim()} // Disable send button when loading or input is empty
            >
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

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f4f8ff",
    position: "relative",
    overflow: "hidden",
    fontFamily: 'Arial, sans-serif',
  },
  menuButton: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "#0a59b4ff",
    color: "white",
    border: "none",
    borderRadius: "50%", // Made it round
    width: "40px",
    height: "40px",
    lineHeight: "40px",
    textAlign: "center",
    cursor: "pointer",
    zIndex: 20,
    fontSize: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
  topBar: {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  marginBottom: "10px",
},

authButtons: {
  display: "flex",
  gap: "10px",
},

loginBtn: {
  padding: "8px 16px",
  backgroundColor: "white",
  color: "#1257a5ff",
  border: "1px solid #1257a5ff",
  borderRadius: "20px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "all 0.2s ease",
  cursor: "pointer",
},
signupBtn: {
  padding: "8px 16px",
  backgroundColor: "#1257a5ff",
  color: "white",
  border: "none",
  borderRadius: "20px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "background-color 0.2s ease",
  cursor: "pointer",
},
logoutBtn: {
  padding: "8px 16px",
  backgroundColor: "#d32f2f",
  color: "white",
  border: "none",
  borderRadius: "20px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "14px",
  transition: "background-color 0.2s ease",
},

  sidebar: {
    position: "fixed",
    top: 0,
    width: "280px",
    height: "100%",
    background: "#f8fafaff",
    borderRight: "1px solid #83d7f8ff",
    padding: "15px", // Increased padding
    display: "flex",
    flexDirection: "column",
    overflowY: "auto", // Allow scrolling for long content
    transition: "left 0.3s ease",
    zIndex: 10,
  },
  botHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
  },
  avatar: { width: "50px", height: "50px", borderRadius: "50%" },
  newChatBtn: {
    background: "#0a59b4ff",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px", // Increased padding
    cursor: "pointer",
    marginBottom: "15px", // Increased margin
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  section: { marginBottom: "15px" },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#131392ff",
    borderBottom: "1px solid #f0f0f0",
    paddingBottom: "4px",
  },
  link: { 
    fontSize: "13px", 
    color: "#252424ff", 
    margin: "6px 0", 
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
    '&:hover': {
        backgroundColor: "#eef2ff",
    }
  },
  chatList: { 
    maxHeight: "180px", // Increased max height
    overflowY: "auto", 
    paddingRight: "5px" 
  },
  chatItem: { 
    borderBottom: "1px solid #eee", 
    padding: "6px 0", 
    cursor: "pointer",
    transition: "background-color 0.2s",
    borderRadius: "4px",
    paddingLeft: "8px",
    '&:hover': {
        backgroundColor: "#eef2ff",
    }
  },
  chatTitle: { fontSize: "13px", fontWeight: "600", margin: 0 },
  chatTime: { fontSize: "10px", color: "#777", margin: 0, marginTop: "2px" },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "20px", // Increased padding
    height: "100vh", // Use 100vh for full height
    overflow: "hidden",
    transition: "margin-left 0.3s ease",
    marginLeft: window.innerWidth >= 769 ? "300px" : "0", // Initial desktop margin
  },
  chatWindow: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "10px",
    padding: "15px", // Increased padding
    background: "white",
    borderRadius: "12px", // Increased border radius
    boxShadow: "0 4px 12px rgba(0, 77, 140, 0.1)", // More pronounced shadow
  },
  message: {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: "20px", // Fully rounded
    maxWidth: "75%", // Slightly less wide for better readability
    lineHeight: "1.4",
  },
  inputRow: { display: "flex", gap: "10px", alignItems: "center" },
  input: {
    flex: 1,
    padding: "12px", // Increased padding
    borderRadius: "25px", // Fully rounded input
    border: "1px solid #1131bdff",
    fontSize: "16px",
  },
  button: {
    background: "#1257a5ff",
    color: "white",
    border: "none",
    borderRadius: "25px", // Fully rounded button
    padding: "12px 20px", // Increased padding
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  footer: {
    borderTop: "1px solid #eee",
    paddingTop: "10px",
    marginTop: "auto",
    textAlign: "center",
  },
};

export default Chatbot;