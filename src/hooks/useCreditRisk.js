import { useState, useCallback } from 'react';
import api from '../lib/api';

export default function useCreditRisk() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateScore = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/creditRisk/score', payload);
      setData(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    calculateScore
  };
}
