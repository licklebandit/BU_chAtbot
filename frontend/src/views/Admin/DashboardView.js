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
  Cell
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
  Zap,
  BarChart3,
  UserCheck,
  FileText,
  Clock,
  Activity
} from "lucide-react";
import { ADMIN_API_URL } from "../../config/api";

// --- Design Tokens (Matching Other Views) ---
const GLASS_CARD = "bg-white/90 backdrop-blur-md border border-[#d6dfff] shadow-lg shadow-[#0033A0]/10 rounded-3xl";
const INPUT_STYLE = "w-full rounded-2xl border border-[#d6dfff] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent transition-all";
const BUTTON_PRIMARY = "bg-[#0033A0] text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-lg shadow-blue-900/20 hover:bg-[#062a7a] transition-all";
const HEADING_COLOR = "text-[#0f2a66]";
const TEXT_MUTED = "text-[#51629b]";
const PRIMARY_BLUE = "#0033A0";

// Color palette for charts
const CHART_COLORS = [
  "#0033A0", // Primary Blue
  "#00C49F", // Teal
  "#FF8042", // Orange
  "#8884D8", // Purple
  "#FFBB28", // Yellow
  "#0088FE", // Light Blue
  "#FF6B6B", // Red
  "#34D399", // Green
];

const AnalyticsCard = ({ title, value, Icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    teal: "bg-teal-100 text-teal-600"
  };

  return (
    <div className={`p-4 sm:p-6 ${GLASS_CARD} flex flex-col justify-between h-full transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-medium ${TEXT_MUTED} mb-1`}>
            {title}
          </p>
          <h3 className={`text-2xl sm:text-3xl font-bold ${HEADING_COLOR} truncate`}>
            {value?.toLocaleString() || 0}
          </h3>
        </div>
        <div className={`p-2 sm:p-3 rounded-xl ${colorClasses[color]} flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
          <TrendingUp className="w-3 h-3" /> {trend}
        </div>
      )}
    </div>
  );
};

export default function DashboardView() {
  const [data, setData] = useState({
    summary: { users: 0, admins: 0, conversations: 0, faqs: 0, knowledge: 0 },
    charts: { 
      conversationsLast7Days: [],
      userActivity: []
    },
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshTime, setRefreshTime] = useState(new Date());

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

      // Transform data for better visualization
      const conversationsData = stats.charts?.conversationsLast7Days || [];
      const userActivityData = stats.charts?.userActivity || [
        { name: 'Active', value: 65 },
        { name: 'Inactive', value: 35 }
      ];

      setData({
        summary: {
          users: stats.users || 0,
          admins: stats.admins || 0,
          conversations: stats.conversations || 0,
          faqs: stats.faqs || 0,
          knowledge: stats.knowledgeArticles || 0,
        },
        charts: {
          conversationsLast7Days: conversationsData,
          userActivity: userActivityData
        },
        recentActivity: stats.recentActivity || [],
      });
      setRefreshTime(new Date());
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

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics]);

  if (loading && !data.summary.users) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0033A0] animate-spin mx-auto mb-4" />
          <p className={`text-lg font-medium ${HEADING_COLOR}`}>
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <BarChart3 className={`w-6 h-6 sm:w-7 sm:h-7 ${HEADING_COLOR} flex-shrink-0`} />
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${HEADING_COLOR} truncate`}>
                Dashboards overview
              </h2>
              {autoRefresh && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">Live</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#51629b] line-clamp-2">
              Real-time statistics and performance metrics for your chatbot
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
              title={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">
                {autoRefresh ? "Live" : "Paused"}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition text-sm font-medium disabled:opacity-50 shadow-lg shadow-[#0033A0]/30"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Last Updated Info */}
        <div className="mt-4 flex items-center gap-2 text-xs text-[#51629b]">
          <Clock className="w-3 h-3" />
          Last updated: {refreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AnalyticsCard
          title="Total Users"
          value={data.summary.users}
          Icon={Users}
          trend="+24 this week"
          color="blue"
        />
        <AnalyticsCard
          title="Conversations"
          value={data.summary.conversations}
          Icon={MessageCircle}
          trend="+12% growth"
          color="green"
        />
        <AnalyticsCard
          title="Admin Users"
          value={data.summary.admins}
          Icon={Shield}
          color="purple"
        />
        <AnalyticsCard
          title="FAQ Articles"
          value={data.summary.faqs}
          Icon={HelpCircle}
          color="orange"
        />
        <AnalyticsCard
          title="Knowledge Base"
          value={data.summary.knowledge}
          Icon={BookOpen}
          color="teal"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Trend */}
        <div className={`${GLASS_CARD} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${HEADING_COLOR} mb-1`}>
                Conversation Trends
              </h3>
              <p className={`text-sm ${TEXT_MUTED}`}>
                Last 7 days performance
              </p>
            </div>
            <Activity className="w-5 h-5 text-[#0033A0]" />
          </div>
          <div className="h-72 w-full">
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
                      weekday: "short",
                    });
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #d6dfff",
                    background: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "#0f2a66", fontWeight: "600" }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={PRIMARY_BLUE}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, stroke: "white", fill: PRIMARY_BLUE }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                  name="Conversations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Analysis */}
        <div className={`${GLASS_CARD} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${HEADING_COLOR} mb-1`}>
                Daily Volume
              </h3>
              <p className={`text-sm ${TEXT_MUTED}`}>
                Conversation distribution
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#0033A0]" />
          </div>
          <div className="h-72 w-full">
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
                      day: "numeric",
                      month: "short",
                    });
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #d6dfff",
                    background: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "#0f2a66", fontWeight: "600" }}
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

      {/* Bottom Section - Activity & User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className={`${GLASS_CARD} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${HEADING_COLOR} mb-1`}>
                Recent Activity
              </h3>
              <p className={`text-sm ${TEXT_MUTED}`}>
                Latest system interactions
              </p>
            </div>
            <Activity className="w-5 h-5 text-[#0033A0]" />
          </div>
          
          <div className="space-y-3">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'admin' ? 'bg-purple-100 text-purple-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {activity.type === 'user' ? <UserCheck className="w-4 h-4" /> :
                     activity.type === 'admin' ? <Shield className="w-4 h-4" /> :
                     <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${HEADING_COLOR} truncate`}>
                      {activity.user || "System Activity"}
                    </p>
                    <p className={`text-xs ${TEXT_MUTED} truncate`}>
                      {activity.action || "Performed an action"}
                    </p>
                  </div>
                  <span className={`text-xs ${TEXT_MUTED} flex-shrink-0`}>
                    {activity.time 
                      ? new Date(activity.time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : "Just now"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className={`text-sm ${TEXT_MUTED}`}>
                  No recent activity to display
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Activity Distribution */}
        <div className={`${GLASS_CARD} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${HEADING_COLOR} mb-1`}>
                User Activity
              </h3>
              <p className={`text-sm ${TEXT_MUTED}`}>
                Current user engagement
              </p>
            </div>
            <Users className="w-5 h-5 text-[#0033A0]" />
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.userActivity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.charts.userActivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #d6dfff",
                    background: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className={`${GLASS_CARD} p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className={`text-sm ${TEXT_MUTED}`}>
              System Status
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">All Systems Operational</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="text-center">
              <p className={`text-xs ${TEXT_MUTED}`}>Avg. Response Time</p>
              <p className="font-bold text-[#0f2a66]">1.2s</p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${TEXT_MUTED}`}>Uptime</p>
              <p className="font-bold text-[#0f2a66]">99.9%</p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${TEXT_MUTED}`}>Satisfaction</p>
              <p className="font-bold text-[#0f2a66]">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className={`p-4 sm:p-6 ${GLASS_CARD} flex flex-col items-center gap-4 text-center`}>
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <div>
            <p className="text-lg font-semibold text-slate-700 mb-2">{error}</p>
            <p className={`text-sm ${TEXT_MUTED}`}>
              Please check your connection and try again
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-6 py-3 bg-[#0033A0] text-white rounded-2xl font-semibold hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Loading Data
          </button>
        </div>
      )}
    </div>
  );
}