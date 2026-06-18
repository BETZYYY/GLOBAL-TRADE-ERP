import { useState, useEffect } from 'react';
import useCreditRisk from '../hooks/useCreditRisk';

export default function CreditRisk() {
  const { data, loading, scoreEntity } = useCreditRisk();
  const [entityName, setEntityName] = useState('Tanaka Trading');
  const [jurisdiction, setJurisdiction] = useState('Japan');
  const [sector, setSector] = useState('Manufacturing');
  const [hasFinancials, setHasFinancials] = useState(true);

  // Since we don't fetch initially without a specific ID in the hook, let's just use the form state
  // to show the assessment if data exists, otherwise show a placeholder or default UI.

  const handleCalculate = () => {
    scoreEntity({ name: entityName, jurisdiction, sector, hasFinancials });
  };

  // If we just loaded the page and there's no data, let's auto-calculate for the mock UI feeling
  useEffect(() => {
    if (!data && !loading) {
      scoreEntity({ name: 'Tanaka Trading', jurisdiction: 'Japan', sector: 'Manufacturing', hasFinancials: true });
    }
  }, [data, loading, scoreEntity]);

  const score = data?.skor_kredit || 72;
  const rating = data?.rating || 'A-';
  const limit = data?.rekomendasi_limit || 2500000;
  
  // Calculate gauge offset (0 to 100 maps to dashoffset 0 to -628 or similar, let's just use CSS offset directly)
  // 471 is the dasharray (2 * pi * r = 2 * 3.14 * 100 = ~628, wait the CSS says 471 628).
  // Actually, circle with r=100 has circumference ~628. If we want 270 degrees, it's 471.
  // 72/100 of 471 is 339. The offset to reveal 339 is 471 - 339 = 132.
  const progressOffset = 471 - ((score / 100) * 471);

  return (
    <div className="pt-20 px-gutter pb-gutter flex-1 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
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
          <div className="bg-brand-midnight-card rounded-xl card-border flex flex-col">
            <div className="p-4 border-b border-brand-midnight-border flex justify-between items-center">
              <h2 className="font-h2 text-h2 text-white">Partner Assessment</h2>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-brand-teal">more_horiz</span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {/* Company Info Fields */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1 group">
                  <label className="font-label-xs text-label-xs text-on-surface-variant uppercase">Entity Name</label>
                  <div className="bg-brand-midnight-base ghost-border rounded-md px-3 py-2 flex items-center group-focus-within:border-brand-teal transition-colors">
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
                    <div className="bg-brand-midnight-base ghost-border rounded-md px-3 py-2 flex items-center group-focus-within:border-brand-teal transition-colors">
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
                    <div className="bg-brand-midnight-base ghost-border rounded-md px-3 py-2 flex items-center group-focus-within:border-brand-teal transition-colors">
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
              <div className="flex items-center justify-between p-3 bg-brand-midnight-base ghost-border rounded-md mt-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-brand-teal">description</span>
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
                className="mt-4 bg-brand-teal text-white font-medium text-sm rounded-md h-button_height hover:bg-[#067a96] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="bg-brand-midnight-card rounded-xl card-border flex-1 flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-brand-midnight-border flex justify-between items-center">
              <h2 className="font-h2 text-h2 text-white">Recent Assessments</h2>
              <button className="text-xs text-brand-teal hover:underline">View All</button>
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
                  <span className="badge-low-risk text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Low Risk</span>
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
                  <span className="badge-med-risk text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Med Risk</span>
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
                  <span className="badge-high-risk text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">High Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (62% ~ Col Span 7) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Score Results Area */}
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Large Gauge Card */}
            <div className="col-span-2 bg-brand-midnight-card rounded-xl card-border flex flex-col relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-teal opacity-[0.05] rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="p-4 border-b border-brand-midnight-border flex justify-between items-center z-10 bg-[#1E2D44]/30">
                <h2 className="font-h2 text-h2 text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-teal">speed</span>
                  Assessment Result
                </h2>
                <span className="text-xs text-on-surface-variant font-data-mono">ID: TNK-2023-Q4</span>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center flex-1 z-10">
                {/* Gauge Visualization */}
                <div className="gauge-container mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                    <circle className="gauge-track" cx="120" cy="120" r="100" strokeDasharray="471 628" strokeDashoffset="-78"></circle>
                    <circle className="gauge-progress" cx="120" cy="120" r="100" strokeDasharray="471 628" strokeDashoffset={progressOffset} style={{ transition: 'stroke-dashoffset 1s ease-out' }}></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-data-mono text-[56px] font-bold text-white leading-none tracking-tighter">{score}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded mt-2 uppercase tracking-widest ${score >= 70 ? 'badge-low-risk' : score >= 40 ? 'badge-med-risk' : 'badge-high-risk'}`}>
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
            <div className="col-span-1 bg-brand-midnight-card rounded-xl card-border p-4 flex flex-col justify-between">
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
            <div className="col-span-1 bg-brand-midnight-card rounded-xl card-border p-4 flex flex-col justify-between">
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
        </div>
      </div>
    </div>
  );
}