import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Send, Loader2, BookOpen, Shield, History, Sun, Moon, Search, Menu, X, LogOut, MessageSquare } from "lucide-react";
import { API_BASE_URL } from "./config/api";
import { useTheme } from "./context/ThemeContext";

// --- Constants (Unchanged) ---
const FREE_QUESTION_LIMIT = 3;

const quickTopics = [
  "Admissions process",
  "Scholarships & financial aid",
  "Faculty of Business",
  "Campus life & clubs",
  "Work program requirements",
  "Campus directions",
  "ICT support",
  "Graduation clearance",
];

const resourceLinks = [
  { label: "Student Portal", prompt: "Tell me about the student portal" },
  { label: "Academic Calendar", prompt: "Share the key dates on the academic calendar" },
  { label: "Fees & Payments", prompt: "What are the current tuition fees?" },
  { label: "Hostels & Housing", prompt: "What accommodation options are near Bugema University?" },
  { label: "Emergency Contacts", prompt: "Who do I reach out to in case of an emergency on campus?" },
];

const supportLinks = [
  { label: "Update my profile", prompt: "How do I update my student profile?" },
  { label: "Give feedback", prompt: "How can I submit feedback about the chatbot?" },
  { label: "Check system status", prompt: "What is the current system status?" },
];

const generateId = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`);
const createAssistantMessage = (text) => ({ id: generateId(), role: "assistant", text, timestamp: new Date().toISOString() });
const formatTimestamp = (value) => { try { return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

// --- MessageBubble Component (Unchanged) ---
const MessageBubble = ({ message }) => {
  const { isDark } = useTheme();
  const isUser = message.role === "user";
  // The rounded-bl-sm for assistant is correct for a side-by-side chat view
  const bubbleClasses = isUser
    ? isDark ? "bg-[#1d4ed8] text-white rounded-br-sm" : "bg-[#0033A0] text-white rounded-br-sm"
    : isDark ? "bg-slate-800/70 text-slate-100 border border-slate-700/70 rounded-bl-sm" : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm";
  const timestampClass = isDark ? (isUser ? "text-white/60" : "text-slate-400") : (isUser ? "text-white/70" : "text-slate-400");

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs sm:max-w-md md:max-w-lg rounded-3xl px-4 py-3 shadow-md transition ${bubbleClasses}`}>
        <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
        <span className={`mt-2 block text-[11px] ${timestampClass}`}>{formatTimestamp(message.timestamp)}</span>
      </div>
    </div>
  );
};

