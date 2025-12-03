import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Search,
  MessageCircle,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  User,
  Calendar,
  Clock,
  Filter,
  Download,
  Zap,
} from "lucide-react";
import { ADMIN_API_URL } from "../../config/api";

// --- Design Tokens (Matching Landing Page) ---
const GLASS_CARD =
  "bg-white/90 backdrop-blur-md border border-[#d6dfff] shadow-lg shadow-[#0033A0]/10 rounded-3xl";
const INPUT_STYLE =
  "w-full rounded-2xl border border-[#d6dfff] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent transition-all";
const BUTTON_PRIMARY =
  "bg-[#0033A0] text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-lg shadow-blue-900/20 hover:bg-[#062a7a] transition-all";
const HEADING_COLOR = "text-[#0f2a66]";
const TEXT_MUTED = "text-[#51629b]";

export default function ConversationsView() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [isDeleting, setIsDeleting] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, unread, read
  const [autoRefresh, setAutoRefresh] = useState(true);

  const token = localStorage.getItem("token");

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${ADMIN_API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      showToast("Failed to load conversations", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-refresh every 15 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchConversations();
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchConversations]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleViewConversation = (conversation) => {
    setSelectedConversation(conversation);
    setIsModalOpen(true);
    // Mark as read when viewing
    if (conversation.isUnread) {
      markAsRead(conversation._id);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;

    setIsDeleting(conversationId);
    try {
      await axios.delete(`${ADMIN_API_URL}/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      showToast("Conversation deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      showToast("Failed to delete conversation", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await axios.patch(
        `${ADMIN_API_URL}/conversations/${conversationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, isUnread: false } : c,
        ),
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const exportConversations = () => {
    const dataStr = JSON.stringify(filteredConversations, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `conversations_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    showToast("Conversations exported successfully", "success");
  };

  const filteredConversations = conversations.filter((c) => {
    const userName = c.userId?.name || c.user_name || "";
    const userEmail = c.userId?.email || c.userEmail || "";
    const lastMessage =
      c.messages?.[c.messages.length - 1]?.text || c.snippet || "";
    const searchLower = search.toLowerCase();

    const matchesSearch =
      userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower) ||
      lastMessage.toLowerCase().includes(searchLower);

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && c.isUnread) ||
      (filterStatus === "read" && !c.isUnread);

    return matchesSearch && matchesFilter;
  });

  const unreadCount = conversations.filter((c) => c.isUnread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <MessageCircle
                className={`w-6 h-6 sm:w-7 sm:h-7 ${HEADING_COLOR} flex-shrink-0`}
              />
              <h2
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${HEADING_COLOR} truncate`}
              >
                Conversations
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                  {unreadCount} new
                </span>
              )}
              {autoRefresh && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">Live</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#51629b] line-clamp-2">
              Monitor and manage all user conversations in real-time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Filter className={`w-4 h-4 ${TEXT_MUTED} flex-shrink-0`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-[#d6dfff] bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0] flex-1 sm:flex-initial"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                autoRefresh
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
              title={
                autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"
              }
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">
                {autoRefresh ? "Live" : "Paused"}
              </span>
            </button>

            {/* Export Button */}
            <button
              onClick={exportConversations}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title="Export Conversations"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchConversations}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
              title="Refresh Now"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 sm:mt-6 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            className={`pl-11 ${INPUT_STYLE}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats Bar */}
        <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
            <span className={`${TEXT_MUTED} truncate`}>
              Total:{" "}
              <span className="font-semibold">{conversations.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
            <span className={`${TEXT_MUTED} truncate`}>
              Read:{" "}
              <span className="font-semibold">
                {conversations.length - unreadCount}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
            <span className={`${TEXT_MUTED} truncate`}>
              Unread: <span className="font-semibold">{unreadCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className={`${GLASS_CARD} overflow-hidden`}>
        {loading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0033A0] mb-3" />
            <p className={`text-base sm:text-lg font-medium ${HEADING_COLOR}`}>
              Loading conversations...
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-slate-300" />
            <p
              className={`text-base sm:text-lg font-medium ${HEADING_COLOR} mb-2`}
            >
              No conversations found
            </p>
            <p className={`text-sm ${TEXT_MUTED}`}>
              {search
                ? `No conversations match "${search}"`
                : "Conversations will appear here when users interact with the chatbot"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      User
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Last Message
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredConversations.map((c) => (
                    <tr
                      key={c._id || c.id}
                      className="hover:bg-[#f8fafc] transition-colors group"
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              c.isUnread
                                ? "bg-blue-100 text-blue-600"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {c.isUnread ? (
                              <MessageCircle className="w-5 h-5" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`font-semibold block ${HEADING_COLOR} ${c.isUnread ? "text-blue-600" : ""} truncate`}
                            >
                              {c.userId?.name ||
                                c.user?.name ||
                                c.user_name ||
                                "Anonymous User"}
                            </span>
                            {(c.userId?.email ||
                              c.user?.email ||
                              c.userEmail) && (
                              <p className="text-xs text-slate-500 truncate">
                                {c.userId?.email ||
                                  c.user?.email ||
                                  c.userEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                        <div
                          className={`line-clamp-2 ${c.isUnread ? "font-medium text-slate-900" : ""}`}
                        >
                          {c.messages?.[c.messages.length - 1]?.text ||
                            c.snippet ||
                            c.lastMessage ||
                            "No messages"}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <MessageCircle className="w-3 h-3" />
                          <span>
                            {c.messages?.length || c.messageCount || 0} messages
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(
                              c.updatedAt || c.date,
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3" />
                            {new Date(c.updatedAt || c.date).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            c.isUnread
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {c.isUnread ? (
                            <>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              Unread
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Read
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewConversation(c)}
                            className="p-2 rounded-xl bg-[#eff4ff] text-[#0033A0] hover:bg-[#dbeafe] transition"
                            title="View Conversation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.isUnread && (
                            <button
                              onClick={() => markAsRead(c._id || c.id)}
                              className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition"
                              title="Mark as Read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteConversation(c._id || c.id)
                            }
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete Conversation"
                            disabled={isDeleting === (c._id || c.id)}
                          >
                            {isDeleting === (c._id || c.id) ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Visible on Mobile Only */}
            <div className="md:hidden divide-y divide-[#f1f5f9]">
              {filteredConversations.map((c) => (
                <div
                  key={c._id || c.id}
                  className="p-4 hover:bg-[#f8fafc] transition-colors"
                >
                  {/* User Info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          c.isUnread
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.isUnread ? (
                          <MessageCircle className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`font-semibold block ${HEADING_COLOR} ${c.isUnread ? "text-blue-600" : ""} truncate text-sm`}
                        >
                          {c.userId?.name ||
                            c.user?.name ||
                            c.user_name ||
                            "Anonymous User"}
                        </span>
                        {(c.userId?.email || c.user?.email || c.userEmail) && (
                          <p className="text-xs text-slate-500 truncate">
                            {c.userId?.email || c.user?.email || c.userEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        c.isUnread
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.isUnread ? (
                        <>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          New
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Read
                        </>
                      )}
                    </span>
                  </div>

                  {/* Last Message */}
                  <div className="mb-3">
                    <p
                      className={`text-sm text-slate-600 line-clamp-2 ${c.isUnread ? "font-medium text-slate-900" : ""}`}
                    >
                      {c.messages?.[c.messages.length - 1]?.text ||
                        c.snippet ||
                        c.lastMessage ||
                        "No messages"}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>
                        {c.messages?.length || c.messageCount || 0} msgs
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(c.updatedAt || c.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(c.updatedAt || c.date).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewConversation(c)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0033A0] hover:bg-[#dbeafe] transition text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {c.isUnread && (
                      <button
                        onClick={() => markAsRead(c._id || c.id)}
                        className="px-3 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition"
                        title="Mark as Read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteConversation(c._id || c.id)}
                      className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                      title="Delete"
                      disabled={isDeleting === (c._id || c.id)}
                    >
                      {isDeleting === (c._id || c.id) ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Conversation Modal */}
      {isModalOpen && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-[#eff4ff] to-white">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-xl sm:text-2xl font-bold ${HEADING_COLOR} mb-2 truncate`}
                  >
                    Conversation Details
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span
                        className={`font-semibold ${HEADING_COLOR} truncate`}
                      >
                        {selectedConversation.userId?.name ||
                          selectedConversation.user?.name ||
                          selectedConversation.user_name ||
                          "Anonymous User"}
                      </span>
                    </div>
                    {(selectedConversation.userId?.email ||
                      selectedConversation.user?.email ||
                      selectedConversation.userEmail) && (
                      <p className="text-sm text-slate-500 flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0">📧</span>
                        <span className="truncate">
                          {selectedConversation.userId?.email ||
                            selectedConversation.user?.email ||
                            selectedConversation.userEmail}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {new Date(
                        selectedConversation.updatedAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white">
              <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
                {selectedConversation.messages?.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" || message.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.role === "user" || message.sender === "user"
                          ? "bg-[#0033A0] text-white rounded-br-sm"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.text || message.content}
                      </p>
                      <span
                        className={`text-xs mt-2 block ${
                          message.role === "user" || message.sender === "user"
                            ? "text-white/70"
                            : "text-slate-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                <span className="font-semibold">
                  {selectedConversation.messages?.length || 0}
                </span>{" "}
                messages in this conversation
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-[#0033A0] text-white rounded-xl font-semibold hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl flex items-center gap-3 z-[60] transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">{toast.message}</span>
          <button
            onClick={() => setToast({ message: "", type: "" })}
            className="ml-2 p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
