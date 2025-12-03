import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  RefreshCw,
  Zap,
  Download,
  Upload,
  Filter,
} from "lucide-react";
import { ADMIN_API_URL } from "../../config/api";

// --- Design Tokens (Matching Landing Page) ---
const GLASS_CARD =
  "bg-white/90 backdrop-blur-md border border-[#d6dfff] shadow-lg shadow-[#0033A0]/10 rounded-3xl";
const BUTTON_PRIMARY =
  "bg-[#0033A0] text-white px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-lg shadow-blue-900/20 hover:bg-[#062a7a] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
const INPUT_STYLE =
  "w-full rounded-2xl border border-[#d6dfff] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent transition-all";
const HEADING_COLOR = "text-[#0f2a66]";
const TEXT_MUTED = "text-[#51629b]";

// --- Toast Component ---
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl flex items-center gap-3 z-[60] transition-all duration-300 animate-in slide-in-from-bottom-5 ${
        isSuccess
          ? "bg-emerald-600 text-white shadow-emerald-900/20"
          : "bg-red-600 text-white shadow-red-900/20"
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertTriangle className="w-5 h-5" />
      )}
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-white/20 rounded-full transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2a66]/20 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        <div className="p-6 border-b border-[#eff4ff] flex justify-between items-center bg-gradient-to-r from-[#eff4ff] to-white">
          <h3 className={`text-xl font-bold ${HEADING_COLOR}`}>{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#eff4ff] text-[#51629b] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default function KnowledgeView() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalForm, setModalForm] = useState({ title: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });

  const token = localStorage.getItem("token");
  const KNOWLEDGE_ENDPOINT = `${ADMIN_API_URL}/knowledge`;

  // --- Data Fetching ---
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(KNOWLEDGE_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        `Failed to retrieve knowledge articles. (Error: ${err.response?.status || err.message || "Unknown error"})`,
      );
    } finally {
      setLoading(false);
    }
  }, [KNOWLEDGE_ENDPOINT, token]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchArticles();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchArticles]);

  // --- Handlers ---
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleAddArticle = () => {
    setSelectedArticle(null);
    setModalForm({ title: "", content: "" });
    setIsModalOpen(true);
  };

  const handleEditArticle = (item) => {
    const sourceArticle = articles.find((a) => a._id === item._id) || item;
    setSelectedArticle(sourceArticle);
    setModalForm({
      title: sourceArticle.question || sourceArticle.title || "",
      content: sourceArticle.answer || sourceArticle.content || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        question: modalForm.title,
        answer: modalForm.content,
      };

      if (selectedArticle) {
        // Update existing article
        await axios.put(
          `${KNOWLEDGE_ENDPOINT}/${selectedArticle._id}`,
          { title: modalForm.title, content: modalForm.content },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        showToast("Article updated successfully", "success");
      } else {
        // Create new article
        await axios.post(
          KNOWLEDGE_ENDPOINT,
          { title: modalForm.title, content: modalForm.content },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        showToast("Article created successfully", "success");
      }

      setIsModalOpen(false);
      fetchArticles(); // Refresh list
    } catch (err) {
      console.error("Save failed:", err);
      showToast(
        `Failed to ${selectedArticle ? "update" : "create"} article: ${err.response?.data?.message || err.message}`,
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this knowledge article?")
    )
      return;
    setIsDeleting(id);
    try {
      await axios.delete(`${KNOWLEDGE_ENDPOINT}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles((prev) => prev.filter((a) => a._id !== id));
      showToast("Article deleted successfully.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(
        `Failed to delete article: ${err.response?.data?.message || err.message}`,
        "error",
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const exportKnowledge = () => {
    const dataStr = JSON.stringify(articles, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `knowledge_base_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    showToast("Knowledge base exported successfully", "success");
  };

  // --- Render Helpers ---
  const filteredArticles = articles.filter(
    (a) =>
      (a.question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.answer || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <BookOpen
                className={`w-6 h-6 sm:w-7 sm:h-7 ${HEADING_COLOR} flex-shrink-0`}
              />
              <h2
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${HEADING_COLOR} truncate`}
              >
                Knowledge Base
              </h2>
              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                {articles.length} articles
              </span>
              {autoRefresh && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">Live</span>
                </div>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${TEXT_MUTED} line-clamp-2`}>
              Manage chatbot answers and university information in real-time
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
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
              onClick={exportKnowledge}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs sm:text-sm font-medium"
              title="Export Knowledge Base"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchArticles}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
              title="Refresh Now"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Add Article Button */}
            <button
              onClick={handleAddArticle}
              className={`${BUTTON_PRIMARY} text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3`}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add Article</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 sm:mt-6 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 sm:pl-11 ${INPUT_STYLE}`}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0033A0] mb-3" />
          <p className={`text-lg font-medium ${HEADING_COLOR}`}>
            Loading Knowledge Base...
          </p>
        </div>
      ) : error && articles.length === 0 ? (
        <div className={`p-8 text-center ${GLASS_CARD}`}>
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      ) : (
        <div className={`${GLASS_CARD} overflow-hidden`}>
          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className={`text-lg font-medium ${HEADING_COLOR} mb-2`}>
                No articles found
              </p>
              <p className={`text-sm ${TEXT_MUTED}`}>
                {searchQuery
                  ? `No articles match "${searchQuery}"`
                  : "Click 'Add Article' to create your first knowledge base entry"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Question / Keyword
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Answer Preview
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Last Updated
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredArticles.map((article) => (
                    <tr
                      key={article._id}
                      className="hover:bg-[#f8fafc] transition-colors group"
                    >
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span
                            className={`font-semibold ${HEADING_COLOR} block max-w-xs`}
                          >
                            {article.question || article.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-600 max-w-sm">
                        <p className="line-clamp-2">
                          {article.answer || article.content}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-slate-500 font-medium">
                        {article.updatedAt
                          ? new Date(article.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="p-2 rounded-xl bg-[#eff4ff] text-[#0033A0] hover:bg-[#dbeafe] transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(article._id)}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete"
                            disabled={isDeleting === article._id}
                          >
                            {isDeleting === article._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
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
          )}
        </div>
      )}

      {/* Edit/Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedArticle ? "Edit Article" : "New Article"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
            >
              Question / Keyword
            </label>
            <input
              type="text"
              required
              className={INPUT_STYLE}
              placeholder="e.g., What are the tuition fees?"
              value={modalForm?.title || ""}
              onChange={(e) =>
                setModalForm({ ...modalForm, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
            >
              Answer Content
            </label>
            <textarea
              required
              rows={6}
              className={`${INPUT_STYLE} resize-none`}
              placeholder="Provide the detailed answer here..."
              value={modalForm?.content || ""}
              onChange={(e) =>
                setModalForm({ ...modalForm, content: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-2xl font-semibold text-sm text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={BUTTON_PRIMARY}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {selectedArticle ? "Save Changes" : "Create Article"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}
