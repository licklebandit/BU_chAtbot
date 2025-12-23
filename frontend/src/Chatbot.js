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
  Search,
  Menu,
  X,
  LogOut,
  Mic,
  Square,
  Play,
  Trash2,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  MessageSquare,
  MicOff,
  AlertCircle,
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

// Static content for English-only version
const STATIC_CONTENT = {
  // UI Text
  newChat: "Hello! I'm BUchatbot, your campus assistant. How can I help you today?",
  newChatButton: 'New Chat',
  send: 'Send',
  logout: 'Logout',
  login: 'Login',
  searchPlaceholder: 'Search conversations...',
  yourHistory: 'Your History',
  quickTopics: 'Quick Topics',
  universityResources: 'University Resources',
  supportProfile: 'Support & Profile',
  freeQuestions: 'Free Questions',
  unlimitedAccess: 'Please log in for unlimited access.',
  uploadFailed: '❌ Failed to upload image. Please try again.',
  imageSelected: 'Image selected',
  uploadImage: 'Upload Image',
  voiceNotSupported: 'Voice input not supported',
  readAloud: 'Read Aloud',
  conversation: 'Conversation',

  // Quick topics list
  quickTopicsList: [
    "What are the library hours?",
    "How do I register for classes?",
    "Where is the student center?",
    "What dining options are available?",
    "How do I access my student email?",
    "Where can I find academic advising?"
  ],

  // Resource links
  resourceLinks: [
    { label: 'Academic Calendar', prompt: 'Show me the academic calendar for this semester' },
    { label: 'Campus Map', prompt: 'Where can I find a campus map?' },
    { label: 'Tuition Payment', prompt: 'How do I pay my tuition?' },
    { label: 'Library Resources', prompt: 'What resources are available in the library?' },
    { label: 'Career Services', prompt: 'Tell me about career services' }
  ],

  // Support links
  supportLinks: [
    { label: 'Technical Support', prompt: 'I need technical support' },
    { label: 'Academic Advising', prompt: 'How do I contact academic advising?' },
    { label: 'Counseling Services', prompt: 'Tell me about counseling services' },
    { label: 'Financial Aid', prompt: 'How do I apply for financial aid?' }
  ]
};

