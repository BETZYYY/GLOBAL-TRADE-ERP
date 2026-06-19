import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const ALLOCATIONS = {
  USD: 45, EUR: 25, JPY: 20, GBP: 10,
  CAD: 8, AUD: 7, CNY: 6, CHF: 4
};

const COLORS = ['#0891B2','#06B6D4','#D97706','#475569',
                '#16A34A','#7C3AED','#DC2626','#0E7490'];

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

  const selectedAllocations = useMemo(() => {
    const selected = currencies.filter(c => selectedCurrencies[c.code]);
    if (selected.length === 0) return [];
    const total = selected.reduce((sum, c) => 
      sum + (ALLOCATIONS[c.code] || 5), 0);
    let cumulative = 0;
    return selected.map(c => {
      const pct = (ALLOCATIONS[c.code] || 5) / total * 100;
      const start = cumulative;
      cumulative += pct;
      return { ...c, pct: Math.round(pct), start };
    });
  }, [selectedCurrencies, currencies]);

  const portfolioVolatility = useMemo(() => {
    if (selectedCount <= 1) return 4.82;
    return Math.max(0.5, (4.82 / selectedCount * 0.8)).toFixed(2);
  }, [selectedCount]);

  const correlationRisk = useMemo(() => {
    if (selectedCount <= 1) return 1.0;
    return Math.max(0.1, (1.0 - selectedCount * 0.12)).toFixed(2);
  }, [selectedCount]);

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-6 max-w-full bg-[#0F1B2D] min-h-screen">
      {/* Page Title */}
      <div>
        <h1 className="font-h1 text-h1 text-white">Alternative Currency Basket</h1>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-5 flex flex-col gap-2">
          <span className="font-h3-caps text-h3-caps text-on-surface-variant uppercase tracking-widest">Portfolio Volatility</span>
          <span className="font-data-mono text-[20px] font-bold text-white">{portfolioVolatility}%</span>
          <span className="font-body text-sm text-[#22C55E]">-56% vs single-currency</span>
        </div>
        <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-5 flex flex-col gap-2">
          <span className="font-h3-caps text-h3-caps text-on-surface-variant uppercase tracking-widest">Correlation Risk</span>
          <span className="font-data-mono text-[20px] font-bold text-white">{correlationRisk}</span>
          <span className="font-body text-sm text-[#0D9488]">Moderate — Good diversification</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
        {/* Left Column: Select Currencies (~33%) */}
        <div className="lg:col-span-4 flex flex-col h-full bg-[#16243B] border border-[#1E3A5F] rounded-xl flex-1 overflow-hidden">
          
          <div className="p-4 border-b border-[#1E3A5F] flex justify-between items-center bg-[#1E2D44]/30">
            <h2 className="font-h2 text-h2 text-white">Select Currencies</h2>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#1E3A5F] text-on-surface-variant hover:bg-[#0F1B2D] hover:text-white transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Checked Rows */}
            {currencies.filter(c => selectedCurrencies[c.code]).map((c) => (
              <label key={c.code} className="flex items-center justify-between p-3 rounded bg-[#0891B2]/8 border border-[#0891B2]/20 cursor-pointer hover:bg-[#0891B2]/15 transition-colors" style={{ background: 'rgba(8,145,178,0.08)' }}>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked 
                    onChange={() => handleToggle(c.code)}
                    className="rounded border-[#1E3A5F] bg-[#0F1B2D] text-[#0891B2] focus:ring-[#0891B2]"
                  />
                  <div className="flex flex-col">
                    <span className="font-data-mono text-data-mono font-bold text-white">{c.code}</span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant">{c.name}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#0891B2] text-sm">drag_indicator</span>
              </label>
            ))}

            <div className="my-2 border-t border-[#1E3A5F]/50"></div>

            {/* Unchecked Rows */}
            {currencies.filter(c => !selectedCurrencies[c.code]).map((c) => (
              <label key={c.code} className="flex items-center justify-between p-3 rounded border border-transparent cursor-pointer hover:bg-[#0F1B2D] transition-colors group">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={false} 
                    onChange={() => handleToggle(c.code)}
                    className="rounded border-[#1E3A5F] bg-[#0F1B2D] text-[#0891B2] focus:ring-[#0891B2]"
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
          <div className="p-4 border-t border-[#1E3A5F] bg-[#1E2D44]/10 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-label-xs text-label-xs text-on-surface-variant">{selectedCount} currencies selected</span>
              <span className="font-label-xs text-label-xs text-on-surface-variant">Min 2 req.</span>
            </div>
            <button className="w-full h-button_height bg-[#0891B2] hover:bg-[#067A96] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-sm">auto_fix_high</span>
              Apply Optimization
            </button>
          </div>
        </div>

        {/* Right Column: Visualizations (~67%) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          {/* Recommended Allocation Card */}
          <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-6 flex flex-col min-h-[340px]">
            <div className="border-b border-[#1E3A5F] pb-3 mb-6 flex justify-between items-center">
              <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Recommended Allocation</h3>
              <button className="text-on-surface-variant hover:text-white transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">more_vert</span>
              </button>
            </div>
            <div className="flex-1 flex items-center gap-12 px-4">
              {/* Donut Chart Area */}
              <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                <PieChart width={200} height={200}>
                  <Pie 
                    data={selectedAllocations} 
                    dataKey="pct" 
                    innerRadius={60} 
                    outerRadius={90}
                    stroke="none"
                  >
                    {selectedAllocations.map((_, i) => 
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    )}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-data-mono text-data-mono text-white text-xl">{selectedCount}</span>
                  <span className="font-label-xs text-label-xs text-on-surface-variant uppercase">Assets</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-3">
                {selectedAllocations.map(item => (
                  <div key={item.code} className="flex items-center justify-between p-2 rounded hover:bg-[#0F1B2D] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                      <span className="font-data-mono text-data-mono font-bold text-white">{item.code}</span>
                      <span className="font-body text-body text-on-surface-variant min-w-[40px]">{item.pct}%</span>
                    </div>
                    <span className="font-data-mono text-data-mono text-on-surface-variant">Rp {((item.pct / 100) * 67.3).toFixed(1)}B</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Correlation Matrix Card */}
          <div className="bg-[#16243B] border border-[#1E3A5F] rounded-xl p-6 flex flex-col flex-1">
            <div className="border-b border-[#1E3A5F] pb-3 mb-6 flex justify-between items-center">
              <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase">Correlation Matrix</h3>
              <div className="flex items-center gap-2 font-label-xs text-label-xs text-on-surface-variant">
                <span>Low</span>
                <div className="w-16 h-2 rounded bg-gradient-to-r from-[#0F1B2D] to-[#0891B2]"></div>
                <span>High</span>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="w-full overflow-x-auto flex-1">
              <div className="grid grid-cols-5 gap-1 min-w-[400px]">
                {/* Header Row */}
                <div className="h-10"></div>
                {['USD','EUR','JPY','GBP'].map(h => (
                  <div key={h} className="h-10 flex items-center justify-center font-data-mono text-data-mono font-bold text-on-surface-variant">{h}</div>
                ))}

                {/* Row 1: USD */}
                <div className="h-12 flex items-center justify-end pr-4 font-data-mono text-data-mono font-bold text-on-surface-variant border-r border-[#1E3A5F]/50">USD</div>
                <div className="h-12 bg-[#0891B2] flex items-center justify-center font-data-mono text-data-mono text-white font-bold rounded">1.00</div>
                <div className="h-12 bg-[#0891B2]/80 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.82</div>
                <div className="h-12 bg-[#0891B2]/30 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.34</div>
                <div className="h-12 bg-[#0891B2]/60 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.61</div>

                {/* Row 2: EUR */}
                <div className="h-12 flex items-center justify-end pr-4 font-data-mono text-data-mono font-bold text-on-surface-variant border-r border-[#1E3A5F]/50">EUR</div>
                <div className="h-12 bg-[#0891B2]/80 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.82</div>
                <div className="h-12 bg-[#0891B2] flex items-center justify-center font-data-mono text-data-mono text-white font-bold rounded">1.00</div>
                <div className="h-12 bg-[#0891B2]/20 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.25</div>
                <div className="h-12 bg-[#0891B2]/70 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.74</div>

                {/* Row 3: JPY */}
                <div className="h-12 flex items-center justify-end pr-4 font-data-mono text-data-mono font-bold text-on-surface-variant border-r border-[#1E3A5F]/50">JPY</div>
                <div className="h-12 bg-[#0891B2]/30 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.34</div>
                <div className="h-12 bg-[#0891B2]/20 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.25</div>
                <div className="h-12 bg-[#0891B2] flex items-center justify-center font-data-mono text-data-mono text-white font-bold rounded">1.00</div>
                <div className="h-12 bg-[#0891B2]/40 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.41</div>

                {/* Row 4: GBP */}
                <div className="h-12 flex items-center justify-end pr-4 font-data-mono text-data-mono font-bold text-on-surface-variant border-r border-[#1E3A5F]/50">GBP</div>
                <div className="h-12 bg-[#0891B2]/60 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.61</div>
                <div className="h-12 bg-[#0891B2]/70 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.74</div>
                <div className="h-12 bg-[#0891B2]/40 flex items-center justify-center font-data-mono text-data-mono text-white rounded">0.41</div>
                <div className="h-12 bg-[#0891B2] flex items-center justify-center font-data-mono text-data-mono text-white font-bold rounded">1.00</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
