import { useState, useEffect } from 'react';
import useCreditRisk from '../hooks/useCreditRisk';

export default function CreditRisk() {
  const { data, loading, calculateScore } = useCreditRisk();
  const [entityName, setEntityName] = useState('Tanaka Trading');
  const [jurisdiction, setJurisdiction] = useState('Japan');
  const [sector, setSector] = useState('Manufacturing');
  const [hasFinancials, setHasFinancials] = useState(true);

  // Since we don't fetch initially without a specific ID in the hook, let's just use the form state
  // to show the assessment if data exists, otherwise show a placeholder or default UI.

  const handleCalculate = () => {
    calculateScore({ name: entityName, jurisdiction, sector, hasFinancials });
  };

  // If we just loaded the page and there's no data, let's auto-calculate for the mock UI feeling
  useEffect(() => {
    if (!data && !loading) {
      calculateScore({ name: 'Tanaka Trading', jurisdiction: 'Japan', sector: 'Manufacturing', hasFinancials: true });
    }
  }, []); // run once on mount only

  const score = data?.skor_kredit || 72;
  const rating = data?.rating || 'A-';
  const limit = data?.rekomendasi_limit || 2500000;
  
  // Calculate gauge offset (0 to 100 maps to dashoffset 0 to -628 or similar, let's just use CSS offset directly)
  // 471 is the dasharray (2 * pi * r = 2 * 3.14 * 100 = ~628, wait the CSS says 471 628).
  // Actually, circle with r=100 has circumference ~628. If we want 270 degrees, it's 471.
  // 72/100 of 471 is 339. The offset to reveal 339 is 471 - 339 = 132.
  const progressOffset = 471 - ((score / 100) * 471);

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-6 max-w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end w-full">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Credit Risk Scoring Global</h1>
          <p className="font-label-xs text-label-xs text-on-surface-variant mt-1">
            Assess and monitor counterparty credit risk for international trade.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block w-64 teal-focus rounded-md bg-brand-midnight-card ghost-border transition-all h-10">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">search</span>
            <input className="w-full bg-transparent border-none text-white text-sm pl-9 pr-3 py-2 focus:ring-0 placeholder:text-on-surface-variant outline-none" placeholder="Search entities..." type="text"/>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-full">
        
        {/* LEFT COLUMN (38% ~ Col Span 5) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Partner Assessment Card */}
          <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] flex flex-col">
            <div className="p-4 border-b border-[#1E3A5F] flex justify-between items-center">
              <h2 className="font-h2 text-h2 text-white">Partner Assessment</h2>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-[#0891B2]">more_horiz</span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {/* Company Info Fields */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1 group">
                  <label className="font-label-xs text-label-xs text-on-surface-variant uppercase">Entity Name</label>
                  <div className="bg-[#0F1B2D] border border-[#1E3A5F] rounded-md px-3 py-2 flex items-center focus-within:border-[#0891B2] transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">domain</span>
                    <input 
                      className="bg-transparent border-none text-white text-sm p-0 w-full focus:ring-0 font-medium outline-none" 
                      type="text" 
                      value={entityName}
                      onChange={e => setEntityName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 group">
                    <label className="font-label-xs text-label-xs text-on-surface-variant uppercase">Jurisdiction</label>
                    <div className="bg-[#0F1B2D] border border-[#1E3A5F] rounded-md px-3 py-2 flex items-center focus-within:border-[#0891B2] transition-colors">
                      <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">public</span>
                      <input 
                        className="bg-transparent border-none text-white text-sm p-0 w-full focus:ring-0 outline-none" 
                        type="text" 
                        value={jurisdiction}
                        onChange={e => setJurisdiction(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 group">
                    <label className="font-label-xs text-label-xs text-on-surface-variant uppercase">Sector</label>
                    <div className="bg-[#0F1B2D] border border-[#1E3A5F] rounded-md px-3 py-2 flex items-center focus-within:border-[#0891B2] transition-colors">
                      <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">factory</span>
                      <input 
                        className="bg-transparent border-none text-white text-sm p-0 w-full focus:ring-0 outline-none" 
                        type="text" 
                        value={sector}
                        onChange={e => setSector(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Statement Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#0F1B2D] border border-[#1E3A5F] rounded-md mt-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0891B2]">description</span>
                  <div>
                    <p className="text-sm font-medium text-white">Q3 Financials Attached</p>
                    <p className="text-xs text-on-surface-variant font-data-mono">audited_stmt_Q3.pdf</p>
                  </div>
                </div>
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={hasFinancials}
                    onChange={e => setHasFinancials(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-surface-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-teal"></div>
                </label>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleCalculate}
                disabled={loading}
                className="mt-4 bg-[#0891B2] text-white font-medium text-sm rounded-md h-button_height hover:bg-[#067a96] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 w-full cursor-pointer"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">calculate</span>
                )}
                {loading ? 'Calculating...' : 'Calculate Risk Score'}
              </button>
            </div>
          </div>

          {/* Recent Assessments List */}
          <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] flex-1 flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-[#1E3A5F] flex justify-between items-center">
              <h2 className="font-h2 text-h2 text-white">Recent Assessments</h2>
              <button className="text-xs text-[#0891B2] hover:underline cursor-pointer">View All</button>
            </div>
            <div className="flex flex-col">
              {/* Row 1 */}
              <div className="p-4 border-b border-brand-midnight-border flex items-center justify-between hover:bg-brand-midnight-base transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brand-midnight-base ghost-border flex items-center justify-center text-on-surface-variant group-hover:text-brand-teal transition-colors">
                    <span className="material-symbols-outlined text-sm">domain</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">PT Bintang Niaga</p>
                    <p className="text-xs text-on-surface-variant">Indonesia • Logistics</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data-mono text-sm text-white">84</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-[#16A34A]/20 text-[#22C55E] border border-[#16A34A]">Low Risk</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="p-4 border-b border-brand-midnight-border flex items-center justify-between hover:bg-brand-midnight-base transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brand-midnight-base ghost-border flex items-center justify-center text-on-surface-variant group-hover:text-brand-teal transition-colors">
                    <span className="material-symbols-outlined text-sm">domain</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Siemens Trading</p>
                    <p className="text-xs text-on-surface-variant">Germany • Tech</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data-mono text-sm text-white">45</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-[#B45309]/20 text-[#F59E0B] border border-[#B45309]">Med Risk</span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="p-4 flex items-center justify-between hover:bg-brand-midnight-base transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brand-midnight-base ghost-border flex items-center justify-center text-on-surface-variant group-hover:text-brand-teal transition-colors">
                    <span className="material-symbols-outlined text-sm">domain</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Ahmed Corp</p>
                    <p className="text-xs text-on-surface-variant">UAE • Energy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data-mono text-sm text-white">12</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]">High Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (62% ~ Col Span 7) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Score Results Area */}
          <div className="grid grid-cols-2 gap-6">
            {/* Large Gauge Card */}
            <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] flex flex-col relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-teal opacity-[0.05] rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="p-4 border-b border-[#1E3A5F] flex justify-between items-center z-10 bg-[#1E2D44]/30">
                <h2 className="font-h2 text-h2 text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0891B2]">speed</span>
                  Assessment Result
                </h2>
                <span className="text-xs text-on-surface-variant font-data-mono">ID: TNK-2023-Q4</span>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center flex-1 z-10">
                {/* Gauge Visualization */}
                <div className="gauge-container mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                    <circle className="gauge-track" cx="120" cy="120" r="100" strokeDasharray="471 628" strokeDashoffset="-78"></circle>
                    <circle className="gauge-progress" cx="120" cy="120" r="100" strokeDasharray="471 628" strokeDashoffset={progressOffset} style={{ transition: 'stroke-dashoffset 1s ease-out', stroke: score >= 71 ? '#16A34A' : score >= 41 ? '#D97706' : '#DC2626' }}></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-data-mono text-[56px] font-bold text-white leading-none tracking-tighter">{score}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded mt-2 uppercase tracking-widest ${
                      score >= 70 
                        ? 'bg-[#16A34A]/20 text-[#22C55E] border border-[#16A34A]' 
                        : score >= 40 
                        ? 'bg-[#B45309]/20 text-[#F59E0B] border border-[#B45309]' 
                        : 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]'
                    }`}>
                      {score >= 70 ? 'Low Risk' : score >= 40 ? 'Med Risk' : 'High Risk'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant text-center max-w-sm">
                  {score >= 70 
                    ? `${entityName} demonstrates strong liquidity and consistent payment history.` 
                    : score >= 40 
                    ? `${entityName} shows moderate risk. Proceed with standard caution.`
                    : `${entityName} presents high credit risk. Hedging is strongly advised.`
                  }
                </p>
              </div>
            </div>

            {/* Metric Card 1 */}
            <div className="col-span-1 bg-[#16243B] rounded-xl border border-[#1E3A5F] p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-brand-midnight-base ghost-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-brand-teal">account_balance</span>
                </div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase">Recommended Limit</span>
              </div>
              <div>
                <div className="font-data-mono text-2xl text-white">${(limit).toLocaleString()}</div>
                <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-[#16A34A]">trending_up</span>
                  <span className="text-[#16A34A]">+15%</span> vs last year
                </div>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="col-span-1 bg-[#16243B] rounded-xl border border-[#1E3A5F] p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-brand-midnight-base ghost-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-[#F59E0B]">warning</span>
                </div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase">Default Probability</span>
              </div>
              <div>
                <div className="font-data-mono text-2xl text-white">
                  {score >= 70 ? '1.2%' : score >= 40 ? '4.5%' : '12.8%'}
                </div>
                <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-[#DC2626]">trending_up</span>
                  <span className="text-[#DC2626]">+0.4%</span> vs sector avg
                </div>
              </div>
            </div>

          </div>

          {/* Risk Factors Analysis Card */}
          <div className="bg-[#16243B] rounded-xl border border-[#1E3A5F] p-5">
            <h3 className="font-h3-caps text-h3-caps text-on-surface-variant uppercase mb-4">Risk Factors</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-white">Payment History</span>
                  <span className="font-data-mono text-white">92/100</span>
                </div>
                <div className="w-full bg-[#1E3A5F] rounded-full h-1.5">
                  <div className="bg-[#16A34A] h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-white">Leverage Ratio</span>
                  <span className="font-data-mono text-white">65/100</span>
                </div>
                <div className="w-full bg-[#1E3A5F] rounded-full h-1.5">
                  <div className="bg-[#0891B2] h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-white">Market Stability</span>
                  <span className="font-data-mono text-white">78/100</span>
                </div>
                <div className="w-full bg-[#1E3A5F] rounded-full h-1.5">
                  <div className="bg-[#16A34A] h-1.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* System Recommendation Box */}
          <div className="bg-[#0891B2]/10 border border-[#0891B2] rounded-lg p-4 flex gap-3">
            <span className="material-symbols-outlined text-[#0891B2] shrink-0">lightbulb</span>
            <div className="flex flex-col gap-1">
              <span className="font-h3-caps text-h3-caps text-[#0891B2] uppercase mb-1">Recommendation</span>
              <p className="text-sm text-white leading-relaxed">
                Approve credit line up to $300,000 USD.<br/>
                Standard payment terms applicable (Net 30–60).<br/>
                No additional collateral required below $100,000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}