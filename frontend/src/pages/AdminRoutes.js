// frontend/src/pages/AdminRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Admin Layout
import AdminLayout from "../views/Admin/AdminLayout";

// Admin Views
import DashboardView from "../views/Admin/DashboardView";
import UsersView from "../views/Admin/UsersView";
import AdminsView from "../views/Admin/AdminsView";
import AnalyticsView from "../views/Admin/AnalyticsView";
import KnowledgeView from "../views/Admin/KnowledgeView";
import FaqsView from "../views/Admin/FaqsView";
import SettingsView from "../views/Admin/SettingsView";
import FeedbackView from "../views/Admin/FeedbackView"; // Added import
import ConversationsView from "../views/Admin/ConversationsView"; // You might need this too

export default function AdminRoutes() {
  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("adminEmail");
    window.location.href = "/login";
  };

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={onLogout} />}>
        {/* Default dashboard */}
        <Route index element={<DashboardView />} />

        {/* Admin Panel Routes */}
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="conversations" element={<ConversationsView />} />
        <Route path="users" element={<UsersView />} />
        <Route path="admins" element={<AdminsView />} />
        <Route path="analytics" element={<AnalyticsView />} />
        <Route path="knowledge" element={<KnowledgeView />} />
        <Route path="faqs" element={<FaqsView />} />
        <Route path="feedback" element={<FeedbackView />} /> {/* Added route */}
        <Route path="settings" element={<SettingsView />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}