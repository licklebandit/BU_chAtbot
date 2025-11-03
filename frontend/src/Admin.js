import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ConfirmDialog from "./components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from 'socket.io-client';
import { useDebounce } from './hooks/useDebounce';
import StableKnowledgeForm from './components/StableKnowledgeForm';
import KnowledgeList from './components/KnowledgeList';
import StableFaqForm from './components/StableFaqForm';
import ConversationStats from './components/ConversationStats';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Users, Download, Search, Settings } from "lucide-react";

const Icon = {
  Menu: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Chat: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Analytics: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 14v4M12 10v8M17 6v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  File: ({ className = "h-5 w-5" }) => <Download className={className} />, 
  Users: ({ className = "h-5 w-5" }) => <Users className={className} />,
  Search: ({ className = "h-5 w-5" }) => <Search className={className} />,
  Settings: ({ className = "h-5 w-5" }) => <Settings className={className} />
};

//API ROOTS
const API_ROOT = process.env.REACT_APP_API_ROOT || "https://bu-chatbot.onrender.com";
const ADMIN_API = `${API_ROOT}/api/admin`;
const INGEST_API = `${API_ROOT}/api/ingest`;
const CONVERSATIONS_API = `${API_ROOT}/api/conversations`;

// Chart Components
function MiniLineChart({ data, stroke = "#0369a1" }) {
  if (!data || data.length === 0) {
    return <div className="h-32 flex items-center justify-center text-gray-400">No data</div>;
  }
  
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke={stroke} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChart({ data, color = "#0369a1" }) {
  if (!data || data.length === 0) {
    return <div className="h-32 flex items-center justify-center text-gray-400">No data</div>;
  }
  
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <Tooltip />
        <Line type="monotone" dataKey="accuracy" stroke={color} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Conversation Modal Component
function ConversationModal({ isOpen, onClose, conversation, markRead, onExport }) {
  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Conversation with {conversation.user}</h3>
              <p className="text-sm text-gray-500">ID: {conversation.id}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {conversation.transcript && conversation.transcript.length > 0 ? (
              <div className="space-y-4">
                {conversation.transcript.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="text-xs opacity-75 mb-1">{msg.role}</div>
                      <div className="text-sm">{msg.text}</div>
                      {msg.timestamp && (
                        <div className="text-xs opacity-75 mt-1">{msg.timestamp}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No messages in this conversation</div>
            )}
          </div>
          
          <div className="p-4 border-t flex justify-between items-center">
            <button
              onClick={() => markRead(conversation.id)}
              className="px-4 py-2 rounded bg-blue-50 text-blue-700 text-sm"
            >
              Mark as Read
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onExport(conversation, 'json')}
                className="px-4 py-2 rounded bg-green-50 text-green-700 text-sm"
              >
                Export JSON
              </button>
              <button
                onClick={() => onExport(conversation, 'csv')}
                className="px-4 py-2 rounded border text-sm"
              >
                Export CSV
              </button>
              <button onClick={onClose} className="px-4 py-2 rounded border text-sm">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const navigate = useNavigate();
   const socketRef = useRef(null);
   const fetchBlockedRef = useRef(false);

  // Initial State - Set to default empty values
  const [active, setActive] = useState("dashboard");
  const [metrics, setMetrics] = useState({});
  const [conversationStats, setConversationStats] = useState(null);
  const [chatsOverTime, setChatsOverTime] = useState([]);
  const [accuracyOverTime, setAccuracyOverTime] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  // Charts + Pagination state
  const [chartsData, setChartsData] = useState({ chats: [], accuracy: [] });
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  // UI state / refs
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'admin');

  const confirmRef = useRef({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // backward-compatible aliases used in the file
  const isModalOpen = modalOpen;
  const setIsModalOpen = setModalOpen;

  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

 // --- Handle Unauthorized Responses ---
  useEffect(() => {
    const handleUnauthorized = (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        fetchBlockedRef.current = true;
        console.warn("401 from API; blocking further automatic fetches.");
        localStorage.removeItem("token");
        try {
          navigate("/login");
        } catch (e) {}
      }
      return Promise.reject(error);
    };

    const id = axios.interceptors.response.use((r) => r, handleUnauthorized);
    return () => axios.interceptors.response.eject(id);
  }, [navigate]);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    if (fetchBlockedRef.current) return;

    try {
      const token = localStorage.getItem("token"); // 🔑 your JWT or auth token
      if (!token) {
        console.warn("No token found — please log in first.");
        fetchBlockedRef.current = true;
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

      // Fetch Dashboard Metrics & Conversation Stats
      const [metricsRes, statsRes] = await Promise.all([
        axios.get(`${ADMIN_API}/metrics`, { headers }),
        axios.get(`${CONVERSATIONS_API}/stats`, { headers }),
      ]);

      setMetrics(metricsRes.data.metrics || {});
      setConversationStats(statsRes.data || {});

      // Normalize charts
      setChatsOverTime(
        (statsRes.data.dailyCounts || []).map((d) => ({
          date: d.date,
          count: d.count || 0
        }))
      );

      setAccuracyOverTime(
        (metricsRes.data.accuracyOverTime || []).map((d) => ({
          date: d.date,
          accuracy: d.accuracy
        }))
      );

      // Fetch lists (conversations, faqs, users, admins, knowledge)
      const [convosRes, faqsRes, usersRes, adminsRes, knowledgeRes] =
        await Promise.all([
          axios.get(`${ADMIN_API}/conversations`, { headers }),
          axios.get(`${ADMIN_API}/faqs`, { headers }),
          axios.get(`${ADMIN_API}/users`, { headers }),
          axios.get(`${ADMIN_API}/admins`, { headers }),
          axios.get(`${INGEST_API}`, { headers }),
        ]);

      const convos = Array.isArray(convosRes.data)
        ? convosRes.data.map((c) => ({
            id: c._id || c.id,
            user: c.user_name || c.user || "Unknown",
            snippet: c.snippet || c.summary || "",
            time: c.createdAt
              ? new Date(c.createdAt).toLocaleString()
              : c.time || "",
            rawDate: c.createdAt || null,
            unread:
              typeof c.isUnread !== "undefined" ? c.isUnread : !!c.unread
          }))
        : [];

      setConversations(convos);
      setFaqs(
        (faqsRes.data || []).map((f) => ({
          id: f._id || f.id,
          q: f.question || f.q,
          a: f.answer || f.a
        }))
      );
      setUsers(usersRes.data || []);
      setAdmins(adminsRes.data || []);
      setKnowledge(knowledgeRes.data || []);
    } catch (error) {
     console.error("Error fetching data:", error);
     if (error?.response?.status === 401) {
      console.warn("401 from API; blocking further automatic fetches.");
      fetchBlockedRef.current = true;
      localStorage.removeItem("token");
      navigate("/login"); // redirect to login
    }
  }
}, [navigate]);

  // --- Load Data + Socket ---
useEffect(() => {
  let intervalId;

  const initSocket = async () => {
    try {
      const { io } = await import("socket.io-client");
      const socket = io(API_ROOT, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
      socketRef.current = socket;

      /* 🟢 Connection Status */
      socket.on("connect", () => {
        console.log("✅ Admin socket connected:", socket.id);
        socket.emit("joinRoom", "adminRoom"); // join admin updates channel
      });

      socket.on("disconnect", () => {
        console.warn("⚠️ Admin socket disconnected");
      });

      socket.on("connect_error", (err) => {
        console.error("❌ Socket connect_error:", err.message);
      });

      /* 🟢 Metrics Updates */
      socket.on("metricsUpdate", (payload) => {
        if (!payload) return;
        setMetrics(payload.metrics || {});
        setChartsData({
          chatsOverTime: payload.chatsOverTime || [],
          accuracyOverTime: payload.accuracyOverTime || [],
        });
      });

      /* 🟢 Real-time Stats (fast updates) */
      socket.on("adminStatsUpdate", (stats) => {
        if (stats)
          setMetrics((prev) => ({
            ...prev,
            chatsToday: stats.chatsToday ?? prev.chatsToday,
            totalUsers: stats.totalUsers ?? prev.totalUsers,
            activeUsersToday: stats.activeUsersToday ?? prev.activeUsersToday,
            lastUpdated: new Date(stats.timestamp).toLocaleString(),
          }));
      });

      /* 🟢 Conversations (new + updates) */
      socket.on("conversationsUpdate", (data) => {
        if (!data?.conversations) return;
        setConversations(data.conversations);
        setPagination(data.pagination || {});
      });

      // When new conversation is created in real time
      socket.on("new_conversation", (payload) => {
        if (!payload) return;
        setConversations((prev) => {
          const next = [
            {
              id: payload.id,
              user_name: payload.user_name || "Unknown",
              snippet: payload.snippet || "",
              createdAt: payload.createdAt,
              isUnread: true,
            },
            ...prev,
          ];
          return next.slice(0, 100);
        });
      });

      /* 🟢 FAQs (added/deleted live updates) */
      socket.on("faqAdded", (faq) => {
        if (faq) setFaqs((prev) => [faq, ...prev]);
      });
      socket.on("faqDeleted", (id) => {
        setFaqs((prev) => prev.filter((f) => f._id !== id));
      });

      /* 🟢 Users (updated/deleted/imported) */
      socket.on("userUpdated", (user) => {
        if (user)
          setUsers((prev) =>
            prev.map((u) => (u._id === user._id ? user : u))
          );
      });

      socket.on("userDeleted", (id) => {
        if (id) setUsers((prev) => prev.filter((u) => u._id !== id));
      });

      socket.on("usersImported", (count) => {
        console.log(`✅ ${count} users imported`);
        fetchData(); // refresh user list
      });

      /* 🟢 Cleanup on Unmount */
      return socket;
    } catch (err) {
      console.error("Socket initialization error:", err);
      return null;
    }
  };

  // --- Load initial data ---
  fetchData();

  // --- Refresh every 60s when tab is visible ---
  intervalId = setInterval(() => {
    if (document.visibilityState === "visible") fetchData();
  }, 60000);

  // --- Initialize Socket ---
  let socketInstance;
  initSocket().then((sock) => (socketInstance = sock));

  // --- Cleanup ---
  return () => {
    clearInterval(intervalId);
    if (socketInstance) {
      socketInstance.disconnect();
      console.log("🧹 Socket disconnected cleanly");
    }
  };
}, [fetchData]);

    /* --- Handlers --- */
    const onLogout = () => { localStorage.removeItem("role"); 
    navigate("/login"); };


  const addFaq = async () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    try {
      const response = await axios.post(`${ADMIN_API}/faqs`, { 
        question: newFaqQ.trim(), 
        answer: newFaqA.trim() 
      });
      // Normalize returned FAQ and prepend
      const created = { id: response.data._id || response.data.id, q: response.data.question || response.data.q, a: response.data.answer || response.data.a };
      setFaqs(prev => [created, ...prev]);
      setNewFaqQ("");
      setNewFaqA("");
    } catch (error) {
      console.error("Error adding FAQ:", error);
    }
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditRole(user.role || "");
    setIsUserModalOpen(true);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    try {
      const id = editingUser.id || editingUser._id;
      const res = await axios.put(`${ADMIN_API}/users/${id}`, { name: editName, role: editRole });
      const updated = res.data;
      setUsers(prev => prev.map(u => (u.id === (updated._id || updated.id) ? { id: updated._id || updated.id, name: updated.name, email: updated.email, role: updated.role } : u)));
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Failed to save user:', err);
      alert('Failed to save user. See console for details.');
    }
  };

  const deleteUser = async (id) => {
    // open confirm dialog
    confirmRef.current = {
      title: 'Delete user',
      message: 'Delete this user? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await axios.delete(`${ADMIN_API}/users/${id}`);
          setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
          console.error('Failed to delete user:', err);
          alert('Failed to delete user. See console for details.');
        } finally {
          setConfirmOpen(false);
        }
      },
      onCancel: () => setConfirmOpen(false),
    };
    setConfirmOpen(true);
  };

  // Filter conversations based on search and date range
  const filterConversations = useCallback((items, searchTerm = "", dateFrom = "", dateTo = "") => {
    let results = items || [];

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      results = results.filter(it => 
        Object.values(it).some(v => String(v).toLowerCase().includes(s))
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      results = results.filter(r => r.rawDate && new Date(r.rawDate) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23,59,59,999);
      results = results.filter(r => r.rawDate && new Date(r.rawDate) <= to);
    }

    return results;
  }, []);

  // Export helpers with confirmation
  const _download = (content, filename, type = 'application/octet-stream') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format) => {
    confirmRef.current = {
      title: 'Export Conversations',
      message: `Export ${conversations.length} conversations as ${format.toUpperCase()}?`,
      onConfirm: () => {
        if (format === 'json') {
          exportConvosJSON(conversations);
        } else {
          exportConvosCSV(conversations);
        }
        setConfirmOpen(false);
      },
      onCancel: () => setConfirmOpen(false),
    };
    setConfirmOpen(true);
  };

  const exportConvosJSON = (convos) => {
    const payload = (convos || []).map(c => ({
      id: c.id,
      user: c.user_name,
      snippet: c.snippet,
      createdAt: c.createdAt,
      isUnread: c.isUnread
    }));
    _download(JSON.stringify(payload, null, 2), `conversations_${Date.now()}.json`, 'application/json');
  };

  const exportConvosCSV = (convos) => {
    const rows = [['User', 'Snippet', 'Created At', 'Unread']];
    (convos || []).forEach(c => rows.push([
      c.user_name,
      c.snippet,
      c.createdAt,
      c.isUnread ? 'true' : 'false'
    ]));
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    _download(csv, `conversations_${Date.now()}.csv`, 'text/csv');
  };

  const exportConversationTranscript = (conversation, format = 'json') => {
    if (!conversation) return;
    const transcript = conversation.transcript || [];
    if (format === 'json') {
      _download(JSON.stringify({ id: conversation.id, user: conversation.user, transcript }, null, 2), `transcript_${conversation.id || 'conv'}.json`, 'application/json');
      return;
    }
    // CSV format: role,text,timestamp
    const rows = [['role','text','timestamp']];
    transcript.forEach(m => rows.push([m.role || '', m.text || '', m.timestamp || '']));
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    _download(csv, `transcript_${conversation.id || 'conv'}.csv`, 'text/csv');
  };

  const deleteFaq = async (id) => {
    try {
      await axios.delete(`${ADMIN_API}/faqs/${id}`);
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${ADMIN_API}/conversations/${id}/read`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };
  
  const openConversationModal = async (conversation) => {
    try {
      const fullConvoRes = await axios.get(`${ADMIN_API}/conversations/${conversation.id}`);
      const conv = fullConvoRes.data;
      setSelectedConversation({ id: conv._id || conv.id, user: conv.user_name || conv.user, transcript: conv.transcript || [] });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      setSelectedConversation({ ...conversation, transcript: [{ role: "user", text: conversation.snippet, timestamp: conversation.time || 'N/A' }] });
    }
  };
  
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;
      const lines = csvText.split('\n').filter(line => line.trim() !== '');
      // Assuming CSV format: name,email,role
      const newUsers = lines.slice(1).map(line => { // skip header
        const [name, email, role] = line.split(',');
        return { 
          name: name?.trim(), 
          email: email?.trim(), 
          role: (role?.trim().toLowerCase() || 'student') 
        };
      }).filter(user => user.name && user.email);

      if (newUsers.length === 0) {
        alert("No valid users found in the CSV.");
        return;
      }

      try {
        // Send to backend for bulk creation
  await axios.post(`${ADMIN_API}/users/import`, newUsers);
        alert(`Successfully imported ${newUsers.length} users! Refreshing data...`);
        fetchData(); // Refresh the user list
      } catch (error) {
        console.error("Error importing users:", error);
        alert("Failed to import users. Check console for details.");
      }
    };
    reader.readAsText(file);
    // Clear the input value
    event.target.value = null; 
  };


  const filterTable = (items) => {
    let results = items || [];
    if (debouncedSearch.trim()) {
      const s = debouncedSearch.toLowerCase();
      results = results.filter(it => Object.values(it).some(v => String(v).toLowerCase().includes(s)));
    }
    return results;
  };

  /* Sidebar menu items (updated with roles) */
  const menu = [
    { key: "dashboard", label: "Dashboard", icon: Icon.Analytics, roles: ["admin", "editor", "viewer"] },
    { key: "conversations", label: "Conversations", icon: Icon.Chat, roles: ["admin", "editor"] },
  { key: "faqs", label: "FAQs Management", icon: Icon.File, roles: ["admin", "editor"] },
  { key: "knowledge", label: "Knowledge", icon: Icon.File, roles: ["admin", "editor"] },
    { key: "users", label: "Users", icon: Icon.Users, roles: ["admin"] },
    { key: "admins", label: "Admins", icon: Icon.Users, roles: ["admin"] },
    { key: "analytics", label: "Analytics", icon: Icon.Analytics, roles: ["admin", "viewer"] },
    { key: "settings", label: "Settings", icon: Icon.Settings, roles: ["admin"] },
  ];

  /* -------------------------
      Render functions for each page (mostly unchanged)
      ------------------------- */

  function DashboardView() {
    return (
      <div className="space-y-6">
        {/* Top row cards (unchanged) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-100 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Chats Today</p>
                <p className="text-2xl font-semibold text-blue-800">{metrics.chatsToday}</p>
              </div>
              <div className="bg-blue-50 text-blue-700 p-2 rounded-full">
                <Icon.Chat />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Compared to yesterday: +5%</p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-blue-800">{metrics.activeUsers}</p>
              </div>
              <div className="bg-blue-50 text-blue-700 p-2 rounded-full">
                <Icon.Users />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Users who interacted in last 24h</p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Avg Response (ms)</p>
                <p className="text-2xl font-semibold text-blue-800">{metrics.avgResponseMs}</p>
              </div>
              <div className="bg-blue-50 text-blue-700 p-2 rounded-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Lower is better</p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Accuracy</p>
                <p className="text-2xl font-semibold text-blue-800">{metrics.accuracyPct}%</p>
              </div>
              <div className="bg-blue-50 text-blue-700 p-2 rounded-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Confidence of correct answers</p>
          </div>
        </div>

        {/* Conversation Statistics */}
        {conversationStats && (
          <div className="mb-6">
            <ConversationStats stats={conversationStats} />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-100 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800">Chats Over Time</h3>
              <p className="text-sm text-gray-500">Last 14 intervals</p>
            </div>
            <MiniLineChart data={chatsOverTime} stroke="#0369a1" />
          </div>

          <div className="bg-slate-100 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800">Accuracy Trend</h3>
              <p className="text-sm text-gray-500">Model accuracy (%)</p>
            </div>
            <BarChart data={accuracyOverTime} color="#0369a1" />
          </div>
        </div>

        {/* Recent conversations (Open button modified) */}
  <div className="bg-slate-100 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Recent Conversations</h3>
            <p className="text-sm text-gray-500">{conversations.length} total</p>
          </div>

          <div className="divide-y">
            {conversations.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${c.unread ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                      {c.user[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{c.user}</div>
                      <div className="text-sm text-gray-500">{c.snippet}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">{c.time}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => markRead(c.id)} className="px-3 py-1 text-sm rounded bg-blue-50 text-blue-700">Mark read</button>
                    <button onClick={() => openConversationModal(c)} className="px-3 py-1 text-sm rounded border">Open</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  function ConversationsView() {
    const [searchConversations, setSearchConversations] = useState("");
    const debouncedSearchConversations = useDebounce(searchConversations, 300);
    
    const filteredConversations = filterConversations(conversations, debouncedSearchConversations, filterDateFrom, filterDateTo);
    const displayConversations = filterUnreadOnly ? filteredConversations.filter(c => c.unread) : filteredConversations;
    
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-4">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchConversations}
                  onChange={e => setSearchConversations(e.target.value)}
                  className="w-full px-4 py-2 border rounded pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Icon.Search />
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filterUnreadOnly}
                onChange={e => setFilterUnreadOnly(e.target.checked)}
              />
              Unread only
            </label>
            <input
              type="date"
              value={filterDateFrom || ''}
              onChange={e => setFilterDateFrom(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <input
              type="date"
              value={filterDateTo || ''}
              onChange={e => setFilterDateTo(e.target.value)}
              className="px-4 py-2 border rounded"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow flex-grow overflow-hidden flex flex-col">
          <div className="divide-y flex-grow overflow-y-auto">
            {displayConversations.length ? displayConversations.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${c.unread ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                    {c.user[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{c.user}</div>
                    <div className="text-sm text-gray-500">{c.snippet}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => markRead(c.id)} className="px-3 py-1 rounded text-sm bg-blue-50 text-blue-700">Mark read</button>
                  <button onClick={() => openConversationModal(c)} className="px-3 py-1 rounded border text-sm">Open</button>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-gray-500">No conversations</div>
            )}
          </div>
          <div className="p-3 border-t flex justify-between items-center bg-white">
            <div className="text-sm text-gray-500">
              Showing {displayConversations.length} of {conversations.length} conversations
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('json')} className="px-3 py-1 rounded bg-green-50 text-green-700 text-sm">Export JSON</button>
              <button onClick={() => handleExport('csv')} className="px-3 py-1 rounded border text-sm">Export CSV</button>
            </div>
          </div>
        </div>

        {selectedConversation && (
          <ConversationModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedConversation(null);
            }}
            conversation={selectedConversation}
            markRead={markRead}
            onExport={exportConversationTranscript}
          />
        )}
      </div>
    );
  }



  function FaqsView() {
    const [searchFaqs, setSearchFaqs] = useState("");

    return (
      <div className="space-y-4">
        <StableFaqForm 
          onSubmit={async ({ question, answer }) => {
            try {
              const response = await axios.post(`${ADMIN_API}/faqs`, { 
                question: question.trim(), 
                answer: answer.trim() 
              });
              // Normalize returned FAQ and prepend
              const created = { 
                id: response.data._id || response.data.id, 
                q: response.data.question || response.data.q, 
                a: response.data.answer || response.data.a 
              };
              setFaqs(prev => [created, ...prev]);
            } catch (error) {
              console.error("Error adding FAQ:", error);
            }
          }} 
        />

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Manage FAQs</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchFaqs}
                onChange={(e) => setSearchFaqs(e.target.value)}
                placeholder="Search FAQs..."
                className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => setSearchFaqs("")}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="divide-y">
            {faqs
              .filter(f => {
                if (!searchFaqs.trim()) return true;
                const search = searchFaqs.toLowerCase();
                return (
                  f.q.toLowerCase().includes(search) ||
                  f.a.toLowerCase().includes(search)
                );
              })
              .map(f => (
              <div key={f.id} className="py-3 flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-800">{f.q}</div>
                  <div className="text-sm text-gray-500 mt-1">{f.a}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard?.writeText(`${f.q}\n\n${f.a}`)} className="px-3 py-1 rounded border text-sm">Copy</button>
                  <button onClick={() => deleteFaq(f.id)} className="px-3 py-1 rounded bg-red-50 text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function KnowledgeView() {
    const [searchKnowledge, setSearchKnowledge] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Prevent fetchData from running while typing
    useEffect(() => {
      const originalFetchBlocked = fetchBlockedRef.current;
      if (isTyping) {
        fetchBlockedRef.current = true;
      }
      return () => {
        fetchBlockedRef.current = originalFetchBlocked;
      };
    }, [isTyping]);

    const handleSubmit = useCallback(async (formData) => {
      if (!formData.keyword?.trim() || !formData.answer?.trim()) return;
      
      try {
        setIsLoading(true);
        // POST will create or update (ingest.js handles existing keywords)
        const response = await axios.post(`${INGEST_API}`, { 
          keyword: formData.keyword.trim(), 
          answer: formData.answer.trim() 
        });
        // If backend returned an id for the saved item, merge it into state.
        // Otherwise refresh the knowledge list from the server so we have canonical ids.
        const key = formData.keyword.trim();
        const returnedId = response?.data?._id || response?.data?.id;
        if (returnedId) {
          setKnowledge(prev => {
            const existingIndex = prev.findIndex(k => (k.keyword === key) || (k._id === returnedId) || (k.id === returnedId));
            if (existingIndex !== -1) {
              return prev.map((k, i) => i === existingIndex ? { ...k, answer: formData.answer.trim(), _id: returnedId, id: returnedId } : k);
            }
            const newItem = {
              id: returnedId,
              _id: returnedId,
              keyword: key,
              answer: formData.answer.trim()
            };
            return [newItem, ...prev];
          });
        } else {
          // Backend didn't include the created document; refresh whole knowledge list
          try {
            const fresh = await axios.get(`${INGEST_API}`);
            setKnowledge(fresh.data || []);
          } catch (err) {
            console.warn('Failed to refresh knowledge after save:', err);
          }
        }
      } catch (err) {
        console.error('Failed to save knowledge:', err);
        alert('Failed to save knowledge. See console for details.');
      } finally {
        setIsLoading(false);
      }
    }, []);

  const [editingKnowledge, setEditingKnowledge] = useState(null);

  const handleDelete = useCallback(async (id) => {
      confirmRef.current = {
        title: 'Delete knowledge',
        message: 'Delete this knowledge entry?',
        onConfirm: async () => {
          try {
            setIsLoading(true);
            // If this is a client-only temporary item (created without server id), just remove locally
            if (String(id).startsWith('tmp-')) {
              setKnowledge(prev => prev.filter(k => String(k._id || k.id) !== String(id)));
            } else {
              try {
                console.log('Attempting to delete knowledge with ID:', id);
                const token = localStorage.getItem('token');
                const response = await axios.delete(`${INGEST_API}/${id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                console.log('Delete response:', response);
                setKnowledge(prev => prev.filter(k => String(k._id || k.id) !== String(id)));
              } catch (err) {
                console.error('Delete error:', err.response || err);
                const status = err?.response?.status;
                if (status === 404) {
                  console.warn('Delete returned 404 — item not found on server. Removing locally.');
                  setKnowledge(prev => prev.filter(k => String(k._id || k.id) !== String(id)));
                } else {
                  throw err; // let outer catch handle other errors
                }
              }
            }
          } catch (err) {
            console.error('Failed to delete knowledge:', err);
            alert('Failed to delete knowledge. See console for details.');
          } finally {
            setIsLoading(false);
            setConfirmOpen(false);
          }
        },
        onCancel: () => setConfirmOpen(false),
      };
      setConfirmOpen(true);
    }, []);

    const handleEdit = useCallback((item) => {
      // enter edit mode - populate the form with the selected item
      setEditingKnowledge(item);
    }, []);

    const memoizedHandleSubmit = useCallback(async (formData) => {
      await handleSubmit(formData);
      // after successful save, exit edit mode (if any)
      setEditingKnowledge(null);
    }, [handleSubmit]);

    return (
      <div className="space-y-4">
        <StableKnowledgeForm
          onSubmit={memoizedHandleSubmit}
          initialData={editingKnowledge}
          isEditing={!!editingKnowledge}
          onCancel={() => setEditingKnowledge(null)}
        />
        
        <KnowledgeList
          items={knowledge}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchQuery={searchKnowledge}
          onSearchChange={setSearchKnowledge}
          isLoading={isLoading}
        />
      </div>
    );
  }

  function UsersView() {
    const [userSearch, setUserSearch] = useState('');
    const debouncedUserSearch = useDebounce(userSearch, 300);
    
    const filtered = useMemo(() => {
      if (!debouncedUserSearch) return users;
      const searchTerm = debouncedUserSearch.toLowerCase();
      return users.filter(user => 
        Object.values(user).some(val => 
          String(val).toLowerCase().includes(searchTerm)
        )
      );
    }, [users, debouncedUserSearch]);

    return (
      <div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Users</h3>
            <div className="flex items-center gap-2">
                {/* CSV Import */}
              <label htmlFor="csv-upload" className="px-3 py-2 rounded bg-blue-600 text-white cursor-pointer text-sm">
                Import CSV
              </label>
              <input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                onChange={handleCsvUpload} 
                className="hidden" 
              />
                {/* End CSV Import */}
              <input 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users..." 
                className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <button 
                onClick={() => setUserSearch('')} 
                className="px-3 py-2 rounded bg-gray-100"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-500 uppercase">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="py-3">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded text-sm ${u.role === "student" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{u.role}</span></td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditUserModal(u)} className="px-3 py-1 rounded border text-sm">Edit</button>
                        <button onClick={() => deleteUser(u.id)} className="px-3 py-1 rounded bg-red-50 text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      {userSearch ? 'No users found matching your search' : 'No users available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function AdminsView() {
    return (
      <div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-3">Admins</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-500 uppercase">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a.id} className="border-t">
                    <td className="py-3">{a.name}</td>
                    <td className="py-3">{a.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function AnalyticsView() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h4 className="text-sm text-gray-500">Conversations (14d)</h4>
            <p className="text-2xl font-semibold text-blue-800">{chatsOverTime.reduce((a,b) => a+b,0)}</p>
            <div className="mt-3">
              <MiniLineChart data={chatsOverTime} stroke="#075985" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <h4 className="text-sm text-gray-500">Avg Accuracy</h4>
            <p className="text-2xl font-semibold text-blue-800">{chatsOverTime.length > 0 ? Math.round(accuracyOverTime.reduce((a,b)=>a+b,0)/accuracyOverTime.length) : 0}%</p>
            <div className="mt-3">
              <BarChart data={accuracyOverTime.slice(-14)} color="#075985" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <h4 className="text-sm text-gray-500">Quick Actions</h4>
            <div className="mt-4 flex flex-col gap-3">
              <button onClick={() => alert("Run evaluation (not implemented)")} className="px-4 py-2 rounded bg-blue-600 text-white">Run Model Eval</button>
              <button onClick={() => alert("Export logs")} className="px-4 py-2 rounded border">Export Logs</button>
              <button onClick={() => alert("Retrain model (not implemented)")} className="px-4 py-2 rounded bg-gray-100">Start Retrain</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-3">Detailed Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Avg Latency</div>
              <div className="text-xl font-semibold text-blue-800">{metrics.avgResponseMs} ms</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Active Users</div>
              <div className="text-xl font-semibold text-blue-800">{metrics.activeUsers}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Accuracy</div>
              <div className="text-xl font-semibold text-blue-800">{metrics.accuracyPct}%</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SettingsView() {
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium">Settings</h3>
          <p className="text-sm text-gray-500 mt-2">Basic application settings for the chatbot admin.</p>
          <div className="mt-4 grid gap-3">
            <label className="text-sm">University Theme</label>
            <select className="p-2 border rounded">
              <option>Blue (Default)</option>
              <option>Gold</option>
              <option>Green</option>
            </select>
            <label className="text-sm">Notification email</label>
            <input placeholder="admin@bugema.ac.ug" className="p-2 border rounded" />
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              <button className="px-4 py-2 rounded border">Reset</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------
      Main render
      ------------------------- */
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className={`z-30 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 fixed sm:relative inset-y-0 left-0 w-64 bg-blue-900 text-white transition-transform duration-200 ease-in-out`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">BU</div>
            <div>
              <div className="font-semibold text-lg">Chatbot Admin</div>
            </div>
          </div>

          {/* Nav filtered by userRole */}
          <nav className="flex-1 space-y-1">
            {menu
                .filter(m => m.roles.includes(userRole)) // Role-based filtering
                .map(m => {
              const IconComp = m.icon;
              const activeClass = active === m.key ? "bg-white/10" : "hover:bg-white/5";
              return (
                <button
                  key={m.key}
                  onClick={() => { setActive(m.key); setSidebarOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded ${activeClass}`}
                >
                  <span className="text-blue-100"><IconComp /></span>
                  <span className="flex-1 text-sm">{m.label}</span>
                  {m.key === "conversations" && conversations.some(c => c.unread) && <span className="text-xs bg-red-600 px-2 py-0.5 rounded text-white">New</span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-6">
            <button onClick={onLogout} className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded font-semibold">Logout</button>
          </div>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 min-h-screen">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(s => !s)} className="sm:hidden p-2 rounded-md bg-white border">
                <Icon.Menu />
              </button>
              <div>
                <div className="text-sm text-slate-600">Welcome back</div>
                <div className="font-semibold text-lg text-slate-800">My Admin</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search everything..." className="pl-10 pr-3 py-2 rounded border w-80" />
                <div className="absolute left-3 top-2 text-gray-400"><Icon.Search /></div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Page chooser */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 capitalize">{active.replace(/_/g, " ")}</h2>
            <p className="text-sm text-slate-500 mt-1">Bugema University chatbot insights</p>
          </div>

          {/* Page content */}
          <div>
            {active === "dashboard" && <DashboardView />}
            {active === "conversations" && <ConversationsView />}
            {active === "faqs" && <FaqsView />}
            {active === "knowledge" && <KnowledgeView />}
            {active === "users" && <UsersView />}
            {active === "admins" && <AdminsView />}
            {active === "analytics" && <AnalyticsView />}
            {active === "settings" && <SettingsView />}
          </div>
        </main>
      </div>
      
      {/* Conversation Modal */}
      <ConversationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        conversation={selectedConversation}
        markRead={markRead}
        onExport={exportConversationTranscript}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmRef.current?.title}
        message={confirmRef.current?.message}
        onCancel={confirmRef.current?.onCancel}
        onConfirm={confirmRef.current?.onConfirm}
      />

      {/* User Edit Modal */}
      <UserEditModal
        key={editingUser?.id || editingUser?._id || 'user-modal-default'}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={editingUser}
        name={editName}
        role={editRole}
        setName={setEditName}
        setRole={setEditRole}
        onSave={saveUser}
      />
    </div>
  );
}

// User Edit Modal
function UserEditModal({ isOpen, onClose, user, name, role, setName, setRole, onSave }) {
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Edit User</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded mt-1">
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="editor">editor</option>
                <option value="viewer">viewer</option>
              </select>
            </div>
          </div>
          <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button onClick={onSave} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;