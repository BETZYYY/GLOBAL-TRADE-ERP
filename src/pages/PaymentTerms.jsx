import { useState } from 'react';
import api from '../lib/api';

export default function PaymentTerms() {
  const [payMethod, setPayMethod] = useState('lc');
  const [duration, setDuration] = useState('net60');
  const [partnerCountry, setPartnerCountry] = useState('Japan');
  const [transactionValue, setTransactionValue] = useState('150000');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async () => {
    if (!partnerCountry || !transactionValue) {
      alert('Please fill Company Name and Transaction Value');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/payment-terms/optimize', {
        negara_mitra: partnerCountry,
        nilai_transaksi: transactionValue,
        metode_pembayaran: payMethod,
        durasi_preferensi: duration
      });
      setResults(res.data?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-6 max-w-full">
      
      {/* Page Title */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end w-full max-w-[1600px] mx-auto">
        <h1 className="font-h1 text-h1 text-white">Payment Term Optimizer</h1>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Input Form (38% roughly ~ 5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-brand-midnight-card ghost-border rounded-xl p-6 flex flex-col">
            <div className="border-b border-brand-midnight-border pb-3 mb-5">
              <h2 className="font-h3-caps text-h3-caps text-on-surface-variant">PARTNER DETAILS</h2>
            </div>
            
            <div className="space-y-5">
              {/* Company Name */}
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1.5">Company Name</label>
                <input 
                  className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white px-3 py-2 rounded-lg font-body text-body outline-none focus:border-[#0891B2]" 
                  readOnly 
                  type="text" 
                  value="Tanaka Trading Co., Ltd."
                />
              </div>

              {/* Partner Country & Transaction Value Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1.5">Partner Country</label>
                  <div className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white px-3 py-2 rounded-lg font-body text-body flex items-center">
                    <span className="mr-2 text-lg leading-none">🇯🇵</span> 
                    <input 
                      type="text" 
                      className="bg-transparent border-none outline-none flex-1" 
                      value={partnerCountry} 
                      onChange={e => setPartnerCountry(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-label-xs text-label-xs text-on-surface-variant mb-1.5">Transaction Value</label>
                  <input 
                    className="w-full bg-[#0F1B2D] border border-[#1E3A5F] text-white px-3 py-2 rounded-lg font-data-mono text-data-mono text-right outline-none focus:border-[#0891B2]" 
                    type="number" 
                    value={transactionValue}
                    onChange={e => setTransactionValue(e.target.value)}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-2">Current Payment Method</label>
                <div className="space-y-2">
                  <label className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-colors ${payMethod === 'lc' ? 'border-[#0891B2] bg-[#0891B2]/10' : 'border-transparent hover:bg-[#0F1B2D]'}`}>
                    <input 
                      className="custom-radio" 
                      name="pay_method" 
                      type="radio"
                      checked={payMethod === 'lc'}
                      onChange={() => setPayMethod('lc')}
                    />
                    <span className="ml-3 font-body text-body text-white">Letter of Credit (LC)</span>
                  </label>
                  <label className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-colors ${payMethod === 'open' ? 'border-[#0891B2] bg-[#0891B2]/10' : 'border-transparent hover:bg-[#0F1B2D]'}`}>
                    <input 
                      className="custom-radio" 
                      name="pay_method" 
                      type="radio"
                      checked={payMethod === 'open'}
                      onChange={() => setPayMethod('open')}
                    />
                    <span className="ml-3 font-body text-body text-on-surface-variant">Open Account</span>
                  </label>
                  <label className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-colors ${payMethod === 'doc' ? 'border-[#0891B2] bg-[#0891B2]/10' : 'border-transparent hover:bg-[#0F1B2D]'}`}>
                    <input 
                      className="custom-radio" 
                      name="pay_method" 
                      type="radio"
                      checked={payMethod === 'doc'}
                      onChange={() => setPayMethod('doc')}
                    />
                    <span className="ml-3 font-body text-body text-on-surface-variant">Documentary Collection</span>
                  </label>
                  <label className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-colors ${payMethod === 'cash' ? 'border-[#0891B2] bg-[#0891B2]/10' : 'border-transparent hover:bg-[#0F1B2D]'}`}>
                    <input 
                      className="custom-radio" 
                      name="pay_method" 
                      type="radio"
                      checked={payMethod === 'cash'}
                      onChange={() => setPayMethod('cash')}
                    />
                    <span className="ml-3 font-body text-body text-on-surface-variant">Cash in Advance</span>
                  </label>
                </div>
              </div>

              {/* Preferred Duration */}
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant mb-2">Target Duration</label>
                <div className="flex p-1 bg-[#0F1B2D] border border-brand-midnight-border rounded-lg">
                  <button 
                    onClick={() => setDuration('net30')}
                    className={`flex-1 py-1.5 text-center font-data-mono text-[12px] rounded-md transition-colors ${duration === 'net30' ? 'bg-[#16243B] text-brand-teal border border-brand-midnight-border shadow-sm' : 'text-on-surface-variant hover:text-white'}`}
                  >
                    Net 30
                  </button>
                  <button 
                    onClick={() => setDuration('net60')}
                    className={`flex-1 py-1.5 text-center font-data-mono text-[12px] rounded-md transition-colors ${duration === 'net60' ? 'bg-[#16243B] text-brand-teal border border-brand-midnight-border shadow-sm' : 'text-on-surface-variant hover:text-white'}`}
                  >
                    Net 60
                  </button>
                  <button 
                    onClick={() => setDuration('net90')}
                    className={`flex-1 py-1.5 text-center font-data-mono text-[12px] rounded-md transition-colors ${duration === 'net90' ? 'bg-[#16243B] text-brand-teal border border-brand-midnight-border shadow-sm' : 'text-on-surface-variant hover:text-white'}`}
                  >
                    Net 90
                  </button>
                </div>
              </div>

            </div>

            <div className="mt-8">
              <button disabled={isLoading} onClick={handleOptimize} className="w-full h-button_height bg-[#0891B2] text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#067A96] transition-colors cursor-pointer disabled:opacity-50">
                <span className="material-symbols-outlined mr-2 text-[18px]">model_training</span>
                {isLoading ? 'Optimizing...' : 'Optimize Payment Term'}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Results (62% roughly ~ 7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-h2 text-h2 text-white">Recommendation Results</h2>
            <div className="px-2.5 py-1 rounded bg-[#16A34A]/10 border border-[#16A34A] flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mr-2 shadow-[0_0_4px_#22C55E]"></span>
              <span className="font-h3-caps text-[10px] font-bold text-[#22C55E] tracking-wider">JAPAN · LOW RISK</span>
            </div>
          </div>

          {/* Card A: Recommended */}
          {!results ? (
            <>
              <div className="bg-gradient-to-br from-[#16243B] to-[#0F1B2D] border border-brand-teal/40 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 bg-brand-teal text-[#0F1B2D] font-h3-caps text-[9px] px-3 py-1 rounded-bl-lg font-bold flex items-center shadow-[0_0_10px_rgba(8,145,178,0.3)]">
              <span className="material-symbols-outlined text-[12px] mr-1">verified</span> RECOMMENDED
            </div>
            
            <div className="flex justify-between items-start mb-4 pr-24 relative z-10">
              <div>
                <div className="flex items-end gap-3 mb-1">
                  <span className="font-data-mono text-xl font-bold text-white">Net 30</span>
                  <span className="text-on-surface-variant font-body">—</span>
                  <span className="font-body font-medium text-white">Letter of Credit (LC)</span>
                </div>
                <div className="text-xs text-on-surface-variant font-body mt-1">Optimal balance of security and cash flow</div>
              </div>
              <div className="text-right">
                <div className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase">Cash Flow Impact</div>
                <div className="font-data-mono text-lg text-[#22C55E] font-medium">+$2,100 <span className="text-xs text-on-surface-variant font-body">saved</span></div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 items-center relative z-10">
              <div className="col-span-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-label-xs text-label-xs text-on-surface-variant">Risk Exposure</span>
                  <span className="font-data-mono text-[11px] text-brand-teal">28%</span>
                </div>
                <div className="h-1.5 w-full bg-[#0F1B2D] rounded-full overflow-hidden border border-brand-midnight-border">
                  <div className="h-full bg-brand-teal rounded-full relative shadow-[0_0_8px_rgba(8,145,178,0.5)]" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div className="col-span-8 border-l border-brand-midnight-border pl-6 py-1">
                <p className="text-sm font-body text-on-surface-variant leading-relaxed italic">
                  "Japan shows stable payment behavior. LC at Net 30 mitigates FX volatility risk while securing working capital ahead of regional average."
                </p>
              </div>
            </div>
          </div>

          {/* Card B */}
          <div className="bg-brand-midnight-card ghost-border rounded-xl p-5 hover:border-outline-variant transition-colors group cursor-default">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-end gap-3 mb-1">
                  <span className="font-data-mono text-lg font-medium text-white">Net 60</span>
                  <span className="text-on-surface-variant font-body">—</span>
                  <span className="font-body text-white">Open Account</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase">Cash Flow Impact</div>
                <div className="font-data-mono text-[15px] text-[#F87171]">-$800 <span className="text-[11px] text-on-surface-variant font-body">cost</span></div>
              </div>
            </div>
            <div className="w-1/3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-label-xs text-label-xs text-on-surface-variant">Risk Exposure</span>
                <span className="font-data-mono text-[11px] text-[#F59E0B]">41%</span>
              </div>
              <div className="h-1.5 w-full bg-[#0F1B2D] rounded-full overflow-hidden border border-brand-midnight-border">
                <div className="h-full bg-[#F59E0B] rounded-full opacity-80" style={{ width: '41%' }}></div>
              </div>
            </div>
          </div>

          {/* Card C */}
          <div className="bg-brand-midnight-card ghost-border rounded-xl p-5 hover:border-outline-variant transition-colors group cursor-default">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-end gap-3 mb-1">
                  <span className="font-data-mono text-lg font-medium text-white">Net 90</span>
                  <span className="text-on-surface-variant font-body">—</span>
                  <span className="font-body text-white">Doc. Collection</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase">Cash Flow Impact</div>
                <div className="font-data-mono text-[15px] text-[#F87171]">-$2,400 <span className="text-[11px] text-on-surface-variant font-body">cost</span></div>
              </div>
            </div>
            <div className="w-1/3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-label-xs text-label-xs text-on-surface-variant">Risk Exposure</span>
                <span className="font-data-mono text-[11px] text-[#F59E0B]">55%</span>
              </div>
              <div className="h-1.5 w-full bg-[#0F1B2D] rounded-full overflow-hidden border border-brand-midnight-border">
                <div className="h-full bg-[#F59E0B] rounded-full opacity-80" style={{ width: '55%' }}></div>
              </div>
            </div>
          </div>

          {/* Mini Country Profile Footer */}
          <div className="mt-auto pt-4 border-t border-[#1E3A5F]">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant mb-3 flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-1.5">public</span>
              COUNTRY RISK PROFILE
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#0F1B2D] p-3 rounded-lg border border-[#1E3A5F]">
                <div className="font-label-xs text-label-xs text-on-surface-variant mb-1">Country Rating</div>
                <div className="font-data-mono text-[15px] font-bold text-white flex items-center">
                  A+ <span className="ml-2 text-[10px] text-[#22C55E] flex items-center"><span className="material-symbols-outlined text-[12px]">trending_up</span></span>
                </div>
              </div>
              <div className="bg-[#0F1B2D] p-3 rounded-lg border border-[#1E3A5F]">
                <div className="font-label-xs text-label-xs text-on-surface-variant mb-1">Payment History</div>
                <div className="font-body text-sm font-medium text-[#22C55E]">Excellent</div>
              </div>
              <div className="bg-[#0F1B2D] p-3 rounded-lg border border-[#1E3A5F]">
                <div className="font-label-xs text-label-xs text-on-surface-variant mb-1">Currency Stability</div>
                <div className="font-body text-sm font-medium text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#0891B2] mr-2"></span> Low Volatility
                </div>
              </div>
            </div>
          </div>
            </>
          ) : (
            <>
              {/* Dynamic API Result Card - Recommended */}
              {Array.isArray(results) ? results.map((r, i) => (
                <div key={i} className={`rounded-xl p-5 relative overflow-hidden ${i === 0 ? 'bg-gradient-to-br from-[#16243B] to-[#0F1B2D] border border-brand-teal/40' : 'bg-brand-midnight-card ghost-border hover:border-outline-variant transition-colors'}`}>
                  {i === 0 && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute top-0 right-0 bg-brand-teal text-[#0F1B2D] font-h3-caps text-[9px] px-3 py-1 rounded-bl-lg font-bold flex items-center shadow-[0_0_10px_rgba(8,145,178,0.3)]">
                        <span className="material-symbols-outlined text-[12px] mr-1">verified</span> RECOMMENDED
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-start mb-4 pr-24 relative z-10">
                    <div>
                      <div className="flex items-end gap-3 mb-1">
                        <span className="font-data-mono text-xl font-bold text-white">{r.durasi || r.durasi_preferensi || 'N/A'}</span>
                        <span className="text-on-surface-variant font-body">—</span>
                        <span className="font-body font-medium text-white">{r.metode_pembayaran || r.payment_method || 'N/A'}</span>
                      </div>
                      {r.rekomendasi && <div className="text-xs text-on-surface-variant font-body mt-1">{r.rekomendasi}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase">Cash Flow Impact</div>
                      <div className={`font-data-mono text-lg font-medium ${(r.dampak_cash_flow || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#F87171]'}`}>
                        {(r.dampak_cash_flow || 0) >= 0 ? '+' : ''}{r.dampak_cash_flow ? `$${Math.abs(r.dampak_cash_flow).toLocaleString()}` : 'N/A'}
                        {(r.dampak_cash_flow || 0) >= 0 && <span className="text-xs text-on-surface-variant font-body"> saved</span>}
                      </div>
                    </div>
                  </div>
                  {r.eksposur_risiko !== undefined && (
                    <div className="w-1/3 relative z-10">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-label-xs text-label-xs text-on-surface-variant">Risk Exposure</span>
                        <span className="font-data-mono text-[11px] text-brand-teal">{r.eksposur_risiko}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0F1B2D] rounded-full overflow-hidden border border-brand-midnight-border">
                        <div className="h-full bg-brand-teal rounded-full relative shadow-[0_0_8px_rgba(8,145,178,0.5)]" style={{ width: `${r.eksposur_risiko}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-[#0891B2]">task_alt</span>
                    <h3 className="font-h3-caps text-h3-caps text-on-surface-variant">OPTIMIZATION RESULT</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {results.metode_rekomendasi && (
                      <div className="bg-[#0F1B2D] p-3 rounded-lg border border-[#1E3A5F]">
                        <div className="font-label-xs text-label-xs text-on-surface-variant mb-1">Recommended Method</div>
                        <div className="font-data-mono text-sm font-bold text-[#06B6D4]">{results.metode_rekomendasi}</div>
                      </div>
                    )}
                    {results.durasi_optimal && (
                      <div className="bg-[#0F1B2D] p-3 rounded-lg border border-[#1E3A5F]">
                        <div className="font-label-xs text-label-xs text-on-surface-variant mb-1">Optimal Duration</div>
                        <div className="font-data-mono text-sm font-bold text-white">{results.durasi_optimal}</div>
                      </div>
                    )}
                    {results.penghematan && (
                      <div className="bg-[#0F1B2D] p-3 rounded-lg border border-[#1E3A5F]">
                        <div className="font-label-xs text-label-xs text-on-surface-variant mb-1">Estimated Savings</div>
                        <div className="font-data-mono text-sm font-bold text-[#22C55E]">{results.penghematan}</div>
                      </div>
                    )}
                    {results.skor_risiko !== undefined && (
                      <div className="bg-[#0F1B2D] p-3 rounded-lg border border-[#1E3A5F]">
                        <div className="font-label-xs text-label-xs text-on-surface-variant mb-1">Risk Score</div>
                        <div className="font-data-mono text-sm font-bold text-[#F59E0B]">{results.skor_risiko}</div>
                      </div>
                    )}
                  </div>
                  {results.catatan && (
                    <p className="mt-4 text-sm font-body text-on-surface-variant italic border-t border-[#1E3A5F] pt-3">{results.catatan}</p>
                  )}
                  {(!results.metode_rekomendasi && !results.durasi_optimal && !results.penghematan) && (
                    <pre className="text-white font-data-mono text-xs overflow-auto mt-2">{JSON.stringify(results, null, 2)}</pre>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}