// src/views/Admin/FaqsView.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button } from "../../components/ui/Button"; // Assuming a robust Button component
import FaqModal from "../../components/FaqModal"; 
import { Edit, Trash2, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'; // Added icons

// --- Simple Toast/Alert Component for professional feedback ---
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
  const [isDeleting, setIsDeleting] = useState(null); // ID of the FAQ currently being deleted

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null); // The FAQ to edit, or null for Add

  // Toast/Alert State
  const [toast, setToast] = useState({ message: '', type: '' });

  const token = localStorage.getItem("token");

  // Function to fetch FAQs (re-usable for initial load and after save/delete)
  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://bu-chatbot.onrender.com/api/admin/faqs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqs(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to retrieve FAQs. Please check the network connection.");
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
  
  // Refreshes data and shows a success toast
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
      await axios.delete(`https://bu-chatbot.onrender.com/api/admin/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out the deleted FAQ from the local state for immediate feedback
      setFaqs(prev => prev.filter(f => f._id !== id));
      setToast({ message: "FAQ deleted successfully.", type: 'success' });
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ message: "Failed to delete FAQ. Check console for details.", type: 'error' });
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
          <p className="text-xl text-blue-600 font-medium">Loading FAQs...</p>
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

    if (faqs.length === 0) {
      return (
        <div className="text-center p-10 bg-white shadow-md rounded-xl border border-dashed border-gray-300">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No FAQs found.</p>
          <p className="text-gray-500 text-sm mt-1">Click **"Add New FAQ"** to create your first item.</p>
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {faqs.map(faq => (
          <li 
            key={faq._id} 
            className="p-5 bg-white shadow-lg rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center transition hover:shadow-xl border border-gray-100 hover:border-blue-300"
          >
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-light text-blue-600 mb-1 uppercase">Question</p>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-sm font-light text-blue-600 mb-1 uppercase">Answer</p>
              <p className="text-gray-700 text-base italic leading-relaxed line-clamp-2">{faq.answer}</p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0 flex-shrink-0">
              <Button 
                onClick={() => handleEditFaq(faq)} 
                className="bg-green-500 hover:bg-green-600 p-2 h-auto text-sm flex items-center font-semibold"
              >
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button 
                onClick={() => handleDeleteFaq(faq._id)} 
                disabled={isDeleting === faq._id}
                className="bg-red-600 hover:bg-red-700 p-2 h-auto text-sm flex items-center font-semibold"
              >
                {isDeleting === faq._id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
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
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b-4 border-blue-500/50">
        <h2 className="text-3xl font-extrabold text-blue-800">📚 FAQs Management</h2>
        <Button 
          onClick={handleAddFaq} 
          className="bg-blue-600 hover:bg-blue-700 transition font-semibold px-4 py-2 shadow-md"
        >
          Add New FAQ
        </Button>
      </div>

      {/* Main Content (List/States) */}
      {renderContent()}

      {/* FaqModal for Add/Edit */}
      <FaqModal
        isOpen={isModalOpen}
        faq={selectedFaq}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRefreshAndToast} // Use the combined handler for save
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