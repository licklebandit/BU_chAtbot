// src/components/KnowledgeModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Loader2 } from 'lucide-react';

/**
 * KnowledgeModal Component (Handles Add/Edit form logic for articles)
 * Props:
 * - isOpen: Boolean → controls modal visibility
 * - article: Object|null → current article being edited (null for Add)
 * - onClose: Function → closes modal
 * - onSave: Function → refreshes parent list and shows toast after successful save
 */
export default function KnowledgeModal({ isOpen, article, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const isEdit = !!article;

  useEffect(() => {
    if (isOpen) {
      setTitle(article ? article.title : '');
      setContent(article ? article.content : '');
      setError(null);
    }
  }, [isOpen, article]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError("Title and Content cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = { title, content };
    const url = `https://bu-chatbot.onrender.com/api/admin/knowledge${isEdit ? '/' + article._id : ''}`;
    const method = isEdit ? 'put' : 'post';

    try {
      await axios({
        method,
        url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      onSave(); // Trigger parent refresh and toast
      onClose();
    } catch (err) {
      console.error("Failed to save article:", err);
      setError(`Failed to ${isEdit ? 'update' : 'create'} article. Please try again.`);
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
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Edit Article' : 'Add New Article'}
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="8"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y"
              required
            ></textarea>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 text-white font-semibold rounded-lg transition shadow-md ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {isEdit ? 'Update Article' : 'Save Article'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}