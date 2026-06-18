import { useState, useCallback } from 'react';
import api from '../lib/api';

export default function useRisk() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateRisk = useCallback(async (id_transaksi) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/risk/calculate', { id_transaksi });
      setData(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRiskByTransaction = useCallback(async (id_transaksi) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/risk/transaction/${id_transaksi}`);
      setData(res.data.data);
      return res.data.data;
    } catch (err) {
      // Don't override data to null on 404 so we can tell there's no risk assessed yet.
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    calculateRisk,
    getRiskByTransaction
  };
}
