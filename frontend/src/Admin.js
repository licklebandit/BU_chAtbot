import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Define your API base URL
const API_BASE_URL = "http://localhost:5000/api/admin , https://bu-chatbot.onrender.com/api/admin"; // Update as needed

const Icon = {
  Menu: ({ className = "h-5 w-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Search: ({ className = "h-5 w-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  ),
  Users: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 00-3-3.87M9 21v-2a4 4 0 013-3.87" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Chat: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Analytics: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 13v5M12 8v10M17 4v14" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Settings: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.21 4.2A2 2 0 017 1.37l.06.06c.48.48 1.2.58 1.82.33.38-.16.82-.24 1.24-.24.42 0 .86.08 1.24.24a1.65 1.65 0 001.82-.33L15.8 2.8a2 2 0 012.83 2.83l-.06.06c-.48.48-.58 1.2-.33 1.82.16.38.24.82.24 1.24 0 .42-.08.86-.24 1.24z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  File: ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

/* -------------------------
    Tiny chart components using pure SVG (kept as is)
    ------------------------- */
function LineChart({ data = [], width = 500, height = 120, stroke = "#0ea5e9" }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  });
  const pathD = points.length ? `M${points.join(" L ")}` : "";
  const areaD = points.length ? `M${points[0]} L ${points.slice(1).map(p => p).join(" L ")} L ${width},${height} L 0,${height} Z` : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
      <defs>
        <linearGradient id="lg1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {areaD && <path d={areaD} fill="url(#lg1)" />}
      {pathD && <path d={pathD} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / (max - min || 1)) * height;
        return <circle key={i} cx={x} cy={y} r="2.2" fill={stroke} />;
      })}
    </svg>
  );
}

function BarChart({ data = [], width = 500, height = 120, color = "#0284c7" }) {
  const max = Math.max(...data, 1);
  const barWidth = data.length ? width / data.length - 6 : 0;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
      {data.map((d, i) => {
        const barH = (d / max) * (height - 10);
        const x = i * (barWidth + 6) + 4;
        const y = height - barH;
        return <rect key={i} x={x} y={y} width={barWidth} height={barH} rx="3" fill={color} opacity="0.95" />;
      })}
    </svg>
  );
}


/* -------------------------
    Conversation Modal Component
    ------------------------- */
