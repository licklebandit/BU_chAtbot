// src/views/Admin/AnalyticsView.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_URL } from "../../config/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { Users, MessageCircle, HelpCircle, BookOpen, Loader2, AlertTriangle } from 'lucide-react'; // Import icons

// --- Dynamic URL Configuration ---
// Function to determine the correct base URL
const getApiBaseUrl = () => {
  // Check if the current environment is running on localhost (common for React development)
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    // 🚨 ASSUMPTION: Your local backend runs on port 5000. Adjust if needed.
    return "http://localhost:8000/api/admin";
  }
  // Otherwise, use the production (online) URL
  return "https://bu-chatbot.onrender.com/api/admin";
};

// Store the determined base URL
const API_BASE_URL = getApiBaseUrl(); 
// ---------------------------------


// Map keys to visual details (rest of component code unchanged)
const cardData = [
  { key: 'users', title: 'Total Users', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'conversations', title: 'Total Conversations', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'faqs', title: 'Total FAQs', icon: HelpCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'knowledge', title: 'Knowledge Articles', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
];

// --- Simple Card Component for Polished Summary View ---
const SummaryCard = ({ title, value, Icon, color, bg }) => (
  <div className={`p-6 ${bg} shadow-lg rounded-xl flex items-center space-x-4 border border-gray-100`}>
    <div className={`p-3 rounded-full ${color} bg-white shadow-md`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value.toLocaleString()}</p>
    </div>
  </div>
);
// --------------------------------------------------------


export default function AnalyticsView() {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch analytics data from backend
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, chartRes] = await Promise.all([
        // 🚨 Using the dynamic API_BASE_URL here
        axios.get(`${ADMIN_API_URL}/analytics/summary`, { 
            headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`${ADMIN_API_URL}/analytics/charts`, { 
            headers: { Authorization: `Bearer ${token}` } 
        })
      ]);
      
      setSummary(summaryRes.data);
      setChartData(chartRes.data);
      
    } catch (err) {
      console.error("Analytics fetch error:", err);
      // Re-check the error type for better user feedback
      const errorMessage = err.code === "ERR_NETWORK" 
        ? "Network Error: Cannot reach the server. Ensure the backend is running on port 8000 locally or is deployed."
        : "Failed to load analytics data. Ensure you are logged in.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="text-center p-10 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-blue-600 font-medium">Loading Analytics Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-50 border border-red-200 rounded-xl min-h-[50vh] flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
        <p className="text-xl text-red-600 font-semibold mb-2">Error Loading Data</p>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  // --- End Render Logic ---

  // ... (return statement with charts remains unchanged)
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center pb-4 border-b-4 border-blue-500/50">
        <h2 className="text-3xl font-extrabold text-blue-800">📈 Analytics Dashboard</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line chart: Users & Conversations over time */}
        <div className="bg-white p-6 shadow-xl rounded-xl border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">User & Conversation Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: 15 }} />
              <Line 
                type="monotone" 
                dataKey="users" 
                name="New Users"
                stroke="#4F46E5" // Indigo-600
                strokeWidth={3} 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                name="New Conversations"
                stroke="#10B981" // Green-500
                strokeWidth={3} 
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart: FAQs & Knowledge Base over time */}
        <div className="bg-white p-6 shadow-xl rounded-xl border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Content Growth (FAQs & Knowledge)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} // Blue-50 transparent background
                contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
              />
              <Legend iconType="square" wrapperStyle={{ paddingTop: 15 }} />
              <Bar dataKey="faqs" name="New FAQs" fill="#FBBF24" radius={[4, 4, 0, 0]} /> {/* Amber-400 */}
              <Bar dataKey="knowledge" name="New Articles" fill="#3B82F6" radius={[4, 4, 0, 0]} /> {/* Blue-500 */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}