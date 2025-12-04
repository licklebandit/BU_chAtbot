import React, { useState, useEffect } from "react";
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
  Activity,
  Wifi,
  WifiOff,
  Bell,
} from "lucide-react";
import { useSocket } from "../../context/SocketContext";

// Button Component
const Button = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  ...props
}) => {
  let baseClasses =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-2xl transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed";

  if (variant === "primary") {
    baseClasses +=
      " bg-[#0033A0] text-white hover:bg-[#002570] hover:shadow-lg hover:scale-[1.02]";
  } else if (variant === "danger") {
    baseClasses += " bg-red-600 text-white hover:bg-red-700 hover:shadow-lg";
  } else if (variant === "secondary") {
    baseClasses +=
      " bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { connected, newConversationCount, resetNewConversationCount } =
    useSocket();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (newConversationCount > 0) {
      setShowNotification(true);
    }
  }, [newConversationCount]);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: BarChart2 },
    {
      name: "Conversations",
      path: "/admin/conversations",
      icon: MessageSquare,
      badge: newConversationCount,
    },
    { name: "Knowledge Base", path: "/admin/knowledge", icon: BookOpen },
    { name: "FAQs", path: "/admin/faqs", icon: HelpCircle },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Admins", path: "/admin/admins", icon: Shield },
    { name: "Analytics", path: "/admin/analytics", icon: Activity },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleNavClick = (path) => {
    if (path === "/admin/conversations" && showNotification) {
      resetNewConversationCount();
      setShowNotification(false);
    }
    setSidebarOpen(false);
  };

  const adminName =
    (typeof window !== "undefined" && localStorage.getItem("adminName")) ||
    "Administrator";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex overflow-hidden">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#15065b] to-[#012264] text-white shadow-2xl transform transition-all duration-300 lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-100 font-medium">
                  BUchatbot
                </p>
                <p className="text-base font-bold text-white truncate">
                  Admin Panel
                </p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition flex-shrink-0"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              connected
                ? "bg-emerald-500/20 text-emerald-100"
                : "bg-red-500/20 text-red-100"
            }`}
          >
            {connected ? (
              <>
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Connecting...</span>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navItems.map(({ name, path, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 relative ${
                  isActive
                    ? "bg-white text-[#0033A0] shadow-lg font-semibold"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`
              }
              onClick={() => handleNavClick(path)}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-[#0033A0]" : ""
                    }`}
                  />
                  <span className="truncate text-sm">{name}</span>
                  {badge > 0 && (
                    <span className="absolute right-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {adminName}
              </p>
              <p className="text-xs text-blue-200">Administrator</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="danger"
            className="w-full justify-center bg-white/10 hover:bg-red-600 border-none shadow-none"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                className="lg:hidden p-2.5 rounded-xl bg-[#0033A0] text-white shadow-md hover:bg-[#002570] transition"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">
                  
                </p>
                <p className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                  
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Live Status */}
              <div
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                  connected
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                ></div>
                <span>{connected ? "Live" : "Offline"}</span>
              </div>
              {/* View Chatbot */}
              <a
                href="/chatbot"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chatbot</span>
              </a>
              {/* Logout */}
              <Button
                onClick={onLogout}
                className="flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}