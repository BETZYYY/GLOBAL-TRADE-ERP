import { io } from 'socket.io-client';
import useAuthStore from '../stores/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // We connect manually when we have a token
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

// A helper to connect socket with token
export const connectSocket = () => {
  const token = useAuthStore.getState().token;
  if (!token) return;

  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
