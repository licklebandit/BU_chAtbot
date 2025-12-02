import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_URL } from "../../config/api";
import { Button } from "../../components/ui/Button";
import AdminModal from "../../components/AdminModal";
import { Edit, Trash2, Loader2, CheckCircle, AlertTriangle, UserCog, RefreshCw } from 'lucide-react';

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

export default function AdminsView() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [lastFetched, setLastFetched] = useState(null);

  const token = localStorage.getItem("token");

  const fetchAdmins = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${ADMIN_API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      setAdmins(res.data.filter(u => u.role === 'admin') || []);
      setLastFetched(new Date());
    } catch (err) {
      console.error(err);
      setError("Failed to load administrators.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleAddAdmin = () => { setSelectedAdmin(null); setIsModalOpen(true); };
  const handleEditAdmin = (admin) => { setSelectedAdmin(admin); setIsModalOpen(true); };
  const handleRefreshAndToast = () => { fetchAdmins(); setToast({ message: 'Admin saved successfully!', type: 'success' }); };
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Confirm deletion?")) return;
    setIsDeleting(id);
    try {
      await axios.delete(`${ADMIN_API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAdmins(prev => prev.filter(a => a._id !== id));
      setToast({ message: "Admin deleted successfully.", type: 'success' });
    } catch { setToast({ message: "Failed to delete admin.", type: 'error' }); } 
    finally { setIsDeleting(null); }
  };

  if (loading && !lastFetched) {
    return (
      <div className="text-center p-10 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-bu-primary mb-4" />
        <p className="text-xl text-bu-primary font-medium">Loading Administrators...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end pb-4 border-b-4 border-bu-primary/50">
        <h2 className="text-3xl font-extrabold text-bu-primary">🛠️ Admin Management</h2>
        <div className="flex space-x-2">
          <Button onClick={fetchAdmins} className="flex items-center bg-bu-primary hover:bg-bu-primary/90 px-4 py-2 font-semibold shadow-md">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button onClick={handleAddAdmin} className="flex items-center bg-bu-primary hover:bg-bu-primary/80 px-4 py-2 font-semibold shadow-md">
            <UserCog className="w-4 h-4 mr-1" /> Add Admin
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2"/>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.length === 0 ? (
          <div className="p-6 bg-white shadow-md rounded-xl border border-dashed border-gray-300 text-center col-span-full">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2"/>
            <p className="text-gray-600 font-medium">No administrators found.</p>
            <p className="text-gray-500 text-sm mt-1">Click "Add Admin" to create a new admin.</p>
          </div>
        ) : admins.map(admin => (
          <div key={admin._id} className="p-5 bg-white shadow-md rounded-xl flex flex-col justify-between border border-gray-100 hover:shadow-lg hover:border-bu-primary/30 transition">
            <div className="flex items-center space-x-2 mb-2">
              <UserCog className="w-5 h-5 text-bu-primary"/>
              <h3 className="text-lg font-bold text-gray-900">{admin.username || admin.name}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">{admin.email}</p>
            <div className="flex space-x-2">
              <Button onClick={() => handleEditAdmin(admin)} className="bg-green-500 hover:bg-green-600 p-2 flex items-center font-semibold text-sm">
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button onClick={() => handleDeleteAdmin(admin._id)} disabled={isDeleting === admin._id} className="bg-red-600 hover:bg-red-700 p-2 flex items-center font-semibold text-sm">
                {isDeleting === admin._id ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : <Trash2 className="w-4 h-4 mr-1"/>}
                {isDeleting === admin._id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AdminModal isOpen={isModalOpen} admin={selectedAdmin} onClose={() => setIsModalOpen(false)} onSave={handleRefreshAndToast} />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message:'', type:''})} />
    </div>
  );
}
