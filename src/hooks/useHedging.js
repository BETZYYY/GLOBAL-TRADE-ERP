import { useState, useCallback } from 'react';
import api from '../lib/api';

export default function useHedging() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHedging = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/hedging', { params });
      setData(res.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const recommendHedging = useCallback(async (id_transaksi) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/hedging/recommend', { id_transaksi });
      return res.data.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeHedging = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/hedging/execute', payload);
      await fetchHedging();
      return res.data.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchHedging]);

  return {
    data,
    loading,
    error,
    fetchHedging,
    recommendHedging,
    executeHedging
  };
}
