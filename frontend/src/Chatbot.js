import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// 🎨 Theme Colors (Refined Blue & White Palette)
const COLOR_PRIMARY = "#1e88e5";      // Vibrant Blue for action buttons
const COLOR_LIGHT_BLUE = "#f0f8ff";   // Very subtle blue for backgrounds/highlights
const COLOR_DARK_BLUE = "#0d47a1";    // Deep Blue for headings/text
const COLOR_BACKGROUND = "#ffffff";   // Pure White for main chat window and sidebar
const COLOR_CONTAINER_BG = "#f8f9fa"; // Off-white for overall container
const COLOR_TEXT_DARK = "#333333";
const COLOR_TEXT_LIGHT = "white";

// Get API base URL from environment or use production as default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://bu-chatbot.onrender.com";

// Static styles object should be defined outside the component 
// to prevent re-creation on every render, improving performance.
const styles = {
    container: { display: "flex", height: "100vh", background: COLOR_CONTAINER_BG, position: "relative", overflow: "hidden", fontFamily: 'Roboto, Arial, sans-serif' },
    
    // --- Sidebar Styles ---
    sidebar: { 
        position: "fixed", top: 0, width: "280px", height: "100%", background: COLOR_BACKGROUND, borderRight: `1px solid ${COLOR_LIGHT_BLUE}`, 
        padding: "0", // Padding moved to inner sections
        display: "flex", flexDirection: "column", transition: "left 0.3s ease", zIndex: 10 
    },
    sidebarHeader: { // Fixed header section
        padding: "15px 15px 10px 15px",
        borderBottom: `2px solid ${COLOR_LIGHT_BLUE}`,
        backgroundColor: COLOR_BACKGROUND,
        zIndex: 11
    },
    sidebarContent: { // Scrollable content section
        flex: 1, // Takes up remaining height
        overflowY: "auto",
        padding: "5px 15px 15px 15px",
    },
    menuButton: { 
        position: "absolute", top: 10, left: 10, background: COLOR_PRIMARY, color: COLOR_TEXT_LIGHT, border: "none", 
        borderRadius: "50%", width: "40px", height: "40px", lineHeight: "40px", textAlign: "center", 
        cursor: "pointer", zIndex: 20, fontSize: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" 
    },
    botHeader: { display: "flex", alignItems: "center", gap: "10px" },
    avatar: { width: "50px", height: "50px", borderRadius: "50%", border: `2px solid ${COLOR_PRIMARY}` },
    newChatBtn: { 
        background: COLOR_PRIMARY, color: COLOR_TEXT_LIGHT, border: "none", borderRadius: "8px", padding: "12px", 
        cursor: "pointer", marginBottom: "15px", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
        transition: "background-color 0.2s ease", width: '100%'
    },
    section: { marginBottom: "15px" },
    sectionTitle: { 
        fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: COLOR_DARK_BLUE, 
        borderBottom: "1px solid #eee", paddingBottom: "4px" 
    },
    link: { fontSize: "13px", color: COLOR_TEXT_DARK, margin: "6px 0", cursor: "pointer", padding: "6px 8px", borderRadius: "4px", transition: "background-color 0.1s", userSelect: "none" },
    chatList: { maxHeight: "180px", overflowY: "auto", paddingRight: "5px" },
    chatTitle: { fontSize: "13px", fontWeight: "600", margin: 0 },
    chatTime: { fontSize: "10px", color: "#777", margin: 0, marginTop: "2px" },

    // --- Dropdown Specific Styles ---
    dropdownHeader: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 10px", marginBottom: "5px", background: COLOR_LIGHT_BLUE, borderRadius: "6px",
        cursor: "pointer", color: COLOR_DARK_BLUE, fontWeight: 'bold', fontSize: '14px'
    },
    dropdownContent: {
        maxHeight: 0, overflow: 'hidden', transition: 'max-height 0.3s ease-in-out',
        padding: '0 10px', background: COLOR_BACKGROUND, border: `1px solid ${COLOR_LIGHT_BLUE}`, borderRadius: '0 0 6px 6px',
        borderTop: 'none'
    },
    dropdownOpen: {
        maxHeight: '300px', // Large enough value to show content
    },

    // --- Main Chat Window Styles ---
    main: { flex: 1, display: "flex", flexDirection: "column", padding: "20px", height: "100vh", overflow: "hidden", transition: "margin-left 0.3s ease", marginLeft: 0 },
    topBar: { display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "10px" },
    chatWindow: { flex: 1, overflowY: "auto", marginBottom: "10px", padding: "15px", background: COLOR_BACKGROUND, borderRadius: "12px", boxShadow: "0 6px 20px rgba(0, 77, 140, 0.15)" },
    input: { flex: 1, padding: "12px", borderRadius: "25px", border: `1px solid ${COLOR_PRIMARY}`, fontSize: "16px", outline: 'none' },
    button: { 
        background: COLOR_PRIMARY, color: COLOR_TEXT_LIGHT, border: "none", borderRadius: "25px", padding: "12px 20px", 
        cursor: "pointer", fontWeight: "bold", transition: "background-color 0.2s" 
    },
    
    // Auth Button Styles (Kept consistent with new palette)
    loginBtn: { 
        padding: "8px 16px", backgroundColor: COLOR_BACKGROUND, color: COLOR_PRIMARY, border: `1px solid ${COLOR_PRIMARY}`, 
        borderRadius: "20px", textDecoration: "none", fontWeight: "bold", fontSize: "14px", transition: "all 0.2s ease", cursor: "pointer" 
    },
    signupBtn: { 
        padding: "8px 16px", backgroundColor: COLOR_PRIMARY, color: COLOR_TEXT_LIGHT, border: "none", borderRadius: "20px", 
        textDecoration: "none", fontWeight: "bold", fontSize: "14px", transition: "background-color 0.2s ease", cursor: "pointer" 
    },
};

