'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface Props {
  data: { log_date: string; total_eggs: number; good_eggs: number; broken_eggs: number }[]
}

export function EggProductionChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No egg production data yet — log your first batch to see this chart.
      </div>
    )
  }

  const formatted = data.map(d => ({
    date: format(parseISO(d.log_date), 'MMM d'),
    total: d.total_eggs,
    good: d.good_eggs,
    broken: d.broken_eggs,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#ca8a04" strokeWidth={2} dot={false} name="Total" activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="good" stroke="#16a34a" strokeWidth={2} dot={false} name="Good" activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="broken" stroke="#dc2626" strokeWidth={2} dot={false} name="Broken" activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}