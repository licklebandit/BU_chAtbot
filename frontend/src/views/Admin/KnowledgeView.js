// src/views/Admin/KnowledgeView.js

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button } from "../../components/ui/Button"; // Assuming this path is correct
import KnowledgeModal from "../../components/KnowledgeModal"; 
import KnowledgeList from "../../components/KnowledgeList"; 
import { Loader2, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react'; 

// --- Simple Toast/Alert Component ---
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
  const [isDeleting, setIsDeleting] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(''); 

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null); 

  // Toast/Alert State
  const [toast, setToast] = useState({ message: '', type: '' });

  const token = localStorage.getItem("token");

  // API URL: CORRECTED to match the backend route /knowledge
  const API_BASE = "https://bu-chatbot.onrender.com/api/admin/knowledge";

  // Function to fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      // Display a more specific error if available from Axios
      setError(`Failed to retrieve knowledge articles. (Error: ${err.response?.status || err.code})`);
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

  const handleEditArticle = (item) => {
    // Map the keyword/answer fields from the list component back to title/content for the modal
    const articleForModal = {
      _id: item._id,
      title: item.keyword || item.title, 
      content: item.answer || item.content, 
      lastUpdated: item.lastUpdated,
    };
    setSelectedArticle(articleForModal);
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
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setArticles(prev => prev.filter(a => a._id !== id));
      setToast({ message: "Article deleted successfully.", type: 'success' });
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ message: `Failed to delete article. (Error: ${err.response?.status || err.code})`, type: 'error' });
    } finally {
      setIsDeleting(null);
    }
  };

  // Map the articles (title/content) to the format KnowledgeList expects (keyword/answer)
  const mappedArticles = articles.map(article => ({
    _id: article._id,
    // If your backend is sending title/content, map them to keyword/answer
    keyword: article.title || article.question, 
    answer: article.content || article.answer,
    lastUpdated: article.updatedAt, 
  }));

  // --- Render Logic ---
  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xl text-red-600 font-semibold mb-2">API Error</p>
          <p className="text-red-500">{error}</p>
          <p className="text-red-500 mt-2 text-sm">Please check your backend logs and CORS configuration.</p>
        </div>
      );
    }
    
    return (
      <KnowledgeList
        items={mappedArticles}
        onEdit={handleEditArticle}
        onDelete={handleDelete}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={loading || isDeleting !== null}
      />
    );
  };
  // --- End Render Logic ---


  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b-4 border-blue-500/50">
        <h2 className="text-3xl font-extrabold text-blue-800 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600"/> 🧠 Knowledge Base Management
        </h2>
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
        onSave={handleRefreshAndToast} 
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