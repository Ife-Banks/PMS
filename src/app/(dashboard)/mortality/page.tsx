import { redirect } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { MortalityTable } from '@/components/mortality/MortalityTable'
import { getCurrentMonthRange } from '@/lib/utils'

export const metadata = { title: 'Mortality Logs' }

export default async function MortalityPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { start, end } = getCurrentMonthRange()

  const { data: mortalityLogs } = await supabase
    .from('mortality_logs')
    .select('*, flock:flocks(name), logger:profiles(full_name)')
    .order('log_date', { ascending: false })

  const { data: monthMortality } = await supabase
    .from('mortality_logs')
    .select('quantity, flock:flocks(name)')
    .gte('log_date', start)
    .lte('log_date', end)

  const totalDeaths = monthMortality?.reduce((acc, curr) => acc + curr.quantity, 0) || 0

  const flockDeaths = monthMortality?.reduce((acc: Record<string, number>, curr) => {
    const name = (curr.flock as unknown as { name: string })?.name || 'Unknown'
    acc[name] = (acc[name] || 0) + curr.quantity
    return acc
  }, {})

  const mostAffectedFlock = flockDeaths
    ? Object.entries(flockDeaths).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null

  return (
    <div>
      <PageHeader
        title="Mortality Logs"
        description="Track bird deaths and causes"
        action={{ label: 'Log Mortality', href: '/mortality/new' }}
      />

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Deaths This Month</p>
          <p className="text-2xl font-bold text-red-600">{totalDeaths}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Most Affected Flock</p>
          <p className="text-2xl font-bold">{mostAffectedFlock || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <MortalityTable logs={mortalityLogs || []} currentUser={profile} />
      </div>
    </div>
  )
}