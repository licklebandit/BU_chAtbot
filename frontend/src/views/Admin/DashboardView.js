import React, { useEffect, useState } from "react";
import axios from "axios";
// Importing Lucide icons for a cleaner visual dashboard
import { Users, MessageSquare, BookOpen, HelpCircle, ShieldCheck, Activity, Clock, Loader } from "lucide-react";

// Helper component for a single statistics card
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  // Changed shadow-lg to shadow-md and removed aggressive hover:scale
  <div className="p-6 bg-white shadow-md rounded-xl flex items-center justify-between transition duration-300 ease-in-out hover:shadow-lg">
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
    {/* Cleaned Icon: uses a fixed, light background (bg-blue-50) and the full color on the icon itself */}
    <div className="p-3 rounded-full bg-blue-50">
      <Icon className="w-6 h-6" style={{ color: colorClass }} />
    </div>
  </div>
);

// Simulated data for demonstration
const recentActivityData = [
  { id: 1, user: "Alice C.", action: "Started new chat", time: "2 min ago" },
  { id: 2, user: "System", action: "Knowledge base updated", time: "1 hour ago" },
  { id: 3, user: "Bob D.", action: "Viewed FAQ: 'API limits'", time: "4 hours ago" },
  { id: 4, user: "Jane E.", action: "Logged in", time: "1 day ago" },
];

export default function DashboardView() {
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    conversations: 0,
    knowledgeArticles: 0,
    faqs: 0,
    responseTime: 0, // New stat: Average Response Time
  });
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState("Operational"); // Simulated system status

  const token = localStorage.getItem("token");
  
  // Custom colors for the cards
  const colorMap = {
    users: "#10B981", // Emerald
    admins: "#3B82F6", // Blue
    conversations: "#F59E0B", // Amber
    knowledgeArticles: "#8B5CF6", // Violet
    faqs: "#EF4444", // Red
    responseTime: "#06B6D4", // Cyan
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://bu-chatbot.onrender.com/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Merge fetched data with a simulated response time metric
        setStats({
          ...res.data,
          responseTime: (Math.random() * (1.5 - 0.2) + 0.2).toFixed(2), // Simulate 0.2s to 1.5s
        });
        setSystemStatus("Operational"); // Confirmed operational upon successful API call
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setSystemStatus("API Error"); // Indicate failure
        // Keep stats at 0 but stop loading indicator
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // Define cards data structure
  const cards = [
    { title: "Total Users", value: stats.users, icon: Users, color: colorMap.users, key: 'users' },
    { title: "Active Admins", value: stats.admins, icon: ShieldCheck, color: colorMap.admins, key: 'admins' },
    { title: "Total Conversations", value: stats.conversations, icon: MessageSquare, color: colorMap.conversations, key: 'conversations' },
    { title: "Knowledge Articles", value: stats.knowledgeArticles, icon: BookOpen, color: colorMap.knowledgeArticles, key: 'articles' },
    { title: "FAQs Count", value: stats.faqs, icon: HelpCircle, color: colorMap.faqs, key: 'faqs' },
    { title: "Avg. Response Time (s)", value: stats.responseTime, icon: Activity, color: colorMap.responseTime, key: 'response' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-4xl font-semibold text-blue-700 border-b-2 pb-2">Admin Dashboard</h1>

      {loading ? (
        <div className="text-center p-10 flex items-center justify-center text-blue-600">
          <Loader className="w-8 h-8 mr-2 animate-spin" /> Loading Stats...
        </div>
      ) : (
        <>
          {/* Section 1: Key Performance Indicators (KPIs) */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">Key Metrics</h2>
            {/* UPDATED: Changed xl:grid-cols-6 to xl:grid-cols-3 to display 3 cards per row on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {cards.map(c => (
                <StatCard 
                  key={c.key} 
                  title={c.title} 
                  value={c.value} 
                  icon={c.icon} 
                  colorClass={c.color} 
                />
              ))}
            </div>
          </section>

          {/* Section 2: System Status and Recent Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* System Health Status */}
            <div className="lg:col-span-1 p-6 bg-white shadow-md rounded-xl space-y-4">
              <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                <Activity className="w-5 h-5" /> System Health
              </h3>
              <div className={`p-4 rounded-lg font-bold text-center ${
                systemStatus === "Operational" 
                  ? "bg-green-100 text-green-700 border-green-300 border" 
                  : "bg-red-100 text-red-700 border-red-300 border"
              }`}>
                Status: {systemStatus}
              </div>
              <p className="text-sm text-gray-500">Last Checked: {new Date().toLocaleTimeString()}</p>
            </div>

            {/* Recent Activity Feed */}
            <div className="lg:col-span-2 p-6 bg-white shadow-md rounded-xl space-y-4">
              <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Recent Activity
              </h3>
              <ul className="divide-y divide-gray-200">
                {recentActivityData.map(activity => (
                  <li key={activity.id} className="py-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium">{activity.user}</span>
                    <span className="text-gray-600 truncate flex-1 mx-4">{activity.action}</span>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}