import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useDashboard from '../hooks/useDashboard';
import useSocket from '../hooks/useSocket';

function formatCur(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(val || 0);
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data, loading, error, fetchSummary } = useDashboard();
  const { socket } = useSocket();

  const [localAlerts, setLocalAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (data?.recent_alerts) {
      setLocalAlerts(data.recent_alerts);
    }
  }, [data]);

  useEffect(() => {
    if (!socket) return;
    const handleNewAlert = (alert) => {
      setLocalAlerts(prev => [alert, ...prev].slice(0, 10));
    };
    const handleRateUpdate = () => setLastUpdate(new Date());

    socket.on('new_alert', handleNewAlert);
    socket.on('rate_updated', handleRateUpdate);

    return () => {
      socket.off('new_alert', handleNewAlert);
      socket.off('rate_updated', handleRateUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-4 max-w-full animate-pulse">
        <div className="h-8 bg-surface-elevated rounded w-64 mb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-brand-midnight-card ghost-border rounded-xl p-5 h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col">
        <div className="bg-brand-midnight-card ghost-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-[#DC2626] mb-4">warning</span>
          <h2 className="font-h2 text-h2 text-white mb-2">Failed to Load Dashboard</h2>
          <button onClick={fetchSummary} className="btn-primary mt-4">Try Again</button>
        </div>
      </div>
    );
  }

  const { total_exposure, hedging_coverage, pending_approvals, high_risk_transactions } = data;

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-4 max-w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface m-0">Dashboard Overview</h1>
          <p className="font-label-xs text-label-xs text-on-surface-variant mt-1">
            Ringkasan posisi keuangan dan risiko hari ini. 
            <span className="ml-2 px-2 py-0.5 rounded ghost-border bg-surface-elevated text-[10px]">
              <span className="material-symbols-outlined text-[10px] align-middle mr-1">update</span>
              Updated {Math.round((new Date() - lastUpdate)/1000)}s ago
            </span>
          </p>
        </div>
        <div>
          <button className="h-button_height bg-transparent border border-outline-variant text-on-surface-variant px-4 rounded-lg font-label-xs text-label-xs flex items-center gap-2 hover:bg-surface-variant/50 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exposure */}
        <div className="bg-brand-midnight-card ghost-border rounded-xl p-5 flex flex-col justify-between hover:border-brand-teal transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Total Eksposur (USD)</h3>
            <span className="material-symbols-outlined text-brand-teal">trending_up</span>
          </div>
          <div className="mt-4">
            <div className="font-h1 text-[28px] font-bold text-white tracking-tight">{formatCur(total_exposure)}</div>
          </div>
        </div>
        
        {/* Hedging */}
        <div className="bg-brand-midnight-card ghost-border rounded-xl p-5 flex flex-col justify-between hover:border-brand-teal transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Hedging Coverage</h3>
            <span className="material-symbols-outlined text-[#22C55E]">security</span>
          </div>
          <div className="mt-4">
            <div className="font-h1 text-[28px] font-bold text-white tracking-tight">{Math.round(hedging_coverage || 0)}%</div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-brand-midnight-card ghost-border rounded-xl p-5 flex flex-col justify-between hover:border-brand-teal transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Pending Approvals</h3>
            <span className="material-symbols-outlined text-[#F59E0B]">schedule</span>
          </div>
          <div className="mt-4">
            <div className="font-h1 text-[28px] font-bold text-white tracking-tight">{pending_approvals}</div>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-brand-midnight-card ghost-border rounded-xl p-5 flex flex-col justify-between hover:border-brand-teal transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Risiko Tinggi (30hr)</h3>
            <span className="material-symbols-outlined text-[#DC2626]">warning</span>
          </div>
          <div className="mt-4">
            <div className="font-h1 text-[28px] font-bold text-[#DC2626] tracking-tight">{high_risk_transactions}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-brand-midnight-card ghost-border rounded-xl flex flex-col min-h-[400px] p-5">
          <h2 className="font-h2 text-h2 text-on-surface m-0 mb-4">Live Exchange Rates (USD/IDR)</h2>
          <div className="flex-1 border border-outline-variant/30 rounded flex items-center justify-center">
            <span className="text-on-surface-variant font-label-xs">Chart Visualization Placeholder</span>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-brand-midnight-card ghost-border rounded-xl flex flex-col min-h-[400px]">
          <div className="px-4 py-3 border-b border-brand-midnight-border flex justify-between items-center">
            <h2 className="font-h2 text-h2 text-on-surface m-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              Risk Alerts
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {localAlerts.length === 0 ? (
              <p className="text-center text-on-surface-variant font-label-xs mt-10">Belum ada peringatan baru.</p>
            ) : (
              localAlerts.map(alert => (
                <div key={alert.id_peringatan} className={`p-3 rounded-lg border ${alert.tingkat_keparahan === 'kritis' ? 'bg-[#DC2626]/10 border-[#DC2626]/30' : 'bg-[#F59E0B]/10 border-[#F59E0B]/30'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase ${alert.tingkat_keparahan === 'kritis' ? 'text-[#DC2626]' : 'text-[#F59E0B]'}`}>
                      {alert.tingkat_keparahan}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">{new Date(alert.timestamp_dibuat).toLocaleDateString()}</span>
                  </div>
                  <p className="font-body text-body text-white text-sm">{alert.pesan_peringatan}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
