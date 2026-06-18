import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { colors, chartTheme } from '../tokens/design'
import { AlertTriangle, TrendingUp } from 'lucide-react'

const varData = [
  { currency: 'EUR', var1d: 145, var10d: 458, exposure: 18.4 },
  { currency: 'JPY', var1d: 89,  var10d: 281, exposure: 11.2 },
  { currency: 'GBP', var1d: 210, var10d: 664, exposure: 8.7 },
  { currency: 'CHF', var1d: 42,  var10d: 133, exposure: 4.1 },
  { currency: 'CNY', var1d: 178, var10d: 563, exposure: 6.3 },
  { currency: 'KRW', var1d: 63,  var10d: 199, exposure: 3.8 },
]

const radarData = [
  { axis: 'FX Volatility', value: 72 }, { axis: 'Credit',      value: 55 },
  { axis: 'Liquidity',     value: 38 }, { axis: 'Settlement',   value: 61 },
  { axis: 'Counterparty',  value: 48 }, { axis: 'Regulatory',   value: 30 },
]

const tooltipStyle = {
  contentStyle: { background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}`, borderRadius: 8, fontSize: 12 },
  itemStyle:    { color: colors.text.primary },
}

export default function RiskDetail() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Portfolio VaR (1d)',  value: '$727K',  icon: AlertTriangle, color: colors.risk.high },
          { label: 'Portfolio VaR (10d)', value: '$2.30M', icon: AlertTriangle, color: colors.risk.medium },
          { label: 'Stressed VaR',        value: '$4.18M', icon: TrendingUp,    color: colors.risk.high },
          { label: 'Expected Shortfall',  value: '$3.41M', icon: TrendingUp,    color: colors.risk.medium },
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="card p-5 xl:col-span-3">
          <h2 className="text-sm font-semibold text-white mb-4">VaR by Currency ($K)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={varData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
              <XAxis dataKey="currency" tick={{ fill: chartTheme.axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chartTheme.axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="var1d"  name="VaR 1d"  fill={colors.accent.cyan}  radius={[3,3,0,0]} barSize={16} />
              <Bar dataKey="var10d" name="VaR 10d" fill={colors.risk.medium}  radius={[3,3,0,0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-4">Risk Dimension Radar</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={chartTheme.gridColor} />
              <PolarAngleAxis dataKey="axis" tick={{ fill: chartTheme.axisColor, fontSize: 10 }} />
              <Radar name="Risk" dataKey="value" stroke={colors.accent.cyan} fill={colors.accent.cyan} fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-elevated">
          <h2 className="text-sm font-semibold text-white">Currency Exposure Detail</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-elevated text-left">
              {['Currency','Exposure ($M)','VaR 1d ($K)','VaR 10d ($K)','Hedge Ratio','Net Risk'].map(h => (
                <th key={h} className="px-5 py-3 stat-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-elevated">
            {varData.map(r => {
              const hedgeRatio = Math.floor(Math.random() * 40 + 50)
              const netRisk = r.var1d * (1 - hedgeRatio / 100)
              const level = netRisk < 60 ? 'low' : netRisk < 120 ? 'medium' : 'high'
              return (
                <tr key={r.currency} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white">{r.currency}</td>
                  <td className="px-5 py-3 text-slate-300 tabular-nums">{r.exposure}</td>
                  <td className="px-5 py-3 text-slate-300 tabular-nums">{r.var1d}</td>
                  <td className="px-5 py-3 text-slate-300 tabular-nums">{r.var10d}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <div className="h-full bg-accent-teal rounded-full" style={{ width: `${hedgeRatio}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 tabular-nums w-8">{hedgeRatio}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className={`badge-risk-${level}`}>{level}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}