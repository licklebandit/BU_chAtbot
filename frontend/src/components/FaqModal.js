// src/components/FaqModal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ✅ FIX: Added Loader2 to the import list
import { X, Save, Loader2 } from 'lucide-react'; 
import { ADMIN_API_URL } from "../config/api"; // Assumed to be /api/admin

/**
 * FaqModal Component (Handles Add/Edit form logic)
 */
export default function FaqModal({ isOpen, faq, onClose, onSave }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const isEdit = !!faq;

  useEffect(() => {
    if (isOpen) {
      setQuestion(faq ? faq.question : '');
      setAnswer(faq ? faq.answer : '');
      setError(null);
    }
  }, [isOpen, faq]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question || !answer) {
      setError("Question and Answer cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = { question, answer };
    
    // CORRECT PATH: Uses /faqs for POST and /faqs/:id for PUT
    const url = `${ADMIN_API_URL}/faqs${isEdit ? '/' + faq._id : ''}`;
    const method = isEdit ? 'put' : 'post'; 

    try {
      await axios({
        method,
        url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      onSave(); // Trigger refresh in parent
      onClose(); // Close modal
    } catch (err) {
      console.error("Failed to save FAQ:", err);
      setError(`Failed to ${isEdit ? 'update' : 'create'} FAQ. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-overlay') onClose();
  };

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white w-full max-w-xl rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Edit FAQ' : 'Add New FAQ'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="answer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows="5"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {isEdit ? 'Update FAQ' : 'Save FAQ'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}