function ConversationModal({ isOpen, onClose, conversation, markRead }) {
  if (!isOpen || !conversation) return null;

  // Mock transcript data if API only returns snippet on the list view
  const displayTranscript = conversation.transcript || [
    { id: 1, role: 'user', text: conversation.snippet, timestamp: conversation.time || 'unknown' },
    // If the full conversation object fetched in openConversationModal is missing 'transcript'
    { id: 2, role: 'bot', text: 'This is a mock response, please implement backend logic to fetch the full conversation transcript from the API endpoint.', timestamp: conversation.time || 'unknown' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-lg mx-auto bg-white rounded-xl shadow-2xl">
          {/* Modal Header */}
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Conversation with {conversation.user}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Modal Body: Transcript */}
          <div className="p-5 h-96 overflow-y-auto space-y-4">
            {displayTranscript.length > 0 ? (
              displayTranscript.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="font-medium capitalize mb-1">{msg.role}:</p>
                    <p>{msg.text}</p>
                    {msg.timestamp && <span className="block text-xs text-gray-400 mt-1 text-right">{msg.timestamp}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No full transcript available for this conversation.</div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t flex justify-end gap-3">
            <button 
              onClick={() => { markRead(conversation.id); onClose(); }} 
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Resolve & Mark Read
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded border">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* -------------------------
    Admin component
    ------------------------- */
export default function Admin() {
  const navigate = useNavigate();

  // Initial State - Set to default empty values
  const [active, setActive] = useState("dashboard"); // options: dashboard, conversations, faqs, users, admins, analytics, settings
  const [metrics, setMetrics] = useState({ chatsToday: 0, activeUsers: 0, avgResponseMs: 0, accuracyPct: 0 });
  const [chatsOverTime, setChatsOverTime] = useState([]);
  const [accuracyOverTime, setAccuracyOverTime] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "admin"); // Role-based access
  
  // Conversation Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // local form states
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [search, setSearch] = useState("");

  /* --- API Fetching --- */
  const fetchData = async () => {
    try {
      // Fetch Dashboard Metrics & Charts
      const metricsRes = await axios.get(`${API_BASE_URL}/metrics`);
      setMetrics(metricsRes.data.metrics);
      setChatsOverTime(metricsRes.data.chatsOverTime);
      setAccuracyOverTime(metricsRes.data.accuracyOverTime);

      // Fetch Lists
      const convosRes = await axios.get(`${API_BASE_URL}/conversations`);
      setConversations(convosRes.data);
      const faqsRes = await axios.get(`${API_BASE_URL}/faqs`);
      setFaqs(faqsRes.data);
      const usersRes = await axios.get(`${API_BASE_URL}/users`);
      setUsers(usersRes.data);
      const adminsRes = await axios.get(`${API_BASE_URL}/admins`);
      setAdmins(adminsRes.data);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Initial data load

    // Existing interval logic (kept for demo chart simulation)
    const id = setInterval(() => {
       // small random walk for demo
       // NOTE: This should ideally be replaced with a periodic fetchData() call 
       // or be removed if the charts are fully driven by API calls only.
      setChatsOverTime(prev => {
        const next = [...prev.slice(1), Math.max(6, Math.round((prev[prev.length - 1] || 20) * (0.9 + Math.random() * 0.2)))];
        return next;
      });
      setAccuracyOverTime(prev => {
        const next = [...prev.slice(1), Math.min(100, Math.round((prev[prev.length - 1] || 85) + (Math.random() > 0.6 ? 1 : 0)))];
        return next;
      });
      // The dependency array below is a placeholder from the original code that may cause issues 
      // if accuracyOverTime is used within the setMetrics call. Removing for simplicity.
      // setMetrics(prev => ({ ...prev, accuracyPct: Math.round(accuracyOverTime[accuracyOverTime.length - 1] || prev.accuracyPct) }));
    }, 45000);
    return () => clearInterval(id);
  }, []); // Removed accuracyOverTime from dependencies

  /* --- Handlers --- */
  const onLogout = () => {
    localStorage.removeItem("role");
    navigate("/login");
  };

  const addFaq = async () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/faqs`, { 
        q: newFaqQ.trim(), 
        a: newFaqA.trim() 
      });
      // Assuming API returns the newly created FAQ object
      setFaqs(prev => [response.data, ...prev]);
      setNewFaqQ("");
      setNewFaqA("");
    } catch (error) {
      console.error("Error adding FAQ:", error);
    }
  };

  const deleteFaq = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/faqs/${id}`);
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/conversations/${id}/read`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };
  
  const openConversationModal = async (conversation) => {
    try {
      // Fetch full transcript details
      const fullConvoRes = await axios.get(`${API_BASE_URL}/conversations/${conversation.id}`);
      setSelectedConversation(fullConvoRes.data); // Should contain full transcript array
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      // Fallback: use the snippet if full fetch fails
      setSelectedConversation({ ...conversation, transcript: [{ role: "user", text: conversation.snippet, timestamp: conversation.time || 'N/A' }] });
      setIsModalOpen(true);
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
          id: `u_${Date.now()}_${Math.random()}`, // Mock ID
          name: name?.trim(), 
          email: email?.trim(), 
          role: role?.trim().toLowerCase() || 'student' 
        };
      }).filter(user => user.name && user.email);

      if (newUsers.length === 0) {
        alert("No valid users found in the CSV.");
        return;
      }

      try {
        // Send to backend for bulk creation
        await axios.post(`${API_BASE_URL}/users/import`, newUsers);
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


  // pagination for conversations (kept as is)
  const pageSize = 6;
  const totalPages = Math.ceil(conversations.length / pageSize);
  const [page, setPage] = useState(1);
  
  const filterTable = (items) => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(it => Object.values(it).some(v => String(v).toLowerCase().includes(s)));
  };
  
  const filteredConvos = useMemo(() => filterTable(conversations), [conversations, search]);
  const paginatedConvos = useMemo(() => {
    const s = (page - 1) * pageSize;
    return filteredConvos.slice(s, s + pageSize);
  }, [filteredConvos, page]);

  /* Sidebar menu items (updated with roles) */
  const menu = [
    { key: "dashboard", label: "Dashboard", icon: Icon.Analytics, roles: ["admin", "editor", "viewer"] },
    { key: "conversations", label: "Conversations", icon: Icon.Chat, roles: ["admin", "editor"] },
    { key: "faqs", label: "FAQs Management", icon: Icon.File, roles: ["admin", "editor"] },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
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

          <div className="bg-white p-5 rounded-xl shadow">
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

          <div className="bg-white p-5 rounded-xl shadow">
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

          <div className="bg-white p-5 rounded-xl shadow">
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

        {/* Charts (unchanged) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800">Chats Over Time</h3>
              <p className="text-sm text-gray-500">Last 14 intervals</p>
            </div>
            <LineChart data={chatsOverTime} stroke="#0369a1" />
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800">Accuracy Trend</h3>
              <p className="text-sm text-gray-500">Model accuracy (%)</p>
            </div>
            <BarChart data={accuracyOverTime} color="#0369a1" />
          </div>
        </div>

        {/* Recent conversations (Open button modified) */}
        <div className="bg-white p-5 rounded-xl shadow">
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
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full p-2 rounded border" />
            <div className="absolute right-2 top-2 text-gray-400"><Icon.Search /></div>
          </div>
          <div>
            <button onClick={() => setSearch("")} className="bg-gray-100 px-3 py-2 rounded">Clear</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="divide-y">
            {paginatedConvos.length ? paginatedConvos.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between">
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
          {/* pagination */}
          <div className="p-3 flex justify-between items-center">
            <div className="text-sm text-gray-500">Showing {paginatedConvos.length} of {filteredConvos.length} results</div>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-100">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded bg-gray-100">Next</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FaqsView() {
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-gray-800">Add FAQ</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder="Question" className="col-span-2 p-2 border rounded" />
            <input value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder="Answer" className="p-2 border rounded" />
            <div className="col-span-3 flex gap-2">
              <button onClick={addFaq} className="bg-blue-600 text-white px-4 py-2 rounded">Add FAQ</button>
              <button onClick={() => { setNewFaqQ(""); setNewFaqA(""); }} className="px-4 py-2 rounded border">Clear</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-3">Manage FAQs</h3>
          <div className="divide-y">
            {faqs.map(f => (
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

  function UsersView() {
    const filtered = filterTable(users);
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="p-2 border rounded" />
              <button onClick={() => setSearch("")} className="px-3 py-2 rounded bg-gray-100">Clear</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-500 uppercase">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="py-3">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded text-sm ${u.role === "student" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{u.role}</span></td>
                  </tr>
                ))}
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
              <LineChart data={chatsOverTime} stroke="#075985" />
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
              <div className="font-semibold text-lg">Bugema University</div>
              <div className="text-sm text-blue-200">Chatbot Admin</div>
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
      <div className="flex-1 min-h-screen sm:pl-64">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(s => !s)} className="sm:hidden p-2 rounded-md bg-white border">
                <Icon.Menu />
              </button>
              <div>
                <div className="text-sm text-slate-600">Welcome back</div>
                <div className="font-semibold text-lg text-slate-800">Bugema University — Chatbot Admin</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search everything..." className="pl-10 pr-3 py-2 rounded border w-80" />
                <div className="absolute left-3 top-2 text-gray-400"><Icon.Search /></div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">Signed in as <span className="font-medium">admin@bugema.ac.ug</span></div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Page chooser */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 capitalize">{active.replace(/_/g, " ")}</h2>
            <p className="text-sm text-slate-500 mt-1">Bugema University chatbot administration panel</p>
          </div>

          {/* Page content */}
          <div>
            {active === "dashboard" && <DashboardView />}
            {active === "conversations" && <ConversationsView />}
            {active === "faqs" && <FaqsView />}
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
      />
    </div>
  );
}