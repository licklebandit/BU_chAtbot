import { useState, useEffect } from 'react';
import axios from 'axios';

const API_ROOT = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const ADMIN_API = `${API_ROOT.replace(/\/$/, '')}/api/admin`;

export const useAdminStats = () => {
    const [stats, setStats] = useState({
        users: {
            total: 0,
            active: 0,
            newToday: 0
        },
        chats: {
            total: 0,
            today: 0,
            hourly: []
        },
        knowledge: {
            total: 0,
            categories: []
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            const [usersStats, chatsStats, knowledgeStats] = await Promise.all([
                axios.get(`${ADMIN_API}/stats/users`),
                axios.get(`${ADMIN_API}/stats/chats`),
                axios.get(`${ADMIN_API}/stats/knowledge`)
            ]);

            setStats({
                users: usersStats.data,
                chats: chatsStats.data,
                knowledge: knowledgeStats.data
            });
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Refresh stats every minute
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    return { stats, loading, error, refreshStats: fetchStats };
};