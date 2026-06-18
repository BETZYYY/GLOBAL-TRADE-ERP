import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useSocket from '../hooks/useSocket';

export default function SocketManager() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const onNewAlert = (alert) => {
      const isEmergency = alert.level_keparahan === 'emergency';
      
      toast(
        (t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">
              {isEmergency ? '🚨 EMERGENCY RISK' : '⚠️ CRITICAL RISK'}
            </span>
            <span className="text-xs text-slate-200">
              {alert.pesan_peringatan}
            </span>
          </div>
        ),
        {
          duration: 8000,
          position: 'top-right',
          style: {
            background: isEmergency ? '#7f1d1d' : '#9a3412', // red-900 or orange-900
            color: '#fff',
            border: `1px solid ${isEmergency ? '#ef4444' : '#f97316'}`,
          },
        }
      );
    };

    socket.on('new_alert', onNewAlert);

    return () => {
      socket.off('new_alert', onNewAlert);
    };
  }, [socket]);

  return null; // This component doesn't render anything
}
