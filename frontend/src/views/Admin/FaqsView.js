import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  Zap,
  Download,
  X,
  Save,
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
  const baseClasses =
    "fixed bottom-5 right-5 p-4 rounded-2xl shadow-xl text-white flex items-center gap-3 z-[60] transition-all duration-300";
  let colorClasses = "",
    Icon = AlertTriangle;

  if (type === "success") {
    colorClasses = "bg-emerald-600 shadow-emerald-900/20";
    Icon = CheckCircle;
  }
  if (type === "error") {
    colorClasses = "bg-red-600 shadow-red-900/20";
    Icon = AlertTriangle;
  }

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium">{message}</span>
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
const FaqModal = ({ isOpen, faq, onClose, onSave }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const isEdit = !!faq;

  useEffect(() => {
    if (isOpen) {
      setQuestion(faq ? faq.question : "");
      setAnswer(faq ? faq.answer : "");
      setError(null);
    }
  }, [isOpen, faq]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question || !answer) {
      setError("Question and Answer cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = { question, answer };
    const url = `${ADMIN_API_URL}/faqs${isEdit ? "/" + faq._id : ""}`;
    const method = isEdit ? "put" : "post";

    try {
      await axios({
        method,
        url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save FAQ:", err);
      setError(
        `Failed to ${isEdit ? "update" : "create"} FAQ. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === "modal-overlay") onClose();
  };

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#eff4ff] bg-gradient-to-r from-[#eff4ff] to-white">
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-bold ${HEADING_COLOR}`}>
              {isEdit ? "Edit FAQ" : "Add New FAQ"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="question"
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
            >
              Question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={INPUT_STYLE}
              placeholder="e.g., What are the admission requirements?"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="answer"
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
            >
              Answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows="6"
              className={`${INPUT_STYLE} resize-none`}
              placeholder="Provide a clear and helpful answer..."
              required
            ></textarea>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#eff4ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl font-semibold text-sm text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className={BUTTON_PRIMARY}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />{" "}
                  {isEdit ? "Update FAQ" : "Save FAQ"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function FaqsView() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  const token = localStorage.getItem("token");

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${ADMIN_API_URL}/faqs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaqs(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage =
        err.response?.status === 404
          ? "FAQ API route not found. Check backend."
          : err.code === "ERR_NETWORK"
            ? "Cannot connect to backend."
            : "Failed to retrieve FAQs.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchFaqs();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchFaqs]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleAddFaq = () => {
    setSelectedFaq(null);
    setIsModalOpen(true);
  };

  const handleEditFaq = (faq) => {
    setSelectedFaq(faq);
    setIsModalOpen(true);
  };

  const handleRefreshAndToast = () => {
    fetchFaqs();
    showToast("FAQ saved successfully!", "success");
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    setIsDeleting(id);
    try {
      await axios.delete(`${ADMIN_API_URL}/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaqs((prev) => prev.filter((f) => f._id !== id));
      showToast("FAQ deleted successfully.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete FAQ.", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const exportFaqs = () => {
    const dataStr = JSON.stringify(faqs, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `faqs_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    showToast("FAQs exported successfully", "success");
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <div className={`p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <HelpCircle
                className={`w-6 h-6 sm:w-7 sm:h-7 ${HEADING_COLOR} flex-shrink-0`}
              />
              <h2
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${HEADING_COLOR} truncate`}
              >
                Frequently Asked Questions
              </h2>
              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                {faqs.length} FAQs
              </span>
              {autoRefresh && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">Live</span>
                </div>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${TEXT_MUTED} line-clamp-2`}>
              Manage frequently asked questions with real-time updates
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
              onClick={exportFaqs}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs sm:text-sm font-medium"
              title="Export FAQs"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchFaqs}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
              title="Refresh Now"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Add FAQ Button */}
            <button
              onClick={handleAddFaq}
              className={`${BUTTON_PRIMARY} text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3`}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add FAQ</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs by question or answer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-11 ${INPUT_STYLE}`}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading && faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#0033A0] mb-4" />
          <p className={`text-lg font-semibold ${HEADING_COLOR}`}>
            Loading FAQs...
          </p>
        </div>
      ) : error ? (
        <div className={`p-10 text-center ${GLASS_CARD}`}>
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <p className="text-xl text-red-600 font-semibold mb-2">
            Error Loading FAQs
          </p>
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchFaqs}
            className="mt-4 px-6 py-2 bg-[#0033A0] text-white rounded-xl font-semibold hover:bg-[#062a7a] transition"
          >
            Retry
          </button>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className={`p-12 text-center ${GLASS_CARD}`}>
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className={`text-lg font-semibold ${HEADING_COLOR} mb-2`}>
            No FAQs Found
          </p>
          <p className={`text-sm ${TEXT_MUTED}`}>
            {searchQuery
              ? `No FAQs match "${searchQuery}"`
              : "Click 'Add FAQ' to create your first frequently asked question"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFaqs.map((faq, index) => (
            <div
              key={faq._id}
              className={`${GLASS_CARD} p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* FAQ Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${HEADING_COLOR} text-lg mb-2`}>
                    {faq.question}
                  </h3>
                </div>
              </div>

              {/* FAQ Answer */}
              <div className="mb-4 pl-14">
                <p className={`text-sm ${TEXT_MUTED} leading-relaxed`}>
                  {faq.answer}
                </p>
              </div>

              {/* FAQ Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-[#eff4ff] pl-14">
                <span className="text-xs text-slate-400">
                  {faq.updatedAt
                    ? `Updated ${new Date(faq.updatedAt).toLocaleDateString()}`
                    : "Just added"}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditFaq(faq)}
                    className="p-2 rounded-xl bg-[#eff4ff] text-[#0033A0] hover:bg-[#dbeafe] transition"
                    title="Edit FAQ"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq._id)}
                    disabled={isDeleting === faq._id}
                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                    title="Delete FAQ"
                  >
                    {isDeleting === faq._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <FaqModal
        isOpen={isModalOpen}
        faq={selectedFaq}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRefreshAndToast}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}
