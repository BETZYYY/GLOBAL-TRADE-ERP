import { useState, useEffect } from 'react';
import useHedging from '../hooks/useHedging';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';

const formatCur = (value) => {
  if (value === null || value === undefined || isNaN(value)) 
    return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value))
}

export default function Hedging() {
  const { user } = useAuthStore();
  const {
    data: hedges,
    loading,
    error,
    fetchHedging,
    recommendHedging,
    executeHedging
  } = useHedging();

  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [showNewHedge, setShowNewHedge] = useState(false);
  const [hedgeFormData, setHedgeFormData] = useState({
    id_transaksi: '',
    tipe_hedging: 'forward',
    nilai_kontrak: '',
    mata_uang: 'USD',
    tanggal_mulai: '',
    tanggal_jatuh_tempo: '',
    biaya_premium: '',
    institusi_keuangan: ''
  });

  const mockHedgingData = [
    { id_hedging: '827a3c1f', tipe_hedging: 'forward', transaksi_terkait: { mata_uang_dari: 'USD', mata_uang_ke: 'IDR' }, nilai_kontrak: 500000, nilai_tukar_terkunci: 15600.00, biaya_premium: 2500, tanggal_jatuh_tempo: '2026-06-25', status_hedging: 'aktif' },
    { id_hedging: '9a1b2c3d', tipe_hedging: 'option', transaksi_terkait: { mata_uang_dari: 'EUR', mata_uang_ke: 'IDR' }, nilai_kontrak: 250000, nilai_tukar_terkunci: 16800.00, biaya_premium: 3200, tanggal_jatuh_tempo: '2026-08-15', status_hedging: 'aktif' }
  ];

  const displayData = hedges?.length > 0 ? hedges : mockHedgingData;

  const [form, setForm] = useState({
    mata_uang_dari: 'USD',
    mata_uang_ke: 'IDR',
    jumlah: 100000,
    target_date: '2026-10-15'
  });

  useEffect(() => {
    fetchHedging();
  }, [fetchHedging]);

  const handleRecommend = async (e) => {
    e.preventDefault();
    if (!form.mata_uang_dari || !form.jumlah) {
      toast.error('Please fill Currency Pair and Exposure Amount');
      return;
    }
    setIsLoading(true);
    try {
      const result = await recommendHedging({
        currency_pair: `${form.mata_uang_dari}/${form.mata_uang_ke}`,
        exposure_amount: Number(form.jumlah),
        target_date: form.target_date,
        risk_tolerance: form.risk_tolerance || 20
      });
      setRecommendation(result);
    } catch (err) {
      console.error('Recommendation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewHedgeSubmit = async (e) => {
    e.preventDefault();
    try {
      await executeHedging(hedgeFormData);
      setShowNewHedge(false);
      fetchHedging();
    } catch (err) {
      console.error('Failed to create hedge:', err);
    }
  };

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-6 max-w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end w-full">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Hedging Management</h1>
        </div>
        <div>
          <button onClick={() => setShowNewHedge(true)} className="h-button_height bg-[#0891B2] text-white px-4 rounded-lg font-label-xs text-label-xs flex items-center gap-2 hover:bg-[#067A96] transition-colors cursor-pointer active:opacity-80">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Hedge
          </button>
        </div>
      </div>

      {/* Top Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Hedging Analysis Form */}
        <div className="lg:col-span-4 bg-[#16243B] border border-[#1E3A5F] rounded-xl flex flex-col">
          <div className="p-4 border-b border-[#1E3A5F]">
            <h2 className="font-h3-caps text-h3-caps text-[#06B6D4] tracking-widest uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              Analyze Hedge
            </h2>
          </div>
          <div className="p-4 flex-1">
            <form onSubmit={handleRecommend} className="space-y-4">
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Exposure Type</label>
                <select className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-[#F8FAFC] rounded p-2 font-data-mono text-data-mono h-10 focus:outline-none focus:border-[#0891B2]">
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
                      className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-[#F8FAFC] rounded p-2 font-data-mono text-data-mono h-10 focus:outline-none focus:border-[#0891B2]"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>SGD</option>
                    </select>
                    <span className="text-on-surface-variant">/</span>
                    <select
                      value={form.mata_uang_ke}
                      onChange={e => setForm({ ...form, mata_uang_ke: e.target.value })}
                      className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-[#F8FAFC] rounded p-2 font-data-mono text-data-mono h-10 focus:outline-none focus:border-[#0891B2]"
                    >
                      <option>IDR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={e => setForm({ ...form, target_date: e.target.value })}
                    className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-[#F8FAFC] rounded p-2 font-data-mono text-data-mono h-10 focus:outline-none focus:border-[#0891B2] [color-scheme:dark]"
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
                    className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-[#F8FAFC] rounded p-2 pl-8 font-data-mono text-data-mono h-10 text-right focus:outline-none focus:border-[#0891B2]"
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

              <div className="pt-4 mt-4 border-t border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={handleRecommend}
                  disabled={isLoading}
                  className="w-full h-button_height bg-[#0891B2] text-white rounded-lg font-label-xs uppercase tracking-wider flex justify-center items-center gap-2 hover:bg-[#067A96] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">model_training</span>
                  {isLoading ? 'Analyzing...' : 'Generate AI Recommendation'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: AI Recommendation Result */}
        <div className="lg:col-span-8 bg-[#16243B] border border-[#1E3A5F] rounded-xl flex flex-col relative overflow-hidden">
          {/* Subtle AI Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0891B2]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="p-4 border-b border-[#1E3A5F] flex justify-between items-center bg-[#1E2D44]/50 z-10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#06B6D4]">auto_awesome</span>
              <h2 className="font-h3-caps text-h3-caps text-[#06B6D4] tracking-widest uppercase">Gemini AI Recommendation</h2>
            </div>
            <span className="bg-[rgba(22,163,74,0.2)] text-[#22C55E] border border-[#16A34A] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              High Confidence
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-6 z-10 overflow-y-auto">
            {/* Recommendation Banner */}
            <div className="bg-[#0F1B2D] border border-[#0891B2]/30 p-4 rounded-lg flex items-center justify-between shadow-[0_0_15px_rgba(8,145,178,0.1)]">
              <div>
                <h3 className="font-h2 text-h2 text-white mb-1">
                  Forward Contract
                </h3>
                <p className="font-body text-[12px] text-on-surface-variant">Optimal protection against downside risk with zero upfront premium for this tenor.</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="font-label-xs text-on-surface-variant uppercase mb-1">Suggested Ratio</div>
                <div className="font-data-mono text-[18px] text-[#06B6D4] font-bold">100% Hedged</div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-[#0F1B2D] border border-[#1E3A5F] rounded flex flex-col">
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-2">Hedged Amount</span>
                <span className="font-data-mono text-[16px] text-white text-right mt-auto font-bold">{formatCur(form.jumlah, form.mata_uang_dari)}</span>
              </div>
              <div className="p-3 bg-[#0F1B2D] border border-[#1E3A5F] rounded flex flex-col">
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-2">Forward Rate</span>
                <span className="font-data-mono text-[16px] text-[#06B6D4] text-right mt-auto font-bold">15,620.50</span>
              </div>
              <div className="p-3 bg-[#0F1B2D] border border-[#1E3A5F] rounded flex flex-col">
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-2">Est. Cost</span>
                <span className="font-data-mono text-[16px] text-[#F59E0B] text-right mt-auto font-bold">$2,500 USD (1.0%)</span>
              </div>
              <div className="p-3 bg-[#0F1B2D] border border-[#1E3A5F] rounded flex flex-col">
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-2">Effectiveness</span>
                <span className="font-data-mono text-[16px] text-white text-right mt-auto font-bold">91.5%</span>
                <div className="w-full h-1 bg-[#1E3A5F] mt-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0891B2] w-[91.5%]"></div>
                </div>
              </div>
            </div>

            {/* Instrument Comparison Table */}
            <div>
              <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase tracking-widest mb-3">Instrument Comparison</h3>
              <div className="bg-[#0F1B2D] border border-[#1E3A5F] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[#16243B] border-b border-[#1E3A5F]">
                    <tr>
                      <th className="font-h3-caps text-h3-caps text-on-surface-variant py-2 px-4 uppercase">Instrument</th>
                      <th className="font-h3-caps text-h3-caps text-on-surface-variant py-2 px-4 uppercase">Protected Rate</th>
                      <th className="font-h3-caps text-h3-caps text-on-surface-variant py-2 px-4 uppercase text-right">Upfront Premium</th>
                      <th className="font-h3-caps text-h3-caps text-on-surface-variant py-2 px-4 uppercase text-center">Flexibility</th>
                      <th className="font-h3-caps text-h3-caps text-on-surface-variant py-2 px-4 uppercase text-center">AI Rank</th>
                    </tr>
                  </thead>
                  <tbody className="font-data-mono text-data-mono">
                    <tr className="bg-[#0891B2]/10 border-l-2 border-[#0891B2] border-b border-[#1E3A5F]">
                      <td className="py-3 px-4 text-white font-bold">Forward Contract</td>
                      <td className="py-3 px-4 text-on-surface-variant">Locked Rate</td>
                      <td className="py-3 px-4 text-[#F59E0B] text-right">$2,500 (1.0%)</td>
                      <td className="py-3 px-4 text-center text-on-surface-variant">Low</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#0891B2]/20 text-[#06B6D4] border border-[#0891B2]">
                          #1 RECOMMENDED
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-[#1E3A5F] hover:bg-[#16243B] transition-colors cursor-pointer border-l-2 border-transparent">
                      <td className="py-3 px-4 text-white">Vanilla Option</td>
                      <td className="py-3 px-4 text-on-surface-variant">Market Rate</td>
                      <td className="py-3 px-4 text-[#F59E0B] text-right">$3,200 (1.3%)</td>
                      <td className="py-3 px-4 text-center text-[#22C55E]">High</td>
                      <td className="py-3 px-4 text-center text-on-surface-variant">#2</td>
                    </tr>
                    <tr className="hover:bg-[#16243B] transition-colors cursor-pointer border-l-2 border-transparent">
                      <td className="py-3 px-4 text-white">Collar Strategy</td>
                      <td className="py-3 px-4 text-on-surface-variant">Range Rate</td>
                      <td className="py-3 px-4 text-[#F59E0B] text-right">$1,800 (0.7%)</td>
                      <td className="py-3 px-4 text-center text-[#F59E0B]">Med</td>
                      <td className="py-3 px-4 text-center text-on-surface-variant">#3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Active Hedges Table */}
      <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl flex-1 flex flex-col overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-[#1E3A5F] flex justify-between items-center bg-[#1E2D44]/30">
          <h2 className="font-h2 text-h2 text-on-surface m-0">Active Hedging Positions</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 space-y-4 animate-pulse">
              <div className="h-8 bg-surface-elevated rounded w-full"></div>
              <div className="h-8 bg-surface-elevated rounded w-full"></div>
            </div>
          ) : error && !hedges?.length ? (
            <div className="p-8 text-[#DC2626]">
              Error loading hedging data: {error.message || 'API connection failed'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#1E2D44] sticky top-0 z-10 ghost-border">
                <tr>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Hedge ID</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Type</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Pair</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase text-right">Notional</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase text-right">Strike/Rate</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Start Date</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Expiry Date</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Days Remaining</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase">Status</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase text-right">P&L</th>
                  <th className="font-h3-caps text-h3-caps text-[#94A3B8] py-2 px-4 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="font-data-mono text-data-mono">
                {(displayData || []).map((h, idx) => {
                  const isExpiring = idx === 0; // Mock logic
                  const daysRemaining = isExpiring ? 6 : 57;

                  return (
                    <tr key={h?.id_hedging || idx} className={`transition-colors border-b border-[#1E3A5F] ${isExpiring ? 'bg-[#D97706]/5 border-l-2 border-l-[#D97706]' : 'hover:bg-[#16243B] border-l-2 border-l-transparent'}`}>
                      <td className="py-3 px-4 text-white font-bold">HDG-{h?.id_hedging?.substring(0, 6)?.toUpperCase() || 'XXX'}</td>
                      <td className="py-3 px-4 text-[#06B6D4] uppercase">{h?.tipe_hedging ?? '-'}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{h?.transaksi_terkait?.mata_uang_dari || 'USD'}/{h?.transaksi_terkait?.mata_uang_ke || 'IDR'}</td>
                      <td className="py-3 px-4 text-white text-right">{formatCur(h?.nilai_kontrak ?? 0)}</td>
                      <td className="py-3 px-4 text-white text-right">{formatCur(h?.nilai_tukar_terkunci ?? 0)}</td>
                      <td className="py-3 px-4 text-on-surface-variant">2026-05-10</td>
                      <td className="py-3 px-4 text-on-surface-variant">{h?.tanggal_jatuh_tempo?.split('T')[0] || '-'}</td>
                      <td className={`py-3 px-4 font-bold ${isExpiring ? 'text-[#D97706]' : 'text-white'}`}>{daysRemaining} d</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A]/20 text-[#22C55E] border border-[#16A34A] uppercase">
                          {h?.status_hedging ?? 'aktif'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${isExpiring ? 'text-[#DC2626]' : 'text-[#22C55E]'}`}>
                        {isExpiring ? '-$450' : '+$1,250'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="text-on-surface-variant hover:text-white transition-colors cursor-pointer p-1">
                          <span className="material-symbols-outlined text-[16px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-[#1E3A5F] flex justify-between items-center bg-[#0F1B2D]">
          <span className="text-[#94A3B8] text-sm">Showing 1 to {displayData.length} of {displayData.length} positions</span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#1E3A5F] text-[#94A3B8] hover:bg-[#16243B] hover:text-white transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#1E3A5F] text-[#94A3B8] hover:bg-[#16243B] hover:text-white transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

      </div>

      {showNewHedge && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={() => setShowNewHedge(false)}
          ></div>
          <div className="fixed right-0 top-0 h-full w-[480px] bg-[#16243B] border-l border-[#1E3A5F] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-14 border-b border-[#1E3A5F] px-6 flex items-center justify-between shrink-0">
              <h2 className="font-h2 text-h2 text-white m-0">New Hedge</h2>
              <button 
                onClick={() => setShowNewHedge(false)}
                className="text-on-surface-variant hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Transaction Ref ID</label>
                <input type="text" value={hedgeFormData.id_transaksi} onChange={e => setHedgeFormData({...hedgeFormData, id_transaksi: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none" />
              </div>
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Hedge Type</label>
                <select value={hedgeFormData.tipe_hedging} onChange={e => setHedgeFormData({...hedgeFormData, tipe_hedging: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none">
                  <option value="forward">Forward</option>
                  <option value="option">Option</option>
                  <option value="swap">Swap</option>
                  <option value="futures">Futures</option>
                </select>
              </div>
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Contract Value</label>
                <input type="number" value={hedgeFormData.nilai_kontrak} onChange={e => setHedgeFormData({...hedgeFormData, nilai_kontrak: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none" />
              </div>
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Currency</label>
                <select value={hedgeFormData.mata_uang} onChange={e => setHedgeFormData({...hedgeFormData, mata_uang: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Start Date</label>
                  <input type="date" value={hedgeFormData.tanggal_mulai} onChange={e => setHedgeFormData({...hedgeFormData, tanggal_mulai: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Expiry Date</label>
                  <input type="date" value={hedgeFormData.tanggal_jatuh_tempo} onChange={e => setHedgeFormData({...hedgeFormData, tanggal_jatuh_tempo: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Premium Cost</label>
                <input type="number" value={hedgeFormData.biaya_premium} onChange={e => setHedgeFormData({...hedgeFormData, biaya_premium: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none" />
              </div>
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Financial Institution</label>
                <input type="text" value={hedgeFormData.institusi_keuangan} onChange={e => setHedgeFormData({...hedgeFormData, institusi_keuangan: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none" />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#0A1628] border-t border-[#1E3A5F] p-4 shrink-0 flex flex-col gap-3">
              <button onClick={handleNewHedgeSubmit} className="w-full h-10 bg-[#0891B2] text-white font-bold rounded flex items-center justify-center hover:bg-[#067A96] transition-colors cursor-pointer">
                Create Hedge
              </button>
              <button 
                onClick={() => setShowNewHedge(false)}
                className="w-full h-10 bg-transparent text-on-surface-variant font-bold rounded flex items-center justify-center hover:text-white hover:bg-surface-variant/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
