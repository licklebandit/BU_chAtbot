// src/views/Admin/FaqsView.js (Improved Question/Answer Display)

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button } from "../../components/ui/Button"; 
import FaqModal from "../../components/FaqModal"; 
import { Edit, Trash2, Loader2, CheckCircle, AlertTriangle, MessageSquare, BookOpen, HelpCircle } from 'lucide-react'; 
import { ADMIN_API_URL } from "../../config/api"; 


// --- Simple Toast/Alert Component (Unchanged) ---
const Toast = ({ message, type, onClose }) => {
  const baseClasses = "fixed bottom-3 right-3 p-4 rounded-lg shadow-xl text-white flex items-center gap-2 z-[60] transition-opacity duration-300";
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
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

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


export default function FaqsView() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); 

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null); 

  // Toast/Alert State
  const [toast, setToast] = useState({ message: '', type: '' });

  const token = localStorage.getItem("token");

  // Function to fetch FAQs
  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${ADMIN_API_URL}/faqs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqs(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      
      const errorMessage = err.response && err.response.status === 404
        ? "404 Error: FAQ list API route not found. Please check your backend adminRouter.js."
        : err.code === "ERR_NETWORK"
        ? "Network Error: Could not connect to the backend server."
        : "Failed to retrieve FAQs. Check the console for details.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Handlers
  const handleAddFaq = () => {
    setSelectedFaq(null);
    setIsModalOpen(true);
  };

  const handleEditFaq = (faq) => {
    setSelectedFaq(faq);
    setIsModalOpen(true);
  };
  
  const handleRefreshAndToast = () => {
    fetchFaqs();
    setToast({ message: 'FAQ successfully saved!', type: 'success' });
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Confirm deletion: Are you absolutely sure you want to delete this FAQ? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(id);
    try {
      await axios.delete(`${ADMIN_API_URL}/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFaqs(prev => prev.filter(f => f._id !== id));
      setToast({ message: "FAQ deleted successfully.", type: 'success' });
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ message: "Failed to delete FAQ. Check console for details.", type: 'error' });
    } finally {
      setIsDeleting(null);
    }
  };

  // --- Render Logic (Medium, Downwards Listing, with Clear Q/A separation) ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-10 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xl text-blue-600 font-medium">Loading FAQs...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xl text-red-600 font-semibold mb-2">Connection Error</p>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (faqs.length === 0) {
      return (
        <div className="text-center p-10 bg-white shadow-md rounded-xl border border-dashed border-gray-300">
          <HelpCircle className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium text-lg">No FAQs Found</p>
          <p className="text-gray-500 text-sm mt-1">Click **"Add New FAQ"** to create your first item.</p>
        </div>
      );
    }

    return (
      <ul className="space-y-4 max-w-3xl mx-auto"> 
        {faqs.map(faq => (
          <li 
            key={faq._id} 
            className="p-4 bg-white shadow-lg rounded-xl flex flex-col transition hover:shadow-xl border border-gray-100 hover:border-indigo-400"
          >
            
            {/* 1. Question Section */}
            <div className="mb-3 pb-3 border-b border-gray-200">
                <span className="font-semibold text-blue-600 text-xs uppercase block mb-1 flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" /> QUESTION:
                </span>
                <p className="text-sm font-bold text-gray-900 leading-snug">
                    {faq.question}
                </p>
            </div>

            {/* 2. Answer Section */}
            <div className="flex-1 mb-4 text-xs text-gray-700 leading-relaxed min-h-[40px]">
                <span className="font-semibold text-indigo-600 text-xs uppercase block mb-1 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" /> ANSWER:
                </span>
                {/* line-clamp-2 keeps the height small and consistent */}
                <p className="line-clamp-2"> 
                    {faq.answer}
                </p>
            </div>
            
            {/* 3. Actions Footer (Unchanged) */}
            <div className="flex space-x-2 pt-3 border-t border-gray-100 mt-auto justify-end">
              <Button 
                onClick={() => handleEditFaq(faq)} 
                className="bg-green-500 hover:bg-green-600 p-2 h-auto text-xs flex items-center font-semibold"
              >
                <Edit className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button 
                onClick={() => handleDeleteFaq(faq._id)} 
                disabled={isDeleting === faq._id}
                className="bg-red-600 hover:bg-red-700 p-2 h-auto text-xs flex items-center font-semibold"
              >
                {isDeleting === faq._id ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3 mr-1" />
                )}
                {isDeleting === faq._id ? 'Deleting...' : 'Delete'}
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
      {/* Header Section (Unchanged) */}
      <div className="flex justify-between items-center pb-4 border-b-4 border-indigo-500/50">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-600"/> 
            FAQs Management
        </h2>
        <Button 
          onClick={handleAddFaq} 
          className="bg-indigo-600 hover:bg-indigo-700 transition font-semibold px-4 py-2 shadow-md"
        >
          <MessageSquare className="w-4 h-4 mr-2"/> Add New FAQ
        </Button>
      </div>

      {/* Main Content (List/States) */}
      {renderContent()}

      {/* FaqModal for Add/Edit (Unchanged) */}
      <FaqModal
        isOpen={isModalOpen}
        faq={selectedFaq}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRefreshAndToast} 
      />

      {/* Toast Feedback (Unchanged) */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </div>
  );
}