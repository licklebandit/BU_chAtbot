import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_ROOT = process.env.REACT_APP_API_BASE_URL || "https://bu-chatbot.onrender.com";

export const useSocket = () => {
    const socketRef = useRef(null);

    useEffect(() => {
        // Force websocket transport and longer timeout
        socketRef.current = io(API_ROOT, {
            transports: ['websocket'],
            timeout: 20000,          // 20 seconds
            withCredentials: true,
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected', socketRef.current.id);
            socketRef.current.emit('joinAdminRoom');
        });

        socketRef.current.on('connect_error', (err) => {
            console.warn('⚠️ Socket connect_error:', err.message || err);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return socketRef.current;
};
