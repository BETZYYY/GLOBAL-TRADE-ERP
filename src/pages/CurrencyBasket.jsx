import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, ScatterPlot, FilterList, DragIndicator, 
  AutoFixHigh, MoreVert, CurrencyExchange 
} from '@mui/icons-material';
import useRates from '../hooks/useRates';

export default function CurrencyBasket() {
  const { fetchRates } = useRates();
  const [loading, setLoading] = useState(true);

  const [currencies, setCurrencies] = useState([
    { id: 'USD', name: 'US Dollar', selected: true },
    { id: 'EUR', name: 'Euro', selected: true },
    { id: 'JPY', name: 'Japanese Yen', selected: true },
    { id: 'GBP', name: 'British Pound', selected: true },
    { id: 'CAD', name: 'Canadian Dollar', selected: false },
    { id: 'AUD', name: 'Australian Dollar', selected: false },
    { id: 'CNY', name: 'Chinese Yuan', selected: false },
    { id: 'CHF', name: 'Swiss Franc', selected: false },
  ]);

  useEffect(() => {
    // Fetch rates just to verify backend connection for this demo page
    fetchRates().then(() => {
      setTimeout(() => setLoading(false), 800);
    });
  }, [fetchRates]);

  const toggleCurrency = (id) => {
    setCurrencies(currencies.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const selectedCount = currencies.filter(c => c.selected).length;

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-surface-elevated rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-surface-elevated rounded-xl"></div>
          <div className="h-32 bg-surface-elevated rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[600px] bg-surface-elevated rounded-xl"></div>
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="h-[300px] bg-surface-elevated rounded-xl"></div>
            <div className="flex-1 bg-surface-elevated rounded-xl min-h-[300px]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Alternative Currency Basket</h1>
      </div>

      {/* Top Row: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown sx={{ fontSize: 64 }} className="text-accent-cyan" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Portfolio Volatility</h3>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-mono text-4xl text-white">2.14%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-surface border border-surface-elevated font-mono text-risk-low text-xs">
              vs single-currency: 4.82%
            </span>
            <span className="text-xs text-risk-low">— 56% reduction</span>
          </div>
        </div>

        <div className="card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ScatterPlot sx={{ fontSize: 64 }} className="text-accent-cyan" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Correlation Risk</h3>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-mono text-4xl text-white">0.43</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-xs text-accent-cyan">
              Moderate
            </span>
            <span className="text-xs text-slate-400">— Good diversification</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Currencies */}
        <div className="lg:col-span-4 card flex flex-col h-[600px]">
          <div className="p-4 border-b border-surface-elevated flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Currencies</h3>
            <button className="text-slate-400 hover:text-white transition-colors">
              <FilterList fontSize="small" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {currencies.filter(c => c.selected).map(c => (
              <label key={c.id} className="flex items-center justify-between p-3 rounded bg-accent-cyan/10 border border-accent-cyan/30 cursor-pointer hover:bg-accent-cyan/20 transition-colors">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={c.selected} onChange={() => toggleCurrency(c.id)} className="rounded border-surface-elevated bg-surface text-accent-cyan focus:ring-accent-cyan" />
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-white">{c.id}</span>
                    <span className="text-xs text-slate-400">{c.name}</span>
                  </div>
                </div>
                <DragIndicator fontSize="small" className="text-accent-cyan" />
              </label>
            ))}

            <div className="my-2 border-t border-surface-elevated"></div>

            {currencies.filter(c => !c.selected).map(c => (
              <label key={c.id} className="flex items-center justify-between p-3 rounded border border-transparent cursor-pointer hover:bg-surface-elevated/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={c.selected} onChange={() => toggleCurrency(c.id)} className="rounded border-surface-elevated bg-surface text-accent-cyan focus:ring-accent-cyan" />
                  <div className="flex flex-col opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="font-mono font-bold text-white">{c.id}</span>
                    <span className="text-xs text-slate-400">{c.name}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="p-4 border-t border-surface-elevated bg-surface">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400">{selectedCount} currencies selected</span>
              <span className="text-xs text-slate-400">Min 2 req.</span>
            </div>
            <button className="w-full btn-primary h-10 flex items-center justify-center gap-2" disabled={selectedCount < 2}>
              <AutoFixHigh fontSize="small" /> Apply Optimization
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="card p-6 flex flex-col h-[300px]">
            <div className="border-b border-surface-elevated pb-3 mb-6 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Allocation</h3>
              <button className="text-slate-400 hover:text-white transition-colors">
                <MoreVert fontSize="small" />
              </button>
            </div>
            <div className="flex-1 flex items-center gap-12 px-4">
              <div className="relative w-40 h-40 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#27354d" strokeWidth="15" />
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#0891B2" strokeDasharray="113.1 251.2" strokeDashoffset="0" strokeWidth="15" />
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#06b6d4" strokeDasharray="62.8 251.2" strokeDashoffset="-113.1" strokeWidth="15" />
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#d97706" strokeDasharray="50.2 251.2" strokeDashoffset="-175.9" strokeWidth="15" />
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#64748b" strokeDasharray="25.1 251.2" strokeDashoffset="-226.1" strokeWidth="15" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-2xl text-white">4</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Assets</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {[
                  { name: 'USD', pct: '45%', val: 'Rp 30.3B', color: 'bg-[#0891B2]' },
                  { name: 'EUR', pct: '25%', val: 'Rp 16.8B', color: 'bg-[#06b6d4]' },
                  { name: 'JPY', pct: '20%', val: 'Rp 13.5B', color: 'bg-[#d97706]' },
                  { name: 'GBP', pct: '10%', val: 'Rp 6.7B', color: 'bg-[#64748b]' }
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded hover:bg-surface-elevated/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="font-mono font-bold text-white">{item.name}</span>
                      <span className="text-sm text-slate-400 min-w-[40px]">{item.pct}</span>
                    </div>
                    <span className="font-mono text-slate-400">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6 flex flex-col flex-1">
            <div className="border-b border-surface-elevated pb-3 mb-6 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Correlation Matrix</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Low</span>
                <div className="w-16 h-2 rounded bg-gradient-to-r from-surface to-accent-cyan"></div>
                <span>High</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <div className="grid grid-cols-5 gap-1 min-w-[400px]">
                <div className="h-10"></div>
                {['USD', 'EUR', 'JPY', 'GBP'].map(c => (
                  <div key={c} className="h-10 flex items-center justify-center font-mono font-bold text-slate-400">{c}</div>
                ))}

                {[
                  ['USD', [
                    { val: '1.00', bg: 'bg-accent-cyan', text: 'text-surface font-bold' },
                    { val: '0.82', bg: 'bg-accent-cyan/80', text: 'text-surface font-bold' },
                    { val: '0.34', bg: 'bg-accent-cyan/30', text: 'text-white' },
                    { val: '0.61', bg: 'bg-accent-cyan/60', text: 'text-surface font-bold' }
                  ]],
                  ['EUR', [
                    { val: '0.82', bg: 'bg-accent-cyan/80', text: 'text-surface font-bold' },
                    { val: '1.00', bg: 'bg-accent-cyan', text: 'text-surface font-bold' },
                    { val: '0.25', bg: 'bg-accent-cyan/20', text: 'text-white' },
                    { val: '0.74', bg: 'bg-accent-cyan/70', text: 'text-surface font-bold' }
                  ]],
                  ['JPY', [
                    { val: '0.34', bg: 'bg-accent-cyan/30', text: 'text-white' },
                    { val: '0.25', bg: 'bg-accent-cyan/20', text: 'text-white' },
                    { val: '1.00', bg: 'bg-accent-cyan', text: 'text-surface font-bold' },
                    { val: '0.41', bg: 'bg-accent-cyan/40', text: 'text-white' }
                  ]],
                  ['GBP', [
                    { val: '0.61', bg: 'bg-accent-cyan/60', text: 'text-surface font-bold' },
                    { val: '0.74', bg: 'bg-accent-cyan/70', text: 'text-surface font-bold' },
                    { val: '0.41', bg: 'bg-accent-cyan/40', text: 'text-white' },
                    { val: '1.00', bg: 'bg-accent-cyan', text: 'text-surface font-bold' }
                  ]]
                ].map(([rowLabel, cells], i) => (
                  <React.Fragment key={i}>
                    <div className="h-10 flex items-center justify-end pr-4 font-mono font-bold text-slate-400 border-r border-surface-elevated">
                      {rowLabel}
                    </div>
                    {cells.map((cell, j) => (
                      <div key={j} className={`h-10 ${cell.bg} flex items-center justify-center font-mono ${cell.text} rounded`}>
                        {cell.val}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
