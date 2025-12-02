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
  { key: "users", title: "Total Users", icon: Users },
  { key: "admins", title: "Active Admins", icon: ShieldCheck },
  { key: "conversations", title: "Total Conversations", icon: MessageSquare },
  { key: "knowledgeArticles", title: "Knowledge Articles", icon: BookOpen },
  { key: "faqs", title: "FAQs Count", icon: HelpCircle },
  { key: "responseTime", title: "Avg. Response Time (s)", icon: Activity },
];

// Summary Card Component
const SummaryCard = ({ title, value, Icon }) => {
  const displayValue =
    typeof value === "number"
      ? value.toLocaleString()
      : value || "0";
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.25)] backdrop-blur transition-all duration-200 hover:border-white/40 hover:shadow-[0_35px_70px_rgba(8,16,34,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">{title}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{displayValue}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white/80 transition group-hover:bg-white/30 group-hover:text-white">
          <Icon className="h-6 w-6" />
        </span>
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0b1a34] text-white">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-white" />
        <p className="text-xl font-medium">Loading dashboard…</p>
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
    <div className="min-h-screen bg-[#0b1a34]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-[0_40px_80px_rgba(4,7,25,0.5)] backdrop-blur">
          <div className="flex flex-col gap-4 text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.45em] text-white/60">Admin intelligence</p>
              <h2 className="text-3xl font-semibold">Dashboard overview</h2>
              {lastFetched && (
                <p className="flex items-center gap-2 text-sm text-white/70">
                  <RefreshCw className="h-4 w-4" /> Updated {lastFetched.toLocaleTimeString()} · Refresh every {REFRESH_INTERVAL_SECONDS}s
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <button
                onClick={() => fetchDashboard(true)}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] transition ${
                  loading
                    ? "bg-white/20 text-white"
                    : "bg-white text-bu-primary shadow-[0_10px_35px_rgba(255,255,255,0.35)] hover:bg-white/90"
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading && lastFetched ? "Refreshing" : "Refresh data"}
              </button>
              {lastFetched && (
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                  Data as of {lastFetched.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cardDataConfig.map(({ key, title, icon }) => (
            <SummaryCard key={key} title={title} value={summary[key]} Icon={icon} />
          ))}
        </div>

        {/* System Status & Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_35px_70px_rgba(8,16,34,0.45)] backdrop-blur">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.45em] text-white/60">Health monitor</p>
                <h3 className="text-2xl font-semibold">System health</h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] ${
                  systemStatus === "Operational"
                    ? "border border-emerald-300/40 bg-emerald-400/20 text-emerald-100"
                    : "border border-rose-300/40 bg-rose-400/20 text-rose-100"
                }`}
              >
                {systemStatus}
              </span>
            </div>
            <p className="text-sm text-white/70">
              Monitoring API uptime, knowledge base ingestion, and conversation processing in real time.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Status checked</p>
                <p className="mt-2 text-lg font-semibold">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Overall state</p>
                <p className="mt-2 text-lg font-semibold">
                  {systemStatus === "Operational" ? "All systems go" : "Action required"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_35px_70px_rgba(8,16,34,0.45)] backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.45em] text-white/60">Event stream</p>
                <h3 className="text-2xl font-semibold">Recent activity</h3>
              </div>
              <span className="text-sm text-white/60">{activityFeed.length} events</span>
            </div>
            <ul className="mt-6 space-y-3">
              {activityFeed.map((activity, index) => (
                <li
                  key={activity.id || index}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{activity.user}</p>
                    <p className="truncate text-white/70">{activity.action || "Awaiting new events"}</p>
                  </div>
                  <span className="shrink-0 text-xs text-white/50">{formatRelativeTime(activity.time)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_35px_70px_rgba(8,16,34,0.45)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.45em] text-white/60">Conversation pulse</p>
              <h3 className="text-2xl font-semibold">Live activity ticker</h3>
            </div>
            <p className="text-sm text-white/70">Tracking the latest five interactions.</p>
          </div>
          <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {activityFeed.slice(0, 6).map((activity, index) => (
              <li
                key={`activity-card-${index}`}
                className="rounded-2xl border border-white/10 bg-[#10244d]/70 p-4 shadow-[0_20px_40px_rgba(3,7,18,0.35)]"
              >
                <p className="text-sm font-semibold text-white">{activity.user}</p>
                <p className="mt-2 line-clamp-2 text-sm text-white/70">{activity.action || "No recent updates"}</p>
                <p className="mt-3 text-xs text-white/50">{formatRelativeTime(activity.time)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
