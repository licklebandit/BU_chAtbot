// frontend/src/utils/useSockets.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Automatically pick correct backend URL
const API_ROOT =
  process.env.NODE_ENV === "production"
    ? "https://bu-chatbot.onrender.com" // 🔥 your Render backend URL
    : "http://localhost:5000";          // local dev

// Hook for a single socket connection
export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(API_ROOT, {
      transports: ["websocket"], // force WebSocket transport
      withCredentials: true,
    });

    // Handle connection errors
    socketRef.current.on("connect_error", (err) => {
      console.error("⚠️ Socket connect_error:", err.message);
    });

    // Join admin room when connected
    socketRef.current.on("connect", () => {
      console.log("✅ Connected to server:", socketRef.current.id);
      socketRef.current.emit("joinAdminRoom");
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("🔌 Socket disconnected");
      }
    };
  }, []);

  return socketRef.current;
};

// Hook for admin dashboard real-time updates
export const useAdminSocket = (onMetricsUpdate, onConversationsUpdate) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    if (onMetricsUpdate) socket.on("metricsUpdate", onMetricsUpdate);
    if (onConversationsUpdate)
      socket.on("conversationsUpdate", onConversationsUpdate);

    return () => {
      if (onMetricsUpdate) socket.off("metricsUpdate", onMetricsUpdate);
      if (onConversationsUpdate)
        socket.off("conversationsUpdate", onConversationsUpdate);
    };
  }, [socket, onMetricsUpdate, onConversationsUpdate]);

  return socket;
};
