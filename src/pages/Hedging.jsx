import { useState, useEffect } from 'react';
import { TrendingUp, Plus, BrainCircuit, List, Filter, Download as DownloadIcon } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useHedging from '../hooks/useHedging';
import useTransactions from '../hooks/useTransactions';

function formatCur(n, ccy = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: ccy,
  }).format(n || 0);
}

export default function Hedging() {
  const { user } = useAuthStore();
  
  const { data: hedges, loading: loadingHedges, fetchHedging, recommendHedging, executeHedging } = useHedging();
  const { data: allTransactions, fetchTransactions } = useTransactions();
  
  const [selectedTrx, setSelectedTrx] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const transactions = (allTransactions || []).filter(t => t.status === 'pending' || t.status_pembayaran === 'pending');

  useEffect(() => {
    fetchHedging();
    fetchTransactions();
  }, [fetchHedging, fetchTransactions]);

  const handleRecommend = async () => {
    if (!selectedTrx) return alert('Pilih transaksi terlebih dahulu');
    setLoading(true);
    try {
      const data = await recommendHedging(selectedTrx);
      setRecommendation(data);
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHedge = async (recType) => {
    if (!selectedTrx || !recommendation) return;
    try {
      const payload = {
        id_transaksi: selectedTrx,
        tipe_instrumen: recType,
        mata_uang_lindung: recommendation.transaction.mata_uang_asal || 'USD',
        nilai_kontrak: recommendation.transaction.jumlah_asal || 10000,
        nilai_tukar_terkunci: recommendation.current_rate || 15000,
        tanggal_jatuh_tempo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        biaya_premi: recommendation.recommendations?.find(r => r.instrumen === recType)?.estimasi_biaya || 0
      };

      await executeHedging(payload);
      alert('Hedging berhasil dibuat');
      setRecommendation(null);
      setSelectedTrx('');
    } catch (err) {
      // Error handled globally
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-end w-full">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manajemen Hedging</h1>
          <p className="text-slate-400 text-sm">Lindungi nilai tukar menggunakan instrumen derivatif.</p>
        </div>
        {user?.peran !== 'auditor' && (
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Hedge
          </button>
        )}
      </div>

      {/* ── Top Section: 2 Columns ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Hedging Analysis Form */}
        <div className="lg:col-span-4 card flex flex-col">
          <div className="border-b border-surface-elevated p-4">
            <h2 className="stat-label text-accent-cyan tracking-widest flex items-center gap-2">
              <TrendingUp size={16} /> Analisis Risiko Nilai Tukar
            </h2>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Transaksi Pending</label>
                <select 
                  className="w-full bg-surface-card border border-surface-elevated rounded-lg p-2 text-sm text-white focus:border-accent-cyan outline-none"
                  value={selectedTrx}
                  onChange={(e) => setSelectedTrx(e.target.value)}
                >
                  <option value="">-- Pilih Transaksi --</option>
                  {transactions.map(t => (
                    <option key={t.id_transaksi} value={t.id_transaksi}>
                      {t.nomor_referensi} - {t.mata_uang_asal} {t.jumlah_asal}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 mt-4 border-t border-surface-elevated">
                <button 
                  onClick={handleRecommend}
                  disabled={!selectedTrx || loading}
                  className="w-full btn-primary uppercase tracking-wider flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <BrainCircuit size={16} />
                  )}
                  {loading ? 'Menganalisis...' : 'Generate AI Recommendation'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Recommendation Result */}
        <div className="lg:col-span-8 card flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="border-b border-surface-elevated p-4 flex justify-between items-center bg-surface-elevated/20">
            <div className="flex items-center gap-3">
              <BrainCircuit size={18} className="text-accent-teal" />
              <h2 className="stat-label text-accent-teal tracking-widest">Rekomendasi Sistem</h2>
            </div>
            {recommendation && (
              <span className="badge-risk-low px-2 py-0.5 text-[10px] uppercase font-bold">Data Ready</span>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col gap-6 min-h-[300px]">
            {!recommendation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
                <BrainCircuit size={48} className="opacity-20 mb-4" />
                <p>Pilih transaksi dan klik Generate untuk mendapatkan rekomendasi instrumen hedging.</p>
              </div>
            ) : (
              <>
                <div className="bg-surface-elevated/30 border border-accent-teal/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {recommendation.recommendations[0].instrumen.toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Strategi optimal berdasarkan profil risiko {recommendation.risk_profile} transaksi ini.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase mb-1">Exposure</div>
                    <div className="font-mono text-lg text-accent-teal">
                      {formatCur(recommendation.transaction.jumlah_asal, recommendation.transaction.mata_uang_asal)}
                    </div>
                  </div>
                </div>

                <div className="flex-1 border border-surface-elevated rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-surface-elevated p-2 border-b border-surface-elevated px-4">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Perbandingan Instrumen</span>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-surface-elevated">
                          <th className="p-2 px-4 text-xs font-medium text-slate-400">Instrumen</th>
                          <th className="p-2 px-4 text-xs font-medium text-slate-400 text-right">Estimasi Biaya</th>
                          <th className="p-2 px-4 text-xs font-medium text-slate-400">Rasionalisasi</th>
                          <th className="p-2 px-4 text-xs font-medium text-slate-400 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-elevated font-mono text-xs text-slate-300">
                        {recommendation.recommendations.map((rec, i) => (
                          <tr key={i} className={i === 0 ? "bg-accent-teal/10 border-l-2 border-l-accent-teal" : ""}>
                            <td className={`p-2 px-4 font-sans ${i===0 ? 'text-accent-teal font-bold' : 'text-white'}`}>
                              {rec.instrumen.toUpperCase()}
                            </td>
                            <td className="p-2 px-4 text-right">
                              {formatCur(rec.estimasi_biaya, 'IDR')}
                            </td>
                            <td className="p-2 px-4 font-sans text-[11px] text-slate-400 max-w-[200px] truncate" title={rec.alasan}>
                              {rec.alasan}
                            </td>
                            <td className="p-2 px-4 text-center">
                              {user?.peran === 'treasury_officer' || user?.peran === 'admin' ? (
                                <button 
                                  onClick={() => handleCreateHedge(rec.instrumen)}
                                  className="text-xs bg-accent-cyan/20 text-accent-cyan px-2 py-1 rounded hover:bg-accent-cyan hover:text-white transition-colors"
                                >
                                  Pilih
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500">View Only</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Active Positions Table ───────────────────────────── */}
      <div className="card flex flex-col w-full overflow-hidden">
        <div className="border-b border-surface-elevated p-4 flex justify-between items-center">
          <h2 className="stat-label text-white tracking-widest flex items-center gap-2">
            <List size={16} /> Posisi Hedging Aktif
          </h2>
          <div className="flex gap-2">
            <button className="text-slate-400 hover:text-white"><Filter size={16} /></button>
            <button className="text-slate-400 hover:text-white"><DownloadIcon size={16} /></button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loadingHedges ? (
            <div className="p-8 text-center text-slate-400">Memuat posisi...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-surface-elevated">
                  <th className="p-3 px-4 stat-label">Ref. TRX</th>
                  <th className="p-3 px-4 stat-label">Instrumen</th>
                  <th className="p-3 px-4 stat-label">Pair</th>
                  <th className="p-3 px-4 stat-label text-right">Nilai Kontrak</th>
                  <th className="p-3 px-4 stat-label text-right">Rate Kunci</th>
                  <th className="p-3 px-4 stat-label text-right">Jatuh Tempo</th>
                  <th className="p-3 px-4 stat-label text-center">Status</th>
                  <th className="p-3 px-4 stat-label text-right">Est. P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-elevated font-mono text-xs">
                {hedges.map(h => (
                  <tr key={h.id_hedging} className="hover:bg-surface-elevated/40">
                    <td className="p-3 px-4 text-accent-cyan">{h.nomor_referensi}</td>
                    <td className="p-3 px-4 text-white font-sans">{h.tipe_instrumen}</td>
                    <td className="p-3 px-4 text-slate-400">{h.mata_uang_lindung}/IDR</td>
                    <td className="p-3 px-4 text-right text-white">
                      {formatCur(h.nilai_kontrak, h.mata_uang_lindung)}
                    </td>
                    <td className="p-3 px-4 text-right text-white">{h.nilai_tukar_terkunci}</td>
                    <td className="p-3 px-4 text-right text-slate-400">
                      {new Date(h.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3 px-4 text-center">
                      <span className={`badge-risk-${h.status_hedging === 'aktif' ? 'low' : 'medium'}`}>
                        {h.status_hedging}
                      </span>
                    </td>
                    <td className={`p-3 px-4 text-right ${h.estimasi_pnl >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                      {h.estimasi_pnl >= 0 ? '+' : ''}{formatCur(h.estimasi_pnl, 'IDR')}
                    </td>
                  </tr>
                ))}
                {hedges.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-slate-500 font-sans">
                      Tidak ada posisi hedging aktif.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