// --- SidebarSection Component (Unchanged) ---
const SidebarSection = ({ title, icon: Icon, description, items = [], children }) => {
  const { isDark } = useTheme();
  const bodyColor = isDark ? "text-slate-300" : "text-[#2d3e73]";
  const mutedColor = isDark ? "text-slate-400" : "text-[#51629b]";
  const buttonClass = isDark ? "border-slate-800/70 bg-slate-900/80 text-slate-200 hover:bg-slate-800/80" : "border-[#d6dfff] bg-white text-[#102863] hover:border-[#0033A0] hover:shadow-sm";

  return (
    <div className="space-y-3">
      <div>
        <p className={`flex items-center gap-2 text-xs uppercase tracking-[0.35em] ${mutedColor}`}>
          {Icon && <Icon className="h-4 w-4" />} {title}
        </p>
        {description && <p className={`text-sm ${bodyColor}`}>{description}</p>}
      </div>
      <div className="grid gap-2">
        {items.map(({ label, action, timestamp }) => (
          <button key={label} onClick={action} className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition ${buttonClass}`}>
            <p className="font-medium line-clamp-1">{label}</p>
            {timestamp && <p className={`text-[11px] ${mutedColor}`}>{timestamp}</p>}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
};

// --- Chatbot Component (Revised) ---
const Chatbot = () => {
  // ... (State and Hooks - Unchanged) ...
  const [messages, setMessages] = useState([createAssistantMessage("Hello! I'm BUchatbot, your campus assistant. Ask me anything about admissions, programs, campus life, or student services.")]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeCount, setFreeCount] = useState(0);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(typeof window !== "undefined" && localStorage.getItem("token")));
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const messagesEndRef = useRef(null);

  // ... (Functions - Unchanged) ...
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, loading]);

  const getToken = useCallback(() => (typeof window === "undefined" ? null : localStorage.getItem("token")), []);
  const fetchChats = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/history`, { headers: { Authorization: `Bearer ${token}` } });
      setChats(Array.isArray(res.data) ? res.data : []);
      setFilteredChats(Array.isArray(res.data) ? res.data : []);
    } catch (error) { console.error("Error fetching chats:", error); }
  }, [getToken]);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(Boolean(token));
    if (token) fetchChats();
    else setChats([]);
  }, [getToken, fetchChats]);

  const loadChat = (chat) => {
    if (!chat?.messages) return;
    const hydrated = chat.messages.map((msg) => ({
      id: msg._id || msg.id || generateId(),
      role: msg.role,
      text: msg.text,
      timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
    }));
    setMessages(hydrated);
    if (sidebarOpen) setSidebarOpen(false);
  };

  const resetChat = () => { setMessages([createAssistantMessage("New chat started. How can BUchatbot support you today?")]); if (!isLoggedIn) setFreeCount(0); };
  const sendMessage = async (promptText = "") => {
    const messageText = (promptText || input).trim();
    if (!messageText || loading) return;

    if (!isLoggedIn && freeCount >= FREE_QUESTION_LIMIT) {
      setMessages((prev) => [...prev, createAssistantMessage("🔒 Free question limit reached. Please log in for unlimited access.")]);
      return;
    }

    setMessages((prev) => [...prev, { id: generateId(), role: "user", text: messageText, timestamp: new Date().toISOString() }]);
    setInput(""); setLoading(true);

    try {
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post(`${API_BASE_URL}/chat`, { q: messageText }, config);
      const answerText = response.data?.answer?.trim() || "I couldn't generate a response. Please try again.";
      setMessages((prev) => [...prev, createAssistantMessage(answerText)]);
      if (isLoggedIn) fetchChats();
      else setFreeCount((c) => Math.min(FREE_QUESTION_LIMIT, c + 1));
    } catch (error) {
      console.error("Chat error:", error);
      let errorMessage = "⚠️ Connection issue. Please check your network.";
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) errorMessage = "🔒 Please log in. Session expired.";
        else if (status === 429) errorMessage = "⏱️ Too many requests. Wait and try again.";
        else if (status >= 500) errorMessage = "🔧 Server error. Try again later.";
        else if (data?.answer) errorMessage = data.answer;
      } else if (error.code === "ERR_NETWORK") errorMessage = "🌐 Network error. Check your connection.";
      setMessages((prev) => [...prev, createAssistantMessage(errorMessage)]);
    } finally { setLoading(false); }
  };

  const handleQuickAsk = (prompt) => sendMessage(prompt);
  const handleLogout = () => { if (typeof window !== "undefined") { localStorage.removeItem("token"); localStorage.removeItem("role"); } setIsLoggedIn(false); setChats([]); resetChat(); };
  const remainingQuestions = Math.max(0, FREE_QUESTION_LIMIT - freeCount);

  useEffect(() => {
    if (!searchQuery.trim()) setFilteredChats(chats);
    else setFilteredChats(chats.filter(chat =>
      chat.messages?.some(m => m.role==="user" && m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
  }, [searchQuery, chats]);

  // --- Utility Classes (Refined) ---
  const backgroundClass = isDark ? "bg-[#0f172a]" : "bg-[#eff4ff]";
  const panelClasses = isDark ? "bg-slate-900/80 border-slate-800/80" : "bg-white/95 border-[#c5d4ff]";
  const sidebarClasses = isDark ? "bg-slate-900/60 border-slate-800/70 lg:shadow-2xl lg:shadow-black/50" : "bg-white/90 border-[#c5d4ff] lg:shadow-xl lg:shadow-[#c5d4ff]/50";
  const headingColor = isDark ? "text-slate-100" : "text-[#0f2a66]";
  const bodyColor = isDark ? "text-slate-300" : "text-[#2d3e73]";
  const mutedColor = isDark ? "text-slate-400" : "text-[#51629b]";
  const buttonPrimary = isDark ? "bg-[#1b4ed6] hover:bg-[#13389c]" : "bg-[#0033A0] hover:bg-[#062a7a]";
  const accentLink = isDark ? "text-[#9db8ff] hover:text-white" : "text-[#0033A0] hover:text-[#062a7a]";
  const inputClass = isDark ? "border-slate-700 bg-slate-900/80 text-slate-100 focus:border-[#9db8ff] focus:ring-[#1e3a8a]" : "border-[#d6dfff] bg-white text-slate-900 focus:border-[#0033A0] focus:ring-[#c5d4ff]";
  const headerBorder = isDark ? "border-slate-800/70" : "border-[#d8e2ff]";

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen w-screen overflow-hidden ${backgroundClass}`}>
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-30 lg:hidden transition-opacity ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} bg-black/40`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-72 transform lg:translate-x-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarClasses} flex-shrink-0 flex flex-col gap-6 p-6 overflow-y-auto`}>
        {/* Sidebar Header and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className={`h-6 w-6 ${headingColor}`} />
            <h3 className={`text-lg font-bold ${headingColor}`}>BU Chat</h3>
          </div>
          <button onClick={resetChat} className={`text-xs font-medium px-3 py-1 rounded-full border transition ${accentLink} ${isDark ? "border-slate-800/70 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"}`}>
             New Chat
          </button>
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}><X className={`h-5 w-5 ${mutedColor}`} /></button>
        </div>

        <div className="space-y-6 flex-1">
          {/* Search for Logged-In Users */}
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <Search className={`h-4 w-4 ${mutedColor}`} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${isDark ? "bg-slate-900/80 border-slate-700 text-slate-200" : "bg-white border-[#d6dfff] text-[#102863]"}`}
              />
            </div>
          )}

          {/* Chat History */}
          {isLoggedIn && (
            <SidebarSection title="Your History" icon={History} items={filteredChats.slice(0, 8).map(chat => ({
              label: chat.messages?.find(m=>m.role==="user")?.text||"Conversation",
              action: () => loadChat(chat),
              timestamp: formatTimestamp(chat.updatedAt)
            }))} />
          )}
          
          {/* Quick Topics */}
          <SidebarSection title="Quick topics" icon={BookOpen} description="Jump straight into popular questions" items={quickTopics.map(t => ({ label: t, action: () => handleQuickAsk(t) }))} />
          <SidebarSection title="University resources" icon={BookOpen} items={resourceLinks.map(({ label, prompt }) => ({ label, action: () => handleQuickAsk(prompt) }))} />
        </div>

        {/* Footer/Utility Section */}
        <div className={`mt-auto pt-6 border-t space-y-3 ${headerBorder}`}>
            <SidebarSection title="Support & profile" icon={Shield} items={(isLoggedIn ? supportLinks : supportLinks.slice(1)).map(({ label, prompt }) => ({ label, action: () => handleQuickAsk(prompt) }))} />

            <div className="flex justify-between items-center pt-2">
                <button 
                    onClick={toggleTheme} 
                    className={`p-2 rounded-full transition ${isDark ? "bg-slate-800/70 text-slate-200 hover:bg-slate-700" : "bg-white text-[#102863] hover:bg-slate-100 border border-slate-200"}`}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {isLoggedIn ? (
                    <button 
                        onClick={handleLogout} 
                        className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition ${isDark ? "bg-slate-800/70 text-red-400 hover:bg-slate-700" : "bg-white text-red-600 hover:bg-slate-100 border border-slate-200"}`}
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                ) : (
                    <span className={`text-sm ${bodyColor}`}>
                        <a href="/login" className={accentLink}>Login</a> for unlimited access.
                    </span>
                )}
            </div>
        </div>
      </aside>

      {/* Chat Panel - Takes all remaining space */}
      <section className={`flex flex-col flex-1 min-h-screen lg:ml-72 border-r ${panelClasses}`}>
        
        {/* Header/Status Bar */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBorder}`}>
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button className="lg:hidden p-2 rounded-full" onClick={() => setSidebarOpen(true)}>
              <Menu className={`h-6 w-6 ${headingColor}`} />
            </button>
            <h2 className={`text-xl font-semibold ${headingColor}`}>BU Chatbot</h2>
          </div>
          
          {!isLoggedIn && (
            <span className={`text-xs font-semibold uppercase tracking-[0.35em] rounded-full px-3 py-1 ${isDark ? "bg-slate-800 text-yellow-400" : "bg-yellow-100 text-yellow-800"}`}>
              Free: {remainingQuestions} questions left
            </span>
          )}
          {/* Desktop Theme Toggle (Moved to sidebar for cleaner chat header) */}
        </div>

        {/* Message Area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
          {messages.map(m => <MessageBubble key={m.id} message={m} />)}
          {loading && <div className={`flex items-center gap-2 text-sm ${mutedColor}`}><Loader2 className="h-4 w-4 animate-spin" /> Assistant is typing…</div>}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input Area */}
        <div className={`px-4 sm:px-6 py-4 border-t ${isDark ? "border-slate-800/70 bg-slate-900/70" : "border-[#d8e2ff] bg-white/90"}`}>
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything about campus life or student support…"
              className={`flex-1 resize-none rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 max-h-36 ${inputClass}`}
              rows={1} disabled={loading}
            />
            <button 
              onClick={() => sendMessage()} 
              disabled={loading || !input.trim()} 
              className={`flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0033A0]/20 transition disabled:opacity-60 disabled:shadow-none ${buttonPrimary}`}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chatbot;