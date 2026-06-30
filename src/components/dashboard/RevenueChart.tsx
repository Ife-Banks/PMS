'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface Props {
  data: { month: string; total_revenue: number; item_type?: string }[]
}

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-green-600">₦{Number(payload[0].value).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
    </div>
  )
}

export function RevenueChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No revenue data yet — record your first sale to see this chart.
      </div>
    )
  }

  const aggregated = Object.values(
    data.reduce((acc, d) => {
      const key = d.month
      if (!acc[key]) acc[key] = { month: key, revenue: 0 }
      acc[key].revenue += Number(d.total_revenue)
      return acc
    }, {} as Record<string, { month: string; revenue: number }>)
  ).map(d => ({
    month: format(parseISO(d.month), 'MMM yy'),
    revenue: d.revenue,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={aggregated} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={56}
          tickFormatter={(v) => `₦${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
        <Tooltip content={<Tip />} />
        <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5}
          fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#16a34a' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}