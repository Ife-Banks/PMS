'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FlockSummary {
  id: string
  status: string
}

interface Props {
  data: FlockSummary[]
}

const COLORS = { active: '#16a34a', sold: '#2563eb', closed: '#6b7280' }

export function FlockStatusChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No flock data available.
      </div>
    )
  }

  const counts = data.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%"
          outerRadius={75} innerRadius={40} paddingAngle={3}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] ?? '#6b7280'} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number, name: string) => [v, name.charAt(0).toUpperCase() + name.slice(1)]} />
        <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
      </PieChart>
    </ResponsiveContainer>
  )
}