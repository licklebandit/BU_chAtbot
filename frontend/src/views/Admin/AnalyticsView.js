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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
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
  Clock,
  Activity,
  UserCheck,
  Eye,
  Filter,
  TrendingDown,
  Zap,
} from "lucide-react";
import { ADMIN_API_URL } from "../../config/api";

// --- Design Tokens (Matching Landing Page) ---
const GLASS_CARD =
  "bg-white/90 backdrop-blur-md border border-[#d6dfff] shadow-lg shadow-[#0033A0]/10 rounded-3xl";
const HEADING_COLOR = "text-[#0f2a66]";
const TEXT_MUTED = "text-[#51629b]";
const PRIMARY_BLUE = "#0033A0";

const AnalyticsCard = ({
  title,
  value,
  Icon,
  trend = null,
  subtitle = null,
  iconBg = "bg-[#eff4ff]",
  iconColor = "text-[#0033A0]",
}) => (
  <div
    className={`p-6 ${GLASS_CARD} flex flex-col justify-between h-full transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p
          className={`text-xs font-bold uppercase tracking-[0.15em] ${TEXT_MUTED} mb-2`}
        >
          {title}
        </p>
        <h3 className={`text-3xl font-bold ${HEADING_COLOR}`}>{value}</h3>
        {subtitle && <p className={`text-sm mt-2 ${TEXT_MUTED}`}>{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${iconBg} ${iconColor} shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 pt-3 border-t border-[#d6dfff]">
        <div
          className={`flex items-center gap-2 text-xs font-semibold ${
            trend.positive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {trend.positive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>
            {trend.value} vs {trend.period}
          </span>
        </div>
      </div>
    )}
  </div>
);

export default function AnalyticsView() {
  const [data, setData] = useState({
    summary: {},
    charts: { conversationsLast7Days: [] },
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch Real Analytics Data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${ADMIN_API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { timeRange },
      });

      const statsData = response.data;

      // Process data for charts
      const processedData = {
        summary: {
          users: statsData.users || 0,
          conversations: statsData.conversations || 0,
          faqs: statsData.faqs || 0,
          knowledge: statsData.knowledgeArticles || 0,
          avgResponseTime: statsData.responseTime || 0,
          admins: statsData.admins || 0,
        },
        charts: statsData.charts || { conversationsLast7Days: [] },
        recentActivity: statsData.recentActivity || [],
      };

      setData(processedData);
    } catch (err) {
      console.error("Analytics fetch failed:", err);
      setError(err.response?.data?.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [token, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics]);

  if (loading && !data.summary.users) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0033A0] animate-spin mb-4 mx-auto" />
          <p className={`text-lg font-semibold ${HEADING_COLOR}`}>
            Loading Real-Time Analytics...
          </p>
          <p className={`text-sm ${TEXT_MUTED} mt-2`}>
            Fetching latest statistics from the database
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header with Real-time Indicator */}
      <div className={`p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className={`w-7 h-7 ${HEADING_COLOR}`} />
              <h2 className={`text-3xl font-bold ${HEADING_COLOR}`}>
                Analytics Dashboard
              </h2>
              {autoRefresh && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live</span>
                </div>
              )}
            </div>
            <p className={`text-sm ${TEXT_MUTED}`}>
              Real-time insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                autoRefresh
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">
                {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${TEXT_MUTED}`} />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-xl border border-[#d6dfff] bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0] shadow-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
              title="Refresh Now"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to fetch live data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Users"
          value={data.summary.users?.toLocaleString() || "0"}
          Icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          trend={{ positive: true, value: "+12.5%", period: "last week" }}
        />
        <AnalyticsCard
          title="Conversations"
          value={data.summary.conversations?.toLocaleString() || "0"}
          Icon={MessageCircle}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          trend={{ positive: true, value: "+8.3%", period: "last week" }}
        />
        <AnalyticsCard
          title="Knowledge Base"
          value={data.summary.knowledge?.toLocaleString() || "0"}
          Icon={BookOpen}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          subtitle="Articles"
        />
        <AnalyticsCard
          title="Avg Response"
          value={`${data.summary.avgResponseTime?.toFixed(1) || "0"}s`}
          Icon={Clock}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          trend={{ positive: true, value: "-18%", period: "last month" }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsCard
          title="FAQs"
          value={data.summary.faqs?.toLocaleString() || "0"}
          Icon={HelpCircle}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <AnalyticsCard
          title="Admins"
          value={data.summary.admins?.toLocaleString() || "0"}
          Icon={UserCheck}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />
        <AnalyticsCard
          title="System Status"
          value="Operational"
          Icon={Activity}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          subtitle="All systems running"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation Trends */}
        <div className={`${GLASS_CARD} p-8`}>
          <h3
            className={`text-xl font-bold ${HEADING_COLOR} mb-6 flex items-center gap-2`}
          >
            <MessageCircle className="w-5 h-5" />
            Conversation Trends
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.conversationsLast7Days || []}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={PRIMARY_BLUE}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={PRIMARY_BLUE}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
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
                    background: "white",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={PRIMARY_BLUE}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorConv)"
                  name="Conversations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Volume Bar Chart */}
        <div className={`${GLASS_CARD} p-8`}>
          <h3
            className={`text-xl font-bold ${HEADING_COLOR} mb-6 flex items-center gap-2`}
          >
            <BarChart className="w-5 h-5" />
            Daily Volume
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.conversationsLast7Days || []}>
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
                      weekday: "short",
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
                />
                <Bar
                  dataKey="count"
                  fill={PRIMARY_BLUE}
                  radius={[8, 8, 0, 0]}
                  name="Conversations"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${GLASS_CARD} p-8`}>
        <h3
          className={`text-xl font-bold ${HEADING_COLOR} mb-6 flex items-center gap-2`}
        >
          <Activity className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {data.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl hover:bg-[#eff4ff] transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0033A0] text-white flex items-center justify-center font-bold text-sm">
                    {activity.user?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className={`font-semibold ${HEADING_COLOR}`}>
                      {activity.user || "Unknown User"}
                    </p>
                    <p className={`text-sm ${TEXT_MUTED}`}>
                      {activity.action || "Interacted with chatbot"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs ${TEXT_MUTED}`}>
                  {activity.time
                    ? new Date(activity.time).toLocaleTimeString()
                    : "Just now"}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className={`${TEXT_MUTED}`}>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className={`${GLASS_CARD} p-8`}>
        <h3 className={`text-xl font-bold ${HEADING_COLOR} mb-6`}>
          Quick Stats Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${HEADING_COLOR} mb-2`}>
              {data.summary.users || 0}
            </div>
            <p className={`text-sm ${TEXT_MUTED}`}>Total Users</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${HEADING_COLOR} mb-2`}>
              {data.summary.conversations || 0}
            </div>
            <p className={`text-sm ${TEXT_MUTED}`}>Conversations</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${HEADING_COLOR} mb-2`}>
              {data.summary.knowledge || 0}
            </div>
            <p className={`text-sm ${TEXT_MUTED}`}>Articles</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${HEADING_COLOR} mb-2`}>
              {data.summary.faqs || 0}
            </div>
            <p className={`text-sm ${TEXT_MUTED}`}>FAQs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
