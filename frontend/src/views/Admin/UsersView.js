import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  User,
  RefreshCw,
  Plus,
  Search,
  Zap,
  Download,
  Mail,
  Calendar,
  Shield,
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
  const isSuccess = type === "success";

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 p-4 rounded-2xl shadow-xl text-white flex items-center gap-3 z-[60] transition-all duration-300 ${
        isSuccess
          ? "bg-emerald-600 shadow-emerald-900/20"
          : "bg-red-600 shadow-red-900/20"
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

// --- User Modal Component ---
const UserModal = ({ isOpen, user, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const isEdit = !!user;

  useEffect(() => {
    if (isOpen) {
      setName(user ? user.name : "");
      setEmail(user ? user.email : "");
      setRole(user ? user.role : "user");
      setPassword("");
      setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || (!isEdit && !password)) {
      setError("Name, Email, and Password (for new users) are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = { name, email, role };
    if (password) {
      payload.password = password;
    }

    const url = `${ADMIN_API_URL}/users${isEdit ? "/" + user._id : ""}`;
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
      console.error("Failed to save user:", err);
      setError(
        `Failed to ${isEdit ? "update" : "create"} user. ${err.response?.data?.message || "Please try again."}`,
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
              {isEdit ? "Edit User" : "Add New User"}
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
              placeholder="e.g., John Doe"
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
              placeholder="user@bugema.ac.ug"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role"
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={INPUT_STYLE}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
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
                  {isEdit ? "Update User" : "Create User"}
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
export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterRole, setFilterRole] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${ADMIN_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        `Failed to retrieve users. (Error: ${err.response?.status || err.message || "Unknown error"})`,
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchUsers]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleRefreshAndToast = () => {
    fetchUsers();
    showToast("User saved successfully!", "success");
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setIsDeleting(id);
    try {
      await axios.delete(`${ADMIN_API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showToast("User deleted successfully.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(
        `Failed to delete user: ${err.response?.data?.message || err.message}`,
        "error",
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const exportUsers = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `users_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    showToast("Users exported successfully", "success");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      filterRole === "all" ||
      (filterRole === "user" && user.role === "user") ||
      (filterRole === "admin" && user.role === "admin");

    return matchesSearch && matchesRole;
  });

  const userCount = users.filter((u) => u.role === "user").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <User
                className={`w-6 h-6 sm:w-7 sm:h-7 ${HEADING_COLOR} flex-shrink-0`}
              />
              <h2
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${HEADING_COLOR} truncate`}
              >
                User Management
              </h2>
              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                {users.length} total
              </span>
              {autoRefresh && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">Live</span>
                </div>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${TEXT_MUTED} line-clamp-2`}>
              Manage all users and administrators with real-time updates
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
              onClick={exportUsers}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs sm:text-sm font-medium"
              title="Export Users"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
              title="Refresh Now"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Add User Button */}
            <button
              onClick={handleAddUser}
              className={`${BUTTON_PRIMARY} text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5`}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-4 sm:mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 sm:pl-11 ${INPUT_STYLE}`}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-2xl border border-[#d6dfff] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
          >
            <option value="all">All Roles</option>
            <option value="user">Users Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>

        {/* Stats Bar */}
        <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className={TEXT_MUTED}>
              Total: <span className="font-semibold">{users.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className={TEXT_MUTED}>
              Users: <span className="font-semibold">{userCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className={TEXT_MUTED}>
              Admins: <span className="font-semibold">{adminCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#0033A0] mb-4" />
          <p className={`text-lg font-semibold ${HEADING_COLOR}`}>
            Loading Users...
          </p>
        </div>
      ) : error ? (
        <div className={`p-10 text-center ${GLASS_CARD}`}>
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <p className="text-xl text-red-600 font-semibold mb-2">
            Error Loading Users
          </p>
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-6 py-2 bg-[#0033A0] text-white rounded-xl font-semibold hover:bg-[#062a7a] transition"
          >
            Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className={`p-12 text-center ${GLASS_CARD}`}>
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className={`text-lg font-semibold ${HEADING_COLOR} mb-2`}>
            No Users Found
          </p>
          <p className={`text-sm ${TEXT_MUTED}`}>
            {searchQuery
              ? `No users match "${searchQuery}"`
              : "Click 'Add User' to create your first user"}
          </p>
        </div>
      ) : (
        <div className={`${GLASS_CARD} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#51629b]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#f8fafc] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <Shield className="w-5 h-5" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <span
                            className={`font-semibold block ${HEADING_COLOR}`}
                          >
                            {user.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 rounded-xl bg-[#eff4ff] text-[#0033A0] hover:bg-[#dbeafe] transition"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Delete User"
                          disabled={isDeleting === user._id}
                        >
                          {isDeleting === user._id ? (
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
        </div>
      )}

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        user={selectedUser}
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
