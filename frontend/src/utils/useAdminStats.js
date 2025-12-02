import { useState, useEffect } from "react";
import axios from "axios";
import { ADMIN_API_URL } from "../config/api";

export const useAdminStats = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, newToday: 0 },
    chats: { total: 0, today: 0, hourly: [] },
    knowledge: { total: 0, categories: [] },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchStats = async () => {
    try {
      const [usersStats, chatsStats, knowledgeStats] = await Promise.all([
        axios.get(`${ADMIN_API_URL}/stats/users`, { headers: getAuthHeaders() }),
        axios.get(`${ADMIN_API_URL}/stats/chats`, { headers: getAuthHeaders() }),
        axios.get(`${ADMIN_API_URL}/stats/knowledge`, { headers: getAuthHeaders() }),
      ]);

      setStats({
        users: usersStats.data,
        chats: chatsStats.data,
        knowledge: knowledgeStats.data,
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refreshStats: fetchStats };
};
