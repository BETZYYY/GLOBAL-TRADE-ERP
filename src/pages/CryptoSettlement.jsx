import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { colors, chartTheme } from '../tokens/design'
import { Bitcoin, Zap, Shield, Clock } from 'lucide-react'
import useTransactions from '../hooks/useTransactions'

const volumeData = [
  { date: 'Jun 12', usdc: 420, usdt: 310, btc: 85  },
  { date: 'Jun 13', usdc: 380, usdt: 280, btc: 120 },
  { date: 'Jun 14', usdc: 510, usdt: 390, btc: 95  },
  { date: 'Jun 15', usdc: 470, usdt: 350, btc: 140 },
  { date: 'Jun 16', usdc: 620, usdt: 480, btc: 110 },
  { date: 'Jun 17', usdc: 580, usdt: 440, btc: 160 },
  { date: 'Jun 18', usdc: 710, usdt: 520, btc: 130 },
]

const SETTLEMENTS = [
  { id: 'CSTTL-211', date: '2026-06-18 09:14', asset: 'USDC', network: 'Ethereum', amount: '$420,000', counterparty: 'Toyota Motors',      confirmations: 24,  status: 'confirmed', fee: '$3.20' },
  { id: 'CSTTL-210', date: '2026-06-18 08:02', asset: 'USDT', network: 'Tron',     amount: '$280,000', counterparty: 'Alibaba Group',       confirmations: 18,  status: 'confirmed', fee: '$0.80' },
  { id: 'CSTTL-209', date: '2026-06-17 16:45', asset: 'BTC',  network: 'Bitcoin',  amount: '$95,000',  counterparty: 'Shell PLC',           confirmations: 6,   status: 'pending',   fee: '$12.40' },
  { id: 'CSTTL-208', date: '2026-06-17 14:30', asset: 'USDC', network: 'Polygon',  amount: '$180,000', counterparty: 'Nestlé SA',           confirmations: 128, status: 'confirmed', fee: '$0.10' },
  { id: 'CSTTL-207', date: '2026-06-16 11:20', asset: 'USDT', network: 'Solana',   amount: '$340,000', counterparty: 'Bosch GmbH',          confirmations: 32,  status: 'confirmed', fee: '$0.02' },
  { id: 'CSTTL-206', date: '2026-06-16 09:05', asset: 'BTC',  network: 'Bitcoin',  amount: '$62,000',  counterparty: 'Samsung Electronics', confirmations: 1,   status: 'pending',   fee: '$9.80' },
]

const ASSET_COLORS = { USDC: colors.accent.cyan, USDT: colors.risk.low, BTC: colors.risk.medium }

const tooltipStyle = {
  contentStyle: { background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}`, borderRadius: 8, fontSize: 12 },
  itemStyle:    { color: colors.text.primary },
}

export default function CryptoSettlement() {
  const { fetchTransactions } = useTransactions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch generic transactions to test API connection
    fetchTransactions().then(() => {
      setTimeout(() => setLoading(false), 800);
    });
  }, [fetchTransactions]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-elevated rounded-xl"></div>)}
        </div>
        <div className="h-72 bg-surface-elevated rounded-xl"></div>
        <div className="h-96 bg-surface-elevated rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Settlements Today',   value: '8',        icon: Bitcoin, color: colors.accent.cyan },
          { label: 'Volume Today',        value: '$1.36M',   icon: Zap,     color: colors.risk.low },
          { label: 'Pending Confirms',    value: '2',        icon: Clock,   color: colors.risk.medium },
          { label: 'Avg Settlement Time', value: '4.2 min',  icon: Shield,  color: colors.risk.low },
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
        <h2 className="text-sm font-semibold text-white mb-4">Settlement Volume by Asset ($K)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={volumeData}>
            <defs>
              {[['usdc', colors.accent.cyan],['usdt', colors.risk.low],['btc', colors.risk.medium]].map(([key, col]) => (
                <linearGradient key={key} id={`cg-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={col} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={col} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: chartTheme.axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartTheme.axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="usdc" name="USDC" stroke={colors.accent.cyan} fill="url(#cg-usdc)" strokeWidth={2} />
            <Area type="monotone" dataKey="usdt" name="USDT" stroke={colors.risk.low}    fill="url(#cg-usdt)" strokeWidth={2} />
            <Area type="monotone" dataKey="btc"  name="BTC"  stroke={colors.risk.medium} fill="url(#cg-btc)"  strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-elevated">
          <h2 className="text-sm font-semibold text-white">Recent Crypto Settlements</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-elevated text-left">
              {['ID','Timestamp','Asset','Network','Amount','Counterparty','Confirms','Fee','Status'].map(h => (
                <th key={h} className="px-4 py-3 stat-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-elevated">
            {SETTLEMENTS.map(s => (
              <tr key={s.id} className="hover:bg-surface-elevated/40 transition-colors">
                <td className="px-4 py-3 font-mono text-accent-cyan text-xs">{s.id}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{s.date}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold" style={{ color: ASSET_COLORS[s.asset] }}>{s.asset}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{s.network}</td>
                <td className="px-4 py-3 text-slate-300 tabular-nums">{s.amount}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{s.counterparty}</td>
                <td className="px-4 py-3 tabular-nums text-xs text-slate-400">{s.confirmations}</td>
                <td className="px-4 py-3 tabular-nums text-xs text-slate-400">{s.fee}</td>
                <td className="px-4 py-3">
                  <span className={s.status === 'confirmed' ? 'badge-risk-low' : 'badge-risk-medium'}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}