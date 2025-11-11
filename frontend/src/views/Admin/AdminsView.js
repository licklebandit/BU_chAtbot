// src/views/Admin/AdminsView.js

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_URL } from "../../config/api"; // Assuming this points to /api/admin
import { Button } from "../../components/ui/Button";
import AdminModal from "../../components/AdminModal"; 
import { Edit, Trash2, Loader2, CheckCircle, AlertTriangle, UserCog } from 'lucide-react';

// --- Simple Toast/Alert Component (UNMODIFIED) ---
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
// -----------------------------------------------------------------------------------


export default function AdminsView() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); 

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null); 

  // Toast/Alert State
  const [toast, setToast] = useState({ message: '', type: '' });

  const token = localStorage.getItem("token");

  // Function to fetch admins
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX 1: Change API endpoint to /users (which now fetches all users/admins on backend)
      const res = await axios.get(`${ADMIN_API_URL}/users`,{
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // FIX 2: Filter the fetched users to only display those with the 'admin' role
      const adminUsers = res.data.filter(user => user.role === 'admin');
      setAdmins(adminUsers || []);
      
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.code === "ERR_NETWORK"
      ? "Network Error: Cannot reach the server. Ensure the backend is running on port 8000 locally or is deployed."
      : "Failed to retrieve administrators. Ensure you have the correct permissions.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Handlers for Add/Edit
  const handleAddAdmin = () => {
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };
  
  // Refreshes data and shows a success toast
  const handleRefreshAndToast = () => {
    fetchAdmins();
    setToast({ message: 'Administrator successfully saved!', type: 'success' });
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Confirm deletion: Are you sure you want to remove this administrator?")) return;

    setIsDeleting(id);
    try {
      // API endpoint is correct for DELETE /users/:id
      await axios.delete(`${ADMIN_API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdmins(prev => prev.filter(a => a._id !== id));
      setToast({ message: "Administrator deleted successfully.", type: 'success' });
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ message: "Failed to delete administrator. Check console for details.", type: 'error' });
    } finally {
      setIsDeleting(null);
    }
  };

  // --- Render Logic (Minor update to list item fields) ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-10 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xl text-blue-600 font-medium">Loading Administrators...</p>
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

    if (admins.length === 0) {
      return (
        <div className="text-center p-10 bg-white shadow-md rounded-xl border border-dashed border-gray-300">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No administrators found.</p>
          <p className="text-gray-500 text-sm mt-1">Click **"Add Admin"** to create a new administrator account.</p>
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {admins.map(admin => (
          <li 
            key={admin._id} 
            className="p-5 bg-white shadow-lg rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center transition hover:shadow-xl border border-gray-100 hover:border-blue-300"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center space-x-3">
                <UserCog className="w-5 h-5 text-blue-600"/>
                {/* NOTE: Your backend model field for name is likely 'username', not 'name' */}
                <h3 className="text-lg font-bold text-gray-900">{admin.username || admin.name}</h3>
              </div>
              <p className="text-gray-600 text-sm mt-1 ml-8">{admin.email}</p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0 flex-shrink-0">
              <Button 
                onClick={() => handleEditAdmin(admin)} 
                className="bg-green-500 hover:bg-green-600 p-2 h-auto text-sm flex items-center font-semibold"
              >
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button 
                onClick={() => handleDeleteAdmin(admin._id)} 
                disabled={isDeleting === admin._id}
                className="bg-red-600 hover:bg-red-700 p-2 h-auto text-sm flex items-center font-semibold"
              >
                {isDeleting === admin._id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                {isDeleting === admin._id ? 'Deleting...' : 'Delete'}
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
        <h2 className="text-3xl font-extrabold text-blue-800">🛠️ Admin Management</h2>
        <Button 
          onClick={handleAddAdmin} 
          className="bg-blue-600 hover:bg-blue-700 transition font-semibold px-4 py-2 shadow-md"
        >
          <UserCog className="w-4 h-4 mr-1" /> Add Admin
        </Button>
      </div>

      {/* Main Content (List/States) */}
      {renderContent()}

      {/* Admin Modal for Add/Edit */}
      <AdminModal
        isOpen={isModalOpen}
        admin={selectedAdmin}
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