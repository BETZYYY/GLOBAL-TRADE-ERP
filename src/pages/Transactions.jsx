import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useTransactions from '../hooks/useTransactions';
import useRisk from '../hooks/useRisk';
import api from '../lib/api';

function fmt(n) {
  return new Intl.NumberFormat('en-US', { notation: 'standard', maximumFractionDigits: 2 }).format(n);
}

export default function Transactions() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: transactions, loading, fetchTransactions, createTransaction } = useTransactions();
  const { calculateRisk } = useRisk();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('SWIFT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    mata_uang_asal: 'USD',
    mata_uang_tujuan: 'IDR',
    jumlah_asal: '',
    tanggal_transaksi: new Date().toISOString().split('T')[0],
    tanggal_penyelesaian: '',
    rekanan_negara: 'United States',
    catatan: ''
  });

  useEffect(() => {
    fetchTransactions({ 
      status: statusFilter, 
      risk_level: riskFilter, 
      mata_uang_asal: currencyFilter 
    });
  }, [fetchTransactions, statusFilter, riskFilter, currencyFilter]);

  // Fallback rates (IDR per 1 unit of foreign currency)
  const fallbackRates = { USD: 15750, EUR: 17120, JPY: 104, GBP: 19870 };

  const handleSubmit = async () => {
    if (!formData.mata_uang_asal || !formData.mata_uang_tujuan || !formData.jumlah_asal) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Fetch latest exchange rate for the selected pair
      let rateId = null;
      let exchangeRate = fallbackRates[formData.mata_uang_asal] || 15750;

      try {
        const rateRes = await api.get(
          `/rates/latest?from=${formData.mata_uang_asal}&to=${formData.mata_uang_tujuan}`
        );
        const rateData = rateRes.data?.data;
        if (rateData) {
          rateId = rateData.id_kurs;
          exchangeRate = Number(rateData.nilai_kurs) || exchangeRate;
        }
      } catch {
        // Endpoint unavailable — use fallback rates silently
        console.warn('Rate endpoint unavailable, using fallback rate:', exchangeRate);
      }

      // 2. Build payload with all backend-required field names
      const payload = {
        id_kurs:            rateId,
        mata_uang_asal:     formData.mata_uang_asal,
        mata_uang_tujuan:   formData.mata_uang_tujuan,
        jumlah_asal:        Number(formData.jumlah_asal),
        jumlah_tujuan:      Number(formData.jumlah_asal) * exchangeRate,
        nilai_tukar_pakai:  exchangeRate,
        metode_pembayaran:  paymentMethod.toLowerCase(),
        tanggal_transaksi:  formData.tanggal_transaksi,
        catatan:            formData.catatan || ''
      };

      // 3. Submit transaction
      const newTx = await createTransaction(payload);
      if (newTx && newTx.id_transaksi) {
        await calculateRisk(newTx.id_transaksi);
      }
      setIsDrawerOpen(false);
      fetchTransactions({ status: statusFilter, risk_level: riskFilter, mata_uang_asal: currencyFilter });
    } catch (err) {
      console.error('Failed to create transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = (transactions || []).filter(t =>
    t.nomor_referensi.toLowerCase().includes(search.toLowerCase()) || 
    (t.catatan || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-4 max-w-full">
        {/* Page Header & Actions */}
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface m-0">Payment Transactions</h1>
          </div>
          <div>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="h-button_height bg-[#0891B2] text-white px-4 rounded-lg font-label-xs text-label-xs flex items-center gap-2 hover:bg-[#067A96] transition-colors cursor-pointer active:opacity-80"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Transaction
            </button>
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
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-transparent border-none outline-none text-white font-body text-body w-full p-0 h-full focus:ring-0 cursor-pointer">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] absolute right-2 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="w-32">
            <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Risk Level</label>
            <div className="relative teal-focus ghost-border rounded bg-brand-midnight-base h-8 flex items-center px-2 cursor-pointer">
              <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="appearance-none bg-transparent border-none outline-none text-white font-body text-body w-full p-0 h-full focus:ring-0 cursor-pointer">
                <option value="">All Risk</option>
                <option value="tinggi">High</option>
                <option value="rendah">Low</option>
              </select>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] absolute right-2 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="w-32">
            <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Currency</label>
            <div className="relative teal-focus ghost-border rounded bg-brand-midnight-base h-8 flex items-center px-2 cursor-pointer">
              <select value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)} className="appearance-none bg-transparent border-none outline-none text-white font-body text-body w-full p-0 h-full focus:ring-0 cursor-pointer">
                <option value="">All Pairs</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
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
          <button onClick={() => { setStatusFilter(''); setRiskFilter(''); setCurrencyFilter(''); setSearch(''); }} className="h-8 px-3 rounded ghost-border text-on-surface-variant hover:text-white hover:bg-surface-variant/50 transition-colors font-label-xs text-label-xs flex items-center cursor-pointer">
              Clear
          </button>
        </div>

        {/* Data Table Card */}
        <div className="bg-brand-midnight-card ghost-border rounded-xl flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="px-4 py-3 border-b border-brand-midnight-border flex justify-between items-center">
            <h2 className="font-h2 text-h2 text-white m-0">Transactions</h2>
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
                    <th className="font-h3-caps text-h3-caps text-brand-table-header-text py-2 px-4 uppercase">Method</th>
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
                    
                    const rowClass = `hover:bg-surface-variant/30 transition-colors ghost-border ${idx % 2 === 0 ? 'table-row-alt' : ''} ${isHigh ? 'border-l-2 border-[#DC2626]' : ''}`;
                    
                    return (
                      <tr key={t.id_transaksi || idx} className={rowClass}>
                        <td className="py-2 px-4 text-on-surface-variant">{idx + 1}</td>
                        <td className="py-2 px-4 text-white">{t.nomor_referensi}</td>
                        <td className="py-2 px-4 text-on-surface-variant">{t.mata_uang_asal || t.mata_uang_dari}/{t.mata_uang_tujuan || t.mata_uang_ke}</td>
                        <td className="py-2 px-4 text-white text-right font-data-mono">{"$ " + Number(t.jumlah_asal || t.jumlah_dari || t.amount || 0).toLocaleString()}</td>
                        <td className="py-2 px-4 text-[#0891B2] text-right font-data-mono">{"Rp " + Number(t.jumlah_tujuan || t.exposure_idr || 0).toLocaleString('id-ID')}</td>
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
                          <span className="inline-block bg-[#1E2D44] text-[#94A3B8] text-xs px-2 py-1 rounded">
                            {t.metode_pembayaran || 'SWIFT'}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {(() => {
                            const status = (t.status_pembayaran || t.status || '').toLowerCase();
                            if (status === 'pending') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#B45309]/20 text-[#F59E0B] border border-[#F59E0B]">PENDING</span>;
                            if (status === 'processing') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#0891B2]/20 text-[#06B6D4] border border-[#0891B2]">PROCESSING</span>;
                            if (status === 'completed' || status === 'settled') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(22,163,74,0.2)] text-[#22C55E] border border-[#16A34A]">COMPLETED</span>;
                            if (status === 'failed') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(220,38,38,0.2)] text-[#DC2626] border border-[#DC2626]">FAILED</span>;
                            return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(220,38,38,0.2)] text-[#DC2626] border border-[#DC2626] uppercase">{status || '-'}</span>;
                          })()}
                        </td>
                        <td className="py-2 px-4 text-on-surface-variant">{t.tanggal_transaksi?.split('T')[0]}</td>
                        <td className="py-2 px-4 text-center">
                          <button onClick={() => navigate(`/transactions/${t.id_transaksi}`)} className="text-brand-teal border border-brand-teal hover:bg-brand-teal/10 px-2 py-1 rounded text-[10px] uppercase mr-2 transition-colors cursor-pointer font-bold z-20 relative">Review</button>
                          <button onClick={() => navigate(`/transactions/${t.id_transaksi}`)} className="text-on-surface-variant hover:text-white px-2 py-1 rounded text-[10px] uppercase transition-colors cursor-pointer font-bold z-20 relative">View</button>
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

      {/* Slide-in Drawer overlay */}
      {isDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={() => setIsDrawerOpen(false)}
          ></div>
          <div className="fixed right-0 top-0 h-full w-[480px] bg-[#16243B] border-l border-[#1E3A5F] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-14 border-b border-[#1E3A5F] px-6 flex items-center justify-between shrink-0">
              <h2 className="font-h2 text-h2 text-white m-0">New Transaction</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-on-surface-variant hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="font-h3-caps text-h3-caps text-on-surface-variant uppercase tracking-wider mb-2">Transaction Details</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">From Currency</label>
                  <select value={formData.mata_uang_asal} onChange={e => setFormData({...formData, mata_uang_asal: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">To Currency</label>
                  <select value={formData.mata_uang_tujuan} onChange={e => setFormData({...formData, mata_uang_tujuan: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none">
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Transaction Amount</label>
                <div className="flex items-center bg-[#0F1B2D] border border-[#1E3A5F] rounded overflow-hidden focus-within:border-[#0891B2]">
                  <input type="number" value={formData.jumlah_asal} onChange={e => setFormData({...formData, jumlah_asal: e.target.value})} placeholder="0.00" className="flex-1 bg-transparent border-none text-white p-2 text-sm outline-none" />
                  <span className="px-3 text-on-surface-variant text-sm font-bold border-l border-[#1E3A5F]">{formData.mata_uang_asal}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Transaction Date</label>
                  <input type="date" value={formData.tanggal_transaksi} onChange={e => setFormData({...formData, tanggal_transaksi: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Settlement Date</label>
                  <input type="date" value={formData.tanggal_penyelesaian} onChange={e => setFormData({...formData, tanggal_penyelesaian: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Partner Country</label>
                <select value={formData.rekanan_negara} onChange={e => setFormData({...formData, rekanan_negara: e.target.value})} className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none">
                  <option value="United States">United States</option>
                  <option value="Singapore">Singapore</option>
                  <option value="China">China</option>
                </select>
              </div>

              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-2">Payment Method</label>
                <div className="flex flex-wrap gap-2">
                  {['SWIFT', 'SEPA', 'RTGS', 'ACH', 'Wire'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
                        paymentMethod === method 
                          ? 'bg-[#0891B2]/20 border-[#0891B2] text-[#06B6D4]' 
                          : 'bg-[#1E2D44] border-[#1E3A5F] text-[#94A3B8] hover:bg-[#1E2D44]/80'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1">Notes (Optional)</label>
                <textarea value={formData.catatan} onChange={e => setFormData({...formData, catatan: e.target.value})} rows="3" className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white rounded p-2 text-sm focus:border-[#0891B2] outline-none resize-none" placeholder="Add any references or additional info..."></textarea>
              </div>

              {/* Exposure Preview Card */}
              {(() => {
                const previewRate = fallbackRates[formData.mata_uang_asal] || 15750;
                const previewAmount = Number(formData.jumlah_asal) || 0;
                const previewIDR = previewAmount * previewRate;
                return (
                  <div className="bg-[#1E2D44] border-l-2 border-[#0891B2] p-4 rounded-lg mt-4 shadow-inner">
                    <div className="font-h3-caps text-h3-caps text-on-surface-variant uppercase mb-3 tracking-wide">Exposure Preview</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">Est. Rate</span>
                        <span className="text-white font-data-mono">1 {formData.mata_uang_asal} = {previewRate.toLocaleString()} {formData.mata_uang_tujuan}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-sm">{formData.mata_uang_tujuan} Equivalent</span>
                        <span className="text-white text-[20px] font-bold font-data-mono">
                          {formData.mata_uang_tujuan === 'IDR' ? 'Rp ' : ''}{previewIDR.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-[#1E3A5F]">
                        <span className="text-on-surface-variant">Est. Risk Level</span>
                        <span className="text-on-surface-variant italic">Auto-calculated on submit</span>
                      </div>
                    </div>
                    <div className="mt-3 text-[11px] text-on-surface-variant italic text-right">
                      Live rate fetched at submission time
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Footer */}
            <div className="bg-[#0A1628] border-t border-[#1E3A5F] p-4 shrink-0 flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-10 bg-[#0891B2] text-white font-bold rounded flex items-center justify-center hover:bg-[#067A96] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Transaction'}
              </button>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-full h-10 bg-transparent text-on-surface-variant font-bold rounded flex items-center justify-center hover:text-white hover:bg-surface-variant/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}