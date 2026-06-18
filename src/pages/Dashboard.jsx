import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  RefreshCcw
} from 'lucide-react';
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
      setLocalAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep latest 10
    };

    const handleRateUpdate = (rates) => {
      setLastUpdate(new Date());
      // In a full chart implementation, we'd update chart data state here
    };

    socket.on('new_alert', handleNewAlert);
    socket.on('rate_updated', handleRateUpdate);

    return () => {
      socket.off('new_alert', handleNewAlert);
      socket.off('rate_updated', handleRateUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-end justify-between">
          <div>
            <div className="h-8 bg-surface-elevated rounded w-64 mb-2"></div>
            <div className="h-4 bg-surface-elevated rounded w-48"></div>
          </div>
          <div className="h-10 bg-surface-elevated rounded w-40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-elevated rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-surface-elevated rounded w-24"></div>
                <div className="h-6 bg-surface-elevated rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-5 h-64 bg-surface-elevated"></div>
          <div className="card p-5 h-64 bg-surface-elevated"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="text-risk-high mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h2>
        <p className="text-slate-400 mb-6">There was an error communicating with the server.</p>
        <button onClick={fetchSummary} className="btn-primary">Try Again</button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Eksposur (USD)',
      value: formatCur(data.total_exposure_usd),
      icon: TrendingUp,
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/10',
    },
    {
      title: 'Hedging Coverage',
      value: `${data.hedging_coverage_pct}%`,
      icon: ShieldCheck,
      color: 'text-risk-low',
      bg: 'bg-risk-low/10',
    },
    {
      title: 'Pending Approvals',
      value: data.pending_approvals_count,
      icon: Clock,
      color: 'text-risk-medium',
      bg: 'bg-risk-medium/10',
    },
    {
      title: 'Risiko Tinggi (30hr)',
      value: data.high_risk_count,
      icon: AlertTriangle,
      color: 'text-risk-high',
      bg: 'bg-risk-high/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Selamat datang, {user?.nama?.split(' ')[0]}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-sm">
              Ringkasan posisi keuangan dan risiko hari ini.
            </p>
            <span className="flex items-center gap-1 text-[10px] text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20 ml-2">
              <RefreshCcw size={10} className="animate-spin-slow" /> Updated {Math.floor((new Date() - lastUpdate) / 1000)}s ago
            </span>
          </div>
        </div>
        <Link to="/transactions" className="btn-primary">
          + Buat Transaksi Baru
        </Link>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="card p-5 flex items-center gap-4 border border-surface-elevated hover:border-surface-highlight transition-colors">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
              <kpi.icon className={kpi.color} size={24} />
            </div>
            <div>
              <p className="stat-label mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Content (Left) ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Currencies */}
          <div className="card p-5">
            <h3 className="text-white font-medium mb-4">Volume Mata Uang (30 Hari)</h3>
            <div className="space-y-4">
              {data.top_currencies_30d?.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-xs font-bold text-white">
                      {c.mata_uang_asal}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{c.jumlah_transaksi} Transaksi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-white">
                      {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(c.total_volume)}
                    </p>
                  </div>
                </div>
              ))}
              {(!data.top_currencies_30d || data.top_currencies_30d.length === 0) && (
                <p className="text-slate-500 text-sm">Belum ada data transaksi.</p>
              )}
            </div>
          </div>

        </div>

        {/* ── Sidebar (Right) ───────────────────────────────────────────────── */}
        <div className="space-y-6">
          
          {/* Peringatan Risiko */}
          <div className="card p-5 border border-risk-high/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-risk-high"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Bell size={16} className="text-risk-high" /> Peringatan Aktif
              </h3>
            </div>
            
            <div className="space-y-3">
              {localAlerts?.map((alert) => (
                <div key={alert.id_peringatan} className="p-3 bg-surface-elevated/50 rounded-lg border border-surface-highlight">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-risk-high uppercase">
                      {alert.level_keparahan}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(alert.timestamp_peringatan || alert.tanggal_dibuat).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-snug">
                    {alert.pesan_peringatan}
                  </p>
                </div>
              ))}
              {localAlerts.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">Semua aman. Tidak ada peringatan.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
