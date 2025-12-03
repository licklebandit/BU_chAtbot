// frontend/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [newConversationCount, setNewConversationCount] = useState(0);
  const [metrics, setMetrics] = useState({
    chatsToday: 0,
    activeUsersToday: 0,
  });

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Only connect socket for admin users
    if (!token || role !== 'admin') {
      return;
    }

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setConnected(true);

      // Join admin room for real-time updates
      socketInstance.emit('joinAdminRoom');
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Listen for new conversations
    socketInstance.on('new_conversation', (data) => {
      console.log('📨 New conversation received:', data);
      setNewConversationCount((prev) => prev + 1);

      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('New Conversation', {
          body: `${data.user_name}: ${data.snippet?.substring(0, 50)}...`,
          icon: '/bot.png',
        });
      }
    });

    // Listen for metrics updates
    socketInstance.on('metrics', (data) => {
      console.log('📊 Metrics updated:', data);
      setMetrics({
        chatsToday: data.chatsToday || 0,
        activeUsersToday: data.activeUsersToday || 0,
      });
    });

    // Listen for knowledge base updates
    socketInstance.on('knowledge_updated', (data) => {
      console.log('📚 Knowledge base updated:', data);
    });

    // Listen for FAQ updates
    socketInstance.on('faq_updated', (data) => {
      console.log('❓ FAQ updated:', data);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const value = {
    socket,
    connected,
    newConversationCount,
    metrics,
    resetNewConversationCount: () => setNewConversationCount(0),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
