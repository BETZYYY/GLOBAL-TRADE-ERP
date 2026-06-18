export default function Reports() {
  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end w-full">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Reports</h1>
          <p className="font-body text-body text-on-surface-variant mt-1">Export and review financial risk reports</p>
        </div>
        <button className="h-button_height bg-[#0891B2] text-white px-4 rounded-lg font-label-xs text-label-xs flex items-center gap-2 hover:bg-[#067A96] transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: 'receipt_long', title: 'Transaction Report', desc: 'Full export of payment transactions with risk scores', date: 'Last generated: Today 09:41' },
          { icon: 'account_balance_wallet', title: 'Hedge Portfolio Report', desc: 'Active positions, maturity schedule, P&L summary', date: 'Last generated: Yesterday' },
          { icon: 'speed', title: 'Credit Risk Report', desc: 'Counterparty exposure, ratings and breach alerts', date: 'Last generated: Jun 17' },
          { icon: 'currency_exchange', title: 'Currency Basket Report', desc: 'Basket composition, weights and performance', date: 'Last generated: Jun 17' },
          { icon: 'payments', title: 'Payment Terms Report', desc: 'All counterparty payment terms and compliance status', date: 'Last generated: Jun 16' },
          { icon: 'currency_bitcoin', title: 'Crypto Settlement Report', desc: 'Crypto transaction log and settlement confirmations', date: 'Last generated: Jun 15' },
        ].map((r, i) => (
          <div key={i} className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-5 flex flex-col gap-4 hover:border-[#0891B2]/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-[#0891B2]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0891B2] text-[20px]">{r.icon}</span>
            </div>
            <div>
              <h3 className="font-h2 text-h2 text-white mb-1">{r.title}</h3>
              <p className="font-body text-body text-on-surface-variant text-[13px]">{r.desc}</p>
            </div>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-[11px] text-on-surface-variant font-data-mono">{r.date}</span>
              <button className="flex items-center gap-1 text-[#0891B2] text-[12px] font-bold hover:underline cursor-pointer">
                <span className="material-symbols-outlined text-[14px]">download</span> Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
