import { useState, useEffect } from 'react';
import useTransactions from '../hooks/useTransactions';

export default function CryptoSettlement() {
  const { data: transactions, loading, fetchTransactions } = useTransactions();
  const [network, setNetwork] = useState('erc20');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const pendingCrypto = (transactions || []).filter(t => t.tipe_transaksi === 'crypto' && t.status === 'pending');

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end w-full">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Crypto Settlement</h1>
          <p className="font-label-xs text-label-xs text-on-surface-variant mt-1">
            Execute and monitor blockchain-based cross-border payments.
          </p>
        </div>
        <div>
          <button className="h-button_height bg-transparent border border-outline-variant text-on-surface-variant px-4 rounded-lg font-label-xs text-label-xs flex items-center gap-2 hover:bg-surface-variant/50 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Tx History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (44% ~ 5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active Wallet Card */}
          <div className="bg-brand-midnight-card ghost-border rounded-xl p-5 flex flex-col relative overflow-hidden">
            {/* Background pattern placeholder */}
            <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[150px]">currency_bitcoin</span>
            </div>

            <h2 className="font-label-xs text-label-xs text-outline uppercase mb-4 relative z-10">Corporate Treasury Wallet</h2>
            
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="font-data-mono text-[24px] text-white font-bold">145,280.50</span>
              <span className="font-h3-caps text-h3-caps bg-[#1E2D44] px-2 py-1 rounded text-primary border border-brand-midnight-border">USDC</span>
            </div>
            
            <div className="font-data-mono text-[11px] text-on-surface-variant break-all mb-4 relative z-10 flex items-center gap-2">
              0x71C7656EC7ab88b098defB751B7401B5f6d8976F
              <button className="text-primary hover:text-white"><span className="material-symbols-outlined text-[14px]">content_copy</span></button>
            </div>
            
            <div className="mt-auto pt-4 border-t border-brand-midnight-border flex gap-4 relative z-10">
              <div className="flex flex-col">
                <span className="font-label-xs text-[10px] text-on-surface-variant uppercase">Network</span>
                <span className="font-data-mono text-[12px] text-white">Ethereum (ERC-20)</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-xs text-[10px] text-on-surface-variant uppercase">Est. Gas</span>
                <span className="font-data-mono text-[12px] text-[#22C55E]">12 Gwei</span>
              </div>
            </div>
          </div>

          {/* Settlement Form */}
          <div className="bg-brand-midnight-card ghost-border rounded-xl p-5 flex-1 flex flex-col">
            <h2 className="font-h2 text-h2 text-on-surface mb-5">Initiate Transfer</h2>
            
            <div className="flex flex-col gap-4">
              {/* Network Selection */}
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider mb-2">Select Network</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`cursor-pointer border rounded-md p-2 flex flex-col items-center justify-center text-center transition-colors ${network === 'erc20' ? 'bg-[#0891B2]/10 border-[#0891B2] text-primary' : 'bg-[#0F1B2D] border-[#1E3A5F] hover:border-outline-variant text-on-surface'}`} onClick={() => setNetwork('erc20')}>
                    <span className="font-body text-[13px] font-medium">Ethereum</span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant">ERC-20</span>
                  </label>
                  <label className={`cursor-pointer border rounded-md p-2 flex flex-col items-center justify-center text-center transition-colors ${network === 'polygon' ? 'bg-[#0891B2]/10 border-[#0891B2] text-primary' : 'bg-[#0F1B2D] border-[#1E3A5F] hover:border-outline-variant text-on-surface'}`} onClick={() => setNetwork('polygon')}>
                    <span className="font-body text-[13px] font-medium">Polygon</span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant">PoS</span>
                  </label>
                  <label className={`cursor-pointer border rounded-md p-2 flex flex-col items-center justify-center text-center transition-colors ${network === 'solana' ? 'bg-[#0891B2]/10 border-[#0891B2] text-primary' : 'bg-[#0F1B2D] border-[#1E3A5F] hover:border-outline-variant text-on-surface'}`} onClick={() => setNetwork('solana')}>
                    <span className="font-body text-[13px] font-medium">Solana</span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant">SPL</span>
                  </label>
                </div>
              </div>

              {/* Input Fields */}
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider mb-2">Destination Wallet Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">wallet</span>
                  <input className="w-full bg-brand-midnight-base border border-brand-midnight-border text-[#d6e3ff] h-10 pl-10 pr-3 rounded-md font-data-mono text-data-mono focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none" type="text" placeholder="0x..." />
                </div>
              </div>
              
              <div>
                <label className="block font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider mb-2">Amount</label>
                <div className="relative">
                  <input className="w-full bg-brand-midnight-base border border-brand-midnight-border text-[#d6e3ff] h-10 pl-3 pr-16 rounded-md font-data-mono text-data-mono text-right focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none" type="number" placeholder="0.00" />
                  <div className="absolute right-1 top-1 bottom-1 bg-[#1E2D44] px-3 flex items-center rounded text-on-surface font-label-xs text-label-xs border border-[#1E3A5F]">
                    USDC
                  </div>
                </div>
              </div>

              {/* Compliance Check */}
              <div className="mt-2 p-3 bg-[#16A34A]/10 border border-[#16A34A]/30 rounded-lg flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#16A34A]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#22C55E] text-[16px]">check_circle</span>
                </div>
                <div className="flex-1">
                  <div className="font-label-xs text-label-xs text-[#22C55E] font-medium">AML/KYC Compliance Verified</div>
                  <div className="font-label-xs text-label-xs text-on-surface-variant opacity-80 text-[10px] mt-0.5">Wallet cleared against global sanctions lists.</div>
                </div>
              </div>

              <div className="mt-auto pt-4 flex gap-3">
                <button className="flex-1 h-button_height bg-transparent border border-brand-teal text-brand-teal rounded-lg font-label-xs uppercase tracking-wider hover:bg-brand-teal/10 transition-colors">Cancel</button>
                <button className="flex-1 h-button_height bg-brand-teal text-white rounded-lg font-label-xs uppercase tracking-wider hover:bg-[#067A96] transition-colors">Initiate Settlement</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (56% ~ 7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Settlement Status Card */}
          <div className="bg-brand-midnight-card ghost-border rounded-xl flex flex-col p-5 h-full">
            <div className="border-b border-[#1E3A5F] pb-4 mb-5 flex justify-between items-center">
              <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monitoring</span>
                Settlement Status
              </h2>
              <span className="font-data-mono text-data-mono text-on-surface-variant bg-[#1E2D44] px-2 py-1 rounded border border-[#1E3A5F]">TRX-CRYPTO-0089</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Progress Ring Area */}
              <div className="flex flex-col items-center justify-center bg-[#0F1B2D] p-6 rounded-xl border border-[#1E3A5F]">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Background circle */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="45" stroke="#1E3A5F" strokeWidth="8"></circle>
                    {/* Progress circle (67% of 282.7 perimeter = offset 93.3) */}
                    <circle className="transition-all duration-1000 ease-in-out" cx="50" cy="50" fill="none" r="45" stroke="#0891B2" strokeDasharray="282.7" strokeDashoffset="93.3" strokeWidth="8"></circle>
                  </svg>
                  <div className="flex flex-col items-center text-center z-10">
                    <span className="font-h1 text-h1 text-primary">67%</span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant mt-1">4/6 Blocks</span>
                  </div>
                </div>
                <div className="mt-4 font-label-xs text-label-xs text-[#0891B2] animate-pulse">Awaiting final confirmations...</div>
              </div>

              {/* Vertical Timeline */}
              <div className="flex flex-col justify-center">
                <div className="relative pl-6 space-y-6">
                  {/* Line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#1E3A5F]"></div>
                  <div className="absolute left-[11px] top-2 h-[60%] w-0.5 bg-[#0891B2]"></div>

                  {/* Step 1 Completed */}
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-[#1E2D44] border border-[#0891B2] flex items-center justify-center z-10">
                      <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                    </div>
                    <div>
                      <div className="font-label-xs text-label-xs text-on-surface font-medium">Transaction Initiated</div>
                      <div className="font-label-xs text-label-xs text-on-surface-variant text-[10px]">10:42:01 UTC</div>
                    </div>
                  </div>

                  {/* Step 2 Completed */}
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-[#1E2D44] border border-[#0891B2] flex items-center justify-center z-10">
                      <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                    </div>
                    <div>
                      <div className="font-label-xs text-label-xs text-on-surface font-medium">Broadcast to Network</div>
                      <div className="font-label-xs text-label-xs text-on-surface-variant text-[10px] font-data-mono">TxHash: 0x8f7c...3b9a</div>
                    </div>
                  </div>

                  {/* Step 3 Current */}
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 shadow-[0_0_10px_rgba(8,145,178,0.5)]">
                      <div className="absolute w-full h-full rounded-full border-2 border-primary pulse-ring"></div>
                      <span className="material-symbols-outlined text-[14px] text-[#0F1B2D]">sync</span>
                    </div>
                    <div>
                      <div className="font-label-xs text-label-xs text-primary font-medium">Block Confirmations</div>
                      <div className="font-label-xs text-label-xs text-on-surface-variant text-[10px]">4 of 6 required blocks verified</div>
                    </div>
                  </div>

                  {/* Step 4 Pending */}
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-[#0F1B2D] border border-[#1E3A5F] flex items-center justify-center z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3e484d]"></span>
                    </div>
                    <div className="opacity-50">
                      <div className="font-label-xs text-label-xs text-on-surface font-medium">Final Settlement</div>
                      <div className="font-label-xs text-label-xs text-on-surface-variant text-[10px]">Awaiting block finality</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Requests List */}
            <div className="mt-auto border-t border-[#1E3A5F] pt-5">
              <h3 className="font-h3-caps text-h3-caps text-on-surface-variant mb-3">Pending Settlement Requests ({pendingCrypto.length})</h3>
              <div className="space-y-2">
                {pendingCrypto.slice(0, 3).map(t => (
                  <div key={t.id_transaksi} className="flex justify-between items-center p-3 bg-[#0F1B2D] border border-[#1E3A5F] rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-data-mono text-[12px] text-white">{t.nomor_referensi}</span>
                      <span className="font-label-xs text-[10px] text-on-surface-variant">{t.mata_uang_dari} &rarr; {t.mata_uang_ke}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-data-mono text-[12px] text-white">{t.jumlah_dari.toLocaleString()}</span>
                      <span className="font-label-xs text-[10px] text-[#F59E0B]">PENDING</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}