// Component for a single message - AVATARS REMOVED
const Message = ({ msg }) => {
    const isUser = msg.role === "user";
    const bubbleStyle = {
        padding: "10px 14px", 
        maxWidth: "85%", 
        lineHeight: "1.4",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        background: isUser ? COLOR_PRIMARY : COLOR_LIGHT_BLUE,
        color: isUser ? COLOR_TEXT_LIGHT : COLOR_TEXT_DARK,
        borderRadius: isUser 
            ? "20px 20px 5px 20px" 
            : "20px 20px 20px 5px" 
    };
    
    const messageContainerStyle = { 
        marginBottom: 15, 
        textAlign: isUser ? "right" : "left",
    };

    return (
        <div style={messageContainerStyle}>
            <span style={bubbleStyle}>{msg.text}</span>
        </div>
    );
};


function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [freeCount, setFreeCount] = useState(0);
    const [chats, setChats] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 769);
    const [isTopicsOpen, setIsTopicsOpen] = useState(false); 

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

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

        setMessages([{ id: crypto.randomUUID(), role: "assistant", text: "🎓 Welcome! I'm your BU Campus Assistant. Select a quick topic or ask me anything!" }]);
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
        const messagesWithIds = (chatMessages || []).map(msg => ({ 
            ...msg, 
            id: msg.id || crypto.randomUUID() 
        }));
        setMessages(messagesWithIds);
        if (window.innerWidth < 769) setSidebarOpen(false);
    };

    const resetChat = () => {
        setMessages([{ id: crypto.randomUUID(), role: "assistant", text: "New session started. How can I help you today? What's your question about Bugema University?" }]);
        setFreeCount(0);
        if (window.innerWidth < 769) setSidebarOpen(false);
    };

    const handleQuickTopicClick = (topic) => {
        setInput(topic);
        setTimeout(sendMessage, 10);
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        if (!isLoggedIn && freeCount >= 3) {
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "assistant", text: "🔒 You've reached your free question limit. Please **login** or **sign up** to continue." },
            ]);
            return;
        }

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

            const botMsg = { id: crypto.randomUUID(), role: "assistant", text: res.data.answer }; 
            setMessages((prev) => [...prev, botMsg]);
            
            if (!isLoggedIn) setFreeCount((c) => c + 1);
            if (isLoggedIn) fetchChats();
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "assistant", text: "⚠️ Unable to process your message due to a connection error. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); 
        setIsLoggedIn(false); 
        setChats([]);
        resetChat();
    };

    return (
        <>
            <style>{`
                /* Global CSS for responsiveness and hover effects */
                .sidebar { left: ${sidebarOpen ? "0" : "-300px"}; }

                /* CSS to hide the scrollbar on the sidebar, applied to the scrollable content */
                .sidebar-content {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
                .sidebar-content::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }
                
                @media (max-width: 768px) {
                    .sidebar.open { box-shadow: 2px 0 10px rgba(0,0,0,0.5); }
                    .menu-btn { display: block; }
                    .main { margin-left: 0 !important; padding-top: 50px; }
                }
                @media (min-width: 769px) {
                    .menu-btn { display: none; }
                    .main-shift { margin-left: 300px !important; }
                }
                /* Link hover style */
                .sidebar .link:hover {
                    background-color: ${COLOR_LIGHT_BLUE};
                    color: ${COLOR_DARK_BLUE};
                }
                /* Button Hover */
                .new-chat-btn:hover, .send-btn:hover { background-color: ${COLOR_DARK_BLUE} !important; }

                /* Simple Typing Animation CSS */
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
                .typing-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    margin: 0 2px;
                    background-color: ${COLOR_PRIMARY};
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
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
                    
                    {/* FIXED HEADER SECTION */}
                    <div style={styles.sidebarHeader}>
                        <div style={styles.botHeader}>
                            <img src="/bot.png" alt="BU Bot" style={styles.avatar} />
                            <div>
                                <h2 style={{ margin: 0, color: COLOR_DARK_BLUE }}>BU Chatbot</h2>
                                <p style={{ fontSize: "13px", margin: 0 }}>Your AI Campus Assistant</p>
                                <p style={{ fontSize: "12px", margin: "4px 0", color: "#4caf50" }}>🟢 Online</p>
                            </div>
                        </div>
                    </div>

                    {/* SCROLLABLE CONTENT SECTION */}
                    <div className="sidebar-content" style={styles.sidebarContent}>
                        
                        <button className="new-chat-btn" style={styles.newChatBtn} onClick={resetChat}>
                            + Start New Conversation
                        </button>

                        {/* Quick Topics Dropdown */}
                        <div style={styles.section}>
                            <div style={styles.dropdownHeader} onClick={() => setIsTopicsOpen(!isTopicsOpen)}>
                                <span>💡 Quick Topics</span>
                                <span>{isTopicsOpen ? "▲" : "▼"}</span>
                            </div>
                            <div style={{...styles.dropdownContent, ...(isTopicsOpen ? styles.dropdownOpen : {})}}>
                                {["Admissions","Registration","Academics","Financial Aid","Student Life","Campus Tour","Nearby Hostels","Cafeteria"].map((topic) => (
                                    <p 
                                        key={topic} 
                                        className="link" 
                                        style={styles.link} 
                                        onClick={() => handleQuickTopicClick(topic)}
                                    >
                                        {topic}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Recent Chats Section */}
                        {isLoggedIn && chats.length > 0 && (
                            <div style={styles.section}>
                                <h4 style={styles.sectionTitle}>💬 Recent Chats ({chats.length})</h4>
                                <div className='chat-history' style={styles.chatList}>
                                    {chats.map((c, i) => (
                                        <div key={c.id || c._id || i} className="link" style={{...styles.link, padding: '8px', marginBottom: '4px'}} onClick={() => loadChat(c.messages)}>
                                            <p style={styles.chatTitle}>
                                                {c.messages?.find(m => m.role === 'user')?.text?.slice(0, 25) || "Conversation"}...
                                            </p>
                                            <p style={styles.chatTime}>Opened: {new Date(c.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Utility and Resource Sections */}
                        <div style={styles.section}>
                            <h4 style={styles.sectionTitle}>🔗 University Resources</h4>
                            {["Student Portal","Academic Calendar","Work Program","Hospital","Emergency Contacts"].map((r) => (
                                <p key={r} className="link" style={styles.link}>{r}</p>
                            ))}
                        </div>

                        <div style={{...styles.section, marginTop: '10px', paddingTop: '15px', borderTop: `1px solid ${COLOR_LIGHT_BLUE}`}}>
                            <h4 style={styles.sectionTitle}>⚙️ Profile & Help</h4>
                            {isLoggedIn && <p className="link" style={styles.link}>My Settings</p>}
                            <p className="link" style={styles.link}>Help & Feedback</p>
                            <p className="link" style={styles.link}>System Status</p>
                        </div>
                    </div>

                </div>

                <div className={`main ${sidebarOpen && window.innerWidth >= 769 ? "main-shift" : ""}`} style={styles.main}>
                    <div style={{...styles.topBar, justifyContent: 'flex-end', paddingTop: '5px'}}>
                        {/* Auth Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!isLoggedIn ? (
                                <>
                                    <a href="/login" style={styles.loginBtn}>Login</a>
                                    <a href="/signup" style={styles.signupBtn}>Sign Up</a>
                                </>
                            ) : (
                                <button style={{...styles.loginBtn, backgroundColor: '#d32f2f', color: 'white', border: 'none'}} onClick={handleLogout}>
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={styles.chatWindow}>
                        {messages.length === 0 && <p style={{ color: COLOR_DARK_BLUE, opacity: 0.7 }}>Ask about admissions, courses, or campus life at Bugema University!</p>}
                        
                        {/* Render all messages */}
                        {messages.map((msg) => (
                            <Message key={msg.id} msg={msg} />
                        ))}
                        
                        {/* Typing Indicator */}
                        {loading && (
                            <div style={{ textAlign: 'left', margin: '10px 0', paddingLeft: '10px' }}>
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        )}

                        {/* Spacer for Auto-Scroll */}
                        <div ref={messagesEndRef} style={{ height: '1px' }} />
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            style={styles.input}
                            placeholder="Ask your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            disabled={loading}
                        />
                        <button 
                            className="send-btn"
                            style={styles.button} 
                            onClick={sendMessage} 
                            disabled={loading || !input.trim()}
                        >
                            {loading ? "..." : "Send"}
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