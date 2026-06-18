import { useState } from 'react';

export default function CurrencyBasket() {
  const [selectedCurrencies, setSelectedCurrencies] = useState({
    USD: true,
    EUR: true,
    JPY: true,
    GBP: true,
    CAD: false,
    AUD: false,
    CNY: false,
    CHF: false
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', color: '#0891B2' },
    { code: 'EUR', name: 'Euro', color: '#06b6d4' },
    { code: 'JPY', name: 'Japanese Yen', color: '#d97706' },
    { code: 'GBP', name: 'British Pound', color: '#64748b' },
    { code: 'CAD', name: 'Canadian Dollar', color: '#10b981' },
    { code: 'AUD', name: 'Australian Dollar', color: '#f59e0b' },
    { code: 'CNY', name: 'Chinese Yuan', color: '#ef4444' },
    { code: 'CHF', name: 'Swiss Franc', color: '#8b5cf6' }
  ];

  const handleToggle = (code) => {
    setSelectedCurrencies(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const selectedCount = Object.values(selectedCurrencies).filter(Boolean).length;

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col h-full bg-brand-midnight-base">
      {/* Page Header */}
      <div className="flex justify-between items-center w-full mb-6">
        <div className="flex items-center gap-6">
          <h1 className="font-h2 text-h2 font-bold text-brand-teal">Treasury Risk Manager</h1>
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input className="bg-brand-midnight-card ghost-border text-white font-body text-body rounded-md pl-9 pr-4 py-1.5 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none w-64 placeholder-on-surface-variant" placeholder="Search..." type="text"/>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 h-full">
          <a className="h-full flex items-center text-on-surface-variant hover:text-brand-teal transition-colors font-medium" href="#portfolio">Portfolio</a>
          <a className="h-full flex items-center text-on-surface-variant hover:text-brand-teal transition-colors font-medium" href="#liquidity">Liquidity</a>
          <a className="h-full flex items-center text-brand-teal border-b-2 border-brand-teal pb-1 font-medium" href="#forex">Forex</a>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
        {/* Left Column: Basket Configuration (span 4/12 ~ 33%) */}
        <div className="lg:col-span-4 flex flex-col h-full bg-brand-midnight-card ghost-border rounded-xl flex-1 overflow-hidden">
          
          <div className="p-4 border-b border-brand-midnight-border flex justify-between items-center bg-[#1E2D44]/30">
            <h2 className="font-h2 text-h2 text-white">Basket Configuration</h2>
            <button className="text-brand-teal hover:underline text-sm font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">add</span> Add
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Checked Rows */}
            {currencies.filter(c => selectedCurrencies[c.code]).map((c) => (
              <label key={c.code} className="flex items-center justify-between p-3 rounded bg-brand-teal/10 border border-brand-teal/20 cursor-pointer hover:bg-brand-teal/20 transition-colors">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked 
                    onChange={() => handleToggle(c.code)}
                    className="rounded border-outline-variant bg-surface text-brand-teal focus:ring-brand-teal"
                  />
                  <div className="flex flex-col">
                    <span className="font-data-mono text-data-mono font-bold text-white">{c.code}</span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant">{c.name}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-brand-teal text-sm">drag_indicator</span>
              </label>
            ))}

            <div className="my-2 border-t border-brand-midnight-border/50"></div>

            {/* Unchecked Rows */}
            {currencies.filter(c => !selectedCurrencies[c.code]).map((c) => (
              <label key={c.code} className="flex items-center justify-between p-3 rounded border border-transparent cursor-pointer hover:bg-brand-midnight-base transition-colors group">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={false} 
                    onChange={() => handleToggle(c.code)}
                    className="rounded border-outline-variant bg-surface text-brand-teal focus:ring-brand-teal"
                  />
                  <div className="flex flex-col opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="font-data-mono text-data-mono font-bold text-white">{c.code}</span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant">{c.name}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-brand-midnight-border bg-[#1E2D44]/10 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-label-xs text-label-xs text-on-surface-variant">{selectedCount} currencies selected</span>
              <span className="font-label-xs text-label-xs text-on-surface-variant">Min 2 req.</span>
            </div>
            <button className="w-full h-button_height bg-brand-teal hover:bg-[#06b6d4] text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2 focus-glow">
              <span className="material-symbols-outlined text-sm">auto_fix_high</span>
              Apply Optimization
            </button>
          </div>
        </div>

        {/* Right Column: Visualizations (span 8/12 ~ 67%) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          {/* Recommended Allocation Card */}
          <div className="bg-brand-midnight-card ghost-border rounded-xl p-6 flex flex-col min-h-[340px]">
            <div className="border-b border-brand-midnight-border pb-3 mb-6 flex justify-between items-center">
              <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Recommended Allocation</h3>
              <button className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">more_vert</span>
              </button>
            </div>
            <div className="flex-1 flex items-center gap-12 px-4">
              {/* Donut Chart Area */}
              <div className="relative w-48 h-48 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#1E3A5F" strokeWidth="15"></circle>
                  {/* Fake donut data just to match the visual */}
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#0891B2" strokeDasharray="113.1 251.2" strokeDashoffset="0" strokeWidth="15"></circle>
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#06b6d4" strokeDasharray="62.8 251.2" strokeDashoffset="-113.1" strokeWidth="15"></circle>
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#d97706" strokeDasharray="50.2 251.2" strokeDashoffset="-175.9" strokeWidth="15"></circle>
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#64748b" strokeDasharray="25.1 251.2" strokeDashoffset="-226.1" strokeWidth="15"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-data-mono text-data-mono text-white text-xl">{selectedCount}</span>
                  <span className="font-label-xs text-label-xs text-on-surface-variant uppercase">Assets</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between p-2 rounded hover:bg-brand-midnight-base transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#0891B2]"></div>
                    <span className="font-data-mono text-data-mono font-bold text-white">USD</span>
                    <span className="font-body text-body text-on-surface-variant min-w-[40px]">45%</span>
                  </div>
                  <span className="font-data-mono text-data-mono text-on-surface-variant">Rp 30.3B</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-brand-midnight-base transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#06b6d4]"></div>
                    <span className="font-data-mono text-data-mono font-bold text-white">EUR</span>
                    <span className="font-body text-body text-on-surface-variant min-w-[40px]">25%</span>
                  </div>
                  <span className="font-data-mono text-data-mono text-on-surface-variant">Rp 16.8B</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-brand-midnight-base transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#d97706]"></div>
                    <span className="font-data-mono text-data-mono font-bold text-white">JPY</span>
                    <span className="font-body text-body text-on-surface-variant min-w-[40px]">20%</span>
                  </div>
                  <span className="font-data-mono text-data-mono text-on-surface-variant">Rp 13.5B</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-brand-midnight-base transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#64748b]"></div>
                    <span className="font-data-mono text-data-mono font-bold text-white">GBP</span>
                    <span className="font-body text-body text-on-surface-variant min-w-[40px]">10%</span>
                  </div>
                  <span className="font-data-mono text-data-mono text-on-surface-variant">Rp 6.7B</span>
                </div>
              </div>
            </div>
          </div>

          {/* Correlation Matrix Card */}
          <div className="bg-brand-midnight-card ghost-border rounded-xl p-6 flex flex-col flex-1">
            <div className="border-b border-brand-midnight-border pb-3 mb-6 flex justify-between items-center">
              <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Correlation Matrix</h3>
              <div className="flex items-center gap-2 font-label-xs text-label-xs text-on-surface-variant">
                <span>Low</span>
                <div className="w-16 h-2 rounded bg-gradient-to-r from-[#0F1B2D] to-brand-teal"></div>
                <span>High</span>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="w-full overflow-x-auto flex-1">
              <div className="grid grid-cols-5 gap-1 min-w-[400px]">
                {/* Header Row */}
                <div className="h-10"></div>
                <div className="h-10 flex items-center justify-center font-data-mono text-data-mono font-bold text-on-surface-variant">USD</div>
                <div className="h-10 flex items-center justify-center font-data-mono text-data-mono font-bold text-on-surface-variant">EUR</div>
                <div className="h-10 flex items-center justify-center font-data-mono text-data-mono font-bold text-on-surface-variant">JPY</div>
                <div className="h-10 flex items-center justify-center font-data-mono text-data-mono font-bold text-on-surface-variant">GBP</div>

                {/* Row 1: USD */}
                <div className="h-12 flex items-center justify-end pr-4 font-data-mono text-data-mono font-bold text-on-surface-variant border-r border-brand-midnight-border/50">USD</div>
                <div className="h-12 bg-[#0891B2] flex items-center justify-center font-data-mono text-data-mono text-white font-bold rounded-sm">1.00</div>
                <div className="h-12 bg-[#0891B2]/80 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.82</div>
                <div className="h-12 bg-[#0891B2]/30 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.34</div>
                <div className="h-12 bg-[#0891B2]/60 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.61</div>

                {/* Row 2: EUR */}
                <div className="h-12 flex items-center justify-end pr-4 font-data-mono text-data-mono font-bold text-on-surface-variant border-r border-brand-midnight-border/50">EUR</div>
                <div className="h-12 bg-[#0891B2]/80 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.82</div>
                <div className="h-12 bg-[#0891B2] flex items-center justify-center font-data-mono text-data-mono text-white font-bold rounded-sm">1.00</div>
                <div className="h-12 bg-[#0891B2]/20 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.25</div>
                <div className="h-12 bg-[#0891B2]/70 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.74</div>

                {/* Row 3: JPY */}
                <div className="h-12 flex items-center justify-end pr-4 font-data-mono text-data-mono font-bold text-on-surface-variant border-r border-brand-midnight-border/50">JPY</div>
                <div className="h-12 bg-[#0891B2]/30 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.34</div>
                <div className="h-12 bg-[#0891B2]/20 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.25</div>
                <div className="h-12 bg-[#0891B2] flex items-center justify-center font-data-mono text-data-mono text-white font-bold rounded-sm">1.00</div>
                <div className="h-12 bg-[#0891B2]/40 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.41</div>

                {/* Row 4: GBP */}
                <div className="h-12 flex items-center justify-end pr-4 font-data-mono text-data-mono font-bold text-on-surface-variant border-r border-brand-midnight-border/50">GBP</div>
                <div className="h-12 bg-[#0891B2]/60 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.61</div>
                <div className="h-12 bg-[#0891B2]/70 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.74</div>
                <div className="h-12 bg-[#0891B2]/40 flex items-center justify-center font-data-mono text-data-mono text-white rounded-sm">0.41</div>
                <div className="h-12 bg-[#0891B2] flex items-center justify-center font-data-mono text-data-mono text-white font-bold rounded-sm">1.00</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
