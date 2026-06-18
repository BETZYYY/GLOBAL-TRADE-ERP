import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useRisk from '../hooks/useRisk';
import useTransactions from '../hooks/useTransactions';

export default function RiskDetail() {
  const { id } = useParams();
  const { data: riskData, loading: riskLoading, getRiskByTransaction } = useRisk();
  const { data: transactions, fetchTransactions } = useTransactions();

  useEffect(() => {
    fetchTransactions();
    if (id) {
      getRiskByTransaction(id);
    }
  }, [id, fetchTransactions, getRiskByTransaction]);

  const tx = transactions?.find(t => t.id_transaksi === id);

  if (riskLoading) {
    return (
      <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-[48px] text-[#0891B2] animate-spin-slow">sync</span>
        <p className="text-on-surface-variant mt-4 font-data-mono">Analyzing risk profile...</p>
      </div>
    );
  }

  const riskLevel = riskData?.level_risiko || 'tinggi';
  const riskScore = riskData?.skor_risiko || 78;
  const isHigh = riskLevel === 'tinggi';
  const isMed = riskLevel === 'menengah';

  const activities = [
    { type: 'critical', actor: 'Risk Engine', role: 'System', time: '10:42 AM', desc: 'Volatility threshold exceeded (3.42%)' },
    { type: 'warning', actor: 'A. Kusuma', role: 'Risk Analyst', time: '10:30 AM', desc: 'Flagged transaction for manual review' },
    { type: 'info', actor: 'B. Wijaya', role: 'Treasury Officer', time: '09:41 AM', desc: 'Submitted FX request USD/IDR' },
    { type: 'info', actor: 'Compliance API', role: 'System', time: '09:41 AM', desc: 'AML screening completed - CLEAR' },
    { type: 'info', actor: 'Liquidity Pool', role: 'System', time: '09:40 AM', desc: 'Reserved IDR equivalent' },
    { type: 'info', actor: 'B. Wijaya', role: 'Treasury Officer', time: '09:35 AM', desc: 'Drafted transaction' }
  ];

  return (
    <div className="pt-20 px-gutter pb-8 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
        <div>
          <div className="text-on-surface-variant font-label-xs text-label-xs mb-2">
            Dashboard / Transactions / <span className="text-white font-medium">{tx?.nomor_referensi || id}</span>
          </div>
          <h1 className="font-h1 text-h1 text-on-surface mb-1">Risk Assessment Detail</h1>
          <p className="font-body text-body text-on-surface-variant">
            Reviewing risk profile for transaction.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
        
        {/* Left Column: 28% (~3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {/* Transaction Summary Card */}
          <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] p-5">
            <h2 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase border-b border-[#1E3A5F] pb-2 mb-4">Transaction Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Reference</span>
                <span className="font-data-mono text-data-mono text-[#06B6D4] font-bold">{tx?.nomor_referensi || 'TRX-2026-0042'}</span>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Currency Pair</span>
                <div className="flex items-center gap-2 text-white font-bold">
                  {tx?.mata_uang_dari || 'USD'} 
                  <span className="material-symbols-outlined text-[16px] text-[#0891B2]">arrow_forward</span> 
                  {tx?.mata_uang_ke || 'IDR'}
                </div>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Submitted By</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0891B2]/30 text-[#06B6D4] flex items-center justify-center text-[10px] font-bold border border-[#0891B2]/50">
                    BW
                  </div>
                  <span className="font-body text-[13px] text-white">B. Wijaya</span>
                </div>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Submitted At</span>
                <span className="font-data-mono text-data-mono text-white">{tx?.tanggal_transaksi?.replace('T', ' ').substring(0,16) || '2026-10-15 09:41'}</span>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Live Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-data-mono text-data-mono text-white font-bold">15,620.50</span>
                  <span className="text-[#DC2626] text-[10px] font-bold flex items-center bg-[#DC2626]/10 px-1 rounded"><span className="material-symbols-outlined text-[10px]">arrow_upward</span> 0.4%</span>
                </div>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Rate at Submit</span>
                <span className="font-data-mono text-data-mono text-white">15,550.00</span>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Rate Drift</span>
                <span className="font-data-mono text-data-mono text-[#F59E0B]">+ 70.50</span>
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] p-5 flex-1">
            <h2 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase border-b border-[#1E3A5F] pb-2 mb-5">Approval Workflow</h2>
            
            <div className="flex items-center justify-between relative mb-4 px-2">
              {/* Connecting Line */}
              <div className="absolute left-6 right-6 top-3 h-[2px] z-0 flex">
                <div className="h-full bg-[#0891B2] w-1/2"></div>
                <div className="h-full border-t-2 border-dashed border-[#1E3A5F] w-1/2"></div>
              </div>
              
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2 z-10 relative">
                <div className="w-6 h-6 rounded-full bg-[#0891B2] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-white">check</span>
                </div>
                <span className="text-[12px] text-on-surface-variant font-medium">Initiated</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2 z-10 relative">
                <div className="w-6 h-6 rounded-full bg-[#0891B2]/10 border border-[#0891B2] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-[#0891B2] animate-spin-slow">sync</span>
                </div>
                <span className="text-[12px] text-[#0891B2] font-bold">Review</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2 z-10 relative">
                <div className="w-6 h-6 rounded-full bg-[#0F1B2D] border border-[#1E3A5F] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-[#94A3B8]">lock</span>
                </div>
                <span className="text-[12px] text-on-surface-variant font-medium">Approve</span>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Current Status: Pending Risk Review</span>
            </div>
          </div>
        </div>

        {/* Center Column: 44% (~5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Risk Assessment Hero Card */}
          <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none"></div>
            
            <div className="w-full flex justify-between items-center mb-8 relative z-10">
              <h2 className="font-h3-caps text-h3-caps text-white uppercase tracking-widest">Volatility Risk Meter</h2>
              {isHigh ? (
                <span className="px-2 py-1 bg-[rgba(220,38,38,0.2)] border border-[#DC2626] text-[#DC2626] text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">warning</span> HIGH RISK
                </span>
              ) : isMed ? (
                <span className="px-2 py-1 bg-[rgba(245,158,11,0.2)] border border-[#F59E0B] text-[#F59E0B] text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">info</span> MEDIUM RISK
                </span>
              ) : (
                <span className="px-2 py-1 bg-[rgba(16,185,129,0.2)] border border-[#10B981] text-[#10B981] text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span> LOW RISK
                </span>
              )}
            </div>

            {/* Gauge Container */}
            <div className="relative w-[240px] h-[120px] mb-8 overflow-hidden z-10">
              <div className="absolute top-0 left-0 w-[240px] h-[240px] rounded-full border-[16px] border-[#1E3A5F] border-t-transparent border-r-transparent transform -rotate-45 box-border"></div>
              <div className="absolute top-0 left-0 w-full h-[240px] rounded-full box-border" style={{
                  background: 'conic-gradient(from 270deg, #10B981 0deg 60deg, #F59E0B 60deg 120deg, #DC2626 120deg 180deg, transparent 180deg)',
                  maskImage: 'radial-gradient(transparent 58%, black 60%)',
                  WebkitMaskImage: 'radial-gradient(transparent 58%, black 60%)'
              }}></div>
              
              {/* Gauge Needle */}
              <div className="absolute bottom-0 left-1/2 w-1 h-[100px] -ml-[2px] z-20 flex flex-col justify-start items-center transition-transform duration-1000 origin-bottom" 
                   style={{ 
                     transform: isHigh ? 'rotate(60deg)' : isMed ? 'rotate(0deg)' : 'rotate(-60deg)',
                     animation: isHigh ? 'needle-swing 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none'
                   }}>
                <div className="w-3 h-3 bg-white rounded-full absolute -top-1 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                <div className="w-1 h-full bg-gradient-to-b from-white to-transparent"></div>
              </div>
              
              <div className="absolute bottom-[-8px] left-1/2 w-4 h-4 bg-[#0F1B2D] border-2 border-[#0891B2] rounded-full -ml-[8px] z-30"></div>
              
              <div className="absolute bottom-2 left-2 text-[10px] font-bold text-[#10B981] font-data-mono">LOW</div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#F59E0B] font-data-mono">MED</div>
              <div className="absolute bottom-2 right-2 text-[10px] font-bold text-[#DC2626] font-data-mono">HIGH</div>
            </div>

            {/* Score Display */}
            <div className="flex flex-col items-center mb-8 z-10 relative">
              <span className={`font-data-mono text-[48px] leading-none text-white font-bold ${isHigh ? 'drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]' : ''}`}>{riskScore}</span>
              <span className="text-on-surface-variant font-label-xs text-label-xs mt-1 uppercase tracking-widest">Risk Score</span>
            </div>

            {/* Stat Cards Below Gauge */}
            <div className="w-full grid grid-cols-2 gap-4 mb-8 z-10 relative">
              <div className="bg-[#0F1B2D] border border-[#1E3A5F] rounded-lg p-4 flex flex-col">
                <span className="text-on-surface-variant font-label-xs text-label-xs uppercase mb-2">Value at Risk (VaR)</span>
                <span className="font-data-mono text-data-mono text-[16px] text-white font-bold">Rp {(riskData?.var_95 || 196.8).toLocaleString()}M</span>
              </div>
              <div className="bg-[#0F1B2D] border border-[#1E3A5F] rounded-lg p-4 flex flex-col">
                <span className="text-on-surface-variant font-label-xs text-label-xs uppercase mb-2">Volatility 30d</span>
                <div className="flex items-center gap-2">
                  <span className="font-data-mono text-data-mono text-[16px] text-[#DC2626] font-bold">3.42%</span>
                  <span className="material-symbols-outlined text-[16px] text-[#DC2626]">trending_up</span>
                </div>
              </div>
            </div>

            {/* Mitigation Options */}
            <div className="w-full flex flex-col gap-3 z-10 relative">
              <h3 className="font-label-xs text-label-xs text-on-surface-variant uppercase border-b border-[#1E3A5F] pb-1 mb-2">Recommended Mitigations</h3>
              <button className="w-full h-button_height bg-[#0891B2] text-white rounded-lg font-body text-body font-medium flex items-center justify-center gap-2 hover:bg-[#06b6d4] transition-colors">
                <span className="material-symbols-outlined text-[18px]">security</span>
                Apply Forward Contract
              </button>
              <button className="w-full h-button_height bg-transparent border border-[#0891B2] text-[#0891B2] rounded-lg font-body text-body font-medium flex items-center justify-center gap-2 hover:bg-[#0891B2]/10 transition-colors">
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
                Buy Currency Option
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 28% (~4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Risk Factors Card */}
          <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] p-5">
            <h2 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase border-b border-[#1E3A5F] pb-2 mb-5">Risk Factors</h2>
            <div className="flex flex-col gap-5">
              {/* Factor 1 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-body text-[13px] text-white font-medium">Currency Volatility</span>
                  <span className="font-data-mono text-[12px] text-[#DC2626] font-bold">85/100</span>
                </div>
                <div className="w-full h-[6px] bg-[#0F1B2D] rounded-full overflow-hidden border border-[#1E3A5F]">
                  <div className="h-full bg-[#DC2626] w-[85%] relative">
                    <div className="absolute inset-0 bg-white opacity-20 w-1/2"></div>
                  </div>
                </div>
              </div>
              {/* Factor 2 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-body text-[13px] text-white font-medium">Exposure Size</span>
                  <span className="font-data-mono text-[12px] text-[#F59E0B] font-bold">70/100</span>
                </div>
                <div className="w-full h-[6px] bg-[#0F1B2D] rounded-full overflow-hidden border border-[#1E3A5F]">
                  <div className="h-full bg-[#F59E0B] w-[70%]"></div>
                </div>
              </div>
              {/* Factor 3 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-body text-[13px] text-white font-medium">Settlement Tenor</span>
                  <span className="font-data-mono text-[12px] text-[#F59E0B] font-bold">60/100</span>
                </div>
                <div className="w-full h-[6px] bg-[#0F1B2D] rounded-full overflow-hidden border border-[#1E3A5F]">
                  <div className="h-full bg-[#F59E0B] w-[60%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] p-5 flex-1 flex flex-col max-h-[500px]">
            <div className="flex justify-between items-center border-b border-[#1E3A5F] pb-2 mb-4">
              <h2 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Activity Log</h2>
              <button className="text-on-surface-variant hover:text-[#0891B2] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center mt-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${act.type === 'critical' ? 'bg-[#DC2626]' : act.type === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#0891B2]'}`}></div>
                    {i !== activities.length - 1 && <div className="w-px h-full bg-[#1E3A5F] mt-1"></div>}
                  </div>
                  <div className="flex flex-col pb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] text-on-surface-variant font-data-mono">{act.time}</span>
                      <span className="text-[11px] text-white font-bold">{act.actor}</span>
                      <span className="text-[10px] text-on-surface-variant px-1 rounded bg-[#0F1B2D] border border-[#1E3A5F]">{act.role}</span>
                    </div>
                    <span className="text-[13px] text-white/80">{act.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}