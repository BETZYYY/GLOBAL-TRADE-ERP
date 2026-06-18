import { useState, useCallback } from 'react';
import api from '../lib/api';

export default function useRates() {
  const [rates, setRates] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/rates');
      setRates(res.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (pair, days) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/rates/history', { params: { pair, days } });
      setHistory(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerManualFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/rates/fetch');
      await fetchRates();
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRates]);

  return {
    rates,
    history,
    loading,
    error,
    fetchRates,
    fetchHistory,
    triggerManualFetch
  };
}
