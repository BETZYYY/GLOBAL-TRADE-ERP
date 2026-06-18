import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401 & Global Errors
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response) {
    // Handled Server Error
    if (error.response.status === 401) {
      toast.error('Session expired. Please log in again.');
      useAuthStore.getState().logout();
      window.location.href = '/login'; // Redirect to login
    } else {
      const message = error.response.data?.message || `Error: ${error.response.status}`;
      toast.error(message);
    }
  } else if (error.request) {
    // Network Error
    toast.error('Network error. Please check your connection.');
  } else {
    // Other Error
    toast.error(error.message);
  }
  return Promise.reject(error);
});

export default api;
