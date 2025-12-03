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
} from "lucide-react";
import { useSocket } from "../../context/SocketContext";

// Temporary local definition for Button to resolve the import issue and allow compilation.
const Button = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  ...props
}) => {
  let baseClasses =
    "inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-2xl transition duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed";

  if (variant === "primary") {
    baseClasses +=
      " bg-[#0033A0] text-white hover:bg-[#062a7a] shadow-blue-500/30";
  } else if (variant === "danger") {
    // Used for the internal sidebar logout button
    baseClasses += " bg-red-600 text-white hover:bg-red-700 shadow-red-500/30";
  } else if (variant === "secondary") {
    baseClasses +=
      " bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm";
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

// Custom colors based on the admin theme
const PRIMARY_BLUE = "bg-[#0033A0]"; // bu-primary equivalent
const ACCENT_BLUE_TEXT = "text-[#0033A0]"; // bu-primary equivalent

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { connected, newConversationCount, resetNewConversationCount } =
    useSocket();
  const [showNotification, setShowNotification] = useState(false);

  // Show notification badge when new conversations arrive
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
    <div className="min-h-screen bg-slate-100 flex overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 ${PRIMARY_BLUE} text-white shadow-2xl transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="space-y-1 flex-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200/80">
              BUchatbot
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-50" />
              </div>
              <p className="text-lg font-bold text-white tracking-tight">
                Admin Console
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Status Indicator */}
        <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
              connected
                ? "bg-green-100/20 text-green-300"
                : "bg-red-100/20 text-red-300"
            }`}
          >
            {connected ? (
              <>
                <Wifi className="w-3 h-3 animate-pulse" />
                <span>Real-time Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Connecting...</span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navItems.map(({ name, path, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition font-medium text-sm relative ${
                  isActive
                    ? `bg-white ${ACCENT_BLUE_TEXT} shadow-lg shadow-blue-900/40`
                    : "text-white/80 hover:bg-white/10"
                }`
              }
              onClick={() => handleNavClick(path)}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{name}</span>
              {badge > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <Button
            onClick={onLogout}
            variant="danger"
            className="w-full justify-center bg-white/10 text-white hover:bg-red-700/80 rounded-2xl transition shadow-none"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Fixed Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-md flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile Menu Toggle */}
            <button
              className={`lg:hidden p-2 rounded-xl ${PRIMARY_BLUE} text-white shadow-md flex-shrink-0`}
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            {/* Welcome Text */}
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 truncate">
                Admin Control Center
              </p>
              <p className="text-base sm:text-xl font-bold text-slate-800 tracking-tight truncate">
                Welcome back, {adminName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Real-time Status Badge */}
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold ${
                connected
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {connected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span>Offline</span>
                </>
              )}
            </div>
            <a
              href="/chatbot"
              className={`hidden sm:inline-flex items-center gap-2 px-3 sm:px-5 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm shadow-sm`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">View Chatbot</span>
            </a>
            <Button
              onClick={onLogout}
              className={`inline-flex items-center gap-2 px-3 sm:px-5 py-2 rounded-2xl ${PRIMARY_BLUE} text-white font-semibold shadow-lg shadow-blue-500/30 hover:bg-[#062a7a] transition text-sm`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
