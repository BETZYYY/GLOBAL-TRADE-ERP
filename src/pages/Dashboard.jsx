import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  name: `Day ${i + 1}`,
  USD: 15000 + Math.random() * 500,
  EUR: 16500 + Math.random() * 600,
  JPY: 100 + Math.random() * 5,
  GBP: 19000 + Math.random() * 700,
}));

const severityMap = {
  kritis: 'CRITICAL',
  tinggi: 'HIGH',
  sedang: 'MEDIUM',
  rendah: 'LOW'
};

const severityColorMap = {
  CRITICAL: { bg: 'bg-[#1E2D44]', border: 'border-l-4 border-l-[#DC2626] border-y border-r border-y-[#1E3A5F] border-r-[#1E3A5F]', text: 'text-[#DC2626]' },
  HIGH: { bg: 'bg-[#1E2D44]', border: 'border-l-4 border-l-[#F97316] border-y border-r border-y-[#1E3A5F] border-r-[#1E3A5F]', text: 'text-[#F97316]' },
  WARNING: { bg: 'bg-[#1E2D44]', border: 'border-l-4 border-l-[#F59E0B] border-y border-r border-y-[#1E3A5F] border-r-[#1E3A5F]', text: 'text-[#F59E0B]' },
  INFO: { bg: 'bg-[#1E2D44]', border: 'border-l-4 border-l-[#0891B2] border-y border-r border-y-[#1E3A5F] border-r-[#1E3A5F]', text: 'text-[#0891B2]' }
};

