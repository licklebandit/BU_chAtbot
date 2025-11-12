import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_URL } from "../../config/api";
import { Loader2, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export default function SettingsView() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const token = localStorage.getItem("token");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${ADMIN_API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
      setLastFetched(new Date());
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await axios.put(`${ADMIN_API_URL}/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-blue-600 font-medium">Loading Settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 bg-red-50 border border-red-200 rounded-xl min-h-[70vh] flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
        <p className="text-xl text-red-600 font-semibold mb-2">Error Loading Settings</p>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end pb-4 border-b-4 border-blue-500/50">
        <h2 className="text-3xl font-extrabold text-blue-800">⚙️ Chatbot Settings</h2>
        {lastFetched && (
          <p className="text-sm text-gray-500 flex items-center">
            <RefreshCw className="w-3 h-3 mr-1" /> Last fetched: {lastFetched.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
        {/* Chatbot Name */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <label className="text-gray-700 font-medium w-48">Chatbot Name</label>
          <input
            type="text"
            name="chatbotName"
            value={settings.chatbotName}
            onChange={handleChange}
            className="p-2 border rounded w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Default Response Time */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <label className="text-gray-700 font-medium w-48">Default Response Time (s)</label>
          <input
            type="number"
            name="defaultResponseTime"
            value={settings.defaultResponseTime}
            onChange={handleChange}
            step="0.1"
            min="0.1"
            className="p-2 border rounded w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Enable Logging */}
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            name="enableLogging"
            checked={settings.enableLogging}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600"
          />
          <label className="text-gray-700 font-medium">Enable Logging</label>
        </div>

        {/* FAQ Suggestions */}
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            name="faqSuggestions"
            checked={settings.faqSuggestions}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600"
          />
          <label className="text-gray-700 font-medium">Enable FAQ Suggestions</label>
        </div>

        {/* Knowledge Base Auto Update */}
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            name="autoUpdateKnowledge"
            checked={settings.autoUpdateKnowledge}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600"
          />
          <label className="text-gray-700 font-medium">Auto-update Knowledge Base</label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`mt-4 px-6 py-2 rounded-lg font-semibold transition ${
            saving ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          }`}
        >
          {saving ? "Saving..." : "Save Settings"} {success && <CheckCircle className="inline w-5 h-5 ml-2 text-green-500" />}
        </button>
      </div>
    </div>
  );
}
