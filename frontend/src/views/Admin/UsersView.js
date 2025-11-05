// src/views/Admin/UsersView.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button } from "../../components/ui/Button";
import UserModal from "../../components/UserModal"; 
import { Edit, Trash2, Loader2, CheckCircle, AlertTriangle, User } from 'lucide-react';

// --- Simple Toast/Alert Component (Consistency) ---
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
// ---------------------------------------------------


export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); // ID of the user currently being deleted

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 

  // Toast/Alert State
  const [toast, setToast] = useState({ message: '', type: '' });

  const token = localStorage.getItem("token");

  // Function to fetch users (re-usable for initial load and after save/delete)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://bu-chatbot.onrender.com/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to retrieve users. Please check the network connection.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers for Add/Edit
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  // Refreshes data and shows a success toast
  const handleRefreshAndToast = () => {
    fetchUsers();
    setToast({ message: 'User successfully saved!', type: 'success' });
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Confirm deletion: Are you absolutely sure you want to delete this user?")) return;

    setIsDeleting(id);
    try {
      await axios.delete(`https://bu-chatbot.onrender.com/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out the deleted user from the local state for immediate feedback
      setUsers(prev => prev.filter(u => u._id !== id));
      setToast({ message: "User deleted successfully.", type: 'success' });
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ message: "Failed to delete user. Check console for details.", type: 'error' });
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
          <p className="text-xl text-blue-600 font-medium">Loading Users...</p>
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
    
    return (
      <table className="w-full text-left border-collapse bg-white shadow-xl rounded-xl overflow-hidden">
        <thead className="text-white bg-blue-700">
          <tr>
            <th className="py-3 px-4 font-semibold text-sm uppercase">Name</th>
            <th className="py-3 px-4 font-semibold text-sm uppercase">Email</th>
            <th className="py-3 px-4 font-semibold text-sm uppercase">Role</th>
            <th className="py-3 px-4 font-semibold text-sm uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length ? users.map(u => (
            <tr key={u._id} className="border-b border-gray-100 hover:bg-blue-50 transition duration-150">
              <td className="py-3 px-4 text-gray-800 font-medium">{u.name}</td>
              <td className="py-3 px-4 text-gray-600">{u.email}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                  {u.role.toUpperCase()}
                </span>
              </td>
              <td className="py-3 px-4 flex justify-end gap-2">
                <Button 
                  onClick={() => handleEditUser(u)}
                  className="bg-green-500 hover:bg-green-600 p-2 h-auto text-sm flex items-center font-semibold"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => handleDeleteUser(u._id)}
                  disabled={isDeleting === u._id}
                  className="bg-red-600 hover:bg-red-700 p-2 h-auto text-sm flex items-center font-semibold"
                >
                  {isDeleting === u._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500 bg-gray-50">
                <AlertTriangle className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                No users found. Click **"Add User"** to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };
  // --- End Render Logic ---

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b-4 border-blue-500/50">
        <h2 className="text-3xl font-extrabold text-blue-800">👥 User Management</h2>
        <Button 
          onClick={handleAddUser} 
          className="bg-blue-600 hover:bg-blue-700 transition font-semibold px-4 py-2 shadow-md"
        >
          <User className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {/* Main Content (List/States) */}
      {renderContent()}

      {/* User Modal for Add/Edit */}
      <UserModal
        isOpen={isModalOpen}
        user={selectedUser}
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