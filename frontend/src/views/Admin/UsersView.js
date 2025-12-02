import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button } from "../../components/ui/Button";
import UserModal from "../../components/UserModal";
import { Edit, Trash2, Loader2, CheckCircle, AlertTriangle, User, RefreshCw } from 'lucide-react';
import { ADMIN_API_URL } from "../../config/api";

const Toast = ({ message, type, onClose }) => {
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white flex items-center gap-2 z-[60] transition-opacity duration-300";
  let colorClasses = "", Icon = AlertTriangle;

  if (type === 'success') { colorClasses = "bg-green-600"; Icon = CheckCircle; }
  if (type === 'error') { colorClasses = "bg-red-600"; Icon = AlertTriangle; }

  useEffect(() => { if (!message) return; const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [message, onClose]);
  if (!message) return null;

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <Icon className="w-5 h-5" /> <span>{message}</span>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [lastFetched, setLastFetched] = useState(null);
  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${ADMIN_API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data || []);
      setLastFetched(new Date());
    } catch (err) { console.error(err); setError("Failed to load users."); } 
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAddUser = () => { setSelectedUser(null); setIsModalOpen(true); };
  const handleEditUser = (user) => { setSelectedUser(user); setIsModalOpen(true); };
  const handleRefreshAndToast = () => { fetchUsers(); setToast({ message: 'User saved successfully!', type: 'success' }); };
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Confirm deletion?")) return;
    setIsDeleting(id);
    try { await axios.delete(`${ADMIN_API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.filter(u => u._id !== id));
      setToast({ message: "User deleted successfully.", type: 'success' });
    } catch { setToast({ message: "Failed to delete user.", type: 'error' }); } 
    finally { setIsDeleting(null); }
  };

  if (loading && !lastFetched) return (
    <div className="text-center p-10 flex flex-col items-center justify-center min-h-[70vh]">
      <Loader2 className="w-10 h-10 animate-spin text-bu-primary mb-4"/>
      <p className="text-xl text-bu-primary font-medium">Loading Users...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end pb-4 border-b-4 border-blue-500/50">
        <h2 className="text-3xl font-extrabold text-blue-800">👥 User Management</h2>
        <div className="flex space-x-2">
          <Button onClick={fetchUsers} className="flex items-center bg-blue-500 hover:bg-blue-600 px-4 py-2 font-semibold shadow-md">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button onClick={handleAddUser} className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 font-semibold shadow-md">
            <User className="w-4 h-4 mr-1" /> Add User
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2"/>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow-md rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="py-3 px-4 font-semibold text-sm uppercase">Name</th>
              <th className="py-3 px-4 font-semibold text-sm uppercase">Email</th>
              <th className="py-3 px-4 font-semibold text-sm uppercase">Role</th>
              <th className="py-3 px-4 font-semibold text-sm uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500 bg-gray-50">
                  <AlertTriangle className="w-5 h-5 text-gray-400 mx-auto mb-2" /> No users found.
                </td>
              </tr>
            ) : users.map(u => (
              <tr key={u._id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                <td className="py-3 px-4 font-medium text-gray-800">{u.name}</td>
                <td className="py-3 px-4 text-gray-600">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 flex justify-end gap-2">
                  <Button onClick={() => handleEditUser(u)} className="bg-green-500 hover:bg-green-600 p-2 flex items-center font-semibold text-sm"><Edit className="w-4 h-4" /></Button>
                  <Button onClick={() => handleDeleteUser(u._id)} disabled={isDeleting === u._id} className="bg-red-600 hover:bg-red-700 p-2 flex items-center font-semibold text-sm">
                    {isDeleting === u._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal isOpen={isModalOpen} user={selectedUser} onClose={() => setIsModalOpen(false)} onSave={handleRefreshAndToast} />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message:'', type:''})} />
    </div>
  );
}
