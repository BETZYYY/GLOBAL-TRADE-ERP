import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { colors, chartTheme } from '../tokens/design'
import { Clock, Percent, FileText, TrendingDown } from 'lucide-react'
import useCreditRisk from '../hooks/useCreditRisk'

const mockAgingData = [
  { bucket: 'Current', amount: 8400 }, { bucket: '1-30d',  amount: 3200 },
  { bucket: '31-60d',  amount: 1800 }, { bucket: '61-90d', amount: 740 },
  { bucket: '>90d',    amount: 320 },
]

const mockTerms = [
  { counterparty: 'Bosch GmbH',          term: 'Net 30', discount: '2/10',   outstanding: '$1.24M', overdue: false, dso: 28 },
  { counterparty: 'Toyota Motors',       term: 'Net 45', discount: '1/15',   outstanding: '$3.10M', overdue: false, dso: 41 },
  { counterparty: 'Shell PLC',           term: 'Net 60', discount: '—',      outstanding: '$760K',  overdue: false, dso: 55 },
  { counterparty: 'LVMH SA',             term: 'Net 30', discount: '2/10',   outstanding: '$2.10M', overdue: true,  dso: 48 },
  { counterparty: 'Samsung Electronics', term: 'Net 60', discount: '1.5/20', outstanding: '$4.80M', overdue: false, dso: 58 },
  { counterparty: 'Nestlé SA',           term: 'Net 45', discount: '2/10',   outstanding: '$430K',  overdue: false, dso: 32 },
]

const tooltipStyle = {
  contentStyle: { background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}`, borderRadius: 8, fontSize: 12 },
  itemStyle:    { color: colors.text.primary },
}

export default function PaymentTerms() {
  const { calculateScore } = useCreditRisk();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API fetch since there's no full endpoint for this page
    const timer = setTimeout(() => {
      setData({
        agingData: mockAgingData,
        terms: mockTerms,
        stats: { dso: '43.7d', overdue: 12, savings: '$84K', outstanding: '$12.4M' }
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-elevated rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-surface-elevated rounded-xl"></div>
        <div className="h-80 bg-surface-elevated rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg DSO',           value: data.stats.dso,  icon: Clock,       color: colors.accent.cyan },
          { label: 'Overdue Invoices',  value: data.stats.overdue,     icon: FileText,    color: colors.risk.high },
          { label: 'Early Pay Savings', value: data.stats.savings,   icon: Percent,     color: colors.risk.low },
          { label: 'Total Outstanding', value: data.stats.outstanding, icon: TrendingDown,color: colors.risk.medium },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="stat-label">{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-4">AR Aging Buckets ($K)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.agingData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
            <XAxis dataKey="bucket" tick={{ fill: chartTheme.axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartTheme.axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="amount" name="AR ($K)" fill={colors.accent.teal} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-elevated">
          <h2 className="text-sm font-semibold text-white">Counterparty Payment Terms</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-elevated text-left">
              {['Counterparty','Terms','Early Pay Disc.','Outstanding','DSO','Status'].map(h => (
                <th key={h} className="px-5 py-3 stat-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-elevated">
            {data.terms.map(t => (
              <tr key={t.counterparty} className="hover:bg-surface-elevated/40 transition-colors">
                <td className="px-5 py-3 font-medium text-white">{t.counterparty}</td>
                <td className="px-5 py-3 text-slate-400">{t.term}</td>
                <td className="px-5 py-3 text-slate-400 font-mono text-xs">{t.discount}</td>
                <td className="px-5 py-3 text-slate-300 tabular-nums">{t.outstanding}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${t.dso > 45 ? 'bg-risk-high' : t.dso > 30 ? 'bg-risk-medium' : 'bg-risk-low'}`}
                        style={{ width: `${Math.min(100, (t.dso / 90) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums">{t.dso}d</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={t.overdue ? 'badge-risk-high' : 'badge-risk-low'}>
                    {t.overdue ? 'overdue' : 'current'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}