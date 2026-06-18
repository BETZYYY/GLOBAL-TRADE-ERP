import { useState, useCallback } from 'react';
import api from '../lib/api';

export default function useTransactions() {
  const [data, setData] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/transactions', { params });
      setData(res.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransaction = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/transactions/${id}`);
      setDetail(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/transactions', payload);
      await fetchTransactions(); // refresh list
      return res.data.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  const approveTransaction = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/transactions/${id}/approve`);
      await fetchTransactions();
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  const rejectTransaction = useCallback(async (id, alasan_penolakan) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/transactions/${id}/reject`, { alasan_penolakan });
      await fetchTransactions();
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  return {
    data,
    detail,
    loading,
    error,
    fetchTransactions,
    getTransaction,
    createTransaction,
    approveTransaction,
    rejectTransaction
  };
}
