// src/views/Admin/AdminLayout.js
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LogOut, Users, BookOpen, Search, Settings, BarChart2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import ConversationModal from "../../components/ConversationModal";

export default function AdminLayout({ onLogout }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <BarChart2 /> },
    { name: "Conversations", path: "/admin/conversations", icon: <Search /> },
    { name: "FAQs", path: "/admin/faqs", icon: <BookOpen /> },
    { name: "Knowledge Base", path: "/admin/knowledge", icon: <BookOpen /> },
    { name: "Users", path: "/admin/users", icon: <Users /> },
    { name: "Admins", path: "/admin/admins", icon: <Users /> },
    { name: "Analytics", path: "/admin/analytics", icon: <BarChart2 /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white shadow flex flex-col">
        <div className="p-6 text-xl font-bold border-b text-white">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded hover:bg-blue-700 ${
                  isActive ? "bg-blue-800 font-semibold" : ""
                }`
              }
            >
              {item.icon} {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button
            onClick={onLogout}
            className="flex items-center gap-2 w-full justify-center bg-red-600 hover:bg-red-700"
          >
            <LogOut /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>

      {/* Conversation Modal */}
      {selectedConversation && (
        <ConversationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          conversation={selectedConversation}
        />
      )}
    </div>
  );
}
