import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_URL } from "../../config/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  Users, MessageCircle, HelpCircle, BookOpen,
  Loader2, AlertTriangle, RefreshCw
} from "lucide-react";

const REFRESH_INTERVAL_SECONDS = 30; // Auto-refresh every 30 seconds

const cardData = [
  { key: 'users', title: 'Total Users', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'conversations', title: 'Total Conversations', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'faqs', title: 'Total FAQs', icon: HelpCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'knowledge', title: 'Knowledge Articles', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
];

const SummaryCard = ({ title, value, Icon, color, bg }) => (
  <div className={`p-5 ${bg} shadow-md rounded-lg flex items-center space-x-3 border border-gray-200 hover:shadow-lg transition-shadow`}>
    <div className={`p-2 rounded-lg ${color} bg-white shadow-sm flex-shrink-0`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="truncate">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value?.toLocaleString() ?? 0}</p>
    </div>
  </div>
);

export default function AnalyticsView() {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const token = localStorage.getItem("token");

  const fetchAnalytics = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const [summaryRes, chartRes] = await Promise.all([
        axios.get(`${ADMIN_API_URL}/analytics/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${ADMIN_API_URL}/analytics/charts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data || {});
      setChartData(chartRes.data || []);
      setLastFetched(new Date());
    } catch (err) {
      console.error("Analytics fetch error:", err);
      let errorMessage = "Failed to load analytics data.";
      if (err.code === "ERR_NETWORK") {
        errorMessage = "Network Error: Cannot reach the server (Check if your backend is running/deployed).";
      } else if (err.response) {
        if (err.response.status === 404) {
          errorMessage = "404 Error: Analytics endpoints not found. (Did you add the new backend routes?)";
        } else if ([401, 403].includes(err.response.status)) {
          errorMessage = "Authentication Error: You are not authorized. Please log in again.";
        } else {
          errorMessage = `Server Error (${err.response.status}): Failed to load data.`;
        }
      }
      setError(errorMessage);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
    const intervalId = setInterval(() => fetchAnalytics(false), REFRESH_INTERVAL_SECONDS * 1000);
    return () => clearInterval(intervalId);
  }, [fetchAnalytics]);

  if (loading && !lastFetched) {
    return (
      <div className="text-center p-10 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-blue-600 font-medium">Loading Analytics Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 bg-red-50 border border-red-200 rounded-xl min-h-[70vh] flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
        <p className="text-xl text-red-600 font-semibold mb-2">Error Loading Data</p>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* MAIN CONTAINER */}
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="flex justify-between items-end pb-4 border-b-4 border-blue-500/50">
          <div>
            <h2 className="text-3xl font-extrabold text-blue-800">📈 Analytics Dashboard</h2>
            {lastFetched && (
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <RefreshCw className="w-3 h-3 mr-1" />
                Data last updated: {lastFetched.toLocaleTimeString()} (Refreshes every {REFRESH_INTERVAL_SECONDS}s)
              </p>
            )}
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              loading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading && "animate-spin"}`} />
            {loading && lastFetched ? "Refreshing..." : "Manual Refresh"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardData.map(({ key, title, icon, color, bg }) => (
            <SummaryCard
              key={key}
              title={title}
              value={summary[key] || 0}
              Icon={icon}
              color={color}
              bg={bg}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Line Chart */}
          <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
              User & Conversation Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                <Line type="monotone" dataKey="users" name="New Users" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="conversations" name="New Conversations" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
              Content Growth (FAQs & Knowledge)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  cursor={{ fill: "rgba(239, 246, 255, 0.5)" }}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                <Legend iconType="square" wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="faqs" name="New FAQs" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="knowledge" name="New Articles" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
