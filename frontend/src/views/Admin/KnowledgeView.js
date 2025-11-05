// src/views/Admin/KnowledgeView.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button } from "../../components/ui/Button";
import KnowledgeModal from "../../components/KnowledgeModal"; // New modal for add/edit
import { Edit, Trash2, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

// --- Simple Toast/Alert Component (Copied from FaqsView for consistency) ---
const Toast = ({ message, type, onClose }) => {
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white flex items-center gap-2 z-[60] transition-opacity duration-300";
  let colorClasses = "";
  let Icon = AlertTriangle;

  if (type === 'success') {
    colorClasses = "bg-green-600";
    Icon = CheckCircle;
  } else if (type === 'error') {
    colorClasses = "bg-red-600";
    Icon = AlertTriangle;
  }

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};
// -----------------------------------------------------------------


export default function KnowledgeView() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); // ID of the article currently being deleted

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null); // Article to edit, or null for Add

  // Toast/Alert State
  const [toast, setToast] = useState({ message: '', type: '' });

  const token = localStorage.getItem("token");

  // Function to fetch articles (re-usable for initial load and after save/delete)
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://bu-chatbot.onrender.com/api/admin/knowledge", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to retrieve knowledge articles. Please check the network connection.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Handlers for Add/Edit
  const handleAddArticle = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };
  
  // Refreshes data and shows a success toast
  const handleRefreshAndToast = () => {
    fetchArticles();
    setToast({ message: 'Article successfully saved!', type: 'success' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion: Are you absolutely sure you want to delete this knowledge article?")) return;

    setIsDeleting(id);
    try {
      await axios.delete(`https://bu-chatbot.onrender.com/api/admin/knowledge/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out the deleted article from the local state for immediate feedback
      setArticles(prev => prev.filter(a => a._id !== id));
      setToast({ message: "Article deleted successfully.", type: 'success' });
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ message: "Failed to delete article. Check console for details.", type: 'error' });
    } finally {
      setIsDeleting(null);
    }
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-10 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xl text-blue-600 font-medium">Loading Knowledge Base...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xl text-red-600 font-semibold mb-2">Error</p>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="text-center p-10 bg-white shadow-md rounded-xl border border-dashed border-gray-300">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">The Knowledge Base is empty.</p>
          <p className="text-gray-500 text-sm mt-1">Click **"Add Article"** to begin training the chatbot.</p>
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {articles.map(article => (
          <li 
            key={article._id} 
            className="p-5 bg-white shadow-lg rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center transition hover:shadow-xl border border-gray-100 hover:border-blue-300"
          >
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-light text-blue-600 mb-1 uppercase">Title</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
              <p className="text-sm font-light text-blue-600 mb-1 uppercase">Content Preview</p>
              {/* Use line-clamp for content summary */}
              <p className="text-gray-700 text-base leading-relaxed line-clamp-3">{article.content}</p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0 flex-shrink-0">
              <Button 
                onClick={() => handleEditArticle(article)} 
                className="bg-green-500 hover:bg-green-600 p-2 h-auto text-sm flex items-center font-semibold"
              >
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button 
                onClick={() => handleDelete(article._id)} 
                disabled={isDeleting === article._id}
                className="bg-red-600 hover:bg-red-700 p-2 h-auto text-sm flex items-center font-semibold"
              >
                {isDeleting === article._id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                {isDeleting === article._id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  };
  // --- End Render Logic ---


  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b-4 border-blue-500/50">
        <h2 className="text-3xl font-extrabold text-blue-800">🧠 Knowledge Base Management</h2>
        <Button 
          onClick={handleAddArticle} 
          className="bg-blue-600 hover:bg-blue-700 transition font-semibold px-4 py-2 shadow-md"
        >
          Add Article
        </Button>
      </div>

      {/* Main Content (List/States) */}
      {renderContent()}

      {/* Knowledge Modal for Add/Edit */}
      <KnowledgeModal
        isOpen={isModalOpen}
        article={selectedArticle}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRefreshAndToast} // Refresh the list when an article is saved/updated
      />

      {/* Toast Feedback */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </div>
  );
}