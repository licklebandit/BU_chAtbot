import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Users,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Loader2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Shield,
} from "lucide-react";
import { ADMIN_API_URL } from "../../config/api";

// --- Design Tokens ---
const GLASS_CARD =
  "bg-white/80 backdrop-blur-md border border-[#d6dfff] shadow-sm rounded-3xl";
const HEADING_COLOR = "text-[#0f2a66]";
const TEXT_MUTED = "text-[#51629b]";
const PRIMARY_BLUE = "#0033A0";

const AnalyticsCard = ({ title, value, Icon, trend }) => (
  <div
    className={`p-4 sm:p-6 ${GLASS_CARD} flex flex-col justify-between h-full`}
  >
    <div className="flex justify-between items-start gap-2">
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-bold uppercase tracking-[0.15em] ${TEXT_MUTED} truncate`}
        >
          {title}
        </p>
        <h3
          className={`text-2xl sm:text-3xl font-bold mt-2 ${HEADING_COLOR} truncate`}
        >
          {value || 0}
        </h3>
      </div>
      <div
        className={`p-2 sm:p-3 rounded-2xl bg-[#eff4ff] text-[#0033A0] flex-shrink-0`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
        <TrendingUp className="w-3 h-3" /> {trend}
      </div>
    )}
  </div>
);

export default function DashboardView() {
  const [data, setData] = useState({
    summary: { users: 0, admins: 0, conversations: 0, faqs: 0, knowledge: 0 },
    charts: { conversationsLast7Days: [] },
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch real analytics data from backend
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${ADMIN_API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stats = response.data;

      setData({
        summary: {
          users: stats.users || 0,
          admins: stats.admins || 0,
          conversations: stats.conversations || 0,
          faqs: stats.faqs || 0,
          knowledge: stats.knowledgeArticles || 0,
        },
        charts: {
          conversationsLast7Days: stats.charts?.conversationsLast7Days || [],
        },
        recentActivity: stats.recentActivity || [],
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0033A0] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className={`p-6 ${GLASS_CARD} flex flex-col items-center gap-4`}>
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-lg font-semibold text-slate-700">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-6 py-3 bg-[#0033A0] text-white rounded-2xl font-semibold hover:bg-[#062a7a] transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold ${HEADING_COLOR}`}>
            Dashboard Overview
          </h2>
          <p className={`text-sm ${TEXT_MUTED} mt-1`}>
            Real-time statistics and analytics
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <AnalyticsCard
          title="Users"
          value={data.summary.users}
          Icon={Users}
          trend="+4.5% vs last week"
        />
        <AnalyticsCard
          title="Chats"
          value={data.summary.conversations}
          Icon={MessageCircle}
          trend="+12% this week"
        />
        <AnalyticsCard
          title="Admins"
          value={data.summary.admins}
          Icon={Shield}
        />
        <AnalyticsCard
          title="FAQs"
          value={data.summary.faqs}
          Icon={HelpCircle}
        />
        <AnalyticsCard
          title="Articles"
          value={data.summary.knowledge}
          Icon={BookOpen}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Conversations Chart */}
        <div className={`${GLASS_CARD} p-4 sm:p-6 lg:p-8`}>
          <h3
            className={`text-base sm:text-lg font-bold ${HEADING_COLOR} mb-4 sm:mb-6`}
          >
            Conversations (Last 7 Days)
          </h3>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.conversationsLast7Days}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={PRIMARY_BLUE}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 0, fill: PRIMARY_BLUE }}
                  name="Conversations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Analysis */}
        <div className={`${GLASS_CARD} p-4 sm:p-6 lg:p-8`}>
          <h3
            className={`text-base sm:text-lg font-bold ${HEADING_COLOR} mb-4 sm:mb-6`}
          >
            Volume Analysis
          </h3>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.conversationsLast7Days}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={PRIMARY_BLUE}
                  radius={[6, 6, 0, 0]}
                  name="Conversations"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {data.recentActivity && data.recentActivity.length > 0 && (
        <div className={`${GLASS_CARD} p-4 sm:p-6 lg:p-8`}>
          <h3
            className={`text-base sm:text-lg font-bold ${HEADING_COLOR} mb-4 sm:mb-6`}
          >
            Recent Activity
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {data.recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#0033A0] flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${HEADING_COLOR} truncate`}
                    >
                      {activity.user || "Unknown User"}
                    </p>
                    <p className={`text-xs ${TEXT_MUTED} truncate`}>
                      {activity.action || "Activity"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs ${TEXT_MUTED} flex-shrink-0`}>
                  {activity.time
                    ? new Date(activity.time).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
