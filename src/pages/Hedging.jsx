import { useState, useEffect } from 'react';
import useHedging from '../hooks/useHedging';
import useAuthStore from '../stores/authStore';

function formatCur(val, ccy = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: ccy,
    minimumFractionDigits: 2
  }).format(val || 0);
}

export default function Hedging() {
  const { user } = useAuthStore();
  const {
    data: hedges,
    loading,
    error,
    recommendation,
    recommending,
    fetchHedges,
    getRecommendation
  } = useHedging();

  const [form, setForm] = useState({
    mata_uang_dari: 'USD',
    mata_uang_ke: 'IDR',
    jumlah: 100000,
    tenor_hari: 30
  });

  useEffect(() => {
    fetchHedges();
  }, [fetchHedges]);

  const handleRecommend = (e) => {
    e.preventDefault();
    getRecommendation(form.mata_uang_dari, form.mata_uang_ke, form.jumlah, form.tenor_hari);
  };

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end w-full">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Hedging Management</h1>
        </div>
        <div>
          <button className="h-button_height bg-transparent text-brand-teal border border-brand-teal px-6 rounded-lg font-label-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-teal/10 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Hedge
          </button>
        </div>
      </div>

      {/* Top Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Hedging Analysis Form */}
        <div className="lg:col-span-4 bg-brand-midnight-card ghost-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-brand-midnight-border">
            <h2 className="font-h3-caps text-h3-caps text-primary tracking-widest uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              Analyze Hedge
            </h2>
          </div>
          <div className="p-4 flex-1">
            <form onSubmit={handleRecommend} className="space-y-4">
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Exposure Type</label>
                <select className="w-full bg-brand-midnight-base border border-brand-midnight-border text-[#F8FAFC] rounded p-2 font-data-mono text-data-mono h-10 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal">
                  <option>Accounts Payable</option>
                  <option>Accounts Receivable</option>
                  <option>Forecasted Revenue</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Pair</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={form.mata_uang_dari}
                      onChange={e => setForm({ ...form, mata_uang_dari: e.target.value })}
                      className="w-full bg-brand-midnight-base border border-brand-midnight-border text-[#F8FAFC] rounded p-2 font-data-mono text-data-mono h-10 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>SGD</option>
                    </select>
                    <span className="text-on-surface-variant">/</span>
                    <select
                      value={form.mata_uang_ke}
                      onChange={e => setForm({ ...form, mata_uang_ke: e.target.value })}
                      className="w-full bg-brand-midnight-base border border-brand-midnight-border text-[#F8FAFC] rounded p-2 font-data-mono text-data-mono h-10 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                    >
                      <option>IDR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Tenor (Days)</label>
                  <input
                    type="number"
                    value={form.tenor_hari}
                    onChange={e => setForm({ ...form, tenor_hari: parseInt(e.target.value) || 0 })}
                    className="w-full bg-brand-midnight-base border border-brand-midnight-border text-[#F8FAFC] rounded p-2 font-data-mono text-data-mono h-10 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Exposure Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-mono text-on-surface-variant">$</span>
                  <input
                    type="number"
                    value={form.jumlah}
                    onChange={e => setForm({ ...form, jumlah: parseInt(e.target.value) || 0 })}
                    className="w-full bg-brand-midnight-base border border-brand-midnight-border text-[#F8FAFC] rounded p-2 pl-8 font-data-mono text-data-mono h-10 text-right focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Risk Tolerance</label>
                <input className="w-full accent-primary" max="100" min="0" type="range" defaultValue="20" />
                <div className="flex justify-between mt-1 text-[10px] text-on-surface-variant uppercase font-data-mono">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-outline-variant/30">
                <button
                  type="submit"
                  disabled={recommending}
                  className="w-full h-button_height bg-brand-teal text-white rounded-lg font-label-xs uppercase tracking-wider flex justify-center items-center gap-2 hover:bg-[#067A96] transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">model_training</span>
                  {recommending ? 'Generating...' : 'Generate AI Recommendation'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: AI Recommendation Result */}
        <div className="lg:col-span-8 bg-brand-midnight-card ghost-border rounded-xl flex flex-col relative overflow-hidden">
          {/* Subtle AI Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="p-4 border-b border-brand-midnight-border flex justify-between items-center bg-[#1E2D44]/50">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
              <h2 className="font-h3-caps text-h3-caps text-tertiary tracking-widest uppercase">Gemini AI Recommendation</h2>
            </div>
            {recommendation && (
              <span className="bg-[rgba(22,163,74,0.2)] text-[#22C55E] border border-[#16A34A] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                High Confidence
              </span>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col gap-6">
            {!recommendation && !recommending ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">analytics</span>
                <p className="text-on-surface-variant text-sm max-w-sm">Enter exposure details on the left and generate a recommendation to see AI-driven hedging strategies.</p>
              </div>
            ) : recommending ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
              </div>
            ) : (
              <>
                {/* Recommendation Banner */}
                <div className="bg-[#0F1B2D] border border-tertiary/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-h2 text-h2 text-on-surface mb-1">
                      {recommendation.rekomendasi_instrumen === 'forward' ? 'Forward Contract' : 'Options Contract'}
                    </h3>
                    <p className="font-body text-[12px] text-on-surface-variant">{recommendation.analisis}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="font-label-xs text-on-surface-variant uppercase mb-1">Suggested Ratio</div>
                    <div className="font-data-mono text-[18px] text-tertiary">100% Hedged</div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-[#0F1B2D] border border-outline-variant/30 rounded flex flex-col">
                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-2">Hedged Amount</span>
                    <span className="font-data-mono text-[16px] text-on-surface text-right mt-auto">{formatCur(form.jumlah, form.mata_uang_dari)}</span>
                  </div>
                  <div className="p-3 bg-[#0F1B2D] border border-outline-variant/30 rounded flex flex-col">
                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-2">Forward Rate</span>
                    <span className="font-data-mono text-[16px] text-primary text-right mt-auto">{formatCur(recommendation.simulasi_rate, form.mata_uang_ke)}</span>
                  </div>
                  <div className="p-3 bg-[#0F1B2D] border border-outline-variant/30 rounded flex flex-col">
                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-2">Unhedged Risk</span>
                    <span className="font-data-mono text-[16px] text-[#DC2626] text-right mt-auto">~{formatCur(recommendation.simulasi_rate * 1.05, form.mata_uang_ke)}</span>
                  </div>
                  <div className="p-3 bg-[#0F1B2D] border border-outline-variant/30 rounded flex flex-col justify-center items-center">
                    <button className="w-full h-full min-h-[40px] bg-brand-teal text-white rounded font-label-xs uppercase tracking-wider hover:bg-[#067A96] transition-colors">
                      Execute
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Hedges Table */}
      <div className="bg-brand-midnight-card ghost-border rounded-xl flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-midnight-border flex justify-between items-center bg-[#1E2D44]/30">
          <h2 className="font-h2 text-h2 text-on-surface m-0">Active Hedge Portfolio</h2>
          <span className="font-label-xs text-label-xs text-on-surface-variant">Showing {hedges?.length || 0} positions</span>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 space-y-4 animate-pulse">
              <div className="h-8 bg-surface-elevated rounded w-full"></div>
              <div className="h-8 bg-surface-elevated rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">Error loading hedges.</div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#1E2D44] sticky top-0 z-10 ghost-border">
                <tr>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Reference</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Pair</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase text-right">Notional</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Instrument</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase text-right">Rate</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Maturity</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="font-data-mono text-data-mono">
                {hedges?.map((h, idx) => (
                  <tr key={h.id_hedging} className={`hover:bg-surface-variant/30 transition-colors ghost-border ${idx % 2 === 0 ? 'table-row-alt' : ''}`}>
                    <td className="py-2 px-4 text-white">HDG-{h.id_hedging.substring(0, 8)}</td>
                    <td className="py-2 px-4 text-on-surface-variant">{h.transaksi_terkait?.mata_uang_dari}/{h.transaksi_terkait?.mata_uang_ke}</td>
                    <td className="py-2 px-4 text-white text-right">{formatCur(h.transaksi_terkait?.jumlah_dari)}</td>
                    <td className="py-2 px-4 text-primary uppercase">{h.jenis_instrumen}</td>
                    <td className="py-2 px-4 text-white text-right">{formatCur(h.rate_dikunci, '')}</td>
                    <td className="py-2 px-4 text-on-surface-variant">{new Date(h.tanggal_jatuh_tempo).toLocaleDateString()}</td>
                    <td className="py-2 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(22,163,74,0.2)] text-[#22C55E] border border-[#16A34A] uppercase">
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
