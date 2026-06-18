import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { colors, chartTheme } from '../tokens/design'
import { CreditCard, Users, AlertTriangle, ShieldCheck } from 'lucide-react'

const counterparties = [
  { name: 'Bosch GmbH',          score: 88, exposure: 4.2, limit: 6.0,  rating: 'A',    risk: 'low' },
  { name: 'Toyota Motors',       score: 92, exposure: 8.1, limit: 10.0, rating: 'AA',   risk: 'low' },
  { name: 'Shell PLC',           score: 79, exposure: 5.8, limit: 7.0,  rating: 'A-',   risk: 'low' },
  { name: 'LVMH SA',             score: 65, exposure: 6.9, limit: 7.0,  rating: 'BBB+', risk: 'medium' },
  { name: 'Samsung Electronics', score: 84, exposure: 7.2, limit: 8.0,  rating: 'A',    risk: 'low' },
  { name: 'BP PLC',              score: 51, exposure: 5.5, limit: 6.0,  rating: 'BBB',  risk: 'high' },
  { name: 'Nestlé SA',           score: 91, exposure: 2.1, limit: 5.0,  rating: 'AA',   risk: 'low' },
  { name: 'Alibaba Group',       score: 58, exposure: 4.8, limit: 5.0,  rating: 'BBB-', risk: 'high' },
]

const scatterData = counterparties.map(c => ({ x: c.score, y: c.exposure, name: c.name }))

const tooltipStyle = {
  contentStyle: { background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}`, borderRadius: 8, fontSize: 12 },
  itemStyle:    { color: colors.text.primary },
}

function ScoreBar({ score }) {
  const color = score >= 80 ? colors.risk.low : score >= 65 ? colors.risk.medium : colors.risk.high
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

export default function CreditRisk() {
  const atRisk   = counterparties.filter(c => c.risk !== 'low').length
  const utilHigh = counterparties.filter(c => (c.exposure / c.limit) > 0.85).length
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Counterparties',   value: `${counterparties.length}`, icon: Users,        color: colors.accent.cyan },
          { label: 'At-Risk Entities', value: `${atRisk}`,               icon: AlertTriangle, color: colors.risk.high },
          { label: 'Limit Util. >85%', value: `${utilHigh}`,             icon: CreditCard,   color: colors.risk.medium },
          { label: 'Avg Credit Score', value: '76.0',                    icon: ShieldCheck,  color: colors.risk.low },
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
        <div className="card p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-4">Score vs Exposure ($M)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="x" name="Score" domain={[40,100]} tick={{ fill: chartTheme.axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="y" name="Exposure"                tick={{ fill: chartTheme.axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-surface-elevated border border-muted rounded-lg p-2 text-xs">
                    <p className="text-white font-medium">{d.name}</p>
                    <p className="text-slate-400">Score: {d.x}</p>
                    <p className="text-slate-400">Exposure: ${d.y}M</p>
                  </div>
                )
              }} />
              <Scatter data={scatterData} fill={colors.accent.cyan} opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card overflow-hidden xl:col-span-3">
          <div className="px-5 py-4 border-b border-surface-elevated">
            <h2 className="text-sm font-semibold text-white">Counterparty Credit Summary</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-elevated text-left">
                {['Counterparty','Rating','Score','Exposure','Limit','Util.','Risk'].map(h => (
                  <th key={h} className="px-4 py-3 stat-label">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-elevated">
              {counterparties.map(c => {
                const util = ((c.exposure / c.limit) * 100).toFixed(0)
                return (
                  <tr key={c.name} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-white text-xs">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{c.rating}</td>
                    <td className="px-4 py-3"><ScoreBar score={c.score} /></td>
                    <td className="px-4 py-3 tabular-nums text-slate-300 text-xs">${c.exposure}M</td>
                    <td className="px-4 py-3 tabular-nums text-slate-400 text-xs">${c.limit}M</td>
                    <td className="px-4 py-3 tabular-nums text-xs">
                      <span className={parseInt(util) > 85 ? 'text-risk-high font-medium' : 'text-slate-400'}>{util}%</span>
                    </td>
                    <td className="px-4 py-3"><span className={`badge-risk-${c.risk}`}>{c.risk}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}