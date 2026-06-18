import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useRisk from '../hooks/useRisk';
import useTransactions from '../hooks/useTransactions';

export default function RiskDetail() {
  const { id } = useParams();
  const { data: riskData, loading: riskLoading, fetchRiskByTx } = useRisk();
  const { data: transactions, fetchTransactions } = useTransactions();

  useEffect(() => {
    fetchTransactions();
    if (id) {
      fetchRiskByTx(id);
    }
  }, [id, fetchTransactions, fetchRiskByTx]);

  const tx = transactions?.find(t => t.id_transaksi === parseInt(id));

  if (riskLoading) {
    return (
      <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-[48px] text-brand-primary animate-spin-slow">sync</span>
        <p className="text-on-surface-variant mt-4 font-data-mono">Menganalisis profil risiko...</p>
      </div>
    );
  }

  // Fallback to mock logic if data not fully there yet
  const riskLevel = riskData?.level_risiko || 'tinggi';
  const riskScore = riskData?.skor_risiko || 78;
  const isHigh = riskLevel === 'tinggi';

  return (
    <div className="pt-14 px-container_padding pb-8 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-h1 text-h1 text-on-surface">Risk Assessment Detail</h1>
            <span className="px-2 py-0.5 bg-[rgba(220,38,38,0.2)] border border-brand-danger text-brand-danger text-[10px] font-bold rounded">LIVE</span>
          </div>
          <p className="font-body text-body text-on-surface-variant flex items-center gap-2">
            Ref: <span className="font-data-mono text-white">{tx?.nomor_referensi || 'TRX-2026-0042'}</span> 
            | Pair: <span className="font-data-mono text-white">{tx?.mata_uang_dari || 'USD'}/{tx?.mata_uang_ke || 'IDR'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-button_height px-4 rounded-lg bg-surface-container-high border border-brand-border text-on-surface-variant hover:text-white transition-colors flex items-center gap-2 font-label-xs uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">print</span> Print Report
          </button>
          <button className="h-button_height px-6 rounded-lg bg-brand-primary text-white hover:bg-[#06b6d4] transition-colors flex items-center gap-2 font-label-xs uppercase tracking-widest focus-glow">
            <span className="material-symbols-outlined text-[16px]">gavel</span> Require Hedging
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
        
        {/* Left Column: 28% (~3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {/* Transaction Summary Card */}
          <div className="bg-brand-card rounded-xl card-border p-5">
            <h2 className="font-h3-caps text-h3-caps text-outline uppercase border-b border-brand-border pb-2 mb-4">Transaction Profile</h2>
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Total Amount</span>
                <span className="font-data-mono text-data-mono text-white font-bold">{tx ? tx.jumlah_dari : '1,250,000.00'}</span>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">IDR Exposure</span>
                <span className="font-data-mono text-data-mono text-brand-primary font-bold">~Rp {tx ? (tx.jumlah_dari * 15500).toLocaleString() : '19.68B'}</span>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Counterparty</span>
                <span className="font-body text-[13px] text-white">GlobalTech Logistics Ltd.</span>
              </div>
              <div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase block mb-1">Settlement Date</span>
                <span className="font-data-mono text-data-mono text-white">{tx?.tanggal_transaksi?.split('T')[0] || '2026-10-15'}</span>
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-brand-card rounded-xl card-border p-5 flex-1">
            <h2 className="font-h3-caps text-h3-caps text-outline uppercase border-b border-brand-border pb-2 mb-5">Approval Workflow</h2>
            
            <div className="relative flex flex-col gap-8">
              {/* Connecting Line */}
              <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-brand-border"></div>
              
              {/* Step 1: Initiated */}
              <div className="flex items-center gap-4 z-10 relative">
                <div className="w-12 h-12 rounded-full bg-[rgba(13,148,136,0.1)] flex items-center justify-center border border-brand-success shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-brand-success">check_circle</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-xs text-label-xs text-white font-bold">Initiated</span>
                  <span className="font-data-mono text-[10px] text-on-surface-variant mt-0.5">Oct 1, 09:41 AM</span>
                </div>
              </div>

              {/* Step 2: Risk Review (Active) */}
              <div className="flex items-center gap-4 z-10 relative">
                <div className="w-12 h-12 rounded-full bg-[rgba(8,145,178,0.1)] flex items-center justify-center border border-brand-primary shrink-0 shadow-[0_0_15px_rgba(8,145,178,0.3)]">
                  <span className="material-symbols-outlined text-[20px] text-brand-primary animate-spin-slow">sync</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-xs text-label-xs text-brand-primary font-bold">Risk Review</span>
                  <span className="font-data-mono text-[10px] text-on-surface-variant mt-0.5">Pending Action</span>
                </div>
              </div>

              {/* Step 3: Final Approval */}
              <div className="flex items-center gap-4 z-10 relative">
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center border border-brand-border shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-outline">lock</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-xs text-label-xs text-outline font-medium">Final Approval</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: 44% (~5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Risk Assessment Hero Card */}
          <div className="bg-brand-card rounded-xl card-border p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none"></div>
            
            <div className="w-full flex justify-between items-center mb-8 relative z-10">
              <h2 className="font-h3-caps text-h3-caps text-on-surface uppercase tracking-widest">Volatility Risk Meter</h2>
              {isHigh ? (
                <span className="px-2 py-1 bg-[rgba(220,38,38,0.2)] border border-brand-danger text-brand-danger text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">warning</span> HIGH RISK
                </span>
              ) : (
                <span className="px-2 py-1 bg-[rgba(245,158,11,0.2)] border border-[#F59E0B] text-[#F59E0B] text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">info</span> MEDIUM RISK
                </span>
              )}
            </div>

            {/* Gauge Container */}
            <div className="relative w-[240px] h-[120px] mb-8 overflow-hidden z-10">
              <div className="absolute top-0 left-0 w-[240px] h-[240px] rounded-full border-[16px] border-brand-border border-t-transparent border-r-transparent transform -rotate-45 box-border"></div>
              <div className="absolute top-0 left-0 w-full h-[240px] rounded-full box-border" style={{
                  background: 'conic-gradient(from 270deg, #0D9488 0deg 60deg, #D97706 60deg 120deg, #DC2626 120deg 180deg, transparent 180deg)',
                  maskImage: 'radial-gradient(transparent 58%, black 60%)',
                  WebkitMaskImage: 'radial-gradient(transparent 58%, black 60%)'
              }}></div>
              
              {/* Gauge Needle */}
              <div className="absolute bottom-0 left-1/2 w-1 h-[100px] -ml-[2px] z-20 gauge-needle flex flex-col justify-start items-center" 
                   style={{ animation: isHigh ? 'needle-swing 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none', transform: isHigh ? '' : 'rotate(0deg)'}}>
                <div className="w-3 h-3 bg-white rounded-full absolute -top-1 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                <div className="w-1 h-full bg-gradient-to-b from-white to-transparent"></div>
              </div>
              
              <div className="absolute bottom-[-8px] left-1/2 w-4 h-4 bg-brand-bg border-2 border-brand-primary rounded-full -ml-[8px] z-30"></div>
              
              <div className="absolute bottom-2 left-2 text-[10px] font-bold text-brand-success font-data-mono">LOW</div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#F59E0B] font-data-mono">MED</div>
              <div className="absolute bottom-2 right-2 text-[10px] font-bold text-brand-danger font-data-mono">HIGH</div>
            </div>

            {/* Score Display */}
            <div className="flex flex-col items-center mb-8 z-10 relative">
              <span className={`font-data-mono text-[48px] leading-none text-white font-bold drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]`}>{riskScore}</span>
              <span className="text-on-surface-variant font-label-xs text-label-xs mt-1 uppercase tracking-widest">Risk Score</span>
            </div>

            {/* Stat Cards Below Gauge */}
            <div className="w-full grid grid-cols-2 gap-4 mb-8 z-10 relative">
              <div className="bg-brand-bg border border-brand-border rounded-lg p-4 flex flex-col">
                <span className="text-on-surface-variant font-label-xs text-label-xs uppercase mb-2">Value at Risk (VaR)</span>
                <span className="font-data-mono text-data-mono text-[16px] text-on-surface font-bold">Rp {(riskData?.var_95 || 196.8).toLocaleString()}M</span>
              </div>
              <div className="bg-brand-bg border border-brand-border rounded-lg p-4 flex flex-col">
                <span className="text-on-surface-variant font-label-xs text-label-xs uppercase mb-2">Volatility 30d</span>
                <div className="flex items-center gap-2">
                  <span className="font-data-mono text-data-mono text-[16px] text-brand-danger font-bold">3.42%</span>
                  <span className="material-symbols-outlined text-[16px] text-brand-danger">trending_up</span>
                </div>
              </div>
            </div>

            {/* Mitigation Options */}
            <div className="w-full flex flex-col gap-3 z-10 relative">
              <h3 className="font-label-xs text-label-xs text-outline uppercase border-b border-brand-border pb-1 mb-2">Recommended Mitigations</h3>
              <button className="w-full h-button_height bg-brand-primary text-white rounded-lg font-body text-body font-medium flex items-center justify-center gap-2 hover:bg-[#06b6d4] transition-colors focus-glow">
                <span className="material-symbols-outlined text-[18px]">security</span>
                Apply Forward Contract
              </button>
              <button className="w-full h-button_height bg-transparent border border-brand-primary text-brand-primary rounded-lg font-body text-body font-medium flex items-center justify-center gap-2 hover:bg-[rgba(8,145,178,0.1)] transition-colors focus-glow">
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
                Buy Currency Option
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 28% (~4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Risk Factors Card */}
          <div className="bg-brand-card rounded-xl card-border p-5">
            <h2 className="font-h3-caps text-h3-caps text-outline uppercase border-b border-brand-border pb-2 mb-5">Risk Factors</h2>
            <div className="flex flex-col gap-5">
              {/* Factor 1 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-body text-[13px] text-on-surface font-medium">Currency Volatility</span>
                  <span className="font-data-mono text-[12px] text-brand-danger font-bold">85/100</span>
                </div>
                <div className="w-full h-[6px] bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                  <div className="h-full bg-brand-danger w-[85%] relative">
                    <div className="absolute inset-0 bg-white opacity-20 w-1/2"></div>
                  </div>
                </div>
              </div>
              {/* Factor 2 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-body text-[13px] text-on-surface font-medium">Exposure Size</span>
                  <span className="font-data-mono text-[12px] text-[#F59E0B] font-bold">70/100</span>
                </div>
                <div className="w-full h-[6px] bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                  <div className="h-full bg-[#F59E0B] w-[70%]"></div>
                </div>
              </div>
              {/* Factor 3 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-body text-[13px] text-on-surface font-medium">Counterparty Rating</span>
                  <span className="font-data-mono text-[12px] text-brand-success font-bold">A+</span>
                </div>
                <div className="w-full h-[6px] bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                  <div className="h-full bg-brand-success w-[20%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Variance Mini-chart */}
          <div className="bg-brand-card rounded-xl card-border p-5 flex-1 flex flex-col">
            <h2 className="font-h3-caps text-h3-caps text-outline uppercase border-b border-brand-border pb-2 mb-4">Historical Variance (30d)</h2>
            <div className="flex-1 min-h-[120px] relative border-l border-b border-brand-border mt-2">
              {/* Decorative line chart for USD/IDR variance */}
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 Q10,75 20,60 T40,50 T60,80 T80,30 T100,20" fill="none" stroke="#DC2626" strokeWidth="2" />
                <path d="M0,80 Q10,75 20,60 T40,50 T60,80 T80,30 T100,20 L100,100 L0,100 Z" fill="rgba(220,38,38,0.1)" />
              </svg>
            </div>
            <div className="flex justify-between mt-2 font-data-mono text-[10px] text-outline">
              <span>-30d</span>
              <span>Today</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}