// AdminLayout.jsx - Complete component with space key to close notifications
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const notificationRef = useRef(null);
  const notificationButtonRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setIsConnected(true);
      newSocket.emit('joinAdminRoom');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    newSocket.on('clearNotificationsUI', () => {
      console.log('📭 Clearing notifications UI');
      handleClearNotifications();
    });

    newSocket.on('newNotification', (notification) => {
      console.log('🔔 New notification:', notification);
      handleNewNotification(notification);
    });

    // Listen for incoming notifications from backend (example)
    newSocket.on('adminNotification', (data) => {
      const newNotification = {
        id: Date.now(),
        title: data.title || 'New Notification',
        message: data.message || 'You have a new notification',
        type: data.type || 'info',
        timestamp: new Date().toISOString(),
        read: false
      };
      handleNewNotification(newNotification);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle new notification
  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show notification toast
    showToast(notification);
  };

  // Show toast notification
  const showToast = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  // Handle clear notifications
  const handleClearNotifications = () => {
    setShowNotifications(false);
    
    // Mark all notifications as read
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: true
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  // Mark single notification as read
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // Mark all as read when opening
    if (!showNotifications && unreadCount > 0) {
      const updatedNotifications = notifications.map(notif => ({
        ...notif,
        read: true
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      
      // Notify server that admin has read notifications
      if (socket) {
        socket.emit('adminReadNotifications', {
          adminId: localStorage.getItem('adminId') || 'anonymous',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  // Handle space key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if space is pressed and user is not typing
      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        const activeElement = document.activeElement;
        const isTyping = activeElement.tagName === 'INPUT' || 
                        activeElement.tagName === 'TEXTAREA' || 
                        activeElement.isContentEditable;
        
        // Only clear if notifications are visible and user is not typing
        if (showNotifications && !isTyping) {
          e.preventDefault(); // Prevent page scrolling
          
          // Notify server
          if (socket) {
            socket.emit('adminReadNotifications', {
              adminId: localStorage.getItem('adminId') || 'anonymous',
              timestamp: new Date().toISOString()
            });
          }
          
          // Clear notifications locally
          handleClearNotifications();
        }
      }
      
      // Optional: Add ESC key to close notifications
      if (e.key === 'Escape' && showNotifications) {
        handleClearNotifications();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications, socket]);

  // Handle click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && 
          notificationRef.current && 
          !notificationRef.current.contains(event.target) &&
          notificationButtonRef.current &&
          !notificationButtonRef.current.contains(event.target)) {
        handleClearNotifications();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
    
    if (socket) {
      socket.emit('adminReadNotifications', {
        adminId: localStorage.getItem('adminId') || 'anonymous',
        timestamp: new Date().toISOString(),
        clearAll: true
      });
    }
  };

  // Example function to test notifications
  const sendTestNotification = () => {
    if (socket) {
      socket.emit('testNotification', {
        title: 'Test Notification',
        message: 'This is a test notification sent from the admin panel.',
        type: 'info'
      });
    }
  };

  return (
    <div className="admin-layout">
      {/* Top Navigation Bar */}
      <nav className="admin-navbar">
        <div className="navbar-left">
          <h1 className="admin-title">🎓 Bugema University Admin Panel</h1>
        </div>
        
        <div className="navbar-right">
          {/* Connection Status */}
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          {/* Notifications Bell */}
          <div className="notifications-container">
            <button
              ref={notificationButtonRef}
              className="notifications-button"
              onClick={toggleNotifications}
              aria-label="Notifications"
              title="Press Space to close when open"
            >
              <span className="bell-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="notifications-dropdown" ref={notificationRef}>
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <div className="notifications-actions">
                    <button 
                      className="clear-all-btn"
                      onClick={clearAllNotifications}
                      title="Clear all notifications"
                    >
                      Clear All
                    </button>
                    <span className="close-hint">Press Space to close</span>
                  </div>
                </div>
                
                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          {notification.type === 'success' && '✅'}
                          {notification.type === 'warning' && '⚠️'}
                          {notification.type === 'error' && '❌'}
                          {notification.type === 'info' && 'ℹ️'}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.title}
                            {!notification.read && <span className="unread-dot"></span>}
                          </div>
                          <div className="notification-message">
                            {notification.message}
                          </div>
                          <div className="notification-time">
                            {formatTime(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <div className="empty-icon">📭</div>
                      <p>No notifications</p>
                      <small>All caught up!</small>
                    </div>
                  )}
                </div>
                
                <div className="notifications-footer">
                  <button 
                    className="test-notification-btn"
                    onClick={sendTestNotification}
                  >
                    Send Test Notification
                  </button>
                  <button 
                    className="permission-btn"
                    onClick={requestNotificationPermission}
                  >
                    Enable Browser Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">A</div>
            <span className="user-name">Admin</span>
          </div>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <div className="admin-main">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <a href="/admin/dashboard" className="nav-item active">
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </a>
            <a href="/admin/conversations" className="nav-item">
              <span className="nav-icon">💬</span>
              <span className="nav-text">Conversations</span>
            </a>
            <a href="/admin/analytics" className="nav-item">
              <span className="nav-icon">📈</span>
              <span className="nav-text">Analytics</span>
            </a>
            <a href="/admin/knowledge-base" className="nav-item">
              <span className="nav-icon">📚</span>
              <span className="nav-text">Knowledge Base</span>
            </a>
            <a href="/admin/ingest" className="nav-item">
              <span className="nav-icon">📤</span>
              <span className="nav-text">Upload Data</span>
            </a>
            <a href="/admin/settings" className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </a>
            <a href="/admin/feedback" className="nav-item">
              <span className="nav-icon">🌟</span>
              <span className="nav-text">Feedback</span>
            </a>
          </nav>
          
          <div className="sidebar-footer">
            <div className="system-status">
              <div className="status-item">
                <span className="status-label">Socket:</span>
                <span className={`status-value ${isConnected ? 'online' : 'offline'}`}>
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Notifications:</span>
                <span className="status-value">{notifications.length}</span>
              </div>
            </div>
            <button className="logout-btn">
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </aside>
        
        {/* Content Area */}
        <main className="admin-content">
          {/* Breadcrumb */}
          <div className="content-header">
            <div className="breadcrumb">
              <span className="breadcrumb-item">Admin</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">Dashboard</span>
            </div>
            <div className="content-actions">
              <button className="help-btn" title="Help">
                <span className="help-icon">❓</span> Help
              </button>
            </div>
          </div>
          
          {/* Page Content */}
          <div className="content-wrapper">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="content-footer">
            <p>Bugema University AI Chatbot Admin Panel © {new Date().getFullYear()}</p>
            <p className="keyboard-hint">
              💡 <strong>Keyboard Shortcut:</strong> Press <kbd>Space</kbd> to close notifications when open
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;