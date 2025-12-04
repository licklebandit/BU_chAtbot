import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import {
  Send,
  Loader2,
  BookOpen,
  Shield,
  History,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  LogOut,
  Mic,
  Square,
  Play,
  Trash2,
  Globe,
  ChevronDown,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  MessageSquare,
  MicOff,
} from "lucide-react";
import { API_BASE_URL } from "./config/api";
import { useTheme } from "./context/ThemeContext";
import FeedbackButton from "./components/FeedbackButton";
import TypingIndicator from "./components/TypingIndicator";
import SuggestedQuestions from "./components/SuggestedQuestions";
import ExportChatButton from "./components/ExportChatButton";
import useSpeechRecognition from "./hooks/useSpeechRecognition";

// --- Constants ---
const FREE_QUESTION_LIMIT = 3;

// Language code mapping for speech recognition and TTS
const SPEECH_LANG_MAP = {
  en: 'en-US',
  sw: 'sw-KE',
  fr: 'fr-FR',
  lg: 'lg-UG'
};

const generateId = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

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

// --- MessageBubble Component ---
const MessageBubble = ({ message, previousMessage, onSpeak, isSpeaking, speakingMessageId }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const isUser = message.role === "user";
  
  const bubbleClasses = isUser
    ? isDark
      ? "bg-[#1d4ed8] text-white rounded-br-sm"
      : "bg-[#0033A0] text-white rounded-br-sm"
    : isDark
      ? "bg-slate-800/70 text-slate-100 border border-slate-700/70 rounded-bl-sm"
      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm";
      
  const timestampClass = isDark
    ? isUser
      ? "text-white/60"
      : "text-slate-400"
    : isUser
      ? "text-white/70"
      : "text-slate-400";

  const isThisMessageSpeaking = isSpeaking && speakingMessageId === message.id;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className="flex flex-col max-w-xs sm:max-w-md md:max-w-lg">
        <div
          className={`rounded-3xl px-4 py-3 shadow-md transition ${bubbleClasses}`}
        >
          {message.image && (
            <img
              src={message.image}
              alt="Uploaded content"
              className="rounded-lg mb-2 max-w-full h-auto"
              style={{ maxHeight: '200px' }}
            />
          )}
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {message.text}
          </p>
          <span className={`mt-2 block text-[11px] ${timestampClass}`}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        {/* Feedback and Speech buttons for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <FeedbackButton
              messageId={message.id}
              question={previousMessage?.text || ""}
              answer={message.text}
              onFeedbackSubmit={(feedback) => {
                console.log("Feedback submitted:", feedback);
              }}
            />
            <button
              onClick={() => onSpeak(message)}
              className={`p-1.5 rounded-lg transition ${
                isDark 
                  ? "hover:bg-slate-700 text-slate-400" 
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              title={t('speak')}
            >
              {isThisMessageSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SidebarSection Component ---
const SidebarSection = ({
  title,
  icon: Icon,
  description,
  items = [],
  children,
}) => {
  const { isDark } = useTheme();
  const bodyColor = isDark ? "text-slate-300" : "text-[#2d3e73]";
  const mutedColor = isDark ? "text-slate-400" : "text-[#51629b]";
  const buttonClass = isDark
    ? "border-slate-800/70 bg-slate-900/80 text-slate-200 hover:bg-slate-800/80"
    : "border-[#d6dfff] bg-white text-[#102863] hover:border-[#0033A0] hover:shadow-sm";

  return (
    <div className="space-y-3">
      <div>
        <p
          className={`flex items-center gap-2 text-xs uppercase tracking-[0.35em] ${mutedColor}`}
        >
          {Icon && <Icon className="h-4 w-4" />} {title}
        </p>
        {description && <p className={`text-sm ${bodyColor}`}>{description}</p>}
      </div>
      <div className="grid gap-2">
        {items.map(({ label, action, timestamp }) => (
          <button
            key={label}
            onClick={action}
            className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition ${buttonClass}`}
          >
            <p className="font-medium line-clamp-1">{label}</p>
            {timestamp && (
              <p className={`text-[11px] ${mutedColor}`}>{timestamp}</p>
            )}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
};

// --- VoiceInput Component (Combined Approach) ---
const VoiceInput = ({ 
  onTranscript, 
  currentLanguage, 
  isDark, 
  isListening, 
  toggleListening 
}) => {
  const { t } = useTranslation();
  
  // Use the speech recognition hook
  const { 
    isListening: hookIsListening, 
    isSpeaking,
    startListening, 
    stopListening, 
    speak,
    stopSpeaking
  } = useSpeechRecognition((text) => {
    onTranscript(text);
  });

  const handleVoiceToggle = () => {
    if (isListening || hookIsListening) {
      const finalText = stopListening();
      if (finalText) {
        onTranscript(finalText);
      }
    } else {
      const speechLang = SPEECH_LANG_MAP[currentLanguage] || 'en-US';
      startListening(speechLang);
    }
  };

  return (
    <button
      onClick={handleVoiceToggle}
      className={`flex-shrink-0 p-3 rounded-xl border transition ${
        isListening || hookIsListening
          ? "border-red-500 bg-red-500 text-white"
          : isDark 
            ? "border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700" 
            : "border-[#d6dfff] bg-white text-[#102863] hover:border-[#0033A0]"
      }`}
      title={isListening || hookIsListening ? t('stopListening') : t('listening')}
    >
      {isListening || hookIsListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  );
};

// --- Main Chatbot Component ---
const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  
  // State Management
  const [messages, setMessages] = useState([
    createAssistantMessage(t('welcome')),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeCount, setFreeCount] = useState(0);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(typeof window !== "undefined" && localStorage.getItem("token")),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  
  useEffect(() => scrollToBottom(), [messages, loading]);

  // Token management
  const getToken = useCallback(
    () =>
      typeof window === "undefined" ? null : localStorage.getItem("token"),
    [],
  );

  // Fetch chat history
  const fetchChats = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(Array.isArray(res.data) ? res.data : []);
      setFilteredChats(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, [getToken]);

  // Initialize authentication state
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(Boolean(token));
    if (token) fetchChats();
    else setChats([]);
  }, [getToken, fetchChats]);

  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([createAssistantMessage(t('welcome'))]);
    }
  }, [i18n.language]);

  // Language change handler
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    setLanguageDropdownOpen(false);
  };

  // Handle text-to-speech for messages
  const handleSpeak = (message) => {
    if (isSpeaking && speakingMessageId === message.id) {
      // Stop speaking
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    } else {
      // Start speaking
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        
        const utterance = new SpeechSynthesisUtterance(message.text);
        utterance.lang = SPEECH_LANG_MAP[currentLanguage] || 'en-US';
        
        utterance.onstart = () => {
          setIsSpeaking(true);
          setSpeakingMessageId(message.id);
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        };
        
        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        };
        
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Handle audio transcript
  const handleAudioTranscript = (transcript) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
  };

  // Toggle listening state
  const toggleListening = () => {
    setIsListening(!isListening);
  };

  // Load chat from history
  const loadChat = (chat) => {
    if (!chat?.messages) return;
    const hydrated = chat.messages.map((msg) => ({
      id: msg._id || msg.id || generateId(),
      role: msg.role,
      text: msg.text,
      image: msg.image || null,
      timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
    }));
    setMessages(hydrated);
    setSuggestedQuestions([]);
    if (sidebarOpen) setSidebarOpen(false);
  };

  // Reset chat
  const resetChat = () => {
    setMessages([createAssistantMessage(t('newChat'))]);
    setSuggestedQuestions([]);
    setCurrentChatId(null);
    if (!isLoggedIn) setFreeCount(0);
  };

  // Image handling
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const token = getToken();
      const config = token
        ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        : { headers: { 'Content-Type': 'multipart/form-data' } };

      const response = await axios.post(`${API_BASE_URL}/chat/upload-image`, formData, config);
      return response.data.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  // Main send message function
  const sendMessage = async (promptText = "") => {
    const messageText = (promptText || input).trim();
    const hasImage = selectedImage !== null;
    if ((!messageText && !hasImage) || loading) return;

    if (!isLoggedIn && freeCount >= FREE_QUESTION_LIMIT) {
      setMessages((prev) => [
        ...prev,
        createAssistantMessage(
          `🔒 ${t('freeQuestions')} ${t('unlimitedAccess')}.`,
        ),
      ]);
      return;
    }

    // Upload image if selected
    let imageUrl = null;
    if (hasImage) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        setMessages((prev) => [
          ...prev,
          createAssistantMessage(t('uploadFailed') || "❌ Failed to upload image. Please try again."),
        ]);
        return;
      }
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: "user",
        text: messageText,
        image: imageUrl,
        timestamp: new Date().toISOString(),
      },
    ]);
    
    setInput("");
    removeImage();
    setLoading(true);
    setSuggestedQuestions([]);

    try {
      const token = getToken();
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      
      const requestData = { q: messageText };
      if (imageUrl) {
        requestData.imageUrl = imageUrl;
      }

      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        requestData,
        config,
      );
      
      const answerText =
        response.data?.answer?.trim() ||
        "I couldn't generate a response. Please try again.";
      
      setMessages((prev) => [...prev, createAssistantMessage(answerText)]);

      if (response.data?.suggestedQuestions) {
        setSuggestedQuestions(response.data.suggestedQuestions);
      }

      if (isLoggedIn) {
        fetchChats();
        const historyResponse = await axios.get(
          `${API_BASE_URL}/chat/history`,
          config,
        );
        if (historyResponse.data && historyResponse.data.length > 0) {
          setCurrentChatId(historyResponse.data[0]._id);
        }
      } else {
        setFreeCount((c) => Math.min(FREE_QUESTION_LIMIT, c + 1));
      }
    } catch (error) {
      console.error("Chat error:", error);
      let errorMessage = "⚠️ Connection issue. Please check your network.";
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) errorMessage = "🔒 Please log in. Session expired.";
        else if (status === 429)
          errorMessage = "⏱️ Too many requests. Wait and try again.";
        else if (status >= 500)
          errorMessage = "🔧 Server error. Try again later.";
        else if (data?.answer) errorMessage = data.answer;
      } else if (error.code === "ERR_NETWORK")
        errorMessage = "🌐 Network error. Check your connection.";
      setMessages((prev) => [...prev, createAssistantMessage(errorMessage)]);
    } finally {
      setLoading(false);
    }
  };

  // Quick ask handler
  const handleQuickAsk = (prompt) => sendMessage(prompt);

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    setIsLoggedIn(false);
    setChats([]);
    resetChat();
  };

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
    } else {
      setFilteredChats(
        chats.filter((chat) =>
          chat.messages?.some(
            (m) =>
              m.role === "user" &&
              m.text.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        ),
      );
    }
  }, [searchQuery, chats]);

  const remainingQuestions = Math.max(0, FREE_QUESTION_LIMIT - freeCount);

  // Get translated quick topics and resource links
  const quickTopicsList = t('quickTopicsList', { returnObjects: true }) || [];
  const resourceLinksList = t('resourceLinks', { returnObjects: true }) || [];
  const supportLinksList = t('supportLinks', { returnObjects: true }) || [];

  // Styling classes
  const backgroundClass = isDark ? "bg-[#0f172a]" : "bg-[#eff4ff]";
  const panelClasses = isDark
    ? "bg-slate-900/80 border-slate-800/80"
    : "bg-white/95 border-[#c5d4ff]";
  const sidebarClasses = isDark
    ? "bg-slate-900/60 border-slate-800/70 lg:shadow-2xl lg:shadow-black/50"
    : "bg-white/90 border-[#c5d4ff] lg:shadow-xl lg:shadow-[#c5d4ff]/50";
  const headingColor = isDark ? "text-slate-100" : "text-[#0f2a66]";
  const mutedColor = isDark ? "text-slate-400" : "text-[#51629b]";
  const buttonPrimary = isDark
    ? "bg-[#1b4ed6] hover:bg-[#13389c]"
    : "bg-[#0033A0] hover:bg-[#062a7a]";
  const inputClass = isDark
    ? "border-slate-700 bg-slate-900/80 text-slate-100 focus:border-[#9db8ff] focus:ring-[#1e3a8a]"
    : "border-[#d6dfff] bg-white text-slate-900 focus:border-[#0033A0] focus:ring-[#c5d4ff]";
  const headerBorder = isDark ? "border-slate-800/70" : "border-[#d8e2ff]";

  return (
    <div
      className={`flex flex-col lg:flex-row min-h-screen w-screen overflow-hidden ${backgroundClass}`}
    >
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-30 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } bg-black/40`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 transform lg:translate-x-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarClasses} flex-shrink-0 flex flex-col gap-4 p-4 overflow-y-auto`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img
            src="/bot.png"  // This points to public/bot.png
            alt="BU Chatbot"
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
            <h3 className={`text-lg font-bold ${headingColor}`}>BUChatbot</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                isDark 
                  ? "bg-slate-800 hover:bg-slate-700 text-white" 
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
              }`}
            >
              {t('newChatButton')}
            </button>
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className={`h-5 w-5 ${mutedColor}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto py-2">
          {/* Search for Logged-In Users */}
          {isLoggedIn && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-4 w-4 ${mutedColor}`} />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500/50" 
                    : "bg-white border border-gray-200 text-gray-800 focus:ring-2 focus:ring-blue-200"
                }`}
              />
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
                isDark 
                  ? "hover:bg-slate-700/50" 
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{t('selectLanguage')}</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${
                  languageDropdownOpen ? 'transform rotate-180' : ''
                }`} 
              />
            </button>
            {languageDropdownOpen && (
              <div className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg border overflow-hidden ${
                isDark 
                  ? "bg-slate-800 border-slate-700" 
                  : "bg-white border-gray-200"
              }`}>
                {Object.entries(t('languages', { returnObjects: true })).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      currentLanguage === code
                        ? isDark 
                          ? 'bg-slate-700 text-blue-400' 
                          : 'bg-blue-50 text-blue-600'
                        : isDark 
                          ? 'text-gray-200 hover:bg-slate-700' 
                          : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat History */}
          {isLoggedIn && (
            <SidebarSection
              title={t('yourHistory')}
              icon={History}
              items={filteredChats.slice(0, 6).map((chat) => ({
                label:
                  chat.messages?.find((m) => m.role === "user")?.text ||
                  t('conversation'),
                action: () => loadChat(chat),
                timestamp: formatTimestamp(chat.updatedAt),
              }))}
            />
          )}

          {/* Quick Topics */}
          <SidebarSection
            title={t('quickTopics')}
            icon={BookOpen}
            items={Array.isArray(quickTopicsList) ? quickTopicsList.map((topic) => ({
              label: topic,
              action: () => handleQuickAsk(topic),
            })) : []}
          />

          {/* University Resources */}
          <SidebarSection
            title={t('universityResources')}
            icon={BookOpen}
            items={Array.isArray(resourceLinksList) ? resourceLinksList.map(({ label, prompt }) => ({
              label,
              action: () => handleQuickAsk(prompt),
            })) : []}
          />
        </div>

        {/* Footer */}
        <div className={`mt-auto pt-4 border-t space-y-3 ${headerBorder}`}>
          <SidebarSection
            title={t('supportProfile')}
            icon={Shield}
            items={Array.isArray(supportLinksList) ? 
              (isLoggedIn ? supportLinksList : supportLinksList.slice(1)).map(
                ({ label, prompt }) => ({
                  label,
                  action: () => handleQuickAsk(prompt),
                }),
              ) : []}
          />

          <div className="flex justify-between items-center pt-2 text-sm">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition ${
                isDark 
                  ? "bg-slate-800/70 text-slate-200 hover:bg-slate-700" 
                  : "bg-white text-[#102863] hover:bg-slate-100 border border-slate-200"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition ${
                  isDark 
                    ? "bg-slate-800/70 text-red-400 hover:bg-slate-700" 
                    : "bg-white text-red-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <LogOut className="h-4 w-4" /> {t('logout')}
              </button>
            ) : (
              <span className="text-sm">
                <a href="/login" className={isDark ? "text-[#9db8ff] hover:text-white" : "text-[#0033A0] hover:text-[#062a7a]"}>
                  {t('login')}
                </a>
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Chat Panel */}
      <section
        className={`flex flex-col flex-1 min-h-screen lg:ml-72 border-r ${panelClasses}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${headerBorder}`}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-full"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className={`h-6 w-6 ${headingColor}`} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn && currentChatId && messages.length > 1 && (
              <ExportChatButton chatId={currentChatId} />
            )}

            {!isLoggedIn && (
              <span
                className={`text-xs font-semibold uppercase tracking-[0.35em] rounded-full px-3 py-1 ${
                  isDark 
                    ? "bg-slate-800 text-yellow-400" 
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {t('freeQuestions')}: {remainingQuestions}
              </span>
            )}
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
          {messages.map((m, index) => (
            <MessageBubble
              key={m.id}
              message={m}
              previousMessage={index > 0 ? messages[index - 1] : null}
              onSpeak={handleSpeak}
              isSpeaking={isSpeaking}
              speakingMessageId={speakingMessageId}
            />
          ))}
          {loading && <TypingIndicator />}

          {suggestedQuestions.length > 0 && !loading && (
            <SuggestedQuestions
              questions={suggestedQuestions}
              onQuestionClick={(question) => {
                setInput(question);
                sendMessage(question);
              }}
              className="mt-4"
            />
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input Area */}
        <div
          className={`px-4 sm:px-6 py-4 border-t ${
            isDark 
              ? "border-slate-800/70 bg-slate-900/70" 
              : "border-[#d8e2ff] bg-white/90"
          }`}
        >
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 flex items-center gap-3">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt={t('imageSelected')}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
              <p className={`text-sm ${mutedColor}`}>
                {t('imageSelected')}
              </p>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Image Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex-shrink-0 p-3 rounded-xl border transition ${
                isDark 
                  ? "border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700" 
                  : "border-[#d6dfff] bg-white text-[#102863] hover:border-[#0033A0]"
              }`}
              disabled={loading}
              title={t('uploadImage')}
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            {/* Voice Input Button */}
            <VoiceInput
              onTranscript={handleAudioTranscript}
              currentLanguage={currentLanguage}
              isDark={isDark}
              isListening={isListening}
              toggleListening={toggleListening}
            />

            {/* Text Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={t('typeMessage')}
              className={`flex-1 resize-none rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 max-h-36 ${inputClass}`}
              rows={1}
              disabled={loading}
            />

            {/* Send Button */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || (!input.trim() && !selectedImage)}
              className={`flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0033A0]/20 transition disabled:opacity-60 disabled:shadow-none ${buttonPrimary}`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">{t('send')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chatbot;