import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const API_ROOT = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const useSocket = () => {
    const socketRef = useRef(null);

    useEffect(() => {
        // Create socket connection
        socketRef.current = io(API_ROOT, {
            withCredentials: true
        });

        // Connect to admin room
        socketRef.current.emit('joinAdminRoom');

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return socketRef.current;
};

// Custom hook for admin dashboard real-time updates
export const useAdminSocket = (onMetricsUpdate, onConversationsUpdate) => {
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Listen for metrics updates
        if (onMetricsUpdate) {
            socket.on('metricsUpdate', onMetricsUpdate);
        }

        // Listen for conversation updates
        if (onConversationsUpdate) {
            socket.on('conversationsUpdate', onConversationsUpdate);
        }

        return () => {
            if (onMetricsUpdate) {
                socket.off('metricsUpdate', onMetricsUpdate);
            }
            if (onConversationsUpdate) {
                socket.off('conversationsUpdate', onConversationsUpdate);
            }
        };
    }, [socket, onMetricsUpdate, onConversationsUpdate]);

    return socket;
};