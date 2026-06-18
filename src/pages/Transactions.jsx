import { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import useTransactions from '../hooks/useTransactions';

function fmt(n) {
  return new Intl.NumberFormat('en-US', { notation: 'standard', maximumFractionDigits: 2 }).format(n);
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
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-4 max-w-full">
      {/* Page Header & Actions */}
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface m-0">Payment Transactions</h1>
        </div>
        <div>
          {(user?.peran === 'treasury_officer' || user?.peran === 'admin') && (
            <button className="h-button_height bg-[#0891B2] text-white px-4 rounded-lg font-label-xs text-label-xs flex items-center gap-2 hover:bg-[#067A96] transition-colors cursor-pointer active:opacity-80">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Transaction
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-brand-midnight-card ghost-border rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Search</label>
          <div className="relative teal-focus ghost-border rounded bg-brand-midnight-base h-8 flex items-center px-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] mr-2">search</span>
            <input 
              className="bg-transparent border-none outline-none text-white font-data-mono text-data-mono w-full p-0 h-full focus:ring-0" 
              placeholder="TXN ID, Reference..." 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="w-32">
          <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Status</label>
          <div className="relative teal-focus ghost-border rounded bg-brand-midnight-base h-8 flex items-center px-2 cursor-pointer">
            <select className="appearance-none bg-transparent border-none outline-none text-white font-body text-body w-full p-0 h-full focus:ring-0 cursor-pointer">
              <option>All Status</option>
              <option>Pending</option>
              <option>Settled</option>
            </select>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] absolute right-2 pointer-events-none">expand_more</span>
          </div>
        </div>
        <div className="w-32">
          <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Risk Level</label>
          <div className="relative teal-focus ghost-border rounded bg-brand-midnight-base h-8 flex items-center px-2 cursor-pointer">
            <select className="appearance-none bg-transparent border-none outline-none text-white font-body text-body w-full p-0 h-full focus:ring-0 cursor-pointer">
              <option>All Risk</option>
              <option>High</option>
              <option>Low</option>
            </select>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] absolute right-2 pointer-events-none">expand_more</span>
          </div>
        </div>
        <div className="w-32">
          <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Currency</label>
          <div className="relative teal-focus ghost-border rounded bg-brand-midnight-base h-8 flex items-center px-2 cursor-pointer">
            <select className="appearance-none bg-transparent border-none outline-none text-white font-body text-body w-full p-0 h-full focus:ring-0 cursor-pointer">
              <option>All Pairs</option>
              <option>USD/IDR</option>
              <option>EUR/IDR</option>
            </select>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] absolute right-2 pointer-events-none">expand_more</span>
          </div>
        </div>
        <div className="w-48">
          <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Date Range</label>
          <div className="relative teal-focus ghost-border rounded bg-brand-midnight-base h-8 flex items-center px-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] mr-2">calendar_today</span>
            <input className="bg-transparent border-none outline-none text-white font-data-mono text-data-mono w-full p-0 h-full focus:ring-0" type="text" defaultValue="Oct 1 - Oct 31"/>
          </div>
        </div>
        <button className="h-8 px-3 rounded ghost-border text-on-surface-variant hover:text-white hover:bg-surface-variant/50 transition-colors font-label-xs text-label-xs flex items-center cursor-pointer">
            Clear
        </button>
      </div>

      {/* Data Table Card */}
      <div className="bg-brand-midnight-card ghost-border rounded-xl flex-1 flex flex-col overflow-hidden min-h-[400px]">
        <div className="px-4 py-3 border-b border-brand-midnight-border flex justify-between items-center">
          <h2 className="font-h2 text-h2 text-on-surface m-0">Recent Transactions</h2>
          <span className="font-label-xs text-label-xs text-on-surface-variant">Showing {filtered.length} records</span>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-surface-elevated rounded w-full"></div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-brand-table-header-bg sticky top-0 z-10 ghost-border">
                <tr>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase">#</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase">Reference</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase">Pair</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase text-right">Amount</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase text-right">IDR Exposure</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase">Risk Score</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase">Level</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase">Status</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase">Date</th>
                  <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="font-data-mono text-data-mono">
                {filtered.map((t, idx) => {
                  const riskLevel = t.level_risiko || 'rendah';
                  const isHigh = riskLevel === 'tinggi';
                  const isMed = riskLevel === 'menengah';
                  
                  const rowClass = `hover:bg-surface-variant/30 transition-colors ghost-border ${idx % 2 === 0 ? 'table-row-alt' : ''} ${isHigh ? 'border-l-2 border-l-[#DC2626]' : isMed ? 'border-l-2 border-l-[#F59E0B]' : 'border-l-2 border-l-[#22C55E]'}`;
                  
                  return (
                    <tr key={t.id_transaksi} className={rowClass}>
                      <td className="py-2 px-4 text-on-surface-variant">{idx + 1}</td>
                      <td className="py-2 px-4 text-white">{t.nomor_referensi}</td>
                      <td className="py-2 px-4 text-on-surface-variant">{t.mata_uang_dari}/{t.mata_uang_ke}</td>
                      <td className="py-2 px-4 text-white text-right">{fmt(t.jumlah_dari)}</td>
                      <td className="py-2 px-4 text-primary text-right">{fmt(t.jumlah_dari * 15500)}</td> {/* Mock IDR */}
                      <td className="py-2 px-4">
                        <div className="w-[80px] h-1.5 bg-brand-midnight-base rounded-full overflow-hidden">
                          <div className={`h-full ${isHigh ? 'bg-[#DC2626]' : isMed ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'}`} style={{width: isHigh ? '85%' : isMed ? '50%' : '15%'}}></div>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        {isHigh ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(220,38,38,0.2)] text-[#DC2626] border border-[#DC2626]">HIGH</span>
                        ) : isMed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#B45309]/20 text-[#F59E0B] border border-[#F59E0B]">MED</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(22,163,74,0.2)] text-[#22C55E] border border-[#16A34A]">LOW</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {t.status === 'pending' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#B45309]/20 text-[#F59E0B] border border-[#F59E0B]">PENDING</span>
                        ) : t.status === 'completed' || t.status === 'settled' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(22,163,74,0.2)] text-[#22C55E] border border-[#16A34A]">SETTLED</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(220,38,38,0.2)] text-[#DC2626] border border-[#DC2626] uppercase">{t.status}</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-on-surface-variant">{t.tanggal_transaksi?.split('T')[0]}</td>
                      <td className="py-2 px-4 text-center">
                        {(user?.peran === 'finance_manager' || user?.peran === 'admin') && t.status === 'pending' ? (
                          <button onClick={() => handleApprove(t.id_transaksi)} className="text-brand-teal hover:text-white mr-2 text-[10px] font-bold ghost-border px-2 rounded bg-surface-elevated cursor-pointer">APPROVE</button>
                        ) : null}
                        <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}