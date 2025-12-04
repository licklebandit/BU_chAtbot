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
  Database,
  FileJson,
  Layers,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Filter,
  MoreVertical,
  Menu
} from "lucide-react";
import { ADMIN_API_URL } from "../../config/api";

// --- Design Tokens (Matching Landing Page) ---
const GLASS_CARD =
  "bg-white/90 backdrop-blur-md border border-[#d6dfff] shadow-lg shadow-[#0033A0]/10 rounded-xl md:rounded-3xl";
const BUTTON_PRIMARY =
  "bg-[#0033A0] text-white px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm shadow-lg shadow-blue-900/20 hover:bg-[#062a7a] transition-all flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
const INPUT_STYLE =
  "w-full rounded-xl md:rounded-2xl border border-[#d6dfff] bg-white px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent transition-all";
const HEADING_COLOR = "text-[#0f2a66]";
const TEXT_MUTED = "text-[#51629b]";

// --- Toast Component ---
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  const isSuccess = type === "success";
  const isWarning = type === "warning";

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 md:right-6 md:left-auto p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-2 md:gap-3 z-[60] transition-all duration-300 animate-in slide-in-from-bottom-5 max-w-full md:max-w-md ${
        isSuccess
          ? "bg-emerald-600 text-white shadow-emerald-900/20"
          : isWarning
          ? "bg-amber-500 text-white shadow-amber-900/20"
          : "bg-red-600 text-white shadow-red-900/20"
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
      ) : isWarning ? (
        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
      )}
      <span className="font-medium text-xs md:text-sm truncate flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-1 md:ml-2 p-1 hover:bg-white/20 rounded-full transition flex-shrink-0"
      >
        <X className="w-3 h-3 md:w-4 md:h-4" />
      </button>
    </div>
  );
};

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-[#0f2a66]/20 backdrop-blur-sm">
      <div
        className={`w-full max-w-full md:max-w-2xl bg-white rounded-lg md:rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] md:max-h-[80vh] mx-2 md:mx-0`}
      >
        <div className="p-3 md:p-4 lg:p-6 border-b border-[#eff4ff] flex justify-between items-center bg-gradient-to-r from-[#eff4ff] to-white">
          <h3 className={`text-base md:text-lg lg:text-xl font-bold ${HEADING_COLOR} truncate`}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1 md:p-2 rounded-lg md:rounded-xl hover:bg-[#eff4ff] text-[#51629b] transition flex-shrink-0"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        <div className="p-3 md:p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-60px)] md:max-h-[calc(80vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Source Badge Component ---
const SourceBadge = ({ source }) => {
  const sourceColors = {
    'Database': 'bg-blue-100 text-blue-700',
    'JSON File': 'bg-orange-100 text-orange-700',
    'JSON Import': 'bg-green-100 text-green-700',
    'Admin Panel': 'bg-purple-100 text-purple-700',
    'default': 'bg-gray-100 text-gray-600'
  };

  const sourceIcons = {
    'Database': <Database className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />,
    'JSON File': <FileJson className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />,
    'JSON Import': <Download className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />,
    'Admin Panel': <Save className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />,
    'default': <BookOpen className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
  };

  const colorClass = sourceColors[source] || sourceColors.default;
  const icon = sourceIcons[source] || sourceIcons.default;

  return (
    <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium flex items-center gap-0.5 md:gap-1 ${colorClass}`}>
      {icon}
      <span className="truncate max-w-[60px] md:max-w-none">{source}</span>
    </span>
  );
};

// --- Mobile Actions Menu ---
const MobileActionsMenu = ({ 
  isOpen, 
  onClose, 
  onImportJson, 
  onUpdateJson, 
  onExportJson, 
  onToggleStats,
  onToggleJsonPreview,
  isStatsExpanded,
  isJsonPreviewExpanded,
  actionLoading,
  jsonLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Quick Actions</h3>
            <button onClick={onClose} className="p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-2 space-y-1">
          <button
            onClick={() => { onImportJson(); onClose(); }}
            disabled={actionLoading || jsonLoading}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-green-50 disabled:opacity-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Upload className={`w-4 h-4 text-green-600 ${actionLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="font-medium text-gray-800">Import JSON</p>
                <p className="text-xs text-gray-500">Add JSON entries to database</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { onUpdateJson(); onClose(); }}
            disabled={actionLoading}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 disabled:opacity-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Save className={`w-4 h-4 text-orange-600 ${actionLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="font-medium text-gray-800">Update JSON</p>
                <p className="text-xs text-gray-500">Sync database to JSON file</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { onExportJson(); onClose(); }}
            disabled={actionLoading}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 disabled:opacity-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Download className={`w-4 h-4 text-purple-600 ${actionLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="font-medium text-gray-800">Export JSON</p>
                <p className="text-xs text-gray-500">Download database as JSON</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { onToggleStats(); onClose(); }}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {isStatsExpanded ? "Hide Statistics" : "Show Statistics"}
                </p>
                <p className="text-xs text-gray-500">View knowledge base stats</p>
              </div>
            </div>
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${isStatsExpanded ? '' : 'rotate-180'}`} />
          </button>

          <button
            onClick={() => { onToggleJsonPreview(); onClose(); }}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <FileJson className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {isJsonPreviewExpanded ? "Hide JSON Preview" : "Show JSON Preview"}
                </p>
                <p className="text-xs text-gray-500">View JSON file contents</p>
              </div>
            </div>
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${isJsonPreviewExpanded ? '' : 'rotate-180'}`} />
          </button>
        </div>
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
  const [viewMode, setViewMode] = useState("all");
  const [displayMode, setDisplayMode] = useState("table");
  const [stats, setStats] = useState(null);
  const [jsonData, setJsonData] = useState([]);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isJsonPreviewExpanded, setIsJsonPreviewExpanded] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalForm, setModalForm] = useState({ title: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });

  const token = localStorage.getItem("token");
  const API_BASE = ADMIN_API_URL;

  // --- Data Fetching ---
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/ingest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        setArticles(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setArticles([]);
        setError(res.data.message || "Failed to fetch knowledge");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        `Failed to retrieve knowledge articles. (Error: ${err.response?.data?.message || err.message || "Unknown error"})`,
      );
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token]);

  const fetchJsonData = useCallback(async () => {
    setJsonLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/ingest/json`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        setJsonData(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch JSON error:", err);
    } finally {
      setJsonLoading(false);
    }
  }, [API_BASE, token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/ingest/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    fetchArticles();
    fetchJsonData();
    fetchStats();
  }, [fetchArticles, fetchJsonData, fetchStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchArticles();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchArticles]);

  // --- Handlers ---
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleAddArticle = () => {
    setSelectedArticle(null);
    setModalForm({ title: "", content: "" });
    setIsModalOpen(true);
  };

  const handleEditArticle = (item) => {
    if (item._id && item._id.startsWith('json_')) {
      showToast("JSON file entries cannot be edited directly. Use JSON import to add to database.", "warning");
      return;
    }
    
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
        await axios.put(
          `${API_BASE}/ingest/${selectedArticle._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        showToast("Article updated successfully");
      } else {
        await axios.post(
          `${API_BASE}/ingest`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        showToast("Article created successfully");
      }

      setIsModalOpen(false);
      fetchArticles();
    } catch (err) {
      console.error("Save failed:", err);
      showToast(
        `Failed to ${selectedArticle ? "update" : "create"} article: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id && id.startsWith('json_')) {
      showToast("JSON file entries cannot be deleted from here. Edit the JSON file directly.", "warning");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this knowledge article?")) return;
    
    setIsDeleting(id);
    try {
      await axios.delete(`${API_BASE}/ingest/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setArticles(prev => prev.filter((a) => a._id !== id));
      showToast("Article deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(
        `Failed to delete article: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const handleImportFromJson = async () => {
    if (!window.confirm("Import all JSON entries to database? This will not delete existing entries.")) return;
    
    setActionLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ingest/json/import`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        showToast(res.data.message);
        fetchArticles();
        fetchStats();
      }
    } catch (err) {
      console.error("Import failed:", err);
      showToast(
        `Failed to import: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJsonFile = async () => {
    if (!window.confirm("Update JSON file with current database entries? This will overwrite the existing JSON file.")) return;
    
    setActionLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ingest/json/update`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        showToast(res.data.message);
        fetchJsonData();
      }
    } catch (err) {
      console.error("Update JSON failed:", err);
      showToast(
        `Failed to update JSON: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportJson = async () => {
    setActionLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/ingest/json/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        const dataStr = JSON.stringify(res.data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `bugema-knowledge-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast(`Exported ${res.data.count} entries to JSON`);
      }
    } catch (err) {
      console.error("Export failed:", err);
      showToast(
        `Failed to export: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --- Filtering ---
  const filteredArticles = articles.filter((a) => {
    if (viewMode === "database" && a.source === "JSON File") return false;
    if (viewMode === "json" && a.source !== "JSON File") return false;
    
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (a.question || "").toLowerCase().includes(query) ||
      (a.answer || "").toLowerCase().includes(query) ||
      (a.title || "").toLowerCase().includes(query)
    );
  });

  // Get counts
  const databaseCount = articles.filter(a => a.source !== "JSON File").length;
  const jsonCount = articles.filter(a => a.source === "JSON File").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-2 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6">
      {/* Header Card */}
      <div className={`p-3 md:p-4 lg:p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 md:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
              <BookOpen className={`w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ${HEADING_COLOR} flex-shrink-0`} />
              <h2 className={`text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold ${HEADING_COLOR} truncate`}>
                Knowledge Base
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                <span className="px-1.5 md:px-2 lg:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] md:text-xs lg:text-sm font-bold flex items-center gap-0.5 md:gap-1">
                  <Database className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span className="hidden xs:inline">DB:</span>
                  <span>{databaseCount}</span>
                </span>
                <span className="px-1.5 md:px offshore 2 lg:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] md:text-xs lg:text-sm font-bold flex items-center gap-0.5 md:gap-1">
                  <FileJson className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span className="hidden xs:inline">JSON:</span>
                  <span>{jsonCount}</span>
                </span>
                {autoRefresh && (
                  <span className="px-1.5 md:px-2 lg:px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] md:text-xs font-semibold animate-pulse flex items-center gap-0.5 md:gap-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">Live</span>
                  </span>
                )}
              </div>
            </div>
            <p className={`text-[10px] md:text-xs lg:text-sm ${TEXT_MUTED} line-clamp-2`}>
              Manage chatbot answers from database and JSON files in real-time
            </p>
          </div>
          
          {/* Mobile Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 md:gap-2 w-full lg:w-auto">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                title="More Actions"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Display Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setDisplayMode("table")}
                  className={`p-1.5 md:p-2 ${displayMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  title="Table View"
                >
                  <List className="w-3 h-3 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => setDisplayMode("grid")}
                  className={`p-1.5 md:p-2 ${displayMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  title="Grid View"
                >
                  <Grid className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-medium ${
                    viewMode === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setViewMode("database")}
                  className={`px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-medium ${
                    viewMode === "database" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="hidden sm:inline">DB</span>
                  <span className="sm:hidden">DB</span>
                </button>
                <button
                  onClick={() => setViewMode("json")}
                  className={`px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-medium ${
                    viewMode === "json" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  JSON
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => { fetchArticles(); fetchJsonData(); fetchStats(); }}
                disabled={loading || actionLoading}
                className="p-1.5 md:p-2 lg:p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
                title="Refresh All Data"
              >
                <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 ${loading || actionLoading ? "animate-spin" : ""}`} />
              </button>

              {/* Add Article Button */}
              <button
                onClick={handleAddArticle}
                className={`${BUTTON_PRIMARY}`}
                disabled={actionLoading}
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden md:inline">Add Article</span>
                <span className="md:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 md:mt-4 lg:mt-6 relative">
          <Search className="absolute left-2.5 md:left-3 lg:left-4 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-8 md:pl-10 lg:pl-11 ${INPUT_STYLE}`}
            disabled={actionLoading}
          />
          <div className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-[10px] md:text-xs text-gray-500">
            {filteredArticles.length}/{articles.length}
          </div>
        </div>

        {/* Secondary Controls (Desktop) */}
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 hidden lg:flex flex-wrap items-center justify-between gap-2 lg:gap-3">
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="text-xs lg:text-sm font-medium text-gray-700">Actions:</span>
            <div className="flex flex-wrap gap-1.5 lg:gap-2">
              <button
                onClick={handleImportFromJson}
                disabled={actionLoading || jsonLoading}
                className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-xs font-medium transition"
                title="Import from JSON to Database"
              >
                <Upload className={`w-3 h-3 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Import JSON</span>
              </button>

              <button
                onClick={handleUpdateJsonFile}
                disabled={actionLoading}
                className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 text-xs font-medium transition"
                title="Update JSON File from Database"
              >
                <Save className={`w-3 h-3 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Update JSON</span>
              </button>

              <button
                onClick={handleExportJson}
                disabled={actionLoading}
                className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 text-xs font-medium transition"
                title="Export Database to JSON"
              >
                <Download className={`w-3 h-3 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs font-medium transition ${
                autoRefresh
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Zap className="w-3 h-3" />
              {autoRefresh ? "Auto ON" : "Auto OFF"}
            </button>
            
            <button
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition"
            >
              <Filter className="w-3 h-3" />
              {isStatsExpanded ? "Hide Stats" : "Show Stats"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Actions Menu */}
      <MobileActionsMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onImportJson={handleImportFromJson}
        onUpdateJson={handleUpdateJsonFile}
        onExportJson={handleExportJson}
        onToggleStats={() => setIsStatsExpanded(!isStatsExpanded)}
        onToggleJsonPreview={() => setIsJsonPreviewExpanded(!isJsonPreviewExpanded)}
        isStatsExpanded={isStatsExpanded}
        isJsonPreviewExpanded={isJsonPreviewExpanded}
        actionLoading={actionLoading}
        jsonLoading={jsonLoading}
      />

      {/* Stats Cards - Collapsible */}
      {isStatsExpanded && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
          <div className={`p-2 md:p-3 lg:p-4 ${GLASS_CARD}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-500">Database</p>
                <p className="text-base md:text-xl lg:text-2xl font-bold">{stats?.database?.total || 0}</p>
              </div>
              <Database className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-blue-500 flex-shrink-0" />
            </div>
          </div>
          
          <div className={`p-2 md:p-3 lg:p-4 ${GLASS_CARD}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-500">JSON File</p>
                <p className="text-base md:text-xl lg:text-2xl font-bold">{stats?.json?.total || 0}</p>
              </div>
              <FileJson className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-orange-500 flex-shrink-0" />
            </div>
          </div>
          
          <div className={`p-2 md:p-3 lg:p-4 ${GLASS_CARD}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-500">Categories</p>
                <p className="text-base md:text-xl lg:text-2xl font-bold">{stats?.database?.byCategory?.length || 0}</p>
              </div>
              <Layers className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-green-500 flex-shrink-0" />
            </div>
          </div>
          
          <div className={`p-2 md:p-3 lg:p-4 ${GLASS_CARD}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-500">Last Update</p>
                <p className="text-sm md:text-lg lg:text-xl font-bold truncate text-xs md:text-sm">
                  {stats?.json?.lastModified 
                    ? new Date(stats.json.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-purple-500 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Stats Toggle Button */}
      {!isStatsExpanded && (
        <button
          onClick={() => setIsStatsExpanded(true)}
          className="lg:hidden w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition"
        >
          <ChevronDown className="w-3 h-3" />
          Show Statistics
        </button>
      )}

      {/* Content Area */}
      {loading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] md:min-h-[300px] lg:min-h-[400px]">
          <Loader2 className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 animate-spin text-[#0033A0] mb-2 md:mb-3" />
          <p className={`text-sm md:text-base lg:text-lg font-medium ${HEADING_COLOR}`}>
            Loading Knowledge Base...
          </p>
        </div>
      ) : error && articles.length === 0 ? (
        <div className={`p-4 md:p-6 lg:p-8 text-center ${GLASS_CARD}`}>
          <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-red-500 mx-auto mb-2 md:mb-3" />
          <p className="text-red-600 font-semibold text-xs md:text-sm lg:text-base">{error}</p>
          <button
            onClick={fetchArticles}
            className="mt-3 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 bg-[#0033A0] text-white rounded-lg md:rounded-xl hover:bg-[#062a7a] transition text-xs md:text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Table View */}
          {displayMode === "table" ? (
            <div className={`${GLASS_CARD} overflow-hidden`}>
              {filteredArticles.length === 0 ? (
                <div className="p-4 md:p-6 lg:p-8 xl:p-12 text-center text-slate-400">
                  <BookOpen className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 mx-auto mb-2 md:mb-3 opacity-20" />
                  <p className={`text-sm md:text-base lg:text-lg font-medium ${HEADING_COLOR} mb-1 md:mb-2`}>
                    No articles found
                  </p>
                  <p className={`text-[10px] md:text-xs lg:text-sm ${TEXT_MUTED}`}>
                    {searchQuery
                      ? `No articles match "${searchQuery}"`
                      : "Click 'Add Article' to create your first knowledge base entry"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2 md:mx-0">
                  <table className="w-full min-w-[600px] md:min-w-0">
                    <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <tr>
                        <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#51629b] whitespace-nowrap">
                          Question
                        </th>
                        <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#51629b] hidden sm:table-cell">
                          Source
                        </th>
                        <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#51629b]">
                          <span className="hidden md:inline">Answer Preview</span>
                          <span className="md:hidden">Preview</span>
                        </th>
                        <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#51629b] hidden lg:table-cell whitespace-nowrap">
                          Last Updated
                        </th>
                        <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#51629b]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredArticles.map((article) => {
                        const isJsonEntry = article._id && article._id.startsWith('json_');
                        return (
                          <tr
                            key={article._id}
                            className={`hover:bg-[#f8fafc] transition-colors group ${
                              isJsonEntry ? 'bg-orange-50/50' : ''
                            }`}
                          >
                            <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 align-top">
                              <div className="flex items-start gap-1.5 md:gap-2 lg:gap-3">
                                <div className={`mt-0.5 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center shrink-0 ${
                                  isJsonEntry 
                                    ? 'bg-orange-50 text-orange-600' 
                                    : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                  {isJsonEntry ? (
                                    <FileJson className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" />
                                  ) : (
                                    <BookOpen className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={`font-semibold ${HEADING_COLOR} block truncate max-w-[120px] md:max-w-[180px] lg:max-w-xs text-xs md:text-sm`}
                                    title={article.question || article.title}
                                  >
                                    {article.question || article.title}
                                  </span>
                                  {article.category && (
                                    <span className="text-[10px] md:text-xs text-gray-500 mt-0.5 block">
                                      {article.category}
                                    </span>
                                  )}
                                  <div className="sm:hidden mt-1">
                                    <SourceBadge source={article.source || (isJsonEntry ? 'JSON File' : 'Database')} />
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 align-top hidden sm:table-cell">
                              <SourceBadge source={article.source || (isJsonEntry ? 'JSON File' : 'Database')} />
                            </td>
                            <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 align-top text-[10px] md:text-xs lg:text-sm text-slate-600 max-w-[100px] md:max-w-[150px] lg:max-w-sm">
                              <p className="line-clamp-2" title={article.answer || article.content}>
                                {article.answer || article.content}
                              </p>
                            </td>
                            <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 align-top text-[10px] md:text-xs text-slate-500 font-medium hidden lg:table-cell whitespace-nowrap">
                              {article.updatedAt
                                ? new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : "N/A"}
                            </td>
                            <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 align-top">
                              <div className="flex justify-center gap-1 md:gap-1.5 lg:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditArticle(article)}
                                  className={`p-1 md:p-1.5 lg:p-2 rounded-lg md:rounded-xl transition ${
                                    isJsonEntry
                                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 cursor-not-allowed opacity-50'
                                      : 'bg-[#eff4ff] text-[#0033A0] hover:bg-[#dbeafe]'
                                  }`}
                                  title={isJsonEntry ? "JSON entries cannot be edited" : "Edit"}
                                  disabled={isJsonEntry}
                                >
                                  <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(article._id)}
                                  className={`p-1 md:p-1.5 lg:p-2 rounded-lg md:rounded-xl transition ${
                                    isJsonEntry
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                                  }`}
                                  title={isJsonEntry ? "JSON entries cannot be deleted" : "Delete"}
                                  disabled={isJsonEntry || isDeleting === article._id}
                                >
                                  {isDeleting === article._id ? (
                                    <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className={`${GLASS_CARD} p-3 md:p-4 lg:p-6`}>
              {filteredArticles.length === 0 ? (
                <div className="p-4 md:p-6 lg:p-8 xl:p-12 text-center text-slate-400">
                  <Grid className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 mx-auto mb-2 md:mb-3 opacity-20" />
                  <p className={`text-sm md:text-base lg:text-lg font-medium ${HEADING_COLOR} mb-1 md:mb-2`}>
                    No articles found
                  </p>
                  <p className={`text-[10px] md:text-xs lg:text-sm ${TEXT_MUTED}`}>
                    {searchQuery
                      ? `No articles match "${searchQuery}"`
                      : "Click 'Add Article' to create your first knowledge base entry"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {filteredArticles.map((article) => {
                    const isJsonEntry = article._id && article._id.startsWith('json_');
                    return (
                      <div
                        key={article._id}
                        className={`rounded-lg md:rounded-xl border p-3 md:p-4 hover:shadow-md transition-all ${isJsonEntry ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isJsonEntry ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            {isJsonEntry ? (
                              <FileJson className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            ) : (
                              <BookOpen className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            )}
                          </div>
                          <SourceBadge source={article.source || (isJsonEntry ? 'JSON File' : 'Database')} />
                        </div>
                        
                        <h4 className="font-bold text-gray-800 text-xs md:text-sm mb-1 md:mb-2 line-clamp-2" title={article.question || article.title}>
                          {article.question || article.title}
                        </h4>
                        
                        <p className="text-[10px] md:text-xs text-gray-600 mb-2 line-clamp-3" title={article.answer || article.content}>
                          {article.answer || article.content}
                        </p>
                        
                        {article.category && (
                          <div className="mb-2">
                            <span className="inline-block px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] md:text-xs">
                              {article.category}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 md:mt-4 pt-2 md:pt-3 border-t border-gray-100">
                          <span className="text-[10px] md:text-xs text-gray-500 truncate mr-2">
                            {article.updatedAt
                              ? new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : "N/A"}
                          </span>
                          <div className="flex gap-0.5 md:gap-1">
                            <button
                              onClick={() => handleEditArticle(article)}
                              disabled={isJsonEntry}
                              className={`p-1 md:p-1.5 rounded-md md:rounded-lg transition ${
                                isJsonEntry
                                  ? 'bg-orange-100 text-orange-400 cursor-not-allowed'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                              title={isJsonEntry ? "JSON entries cannot be edited" : "Edit"}
                            >
                              <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(article._id)}
                              disabled={isJsonEntry || isDeleting === article._id}
                              className={`p-1 md:p-1.5 rounded-md md:rounded-lg transition ${
                                isJsonEntry
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                              title={isJsonEntry ? "JSON entries cannot be deleted" : "Delete"}
                            >
                              {isDeleting === article._id ? (
                                <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* JSON File Preview */}
      <div className={`${GLASS_CARD} overflow-hidden`}>
        <div 
          className="p-3 md:p-4 lg:p-6 border-b border-[#e2e8f0] cursor-pointer hover:bg-gray-50 transition"
          onClick={() => setIsJsonPreviewExpanded(!isJsonPreviewExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <FileJson className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-orange-500 flex-shrink-0" />
              <div>
                <h3 className={`text-sm md:text-base lg:text-lg font-bold ${HEADING_COLOR}`}>
                  JSON File Preview
                </h3>
                <p className={`text-[10px] md:text-xs lg:text-sm ${TEXT_MUTED}`}>
                  {jsonData.length} entries • Tap to {isJsonPreviewExpanded ? 'collapse' : 'expand'}
                </p>
              </div>
            </div>
            {isJsonPreviewExpanded ? (
              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            )}
          </div>
        </div>
        
        {isJsonPreviewExpanded && (
          <div className="p-3 md:p-4 lg:p-6">
            {jsonLoading ? (
              <div className="flex items-center justify-center py-4 md:py-6 lg:py-8">
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 animate-spin text-[#0033A0]" />
              </div>
            ) : jsonData.length === 0 ? (
              <div className="text-center py-4 md:py-6 lg:py-8 text-gray-400">
                <FileJson className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 mx-auto mb-2 md:mb-3 opacity-20" />
                <p className="text-xs md:text-sm lg:text-base">No data in JSON file</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3 lg:space-y-4">
                <div className="bg-gray-900 text-gray-100 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 overflow-auto max-h-[200px] md:max-h-[250px] lg:max-h-[300px]">
                  <pre className="text-[10px] md:text-xs lg:text-sm font-mono whitespace-pre-wrap">
                    {JSON.stringify(jsonData.slice(0, 2), null, 2)}
                    {jsonData.length > 2 && (
                      <div className="text-gray-400 italic mt-1 md:mt-2 text-[10px] md:text-xs lg:text-sm">
                        ... and {jsonData.length - 2} more entries
                      </div>
                    )}
                  </pre>
                </div>
                <div className="text-[10px] md:text-xs lg:text-sm text-gray-600">
                  <p className="mb-1 md:mb-2">
                    This JSON file serves as a backup and can be used to seed the database.
                  </p>
                  <div className="flex items-start gap-1.5 md:gap-2 text-[10px] md:text-xs">
                    <AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 flex-shrink-0 mt-0.5" />
                    <span>JSON entries are read-only. Use import/export functions to manage them.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedArticle ? "Edit Article" : "New Article"}
      >
        <form onSubmit={handleSave} className="space-y-3 md:space-y-4 lg:space-y-6">
          <div className="space-y-1.5 md:space-y-2">
            <label className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}>
              Question / Keyword
            </label>
            <input
              type="text"
              required
              className={INPUT_STYLE}
              placeholder="e.g., What are the tuition fees?"
              value={modalForm?.title || ""}
              onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <label className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}>
              Answer Content
            </label>
            <textarea
              required
              rows={4}
              className={`${INPUT_STYLE} resize-none`}
              placeholder="Provide the detailed answer here..."
              value={modalForm?.content || ""}
              onChange={(e) => setModalForm({ ...modalForm, content: e.target.value })}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-1.5 md:gap-2 lg:gap-3 pt-3 md:pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm text-slate-600 hover:bg-slate-100 transition order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`${BUTTON_PRIMARY} order-1 sm:order-2`}
            >
              {isSaving ? (
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
              ) : (
                <Save className="w-3 h-3 md:w-4 md:h-4" />
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