import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Send,
  Loader2,
  BookOpen,
  Shield,
  History,
  Sun,
  Moon,
} from "lucide-react";
import { API_BASE_URL } from "./config/api";
import { useTheme } from "./context/ThemeContext";

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

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const createAssistantMessage = (text) => ({
  id: generateId(),
  role: "assistant",
  text,
  timestamp: new Date().toISOString(),
});

const formatTimestamp = (value) => {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const MessageBubble = ({ message }) => {
  const { isDark } = useTheme();
  const isUser = message.role === "user";
  const userClasses = isDark
    ? "bg-[#1d4ed8] text-white rounded-br-sm"
    : "bg-[#0033A0] text-white rounded-br-sm";
  const assistantClasses = isDark
    ? "bg-slate-800/70 text-slate-100 border border-slate-700/70 rounded-bl-sm"
    : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm";
  const timestampClass = isDark
    ? isUser
      ? "text-white/60"
      : "text-slate-400"
    : isUser
      ? "text-white/70"
      : "text-slate-400";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl rounded-3xl px-4 py-3 shadow-sm transition ${
          isUser ? userClasses : assistantClasses
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
        <span className={`mt-2 block text-[11px] ${timestampClass}`}>
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState(() => [
    createAssistantMessage("Hello! I'm BUchatbot, your campus assistant. Ask me anything about admissions, programs, campus life, or student services."),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeCount, setFreeCount] = useState(0);
  const [chats, setChats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("token"));
  });
  const { isDark, toggleTheme } = useTheme();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const fetchChats = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, [getToken]);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(Boolean(token));
    if (token) {
      fetchChats();
    } else {
      setChats([]);
    }
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
  };

  const resetChat = () => {
    setMessages([
      createAssistantMessage("New chat started. How can BUchatbot support you today?"),
    ]);
    if (!isLoggedIn) setFreeCount(0);
  };

  const sendMessage = async (promptText = "") => {
    const sourceText = promptText || input;
    const messageText = sourceText.trim();
    if (!messageText || loading) return;

    if (!isLoggedIn && freeCount >= FREE_QUESTION_LIMIT) {
      setMessages((prev) => [
        ...prev,
        createAssistantMessage(
          "🔒 You've reached the free question limit. Please log in or create an account for unlimited access."
        ),
      ]);
      return;
    }

    const outgoing = {
      id: generateId(),
      role: "user",
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, outgoing]);
    setInput("");
    setLoading(true);

    try {
      const token = getToken();
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        { q: messageText },
        config
      );

      const answerText =
        response.data?.answer?.trim() ||
        "I apologize, but I couldn't generate a response right now. Please try rephrasing your question or try again in a moment.";

      setMessages((prev) => [...prev, createAssistantMessage(answerText)]);

      if (isLoggedIn) {
        fetchChats();
      } else {
        setFreeCount((count) => Math.min(FREE_QUESTION_LIMIT, count + 1));
      }
    } catch (error) {
      console.error("Chat error:", error);
      let errorMessage = "⚠️ I ran into a connection issue. Please check your network and try again.";
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = "🔒 Please log in to continue chatting. Your session may have expired.";
        } else if (error.response.status === 429) {
          errorMessage = "⏱️ Too many requests. Please wait a moment and try again.";
        } else if (error.response.status >= 500) {
          errorMessage = "🔧 Server error. Our team has been notified. Please try again in a moment.";
        } else if (error.response.data?.answer) {
          errorMessage = error.response.data.answer;
        }
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "🌐 Network error. Please check your internet connection and try again.";
      }
      
      setMessages((prev) => [
        ...prev,
        createAssistantMessage(errorMessage),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAsk = (prompt) => {
    sendMessage(prompt);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    setIsLoggedIn(false);
    setChats([]);
    resetChat();
  };

  const remainingQuestions = Math.max(0, FREE_QUESTION_LIMIT - freeCount);

  const backgroundClass = isDark
    ? "bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]"
    : "bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff]";
  const overlayClass = isDark
    ? "bg-[radial-gradient(circle_at_15%_20%,_rgba(37,99,235,0.2),_transparent_60%)]"
    : "bg-[radial-gradient(circle_at_20%_18%,_rgba(0,51,160,0.18),_transparent_55%)]";
  const panelBorder = isDark ? "border-slate-800/80" : "border-[#c5d4ff]";
  const panelBackground = isDark ? "bg-slate-900/80" : "bg-white/95";
  const sidebarBackground = isDark ? "bg-slate-900/60" : "bg-white/80";
  const sidebarBorder = isDark ? "border-slate-800/70" : "border-[#c5d4ff]";
  const headingColor = isDark ? "text-slate-100" : "text-[#0f2a66]";
  const bodyColor = isDark ? "text-slate-300" : "text-[#2d3e73]";
  const mutedColor = isDark ? "text-slate-400" : "text-[#51629b]";
  const badgeClass = isDark
    ? "bg-slate-800/80 text-slate-200"
    : "bg-[#0033A0]/10 text-[#0033A0]";
  const buttonPrimary = isDark
    ? "bg-[#1b4ed6] hover:bg-[#13389c]"
    : "bg-[#0033A0] hover:bg-[#062a7a]";
  const quickButton = isDark
    ? "border-slate-800/70 bg-slate-900/80 text-slate-200 hover:bg-slate-800/80"
    : "border-[#d6dfff] bg-white text-[#102863] hover:border-[#0033A0]";
  const accentLink = isDark
    ? "text-[#9db8ff] hover:text-white"
    : "text-[#0033A0] hover:text-[#062a7a]";

  return (
    <div className={`relative min-h-screen overflow-hidden ${backgroundClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 lg:px-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img src="/bot.png" alt="BUchatbot logo" className="h-12 w-12 rounded-xl object-cover" />
            <div className="space-y-1">
              <h1 className={`text-2xl font-semibold ${headingColor}`}>BUchatbot</h1>
              <p className={`text-sm ${bodyColor}`}>Always-on campus guidance across admissions, academics, and student life.</p>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${badgeClass}`}>
                Live
                <span className="inline-flex h-2 w-2 rounded-full bg-[#00d084]" />
                Secure
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${isDark ? "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-slate-500" : "border-[#c5d4ff] bg-white/90 text-[#0033A0] hover:border-[#0033A0]"}`}
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4" />
                  Light mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Dark mode
                </>
              )}
            </button>
            {!isLoggedIn ? (
              <>
                <a href="/login" className={`text-sm font-semibold transition ${accentLink}`}>
                  Log in
                </a>
                <a href="/signup" className={`text-sm font-semibold transition ${accentLink}`}>
                  Create account
                </a>
              </>
            ) : (
              <button onClick={handleLogout} className={`text-sm font-semibold transition ${accentLink}`}>
                Log out
              </button>
            )}
          </div>
        </header>

        <div className="mt-6 flex-1 min-h-0">
          <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section
              className={`flex min-h-0 flex-col rounded-3xl border ${panelBorder} ${panelBackground} shadow-lg shadow-[#0033A0]/10 backdrop-blur`}
            >
              <div className={`flex flex-col gap-2 border-b px-6 py-5 ${isDark ? "border-slate-800/70" : "border-[#d8e2ff]"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className={`text-lg font-semibold ${headingColor}`}>Conversation</h2>
                    <p className={`text-sm ${mutedColor}`}>
                      Ask in natural language. BUchatbot answers using verified Bugema knowledge.
                    </p>
                  </div>
                  {!isLoggedIn && (
                    <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${mutedColor}`}>
                      Free questions: {remainingQuestions} / {FREE_QUESTION_LIMIT}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={resetChat}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${isDark ? "border-slate-700 text-slate-200 hover:border-slate-500" : "border-[#c5d4ff] text-[#0f2a66] hover:border-[#0033A0]"}`}
                  >
                    Reset chat
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {loading && (
                    <div className={`flex items-center gap-2 text-sm ${mutedColor}`}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Assistant is typing…
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className={`border-t px-6 py-4 ${isDark ? "border-slate-800/70 bg-slate-900/70" : "border-[#d8e2ff] bg-white/90"}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Ask anything about campus life, admissions, or student support…"
                      className={`flex-1 resize-none rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                        isDark
                          ? "border-slate-700 bg-slate-900/80 text-slate-100 focus:border-[#9db8ff] focus:ring-[#1e3a8a]"
                          : "border-[#d6dfff] bg-white text-slate-900 focus:border-[#0033A0] focus:ring-[#c5d4ff]"
                      }`}
                      rows={1}
                      disabled={loading}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={loading || !input.trim()}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0033A0]/20 transition disabled:opacity-60 ${buttonPrimary}`}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside
              className={`flex min-h-0 flex-col gap-6 rounded-3xl border ${sidebarBorder} ${sidebarBackground} p-6 shadow-lg shadow-[#0033A0]/10 backdrop-blur`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.35em] ${mutedColor}`}>Quick topics</p>
                    <p className={`text-sm ${bodyColor}`}>Jump straight into popular questions.</p>
                  </div>
                  <button
                    onClick={resetChat}
                    className={`text-xs font-semibold transition ${accentLink}`}
                  >
                    Clear
                  </button>
                </div>
                <div className="grid gap-2">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleQuickAsk(topic)}
                      className={`text-left rounded-2xl border px-4 py-2 text-sm transition ${quickButton}`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {isLoggedIn && chats.length > 0 && (
                <div className="space-y-2">
                  <p className={`flex items-center gap-2 text-xs uppercase tracking-[0.35em] ${mutedColor}`}>
                    <History className="h-4 w-4" />
                    Saved chats
                  </p>
                  <div className="space-y-2 overflow-y-auto">
                    {chats.slice(0, 4).map((chat) => (
                      <button
                        key={chat._id}
                        onClick={() => loadChat(chat)}
                        className={`w-full text-left rounded-2xl border px-4 py-3 text-sm transition ${
                          isDark
                            ? "border-slate-800/70 bg-slate-900/70 text-slate-200 hover:border-slate-600"
                            : "border-[#d6dfff] bg-white text-[#102863] hover:border-[#0033A0]"
                        }`}
                      >
                        <p className="line-clamp-1 font-medium">{chat.messages?.find((m) => m.role === "user")?.text || "Conversation"}</p>
                        <p className={`text-[11px] ${mutedColor}`}>{formatTimestamp(chat.updatedAt)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className={`flex items-center gap-2 text-xs uppercase tracking-[0.35em] ${mutedColor}`}>
                  <BookOpen className="h-4 w-4" />
                  University resources
                </p>
                <div className="grid gap-2">
                  {resourceLinks.map(({ label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => handleQuickAsk(prompt)}
                      className={`w-full text-left rounded-2xl border px-4 py-3 text-sm transition ${quickButton}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className={`flex items-center gap-2 text-xs uppercase tracking-[0.35em] ${mutedColor}`}>
                    <Shield className="h-4 w-4" />
                    Support & profile
                  </p>
                  {!isLoggedIn ? (
                    <a href="/login" className={`text-xs font-semibold transition ${accentLink}`}>
                      Log in
                    </a>
                  ) : (
                    <button onClick={handleLogout} className={`text-xs font-semibold transition ${accentLink}`}>
                      Log out
                    </button>
                  )}
                </div>
                <div className="grid gap-2">
                  {(isLoggedIn ? supportLinks : supportLinks.slice(1)).map(({ label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => handleQuickAsk(prompt)}
                      className={`w-full text-left rounded-2xl border px-4 py-3 text-sm transition ${quickButton}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`rounded-2xl border px-4 py-4 text-sm ${
                  isDark
                    ? "border-slate-800/70 bg-slate-900/80 text-slate-200"
                    : "border-[#d6dfff] bg-white text-[#102863]"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.35em] ${mutedColor}`}>Status</p>
                <p className={`mt-2 text-sm ${bodyColor}`}>
                  {isLoggedIn
                    ? "Signed in. Conversations sync across devices."
                    : "Sign in for unlimited access and saved history."}
                </p>
                {!isLoggedIn && (
                  <div className="mt-3 flex gap-3">
                    <a
                      href="/login"
                      className={`flex-1 rounded-2xl border px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] transition ${
                        isDark ? "border-slate-700 text-slate-200 hover:border-slate-500" : "border-[#b8c8ff] text-[#0033A0] hover:border-[#0033A0]"
                      }`}
                    >
                      Login
                    </a>
                    <a
                      href="/signup"
                      className={`flex-1 rounded-2xl px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] transition ${buttonPrimary} text-white`}
                    >
                      Signup
                    </a>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
