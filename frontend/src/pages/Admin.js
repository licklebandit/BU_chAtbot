// src/pages/admin.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🧱 Layout + Views
import AdminLayout from "../views/Admin/AdminLayout";
import DashboardView from "../views/Admin/DashboardView";
import ConversationsView from "../views/Admin/ConversationsView";
import FaqsView from "../views/Admin/FaqsView";
import KnowledgeView from "../views/Admin/KnowledgeView";
import UsersView from "../views/Admin/UsersView";
import AdminsView from "../views/Admin/AdminsView";
import AnalyticsView from "../views/Admin/AnalyticsView";
import SettingsView from "../views/Admin/SettingsView";

export default function Admin() {
  // 🔐 Logout logic
  const onLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Routes>
      <Route
        element={
          <AdminLayout
            onLogout={onLogout}
            userRole="admin"
            conversations={[]} // You can pass initial socket data or fetched convos
          />
        }
      >
        {/* Default Dashboard */}
        <Route index element={<DashboardView />} />
        <Route path="dashboard" element={<DashboardView />} />

        {/* Core Admin Pages */}
        <Route path="conversations" element={<ConversationsView />} />
        <Route path="faqs" element={<FaqsView />} />
        <Route path="knowledge" element={<KnowledgeView />} />
        <Route path="users" element={<UsersView />} />

        {/* Extended Views */}
        <Route path="admins" element={<AdminsView />} />
        <Route path="analytics" element={<AnalyticsView />} />

        {/* Settings + Fallback */}
        <Route path="settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
