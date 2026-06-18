import { useEffect, useState } from 'react';
import { socket, connectSocket, disconnectSocket } from '../lib/socket';
import useAuthStore from '../stores/authStore';

export default function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    if (token) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [token]);

  return { socket, isConnected };
}
