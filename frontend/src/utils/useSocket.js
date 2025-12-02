import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api";

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      timeout: 20000,
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected", socketRef.current.id);
      socketRef.current.emit("joinAdminRoom");
    });

    socketRef.current.on("connect_error", (error) => {
      console.warn("⚠️ Socket connect_error:", error.message || error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
};
