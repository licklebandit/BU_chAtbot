// src/components/AdminModal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Loader2 } from 'lucide-react';

export default function AdminModal({ isOpen, admin, onClose, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const isEdit = !!admin;
  const API_BASE = "https://bu-chatbot.onrender.com/api/admin/users"; // Corrected base URL

  useEffect(() => {
    if (isOpen) {
      // FIX: Map the admin's 'username' field (from the model) to the local 'name' state
      setName(admin ? (admin.username || admin.name) : '');
      setEmail(admin ? admin.email : '');
      setPassword(''); 
      setError(null);
    }
  }, [isOpen, admin]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || (!isEdit && !password)) {
      setError("Name, Email, and Password (for new admins) are required.");
      return;
    }

    setLoading(true);
    setError(null);

    // FIX: Use 'username' to match your backend model's field
    const payload = { username: name, email, role: 'admin' }; 
    if (password) {
      payload.password = password;
    }

    // FIX: Corrected URL to use the /users endpoint
    const url = `${API_BASE}${isEdit ? '/' + admin._id : ''}`;
    const method = isEdit ? 'put' : 'post';

    try {
      await axios({
        method,
        url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save admin:", err);
      setError(`Failed to ${isEdit ? 'update' : 'create'} admin. Status: ${err.response?.status || 'N/A'}.`);
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
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Edit Admin' : 'Add New Admin'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            <p className="text-xs text-gray-500 mt-1">This will be stored as the 'username' in the database.</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password {isEdit ? '(Leave blank to keep current)' : ''}
            </label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEdit}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button type="submit" disabled={loading} className={`flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition shadow-md ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) : (
                <><Save className="w-4 h-4" /> {isEdit ? 'Update Admin' : 'Save Admin'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}