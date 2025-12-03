import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_URL } from "../../config/api";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Save,
  Zap,
  X,
} from "lucide-react";

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

export default function SettingsView() {
  const [settings, setSettings] = useState({
    chatbotName: "BUchatbot",
    defaultResponseTime: 2.0,
    enableLogging: true,
    faqSuggestions: true,
    autoUpdateKnowledge: false,
    maxConversationLength: 50,
    sessionTimeout: 30,
    enableNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [lastFetched, setLastFetched] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const token = localStorage.getItem("token");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${ADMIN_API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data || settings);
      setLastFetched(new Date());
    } catch (err) {
      console.error("Failed to load settings:", err);
      // Use default settings if API fails
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Auto-refresh every 60 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSettings();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchSettings]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await axios.put(`${ADMIN_API_URL}/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data);
      showToast("Settings saved successfully!", "success");
    } catch (err) {
      console.error("Failed to save settings:", err);
      showToast(
        `Failed to save settings: ${err.response?.data?.message || err.message}`,
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !lastFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0033A0] mb-4 mx-auto" />
          <p className={`text-lg font-semibold ${HEADING_COLOR}`}>
            Loading Settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <div className={`p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className={`w-7 h-7 ${HEADING_COLOR}`} />
              <h2 className={`text-3xl font-bold ${HEADING_COLOR}`}>
                Chatbot Settings
              </h2>
              {autoRefresh && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live</span>
                </div>
              )}
            </div>
            <p className={`text-sm ${TEXT_MUTED}`}>
              Configure chatbot behavior and system preferences
            </p>
            {lastFetched && (
              <p className="text-xs text-slate-400 mt-1">
                Last updated: {lastFetched.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                autoRefresh
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
              title={
                autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"
              }
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">
                {autoRefresh ? "Live" : "Paused"}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchSettings}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
              title="Refresh Settings"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className={`p-6 ${GLASS_CARD}`}>
          <h3 className={`text-xl font-bold ${HEADING_COLOR} mb-6`}>
            General Settings
          </h3>
          <div className="space-y-6">
            {/* Chatbot Name */}
            <div className="space-y-2">
              <label
                htmlFor="chatbotName"
                className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
              >
                Chatbot Name
              </label>
              <input
                type="text"
                id="chatbotName"
                name="chatbotName"
                value={settings.chatbotName}
                onChange={handleChange}
                className={INPUT_STYLE}
                placeholder="e.g., BUchatbot"
              />
              <p className="text-xs text-slate-400">
                The display name shown to users
              </p>
            </div>

            {/* Default Response Time */}
            <div className="space-y-2">
              <label
                htmlFor="defaultResponseTime"
                className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
              >
                Target Response Time (seconds)
              </label>
              <input
                type="number"
                id="defaultResponseTime"
                name="defaultResponseTime"
                value={settings.defaultResponseTime}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                className={INPUT_STYLE}
              />
              <p className="text-xs text-slate-400">
                Average time goal for chatbot responses
              </p>
            </div>

            {/* Max Conversation Length */}
            <div className="space-y-2">
              <label
                htmlFor="maxConversationLength"
                className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
              >
                Max Conversation Length
              </label>
              <input
                type="number"
                id="maxConversationLength"
                name="maxConversationLength"
                value={settings.maxConversationLength}
                onChange={handleChange}
                min="10"
                max="200"
                className={INPUT_STYLE}
              />
              <p className="text-xs text-slate-400">
                Maximum number of messages per conversation
              </p>
            </div>

            {/* Session Timeout */}
            <div className="space-y-2">
              <label
                htmlFor="sessionTimeout"
                className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED}`}
              >
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                min="5"
                max="120"
                className={INPUT_STYLE}
              />
              <p className="text-xs text-slate-400">
                Idle time before session expires
              </p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className={`p-6 ${GLASS_CARD}`}>
          <h3 className={`text-xl font-bold ${HEADING_COLOR} mb-6`}>
            Feature Controls
          </h3>
          <div className="space-y-6">
            {/* Enable Logging */}
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="enableLogging"
                name="enableLogging"
                checked={settings.enableLogging}
                onChange={handleChange}
                className="mt-1 h-5 w-5 text-[#0033A0] rounded border-slate-300 focus:ring-[#0033A0]"
              />
              <div>
                <label
                  htmlFor="enableLogging"
                  className={`font-semibold ${HEADING_COLOR} cursor-pointer`}
                >
                  Enable Logging
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Record all conversations and system events for analytics
                </p>
              </div>
            </div>

            {/* FAQ Suggestions */}
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="faqSuggestions"
                name="faqSuggestions"
                checked={settings.faqSuggestions}
                onChange={handleChange}
                className="mt-1 h-5 w-5 text-[#0033A0] rounded border-slate-300 focus:ring-[#0033A0]"
              />
              <div>
                <label
                  htmlFor="faqSuggestions"
                  className={`font-semibold ${HEADING_COLOR} cursor-pointer`}
                >
                  Enable FAQ Suggestions
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Show suggested FAQs to users during conversations
                </p>
              </div>
            </div>

            {/* Auto Update Knowledge */}
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="autoUpdateKnowledge"
                name="autoUpdateKnowledge"
                checked={settings.autoUpdateKnowledge}
                onChange={handleChange}
                className="mt-1 h-5 w-5 text-[#0033A0] rounded border-slate-300 focus:ring-[#0033A0]"
              />
              <div>
                <label
                  htmlFor="autoUpdateKnowledge"
                  className={`font-semibold ${HEADING_COLOR} cursor-pointer`}
                >
                  Auto-update Knowledge Base
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Automatically refresh knowledge base from approved sources
                </p>
              </div>
            </div>

            {/* Enable Notifications */}
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="enableNotifications"
                name="enableNotifications"
                checked={settings.enableNotifications}
                onChange={handleChange}
                className="mt-1 h-5 w-5 text-[#0033A0] rounded border-slate-300 focus:ring-[#0033A0]"
              />
              <div>
                <label
                  htmlFor="enableNotifications"
                  className={`font-semibold ${HEADING_COLOR} cursor-pointer`}
                >
                  Enable Admin Notifications
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Receive browser notifications for new conversations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information Card */}
      <div className={`p-6 ${GLASS_CARD}`}>
        <h3 className={`text-xl font-bold ${HEADING_COLOR} mb-6`}>
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED} mb-2`}
            >
              Version
            </p>
            <p className={`text-lg font-semibold ${HEADING_COLOR}`}>1.0.0</p>
          </div>
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED} mb-2`}
            >
              Environment
            </p>
            <p className={`text-lg font-semibold ${HEADING_COLOR}`}>
              {process.env.NODE_ENV === "production"
                ? "Production"
                : "Development"}
            </p>
          </div>
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${TEXT_MUTED} mb-2`}
            >
              Database
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className={`text-lg font-semibold ${HEADING_COLOR}`}>
                Connected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className={`p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className={`font-semibold ${HEADING_COLOR}`}>
              Save Configuration
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Changes will take effect immediately across all active sessions
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={BUTTON_PRIMARY}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`p-6 ${GLASS_CARD}`}>
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}
