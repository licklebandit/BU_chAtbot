// frontend/src/views/Admin/AdminLayout.js
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  BarChart3,
  BookOpen,
  HelpCircle,
  Settings,
  Menu,
  X,
  MessageSquare,
  Bell,
  LogOut,
  MessageCircle,
  ThumbsUp,
  Wifi,
  WifiOff,
  User,
  Check,
  CheckCheck,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

// Mock notifications data - would come from API in real app
const MOCK_NOTIFICATIONS = [
  { 
    id: 1, 
    message: "New feedback received from student", 
    type: "feedback", 
    time: "5 min ago",
    read: false 
  },
  { 
    id: 2, 
    message: "User registration completed", 
    type: "user", 
    time: "10 min ago",
    read: false 
  },
  { 
    id: 3, 
    message: "System backup completed successfully", 
    type: "system", 
    time: "1 hour ago",
    read: false 
  },
];

const AdminLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    online: navigator.onLine,
    checking: false,
    lastChecked: null,
    serverReachable: true
  });
  const [adminInfo, setAdminInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/conversations", icon: MessageCircle, label: "Conversations" },
    { path: "/admin/feedback", icon: ThumbsUp, label: "User Feedback" },
    { path: "/admin/faqs", icon: HelpCircle, label: "FAQs" },
    { path: "/admin/knowledge", icon: BookOpen, label: "Knowledge Base" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/admins", icon: Shield, label: "Admins" },
    { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  // Fetch admin info and notifications from localStorage on component mount
  useEffect(() => {
    fetchAdminInfo();
    fetchNotifications();
    
    // Initial connection check
    setTimeout(() => {
      checkServerConnectivity();
    }, 1000);
    
    // Set up interval to check server connectivity every 60 seconds
    const serverCheckInterval = setInterval(() => {
      checkServerConnectivity();
    }, 60000);

    // Set up network status listeners
    const handleOnline = () => {
      setConnectionStatus(prev => ({ 
        ...prev, 
        online: true,
        checking: true 
      }));
      
      // When coming back online, check server connectivity after a delay
      setTimeout(() => {
        checkServerConnectivity();
      }, 2000);
    };
    
    const handleOffline = () => {
      setConnectionStatus(prev => ({ 
        ...prev, 
        online: false,
        serverReachable: false,
        checking: false 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(serverCheckInterval);
    };
  }, []);

  // Check if server is reachable
  const checkServerConnectivity = async () => {
    // First check if browser is online
    if (!navigator.onLine) {
      setConnectionStatus(prev => ({ 
        ...prev, 
        online: false,
        serverReachable: false,
        checking: false,
        lastChecked: new Date()
      }));
      return;
    }

    setConnectionStatus(prev => ({ 
      ...prev, 
      checking: true 
    }));

    try {
      // Extract base URL from API_BASE_URL (remove /api if present)
      const baseUrl = API_BASE_URL.replace(/\/api$/, '');
      
      console.log("Checking server connectivity to:", baseUrl);

      // Try to make a simple request to the server
      // Use a simple ping endpoint or try to access the root
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      let serverReachable = false;
      
      // Try multiple approaches
      try {
        // First try: Simple GET request to API base
        const response = await fetch(`${baseUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal,
          mode: 'cors'
        });

        if (response.ok || response.status) {
          serverReachable = true;
        }
      } catch (apiError) {
        console.log("API health check failed, trying other methods...");
        
        // Second try: Try to fetch the root
        try {
          const rootResponse = await fetch(baseUrl, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'no-cors',
            cache: 'no-cache'
          });
          // If we get here without error, server is reachable (no-cors mode)
          serverReachable = true;
        } catch (rootError) {
          console.log("Root check also failed");
          
          // Third try: Use image ping (works even with CORS)
          serverReachable = await pingWithImage(baseUrl);
        }
      } finally {
        clearTimeout(timeoutId);
      }

      setConnectionStatus(prev => ({ 
        ...prev, 
        online: true,
        serverReachable: serverReachable,
        checking: false,
        lastChecked: new Date()
      }));

    } catch (error) {
      console.log("Server connectivity check failed:", error.message);
      setConnectionStatus(prev => ({ 
        ...prev, 
        online: navigator.onLine,
        serverReachable: false,
        checking: false,
        lastChecked: new Date()
      }));
    }
  };

  // Alternative method to check server connectivity using image ping
  const pingWithImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Set a timeout
      const timeoutId = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, 2000);
      
      // Try to load a favicon or common endpoint
      img.src = `${url}/favicon.ico?t=${Date.now()}`;
      
      // Clean up timeout
      img.onload = img.onerror = () => clearTimeout(timeoutId);
    });
  };

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Fetch admin information
  const fetchAdminInfo = () => {
    // Try to get admin info from localStorage first
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    
    if (storedName && storedEmail) {
      setAdminInfo({
        name: storedName,
        email: storedEmail,
        role: storedRole || "admin",
        initials: getInitials(storedName)
      });
    } else {
      // If not in localStorage, try to fetch from API using token
      fetchAdminFromAPI();
    }
  };

  const fetchAdminFromAPI = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const tokenData = parseJWT(token);
      if (tokenData) {
        const adminData = {
          name: tokenData.name || "Administrator",
          email: tokenData.email || "admin@bugema.edu",
          role: tokenData.role || "admin",
          initials: getInitials(tokenData.name || "A")
        };
        setAdminInfo(adminData);
        
        // Save to localStorage for future use
        localStorage.setItem("name", adminData.name);
        localStorage.setItem("email", adminData.email);
        localStorage.setItem("role", adminData.role);
      }
    } catch (error) {
      console.error("Error fetching admin info:", error);
    }
  };

  // Fetch notifications from localStorage or initialize with mock data
  const fetchNotifications = async () => {
    try {
      // First, check if we have saved notifications in localStorage
      const savedNotifications = localStorage.getItem('admin_notifications');
      
      if (savedNotifications) {
        // Use saved notifications
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
      } else {
        // For demo, use mock data and save it
        setNotifications(MOCK_NOTIFICATIONS);
        localStorage.setItem('admin_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Fallback to mock data
      setNotifications(MOCK_NOTIFICATIONS);
    }
  };

  // Helper function to parse JWT token
  const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error parsing JWT:", e);
      return null;
    }
  };

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "A";
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === "feedback") {
      navigate("/admin/feedback");
    } else if (notification.type === "user") {
      navigate("/admin/users");
    }
    
    // Mark as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    setNotificationOpen(false);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
  };

  const toggleNotifications = () => {
    setNotificationOpen(!notificationOpen);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('admin_notifications');
    setNotificationOpen(false);
  };

  // Add new notifications (for demo purposes)
  const addMockNotification = () => {
    const newNotification = {
      id: Date.now(),
      message: "New system alert",
      type: "system",
      time: "Just now",
      read: false
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
  };

  // Manual refresh of connection status
  const refreshConnectionStatus = () => {
    checkServerConnectivity();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Determine connection status text and icon
  const getConnectionStatusInfo = () => {
    if (connectionStatus.checking) {
      return {
        text: "Connecting...",
        icon: RefreshCw,
        color: "text-yellow-500",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-500",
        iconClass: "animate-spin"
      };
    }
    
    if (!connectionStatus.online) {
      return {
        text: "Offline",
        icon: WifiOff,
        color: "text-red-500",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-500"
      };
    }
    
    if (!connectionStatus.serverReachable) {
      return {
        text: "Server Unreachable",
        icon: AlertCircle,
        color: "text-orange-500",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-500"
      };
    }
    
    return {
      text: "Online",
      icon: Wifi,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-500"
    };
  };

  const connectionInfo = getConnectionStatusInfo();
  const ConnectionIcon = connectionInfo.icon;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-800 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">BUchatbot</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`
              }
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer - Admin Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {adminInfo ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {adminInfo.initials}
                  </span>
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  connectionStatus.online && connectionStatus.serverReachable 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {adminInfo.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {adminInfo.email}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                  {adminInfo.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">Loading...</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin profile</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Connection Status with refresh button */}
              <div className="relative group">
                <button
                  onClick={refreshConnectionStatus}
                  disabled={connectionStatus.checking}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${connectionInfo.bgColor} hover:opacity-90 disabled:opacity-50`}
                  title="Click to refresh connection status"
                >
                  <ConnectionIcon className={`h-4 w-4 ${connectionInfo.iconColor} ${connectionInfo.iconClass || ''}`} />
                  <span className={`text-sm font-medium ${connectionInfo.color}`}>
                    {connectionInfo.text}
                  </span>
                  <RefreshCw className={`h-3 w-3 ${connectionInfo.color} ${connectionStatus.checking ? 'animate-spin' : ''}`} />
                </button>
                
                {/* Connection status tooltip */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="font-semibold mb-1">Connection Status</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Browser:</span>
                      <span className={connectionStatus.online ? "text-green-300" : "text-red-300"}>
                        {connectionStatus.online ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Server:</span>
                      <span className={connectionStatus.serverReachable ? "text-green-300" : "text-red-300"}>
                        {connectionStatus.serverReachable ? "Reachable" : "Unreachable"}
                      </span>
                    </div>
                    {connectionStatus.lastChecked && (
                      <div className="flex justify-between">
                        <span>Last check:</span>
                        <span className="text-gray-300">
                          {new Date(connectionStatus.lastChecked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Demo button to add notification (remove in production) */}
              <button
                onClick={addMockNotification}
                className="hidden text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title="Add test notification"
              >
                + Notif
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={toggleNotifications}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  {/* Show badge only if there are unread notifications */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                      </h3>
                      <div className="flex gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                            title="Mark all as read"
                          >
                            <CheckCheck className="h-3 w-3" />
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No notifications yet
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            You're all caught up!
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 group"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full ${
                                notification.type === "feedback" 
                                  ? "bg-green-100 dark:bg-green-900" 
                                  : notification.type === "user"
                                  ? "bg-blue-100 dark:bg-blue-900"
                                  : "bg-gray-100 dark:bg-gray-900"
                              }`}>
                                {notification.type === "feedback" ? (
                                  <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : notification.type === "user" ? (
                                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                      notification.read 
                                        ? "text-gray-600 dark:text-gray-400" 
                                        : "text-gray-800 dark:text-white"
                                    }`}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {notification.time}
                                    </p>
                                  </div>
                                  <div className="flex items-center ml-2">
                                    {notification.read ? (
                                      <Check className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center justify-center gap-2 w-full"
                        >
                          <CheckCheck className="h-4 w-4" />
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Bugema University Chatbot. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span>Version 2.0.1</span>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center space-x-1">
                <span>Status:</span>
                <span className={`font-medium ${connectionStatus.online && connectionStatus.serverReachable ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionStatus.checking ? "Checking..." : 
                   !connectionStatus.online ? "Offline" :
                   !connectionStatus.serverReachable ? "Server Unreachable" : "Online"}
                </span>
                {connectionStatus.lastChecked && !connectionStatus.checking && (
                  <button
                    onClick={refreshConnectionStatus}
                    className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Refresh connection status"
                  >
                    <RefreshCw className="h-3 w-3 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;