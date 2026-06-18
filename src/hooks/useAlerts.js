import { useState, useCallback } from 'react';
import api from '../lib/api';

export default function useAlerts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/alerts');
      setData(res.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id_alert) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/alerts/${id_alert}/read`);
      await fetchAlerts();
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAlerts]);

  return {
    data,
    loading,
    error,
    fetchAlerts,
    markRead
  };
}