const generateId = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const createAssistantMessage = (text, source = null) => ({
  id: generateId(),
  role: "assistant",
  text,
  source,
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
const MessageBubble = ({
  message,
  previousMessage,
  onSpeak,
  isSpeaking,
  speakingMessageId,
  chatId // Add this prop
}) => {
  const { isDark } = useTheme();
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
            {/* Source Badge */}
            {message.source && !isUser && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${message.source.includes('knowledge_base')
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : message.source.includes('web')
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}>
                {message.source.includes('knowledge_base') && <BookOpen className="w-3 h-3 mr-1" />}
                {message.source.includes('web') && <Search className="w-3 h-3 mr-1" />}
                {message.source.includes('knowledge_base') ? "Knowledge Base" : message.source.includes('web') ? "Web Search" : "AI"}
              </span>
            )}
          </span>
        </div>

        {/* Feedback and Speech buttons for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <FeedbackButton
              messageId={message.id}
              question={previousMessage?.text || ""}
              answer={message.text}
              chatId={chatId} // Pass chatId here
              onFeedbackSubmit={(feedback) => {
                console.log("Feedback submitted:", feedback);
              }}
            />
            <button
              onClick={() => onSpeak(message)}
              className={`p-1.5 rounded-lg transition ${isDark
                ? "hover:bg-slate-700 text-slate-400"
                : "hover:bg-gray-100 text-gray-600"
                }`}
              title="Read Aloud"
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

// --- VoiceInput Component ---
const VoiceInput = ({
  onTranscript,
  isDark
}) => {
  const [localError, setLocalError] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const statusTimeoutRef = useRef(null);
  const hasSentTranscriptRef = useRef(false);

  const {
    isListening,
    error,
    isSupported,
    startListening,
    stopListening
  } = useSpeechRecognition((text) => {
    console.log('VoiceInput: Received FINAL transcript:', text);
    if (text && text.trim()) {
      if (!hasSentTranscriptRef.current) {
        onTranscript(text);
        hasSentTranscriptRef.current = true;
      }
    }
  });

  // Update local error when hook error changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // Clear status timeout on unmount
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const handleVoiceToggle = async () => {
    console.log('Voice toggle clicked');
    setLocalError(null);

    if (!isSupported) {
      const msg = 'Voice input requires Chrome or Edge browser.';
      alert(msg);
      return;
    }

    if (isListening) {
      console.log('Stopping listening...');
      stopListening();
      setShowStatus(false);
      hasSentTranscriptRef.current = false;
    } else {
      console.log('Starting listening...');
      setShowStatus(true);
      hasSentTranscriptRef.current = false; // Reset for new session

      // Clear any existing timeout
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }

      // Hide status after 5 seconds if still listening
      statusTimeoutRef.current = setTimeout(() => {
        setShowStatus(false);
      }, 5000);

      try {
        await startListening('en-US');

      } catch (err) {
        console.error('Failed to start listening:', err);
        setLocalError('Failed to start listening. Please try again.');
        setShowStatus(false);
      }
    }
  };

  // If not supported, show disabled button
  if (!isSupported) {
    return (
      <button
        disabled
        className={`flex-shrink-0 p-3 rounded-xl border transition ${isDark
          ? "border-slate-700 bg-slate-800/20 text-slate-400"
          : "border-[#d6dfff] bg-gray-100 text-gray-400"
          }`}
        title="Voice input not supported"
      >
        <Mic className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleVoiceToggle}
        type="button"
        className={`flex-shrink-0 p-3 rounded-xl border transition ${isListening
          ? "border-red-500 bg-red-500 text-white animate-pulse"
          : isDark
            ? "border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700"
            : "border-[#d6dfff] bg-white text-[#102863] hover:border-[#0033A0]"
          }`}
        title={
          isListening
            ? "Click to stop voice recording (will send complete transcript)"
            : "Click to start voice recording"
        }
      >
        {isListening ? (
          <div className="relative">
            <MicOff className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
          </div>
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {/* Status indicator */}
      {(showStatus || isListening) && (
        <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 text-xs rounded shadow-lg ${isListening ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>
          <div className="flex items-center gap-1">
            {isListening ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Listening... Speak a complete sentence</span>
              </>
            ) : (
              <span>Starting voice input...</span>
            )}
          </div>
        </div>
      )}

      {/* Error indicator */}
      {localError && !isListening && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-red-500 text-white text-xs rounded shadow-lg max-w-xs">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{localError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Chatbot Component ---
const Chatbot = () => {
  const { isDark, toggleTheme } = useTheme();

  // State Management
  const [messages, setMessages] = useState([
    createAssistantMessage(STATIC_CONTENT.newChat),
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
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const handleNewChat = () => {
    setMessages([createAssistantMessage(STATIC_CONTENT.newChat)]);
    setInput("");
    setCurrentChatId(null);
    setSelectedImage(null);
    setImagePreview(null);
    setSpeakingMessageId(null);
    setIsSpeaking(false);
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
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

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
    console.log('Chatbot received transcript:', transcript);
    if (transcript && transcript.trim()) {
      setInput(prev => {
        const newText = prev ? `${prev} ${transcript}` : transcript;
        console.log('Setting input to:', newText);
        return newText;
      });
    }
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
    setCurrentChatId(chat._id);
    if (sidebarOpen) setSidebarOpen(false);
  };

  // Reset chat
  const resetChat = () => {
    setMessages([createAssistantMessage(STATIC_CONTENT.newChat)]);
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
          `🔒 Free questions exhausted. Please log in for unlimited access.`,
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
          createAssistantMessage("❌ Failed to upload image. Please try again."),
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

      // Send recent history for context (last 6 messages, excluding the current one being sent)
      const recentHistory = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));
      requestData.history = recentHistory;

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
      const source = response.data?.source; // Extract source

      setMessages((prev) => [...prev, createAssistantMessage(answerText, source)]);

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
        className={`fixed inset-0 z-30 lg:hidden transition-opacity ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          } bg-black/40`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 transform lg:translate-x-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${sidebarClasses} flex-shrink-0 flex flex-col gap-4 p-4 overflow-y-auto`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img
              src="/bot.png"
              alt="BU Chatbot"
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
            <h3 className={`text-lg font-bold ${headingColor}`}>BUChatbot</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${isDark
                ? "bg-slate-800 hover:bg-slate-700 text-white"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                }`}
            >
              {STATIC_CONTENT.newChatButton}
            </button>
            <button
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
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
                placeholder={STATIC_CONTENT.searchPlaceholder}
                className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition ${isDark
                  ? "bg-slate-800/50 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500/50"
                  : "bg-white border border-gray-200 text-gray-800 focus:ring-2 focus:ring-blue-200"
                  }`}
              />
            </div>
          )}

          {/* Chat History */}
          {isLoggedIn && (
            <SidebarSection
              title={STATIC_CONTENT.yourHistory}
              icon={History}
              items={filteredChats.slice(0, 6).map((chat) => ({
                label:
                  chat.messages?.find((m) => m.role === "user")?.text ||
                  STATIC_CONTENT.conversation,
                action: () => loadChat(chat),
                timestamp: formatTimestamp(chat.updatedAt),
              }))}
            />
          )}

          {/* Quick Topics */}
          <SidebarSection
            title={STATIC_CONTENT.quickTopics}
            icon={BookOpen}
            items={STATIC_CONTENT.quickTopicsList.map((topic) => ({
              label: topic,
              action: () => handleQuickAsk(topic),
            }))}
          />

          {/* University Resources */}
          <SidebarSection
            title={STATIC_CONTENT.universityResources}
            icon={BookOpen}
            items={STATIC_CONTENT.resourceLinks.map(({ label, prompt }) => ({
              label,
              action: () => handleQuickAsk(prompt),
            }))}
          />
        </div>

        {/* Footer */}
        <div className={`mt-auto pt-4 border-t space-y-3 ${headerBorder}`}>
          <SidebarSection
            title={STATIC_CONTENT.supportProfile}
            icon={Shield}
            items={STATIC_CONTENT.supportLinks.map(({ label, prompt }) => ({
              label,
              action: () => handleQuickAsk(prompt),
            }))}
          />

          <div className="flex justify-between items-center pt-2 text-sm">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition ${isDark
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
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition ${isDark
                  ? "bg-slate-800/70 text-red-400 hover:bg-slate-700"
                  : "bg-white text-red-600 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                <LogOut className="h-4 w-4" /> {STATIC_CONTENT.logout}
              </button>
            ) : (
              <span className="text-sm">
                <a href="/login" className={isDark ? "text-[#9db8ff] hover:text-white" : "text-[#0033A0] hover:text-[#062a7a]"}>
                  {STATIC_CONTENT.login}
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
                className={`text-xs font-semibold uppercase tracking-[0.35em] rounded-full px-3 py-1 ${isDark
                  ? "bg-slate-800 text-yellow-400"
                  : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                Free Questions: {remainingQuestions}
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
              chatId={currentChatId} // Pass currentChatId to MessageBubble
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
          className={`px-4 sm:px-6 py-4 border-t ${isDark
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
                  alt="Selected"
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
                Image selected
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
              className={`flex-shrink-0 p-3 rounded-xl border transition ${isDark
                ? "border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700"
                : "border-[#d6dfff] bg-white text-[#102863] hover:border-[#0033A0]"
                }`}
              disabled={loading}
              title="Upload Image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            {/* Voice Input Button */}
            <VoiceInput
              onTranscript={handleAudioTranscript}
              isDark={isDark}
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
              placeholder="Type your message..."
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
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chatbot;