const mockAlerts = [
  { id_peringatan: 1, tingkat_keparahan: 'CRITICAL', title: 'Approval Overdue', pesan_peringatan: 'TRX-2026-0042 pending 3 days', time: '10 mins ago' },
  { id_peringatan: 2, tingkat_keparahan: 'HIGH', title: 'Volatility Spike', pesan_peringatan: 'USD/IDR exceeded 2.5% in 24h', time: '1 hour ago' },
  { id_peringatan: 3, tingkat_keparahan: 'WARNING', title: 'Hedge Expiring', pesan_peringatan: 'HDG-0089 expires in 5 days', time: '2 hours ago' }
];

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
        <div className="h-8 bg-brand-midnight-card rounded w-64 mb-2"></div>
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

  const { 
    total_exposure = 4280000, 
    hedging_coverage = 68, 
    pending_approvals = 7, 
    high_risk_transactions = 12 
  } = data || {};

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-4 max-w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface m-0">Dashboard Overview</h1>
          <p className="font-label-xs text-label-xs text-on-surface-variant mt-1">
            Summary of financial positions and risk today.
          </p>
        </div>
        <div>
          <button className="h-button_height bg-transparent border border-[#0891B2] text-[#0891B2] px-4 rounded-lg font-label-xs text-label-xs flex items-center gap-2 hover:bg-[#0891B2]/10 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exposure */}
        <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-5 flex flex-col justify-between hover:border-[#0891B2] transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Total Exposure</h3>
            <span className="material-symbols-outlined text-[#0891B2]">trending_up</span>
          </div>
          <div className="mt-4">
            <div className="font-h1 text-[28px] font-bold text-white tracking-tight">{formatCur(total_exposure)}</div>
          </div>
        </div>
        
        {/* High Risk */}
        <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-5 flex flex-col justify-between hover:border-[#0891B2] transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">High Risk Payments</h3>
            <span className="material-symbols-outlined text-[#DC2626]">warning</span>
          </div>
          <div className="mt-4">
            <div className="font-h1 text-[28px] font-bold text-[#DC2626] tracking-tight">{high_risk_transactions}</div>
          </div>
        </div>

        {/* Hedging */}
        <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-5 flex flex-col justify-between hover:border-[#0891B2] transition-colors relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Hedging Coverage</h3>
            <span className="material-symbols-outlined text-[#22C55E]">security</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="font-h1 text-[28px] font-bold text-white tracking-tight">{Math.round(hedging_coverage || 0)}%</div>
            <div className="relative w-12 h-12">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-[#1E3A5F]" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#0891B2]" strokeWidth="3" strokeDasharray={`${hedging_coverage}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               </svg>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-5 flex flex-col justify-between hover:border-[#0891B2] transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Pending Approvals</h3>
            <span className="material-symbols-outlined text-[#F59E0B]">schedule</span>
          </div>
          <div className="mt-4">
            <div className="font-h1 text-[28px] font-bold text-[#F59E0B] tracking-tight">{pending_approvals}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-[#16243B] border border-[#1E3A5F] rounded-xl flex flex-col min-h-[400px] p-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-h2 text-h2 text-white m-0">Exchange Rate Trends — 30 Day</h2>
            <span className="px-2 py-0.5 rounded border border-[#1E3A5F] bg-[#0F1B2D] text-[10px] text-on-surface-variant flex items-center">
              <span className="material-symbols-outlined text-[10px] mr-1">sync</span>
              Updated {Math.round((new Date() - lastUpdate)/1000)}s ago
            </span>
          </div>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value.toLocaleString()}`} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F1B2D', borderColor: '#1E3A5F', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                <Line type="monotone" dataKey="USD" stroke="#0891B2" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="EUR" stroke="#06B6D4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="JPY" stroke="#D97706" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="GBP" stroke="#475569" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#1E3A5F] flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase">Volatility Index</span>
                <span className="font-data-mono text-data-mono text-[#D97706] font-bold">14.2%</span>
              </div>
            </div>
            
            <div className="relative w-full h-2 rounded-full overflow-visible mt-2" style={{ background: 'linear-gradient(to right, #0D9488, #D97706, #DC2626)' }}>
              {/* Diamond Marker at ~42% */}
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border border-[#1E3A5F] shadow-sm" style={{ left: '42%', marginLeft: '-6px' }}></div>
            </div>
            
            <div className="flex justify-between items-center w-full mt-1">
              <span className="text-[10px] text-on-surface-variant font-bold">LOW</span>
              <span className="text-[10px] text-on-surface-variant font-bold">MEDIUM</span>
              <span className="text-[10px] text-on-surface-variant font-bold">HIGH</span>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl flex flex-col min-h-[400px]">
          <div className="px-4 py-3 border-b border-[#1E3A5F] flex justify-between items-center">
            <h2 className="font-h2 text-h2 text-on-surface m-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#D97706]">notifications_active</span>
              Risk Alerts
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {mockAlerts.map(alert => {
              const severity = alert.tingkat_keparahan;
              const colors = severityColorMap[severity] || severityColorMap.WARNING;
              return (
                <div key={alert.id_peringatan} className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase ${colors.text} bg-[#0F1B2D] px-2 py-0.5 rounded border border-[#1E3A5F]`}>
                        {severity}
                      </span>
                      <span className="font-body text-body font-bold text-white text-sm">{alert.title}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant">{alert.time}</span>
                  </div>
                  <p className="font-body text-body text-on-surface-variant text-sm mt-1">{alert.pesan_peringatan}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* High Risk Transactions Table */}
      <div className="mt-2 bg-[#16243B] border border-[#1E3A5F] rounded-xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1E3A5F] flex justify-between items-center bg-[#1E2D44]/30">
          <h2 className="font-h2 text-h2 text-white m-0">High Risk Transactions</h2>
          <Link to="/transactions" className="text-[#0891B2] hover:text-white text-sm transition-colors cursor-pointer flex items-center gap-1">
            View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1B2D] border-b border-[#1E3A5F]">
                <th className="py-3 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ref No</th>
                <th className="py-3 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pair</th>
                <th className="py-3 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Amount</th>
                <th className="py-3 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">IDR Exposure</th>
                <th className="py-3 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Risk Score</th>
                <th className="py-3 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Risk Level</th>
                <th className="py-3 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="py-3 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]">
              {[
                { ref: 'TRX-2026-0042', pair: 'USD/IDR', amount: '$150,000', idr: 'Rp 2.4B', score: 85, level: 'HIGH', status: 'PENDING' },
                { ref: 'TRX-2026-0043', pair: 'EUR/IDR', amount: '€85,000', idr: 'Rp 1.4B', score: 72, level: 'HIGH', status: 'UNHEDGED' },
                { ref: 'TRX-2026-0044', pair: 'JPY/IDR', amount: '¥12.5M', idr: 'Rp 1.3B', score: 45, level: 'MEDIUM', status: 'PENDING' },
                { ref: 'TRX-2026-0045', pair: 'GBP/IDR', amount: '£45,000', idr: 'Rp 880M', score: 88, level: 'HIGH', status: 'UNHEDGED' },
                { ref: 'TRX-2026-0046', pair: 'USD/IDR', amount: '$60,000', idr: 'Rp 960M', score: 55, level: 'MEDIUM', status: 'PENDING' }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#1E2D44]/30 transition-colors">
                  <td className="py-3 px-5 font-data-mono text-sm text-white">{row.ref}</td>
                  <td className="py-3 px-5 font-data-mono text-sm text-on-surface-variant">{row.pair}</td>
                  <td className="py-3 px-5 font-data-mono text-sm text-white">{row.amount}</td>
                  <td className="py-3 px-5 font-data-mono text-sm text-[#0891B2]">{row.idr}</td>
                  <td className="py-3 px-5 font-data-mono text-sm text-white">{row.score}</td>
                  <td className="py-3 px-5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${row.level === 'HIGH' ? 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30' : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'}`}>
                      {row.level}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-sm text-on-surface-variant">{row.status}</td>
                  <td className="py-3 px-5">
                    <button className="text-[#0891B2] hover:text-white transition-colors cursor-pointer text-sm">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
