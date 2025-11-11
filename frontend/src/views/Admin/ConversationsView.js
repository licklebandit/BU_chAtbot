// src/views/Admin/ConversationsView.js (Full, Corrected Code)

import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Button } from "../../components/ui/Button";
import ConversationModal from "../../components/ConversationModal";
import { Search, Calendar, Loader, ChevronLeft, ChevronRight, MessageCircle, ListOrdered, AlertTriangle } from "lucide-react";
// 💡 IMPORTANT: Import the centralized API URL
import { API_BASE_URL } from "../../config/api"; 

const ITEMS_PER_PAGE = 10;

// Helper to format timestamps
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ConversationsView() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  // Filtering and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIX 1: Use dynamic API_BASE_URL
      // The endpoint is /api/conversations (due to backend router.get('/'))
      const res = await axios.get(`${API_BASE_URL}/conversations`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // ✅ FIX 2: Correctly enhance data using the now-available 'messages' array
      const data = Array.isArray(res.data) 
        ? res.data.map(c => {
          const messageCount = c.messages ? c.messages.length : 0;
          const lastMessage = messageCount > 0 ? c.messages[messageCount - 1].content : "No messages yet";
          
          return {
            ...c,
            // Assign computed values
            lastMessage: lastMessage,
            messageCount: messageCount,
            user: c.user_name || c.userId || "Anonymous User", // Prioritize user_name
            // Simulate status based on unread status or message count
            status: c.isUnread ? 'New' : (messageCount > 1 ? 'Open' : 'Closed'), 
          };
        })
        : [];

      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      // Improved error message
      const errorMessage = err.code === "ERR_NETWORK" 
        ? "Network Error: Could not connect to the backend server (local or deployed). Check if the server is running on port 8000."
        : "Failed to load conversations. Ensure your token is valid and the backend route is correct.";
      setError(errorMessage);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch data on component mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Client-side filtering and pagination logic (UNMODIFIED)
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(c =>
      (c.user && c.user.toLowerCase().includes(query)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const totalPages = Math.ceil(filteredConversations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentConversations = filteredConversations.slice(startIndex, endIndex);

  const openConversation = (conv) => {
    setSelectedConversation(conv);
    setModalOpen(true);
  };
  
  // Navigation handlers (UNMODIFIED)
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-2">Conversation History</h1>

      {/* Toolbar: Search and Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or message content..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>
        <Button 
          onClick={fetchConversations} // Use the correct fetch function
          className="bg-blue-600 hover:bg-blue-700 transition"
        >
          Export Data
        </Button>
      </div>

      {/* Content Area: Loading, Error, or Table (UNMODIFIED) */}
      {loading ? (
        <div className="text-center p-20 flex items-center justify-center text-blue-600">
          <Loader className="w-8 h-8 mr-2 animate-spin" /> Loading Conversations...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
        </div>
      ) : currentConversations.length === 0 && searchQuery ? (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-center">No conversations match your search query.</div>
      ) : conversations.length === 0 ? (
        <div className="p-4 bg-gray-100 text-gray-500 rounded-lg text-center">No conversation data found.</div>
      ) : (
        <>
          {/* Table for Conversations (UNMODIFIED) */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User / ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <MessageCircle className="w-4 h-4 inline mr-1" /> Last Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <ListOrdered className="w-4 h-4 inline mr-1" /> Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    <Calendar className="w-4 h-4 inline mr-1" /> Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-3"></th> {/* Action column */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentConversations.map(c => (
                  <tr key={c._id} className="hover:bg-blue-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                      {c.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate">
                      {c.lastMessage.substring(0, 70)}{c.lastMessage.length > 70 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {c.messageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        c.status === 'Open' ? 'bg-green-100 text-green-800' : (c.status === 'New' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800')
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button onClick={() => openConversation(c)} className="bg-blue-500 hover:bg-blue-600 text-xs">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (UNMODIFIED) */}
          <div className="flex justify-between items-center mt-4 p-4 bg-white rounded-lg shadow-md">
            <div className="text-sm text-gray-600">
              Showing {Math.min(endIndex, filteredConversations.length)} of {filteredConversations.length} conversations
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={goToPrevPage} 
                disabled={currentPage === 1}
                className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-sm font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {selectedConversation && (
        <ConversationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          conversation={selectedConversation}
        />
      )}
    </div>
  );
}