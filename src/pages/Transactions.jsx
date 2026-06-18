import { useState, useEffect } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useTransactions from '../hooks/useTransactions';

const statusClasses = {
  settled:   'bg-risk-low/15 text-risk-low',
  completed: 'bg-risk-low/15 text-risk-low',
  pending:   'bg-risk-medium/15 text-risk-medium',
  processing:'bg-risk-medium/15 text-risk-medium',
  failed:    'bg-risk-high/15 text-risk-high',
  cancelled: 'bg-risk-high/15 text-risk-high',
};

function fmt(n, ccy) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n) + ' ' + ccy;
}

export default function Transactions() {
  const { user } = useAuthStore();
  const { data: transactions, loading, fetchTransactions, approveTransaction } = useTransactions();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleApprove = async (id) => {
    if (!confirm('Setujui transaksi ini?')) return;
    try {
      await approveTransaction(id);
    } catch (e) {
      // Error handled globally via api.js interceptor
    }
  };

  const filtered = (transactions || []).filter(t =>
    t.nomor_referensi.toLowerCase().includes(search.toLowerCase()) || 
    (t.catatan || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Daftar Transaksi</h1>
          <p className="text-slate-400 text-sm">Kelola seluruh transaksi valuta asing internasional.</p>
        </div>
        {(user?.peran === 'treasury_officer' || user?.peran === 'admin') && (
          <button className="btn-primary">New Payment</button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full bg-surface-card border border-surface-elevated rounded-lg pl-9 pr-4 py-2
                       text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-teal"
            placeholder="Cari referensi atau catatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-ghost flex items-center gap-1.5"><Filter size={14} /> Filter</button>
        <button className="btn-ghost flex items-center gap-1.5"><Download size={14} /> Export</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-4 bg-surface-elevated rounded w-1/4"></div>
                <div className="h-4 bg-surface-elevated rounded w-1/4"></div>
                <div className="h-4 bg-surface-elevated rounded w-1/4"></div>
                <div className="h-4 bg-surface-elevated rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-elevated text-left">
                  <th className="px-4 py-3 stat-label font-medium whitespace-nowrap">Referensi</th>
                  <th className="px-4 py-3 stat-label font-medium whitespace-nowrap">Tanggal</th>
                  <th className="px-4 py-3 stat-label font-medium whitespace-nowrap text-right">Nilai IDR</th>
                  <th className="px-4 py-3 stat-label font-medium whitespace-nowrap">Pasangan</th>
                  <th className="px-4 py-3 stat-label font-medium whitespace-nowrap">Tipe</th>
                  <th className="px-4 py-3 stat-label font-medium whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 stat-label font-medium whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-elevated">
                {filtered.map(t => (
                  <tr key={t.id_transaksi} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-white text-xs">{t.nomor_referensi}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 max-w-[120px] truncate" title={t.catatan}>
                        {t.catatan || 'Tanpa catatan'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(t.tanggal_transaksi).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-white">{fmt(t.jumlah_mata_uang_asal, '')} IDR</div>
                      <div className="text-slate-500 text-xs">≈ {fmt(t.jumlah_mata_uang_tujuan, t.kode_mata_uang_tujuan)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">IDR</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-xs font-bold text-accent-cyan">{t.kode_mata_uang_tujuan}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.tipe_transaksi === 'outbound' ? (
                        <span className="flex items-center gap-1 text-risk-medium text-xs">
                          <ArrowUpRight size={12} /> Out
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-risk-low text-xs">
                          <ArrowDownLeft size={12} /> In
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${statusClasses[t.status] || 'bg-slate-500/20 text-slate-400'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.status === 'pending' && (user?.peran === 'finance_manager' || user?.peran === 'admin') ? (
                        <button onClick={() => handleApprove(t.id_transaksi)} className="text-xs bg-risk-low/20 text-risk-low hover:bg-risk-low/30 px-2 py-1 rounded transition-colors border border-risk-low/50">
                          Approve
                        </button>
                      ) : (
                        <button className="text-accent-teal hover:text-white transition-colors text-xs border border-transparent hover:border-surface-elevated px-2 py-1 rounded">View</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      Tidak ada transaksi yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}