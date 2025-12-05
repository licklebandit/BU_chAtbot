// src/views/Admin/DashboardView.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_URL } from "../../config/api";
import {
  Users,
  MessageSquare,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Activity,
  Clock,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// Auto-refresh interval
const REFRESH_INTERVAL_SECONDS = 30;

// Dashboard summary cards configuration
const cardDataConfig = [
  { key: "users", title: "Total Users", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "admins", title: "Active Admins", icon: ShieldCheck, color: "text-blue-700", bg: "bg-blue-100" },
  { key: "conversations", title: "Total Conversations", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "knowledgeArticles", title: "Knowledge Articles", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "faqs", title: "FAQs Count", icon: HelpCircle, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "responseTime", title: "Avg. Response Time (s)", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
];

// Summary Card Component
const SummaryCard = ({ title, value, Icon, color, bg }) => {
  const displayValue =
    typeof value === "number"
      ? value.toLocaleString()
      : value || "0";
  return (
    <div className={`p-5 ${bg} shadow-md rounded-lg flex items-center space-x-3 border border-gray-200 hover:shadow-lg transition-shadow`}>
      <div className={`p-2 rounded-lg ${color} bg-white shadow-sm flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="truncate">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className={`text-2xl font-extrabold ${color}`}>{displayValue}</p>
      </div>
    </div>
  );
};

const fallbackActivity = [
  { id: 1, user: "System", action: "Waiting for real-time data…", time: new Date().toISOString() },
];

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "Just now";
  const target = new Date(timestamp);
  const diffMs = Date.now() - target.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function DashboardView() {
  const [summary, setSummary] = useState({
    users: 0,
    admins: 0,
    conversations: 0,
    knowledgeArticles: 0,
    faqs: 0,
    responseTime: 0,
    recentActivity: [],
    charts: { conversationsLast7Days: [] },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [systemStatus, setSystemStatus] = useState("Operational");

  const token = localStorage.getItem("token");
  const activityFeed = summary.recentActivity?.length ? summary.recentActivity : fallbackActivity;

  const fetchDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${ADMIN_API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = res.data || {};
      setSummary((prev) => {
        const normalizedResponseTime =
          typeof payload.responseTime === "number"
            ? Number(payload.responseTime.toFixed(2))
            : prev.responseTime || 0;

        return {
          ...prev,
          ...payload,
          responseTime: normalizedResponseTime,
          recentActivity: payload.recentActivity || [],
          charts: payload.charts || prev.charts,
        };
      });
      setLastFetched(new Date());
      setSystemStatus("Operational");
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data.");
      setSystemStatus("API Error");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
    const intervalId = setInterval(() => fetchDashboard(false), REFRESH_INTERVAL_SECONDS * 1000);
    return () => clearInterval(intervalId);
  }, [fetchDashboard]);

  if (loading && !lastFetched) {
    return (
      <div className="text-center p-10 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-blue-600 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 bg-red-50 border border-red-200 rounded-xl min-h-[70vh] flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
        <p className="text-xl text-red-600 font-semibold mb-2">Error Loading Dashboard</p>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end pb-4 border-b-4 border-blue-500/50">
        <div>
          <h2 className="text-3xl font-extrabold text-blue-800">📊 Admin Dashboard</h2>
          {lastFetched && (
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" />
              Data last updated: {lastFetched.toLocaleTimeString()} (Refreshes every {REFRESH_INTERVAL_SECONDS}s)
            </p>
          )}
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
            loading ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading && "animate-spin"}`} />
          {loading && lastFetched ? "Refreshing..." : "Manual Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cardDataConfig.map(({ key, title, icon, color, bg }) => (
          <SummaryCard key={key} title={title} value={summary[key]} Icon={icon} color={color} bg={bg} />
        ))}
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* System Health */}
        <div className={`p-5 bg-white shadow-md rounded-lg border border-gray-200`}>
          <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5" /> System Health
          </h3>
          <div className={`p-3 rounded-lg font-bold text-center ${
            systemStatus === "Operational"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            Status: {systemStatus}
          </div>
          <p className="text-sm text-gray-500 mt-2">Last checked: {new Date().toLocaleTimeString()}</p>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 p-5 bg-white shadow-md rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Recent Activity
          </h3>
          <ul className="divide-y divide-gray-100">
            {activityFeed.map((activity, index) => (
              <li key={activity.id || index} className="py-2 flex justify-between items-center">
                <span className="text-gray-900 font-medium">{activity.user}</span>
                <span className="text-gray-600 flex-1 mx-4 truncate">{activity.action || "Activity update"}</span>
                <span className="text-xs text-gray-400">{formatRelativeTime(activity.time)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
