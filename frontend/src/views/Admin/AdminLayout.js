// src/views/Admin/AdminLayout.js
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LogOut,
  Users,
  BookOpen,
  Settings,
  BarChart2,
  MessageSquare,
  Menu,
  X,
  Shield,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: BarChart2 },
    { name: "Conversations", path: "/admin/conversations", icon: MessageSquare },
    { name: "FAQs", path: "/admin/faqs", icon: HelpCircle },
    { name: "Knowledge Base", path: "/admin/knowledge", icon: BookOpen },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Admins", path: "/admin/admins", icon: Shield },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart2 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const adminName =
    (typeof window !== "undefined" && localStorage.getItem("adminName")) ||
    "Administrator";

  return (
    <div className="min-h-screen bg-[#1E3A8A] text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-gradient-to-b from-white/5 to-bu-primary/30 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-black/30 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/15 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/70">
              Bugema University
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-100" />
              </div>
              <div>
                <p className="text-sm text-blue-100/80">AI Control Center</p>
                <p className="text-xl font-semibold text-white">Admin Console</p>
              </div>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition font-medium ${
                  isActive
                    ? "bg-white text-bu-primary shadow-[0_10px_30px_rgba(30,58,138,0.45)]"
                    : "text-white/80 hover:bg-white/10"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4" />
              {name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Button
            onClick={onLogout}
            variant="danger"
            className="w-full justify-center bg-white/90 text-bu-primary hover:bg-white"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-2xl bg-slate-900 text-white"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Admin workspace
              </p>
              <p className="text-lg font-semibold text-slate-900">
                Welcome back, {adminName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/chatbot"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <MessageSquare className="w-4 h-4" />
              View chatbot
            </a>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-br from-white to-bu-primary-soft text-bu-primary font-semibold shadow-lg shadow-bu-primary/40"
            >
              <LogOut className="w-4 h-4 text-bu-primary" />
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
