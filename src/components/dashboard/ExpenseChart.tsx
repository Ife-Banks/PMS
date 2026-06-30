'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface Props {
  data: { month: string; total_expenses: number; category: string }[]
}

const COLORS: Record<string, string> = {
  feed: '#16a34a', medication: '#dc2626', equipment: '#2563eb',
  labor: '#9333ea', utilities: '#ea580c', maintenance: '#0891b2',
  transport: '#ca8a04', other: '#6b7280',
}

export function ExpenseChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No expense data yet — add your first expense to see this chart.
      </div>
    )
  }

  const months = [...new Set(data.map(d => d.month))].slice(-6)
  const categories = [...new Set(data.map(d => d.category))]
  const pivoted = months.map(month => {
    const row: Record<string, any> = { month: format(parseISO(month), 'MMM yy') }
    categories.forEach(cat => {
      const match = data.find(d => d.month === month && d.category === cat)
      row[cat] = match ? Number(match.total_expenses) : 0
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={pivoted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={56}
          tickFormatter={(v) => `₦${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
        <Tooltip formatter={(v) => `₦${Number(v).toLocaleString()}`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {categories.map(cat => (
          <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[cat] ?? '#6b7280'} radius={cat === categories[categories.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}