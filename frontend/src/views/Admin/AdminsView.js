import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  UserCog,
  Trash2,
  Edit,
  Plus,
  Shield,
  Mail,
  Loader2,
  RefreshCw,
  Zap,
  Search,
  CheckCircle,
  AlertTriangle,
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
  if (!message) return null;
  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl flex items-center gap-3 z-[60] transition-all duration-300 ${
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

// --- Admin Modal Component ---
const AdminModal = ({ isOpen, admin, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const isEdit = !!admin;

  useEffect(() => {
    if (isOpen) {
      setName(admin ? admin.name : "");
      setEmail(admin ? admin.email : "");
      setPassword("");
      setError(null);
    }
  }, [isOpen, admin]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || (!isEdit && !password)) {
      setError("Name, Email, and Password (for new admins) are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = { name, email, role: "admin" };
    if (password) {
      payload.password = password;
    }

    const url = `${ADMIN_API_URL}/users${isEdit ? "/" + admin._id : ""}`;
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
      console.error("Failed to save admin:", err);
      setError(
        `Failed to ${isEdit ? "update" : "create"} admin. ${err.response?.data?.message || "Please try again."}`,
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
              {isEdit ? "Edit Administrator" : "Add New Administrator"}
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
              htmlFor="name"
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={INPUT_STYLE}
              placeholder="e.g., Dr. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={INPUT_STYLE}
              placeholder="admin@bugema.ac.ug"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
            >
              Password {isEdit ? "(Leave blank to keep current)" : ""}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              className={INPUT_STYLE}
              placeholder="••••••••"
            />
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
                  {isEdit ? "Update Admin" : "Create Admin"}
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
export default function AdminsView() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  const token = localStorage.getItem("token");

  // Fetch Real Admin Data from Backend
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${ADMIN_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter to show only admins
      const adminUsers = (res.data || []).filter(
        (user) => user.role === "admin",
      );
      setAdmins(adminUsers);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        `Failed to retrieve administrators. (Error: ${err.response?.status || err.message || "Unknown error"})`,
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAdmins();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAdmins]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleAddAdmin = () => {
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleRefreshAndToast = () => {
    fetchAdmins();
    showToast("Administrator saved successfully!", "success");
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to remove this administrator?"))
      return;
    setIsDeleting(id);
    try {
      await axios.delete(`${ADMIN_API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      showToast("Administrator removed successfully.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(
        `Failed to remove administrator: ${err.response?.data?.message || err.message}`,
        "error",
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <Shield
                className={`w-6 h-6 sm:w-7 sm:h-7 ${HEADING_COLOR} flex-shrink-0`}
              />
              <h2
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${HEADING_COLOR} truncate`}
              >
                Administrators
              </h2>
              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                {admins.length} admins
              </span>
              {autoRefresh && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">Live</span>
                </div>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${TEXT_MUTED} line-clamp-2`}>
              Manage administrator access and permissions in real-time
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

            {/* Refresh Button */}
            <button
              onClick={fetchAdmins}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
              title="Refresh Now"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Add Admin Button */}
            <button
              onClick={handleAddAdmin}
              className={`${BUTTON_PRIMARY} text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5`}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add Admin</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 sm:mt-6 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search administrators by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 sm:pl-11 ${INPUT_STYLE}`}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading && admins.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#0033A0] mb-4" />
          <p className={`text-lg font-semibold ${HEADING_COLOR}`}>
            Loading Administrators...
          </p>
        </div>
      ) : error ? (
        <div className={`p-10 text-center ${GLASS_CARD}`}>
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <p className="text-xl text-red-600 font-semibold mb-2">
            Error Loading Administrators
          </p>
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchAdmins}
            className="mt-4 px-6 py-2 bg-[#0033A0] text-white rounded-xl font-semibold hover:bg-[#062a7a] transition"
          >
            Retry
          </button>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className={`p-12 text-center ${GLASS_CARD}`}>
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className={`text-lg font-semibold ${HEADING_COLOR} mb-2`}>
            No Administrators Found
          </p>
          <p className={`text-sm ${TEXT_MUTED}`}>
            {searchQuery
              ? `No administrators match "${searchQuery}"`
              : "Click 'Add Admin' to create your first administrator"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((admin, index) => (
            <div
              key={admin._id}
              className={`${GLASS_CARD} p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0033A0] to-[#155EEF] text-white flex items-center justify-center shadow-lg shadow-[#0033A0]/30">
                  <Shield className="w-7 h-7" />
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>

              <h3 className={`text-lg font-bold ${HEADING_COLOR} mb-2`}>
                {admin.name}
              </h3>

              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <Mail className="w-4 h-4" />
                <span className="truncate">{admin.email}</span>
              </div>

              <div className="text-xs text-slate-400 mb-4">
                {admin.createdAt ? (
                  <span>
                    Added {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span>Administrator</span>
                )}
              </div>

              <div className="pt-4 border-t border-[#f1f5f9] flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditAdmin(admin)}
                  className="flex-1 py-2 rounded-xl bg-[#eff4ff] text-[#0033A0] font-semibold text-sm hover:bg-[#dbeafe] transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAdmin(admin._id)}
                  disabled={isDeleting === admin._id}
                  className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                  title="Remove Admin"
                >
                  {isDeleting === admin._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        admin={selectedAdmin}
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
