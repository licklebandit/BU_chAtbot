// frontend/src/views/Admin/FeedbackView.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search,
  Download,
  ChevronDown,
  RefreshCw,
  Star,
  BarChart3,
  Filter,
  Calendar,
  Clock,
  User,
  Eye,
  CheckCircle,
  AlertTriangle,
  X,
  Zap,
  MessageCircle,
  ThumbsUpIcon
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

// --- Design Tokens (Matching ConversationsView) ---
const GLASS_CARD = "bg-white/90 backdrop-blur-md border border-[#d6dfff] shadow-lg shadow-[#0033A0]/10 rounded-3xl";
const INPUT_STYLE = "w-full rounded-2xl border border-[#d6dfff] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent transition-all";
const BUTTON_PRIMARY = "bg-[#0033A0] text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-lg shadow-blue-900/20 hover:bg-[#062a7a] transition-all";
const HEADING_COLOR = "text-[#0f2a66]";
const TEXT_MUTED = "text-[#51629b]";

const FeedbackView = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [autoRefresh, setAutoRefresh] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "admissions", label: "Admissions" },
    { value: "fees", label: "Fees & Payments" },
    { value: "academics", label: "Academics" },
    { value: "campus_life", label: "Campus Life" },
    { value: "support", label: "Support" },
    { value: "faculty", label: "Faculty" },
    { value: "scholarships", label: "Scholarships" },
    { value: "other", label: "Other" }
  ];

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [currentPage, filterRating, filterCategory, dateRange]);

  // Auto-refresh every 15 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchFeedback();
      fetchStats();
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          rating: filterRating !== "all" ? filterRating : undefined,
          category: filterCategory !== "all" ? filterCategory : undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          search: searchTerm || undefined
        }
      });
      
      setFeedbackList(response.data.feedbacks || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      if (error.response?.status === 401) {
        showToast("Session expired. Please login again.", "error");
        setTimeout(() => window.location.href = "/login", 2000);
      } else {
        showToast("Error fetching feedback. Please check your connection.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/feedback/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFeedback();
  };

  const toggleFeedback = (id) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const handleRefresh = () => {
    fetchFeedback();
    fetchStats();
    showToast("Feedback refreshed successfully", "success");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(feedbackList, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `feedback-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast("Feedback exported successfully", "success");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResolveFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/feedback/${feedbackId}`, {
        resolved: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeedback();
      showToast("Feedback marked as resolved!", "success");
    } catch (error) {
      console.error("Error resolving feedback:", error);
      showToast("Failed to mark feedback as resolved.", "error");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/feedback/${feedbackId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeedback();
      showToast("Feedback deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      showToast("Failed to delete feedback.", "error");
    }
  };

  const positiveCount = feedbackList.filter(f => f.rating === 'positive').length;
  const negativeCount = feedbackList.filter(f => f.rating === 'negative').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <ThumbsUpIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${HEADING_COLOR} flex-shrink-0`} />
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${HEADING_COLOR} truncate`}>
                User Feedback
              </h2>
              {feedbackList.length > 0 && (
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                  {feedbackList.length} total
                </span>
              )}
              {autoRefresh && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">Live</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#51629b] line-clamp-2">
              Review and analyze user feedback to improve the chatbot experience
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

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title="Export Feedback"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0033A0] text-white hover:bg-[#062a7a] transition shadow-lg shadow-[#0033A0]/30 disabled:opacity-50"
              title="Refresh Now"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 sm:mt-6 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search feedback by question, answer, or comment..."
            className={`pl-11 ${INPUT_STYLE}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          />
        </div>

        {/* Filters Row */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Rating Filter */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <Filter className={`w-4 h-4 ${TEXT_MUTED} flex-shrink-0`} />
            <select
              className="rounded-xl border border-[#d6dfff] bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0] flex-1 sm:flex-initial"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            className="flex-1 rounded-xl border border-[#d6dfff] bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex gap-2 flex-1">
            <input
              type="date"
              className="flex-1 rounded-xl border border-[#d6dfff] bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              placeholder="Start Date"
            />
            <input
              type="date"
              className="flex-1 rounded-xl border border-[#d6dfff] bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              placeholder="End Date"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className={`${BUTTON_PRIMARY} flex items-center justify-center gap-2`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
            <span className={`${TEXT_MUTED} truncate`}>
              Total: <span className="font-semibold">{feedbackList.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
            <span className={`${TEXT_MUTED} truncate`}>
              Positive: <span className="font-semibold text-green-600">{positiveCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
            <span className={`${TEXT_MUTED} truncate`}>
              Negative: <span className="font-semibold text-red-600">{negativeCount}</span>
            </span>
          </div>
          {stats?.satisfactionRate && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></div>
              <span className={`${TEXT_MUTED} truncate`}>
                Satisfaction: <span className="font-semibold text-purple-600">{stats.satisfactionRate}%</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards - Updated Design */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#51629b]">Total Feedback</p>
                <p className="text-xl sm:text-2xl font-bold text-[#0f2a66]">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#51629b]">Positive</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.positive}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <ThumbsUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#51629b]">Negative</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.negative}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                <ThumbsDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#51629b]">Satisfaction Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {stats.satisfactionRate}%
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className={`${GLASS_CARD} overflow-hidden`}>
        <div className="p-4 sm:p-6 border-b border-[#d6dfff] bg-gradient-to-r from-[#eff4ff] to-white">
          <div className="flex justify-between items-center">
            <h3 className={`text-lg sm:text-xl font-bold ${HEADING_COLOR}`}>
              Feedback List ({feedbackList.length})
            </h3>
            <div className="text-sm text-[#51629b]">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0033A0] mb-3" />
            <p className={`text-base sm:text-lg font-medium ${HEADING_COLOR}`}>
              Loading feedback...
            </p>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-slate-300" />
            <p className={`text-base sm:text-lg font-medium ${HEADING_COLOR} mb-2`}>
              No feedback found
            </p>
            <p className={`text-sm ${TEXT_MUTED}`}>
              {searchTerm || filterRating !== "all" || filterCategory !== "all" || dateRange.start || dateRange.end
                ? "No feedback matches your filters"
                : "User feedback will appear here once submitted"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Rating
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Question
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Category
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      User
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#51629b]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {feedbackList.map((feedback) => {
                    const formattedDate = formatDate(feedback.createdAt);
                    return (
                      <React.Fragment key={feedback._id}>
                        <tr className="hover:bg-[#f8fafc] transition-colors group">
                          <td className="px-4 lg:px-6 py-4">
                            {feedback.rating === 'positive' ? (
                              <div className="flex items-center">
                                <div className="p-2 rounded-xl bg-green-100">
                                  <ThumbsUp className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="ml-2 text-sm font-medium text-green-600">Positive</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="p-2 rounded-xl bg-red-100">
                                  <ThumbsDown className="h-4 w-4 text-red-600" />
                                </div>
                                <span className="ml-2 text-sm font-medium text-red-600">Negative</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-slate-600 max-w-md">
                            <div className="line-clamp-2">
                              {feedback.question}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              feedback.category === 'admissions' ? 'bg-blue-100 text-blue-800' :
                              feedback.category === 'fees' ? 'bg-yellow-100 text-yellow-800' :
                              feedback.category === 'academics' ? 'bg-purple-100 text-purple-800' :
                              feedback.category === 'campus_life' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {feedback.category.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-slate-600" />
                              </div>
                              <div className="min-w-0">
                                <span className={`block font-medium ${HEADING_COLOR} truncate`}>
                                  {feedback.userId?.name || 'Anonymous'}
                                </span>
                                {feedback.userId?.email && (
                                  <p className="text-xs text-slate-500 truncate">
                                    {feedback.userId.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-slate-500">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {formattedDate.date}
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Clock className="w-3 h-3" />
                                {formattedDate.time}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => toggleFeedback(feedback._id)}
                                className="p-2 rounded-xl bg-[#eff4ff] text-[#0033A0] hover:bg-[#dbeafe] transition"
                                title={expandedFeedback === feedback._id ? "Hide Details" : "View Details"}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!feedback.resolved && (
                                <button
                                  onClick={() => handleResolveFeedback(feedback._id)}
                                  className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition"
                                  title="Mark as Resolved"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteFeedback(feedback._id)}
                                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                                title="Delete Feedback"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {expandedFeedback === feedback._id && (
                          <tr>
                            <td colSpan="6" className="px-4 lg:px-6 py-4 bg-slate-50/50">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-slate-700 mb-2">Full Question:</h4>
                                  <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                                    {feedback.question}
                                  </p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-slate-700 mb-2">Chatbot Answer:</h4>
                                  <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                                    {feedback.answer}
                                  </p>
                                </div>
                                
                                {feedback.comment && (
                                  <div>
                                    <h4 className="text-sm font-medium text-slate-700 mb-2">User Comment:</h4>
                                    <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                                      {feedback.comment}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                  <div className="text-xs text-slate-500">
                                    Feedback ID: {feedback._id}
                                  </div>
                                  <div className="flex gap-2">
                                    {!feedback.resolved && (
                                      <button 
                                        onClick={() => handleResolveFeedback(feedback._id)}
                                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                      >
                                        Mark Resolved
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteFeedback(feedback._id)}
                                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[#f1f5f9]">
              {feedbackList.map((feedback) => {
                const formattedDate = formatDate(feedback.createdAt);
                return (
                  <div key={feedback._id} className="p-4 hover:bg-[#f8fafc] transition-colors">
                    {/* Feedback Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {feedback.rating === 'positive' ? (
                          <div className="p-2 rounded-xl bg-green-100 flex-shrink-0">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-red-100 flex-shrink-0">
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-semibold ${HEADING_COLOR} truncate`}>
                              {feedback.userId?.name || 'Anonymous'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              feedback.rating === 'positive' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {feedback.rating === 'positive' ? 'Positive' : 'Negative'}
                            </span>
                          </div>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                            feedback.category === 'admissions' ? 'bg-blue-100 text-blue-800' :
                            feedback.category === 'fees' ? 'bg-yellow-100 text-yellow-800' :
                            feedback.category === 'academics' ? 'bg-purple-100 text-purple-800' :
                            feedback.category === 'campus_life' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {feedback.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFeedback(feedback._id)}
                        className="p-2 rounded-xl bg-[#eff4ff] text-[#0033A0] hover:bg-[#dbeafe] transition flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Preview */}
                    <div className="mb-3">
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {feedback.question}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formattedDate.time}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {expandedFeedback === feedback._id ? (
                      <div className="space-y-4 mt-3 pt-3 border-t border-slate-200">
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Question:</h4>
                          <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 text-sm">
                            {feedback.question}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Answer:</h4>
                          <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 text-sm">
                            {feedback.answer}
                          </p>
                        </div>
                        
                        {feedback.comment && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Comment:</h4>
                            <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 text-sm">
                              {feedback.comment}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => toggleFeedback(feedback._id)}
                            className="text-sm text-[#0033A0] hover:underline"
                          >
                            Hide Details
                          </button>
                          <div className="flex gap-2">
                            {!feedback.resolved && (
                              <button 
                                onClick={() => handleResolveFeedback(feedback._id)}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                              >
                                Resolve
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteFeedback(feedback._id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {!feedback.resolved && (
                          <button
                            onClick={() => handleResolveFeedback(feedback._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFeedback(feedback._id)}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-[#d6dfff]">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-slate-300 rounded-xl text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-xl ${
                        currentPage === pageNum
                          ? 'bg-[#0033A0] text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-slate-300 rounded-xl text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className={`p-4 sm:p-6 ${GLASS_CARD}`}>
          <h3 className={`text-lg sm:text-xl font-bold ${HEADING_COLOR} mb-4`}>Feedback by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.categoryBreakdown.slice(0, 8).map((category) => (
              <div key={category._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700 truncate mr-2">
                  {category._id || 'Uncategorized'}
                </span>
                <span className="text-lg font-bold text-[#0f2a66]">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl flex items-center gap-3 z-[60] transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">{toast.message}</span>
          <button
            onClick={() => setToast({ message: "", type: "" })}
            className="ml-2 p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackView;