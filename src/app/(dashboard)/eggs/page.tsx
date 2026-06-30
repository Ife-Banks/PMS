import { redirect } from 'next/navigation'
import { CircleDot } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EggLogTable } from '@/components/eggs/EggLogTable'
import { Button } from '@/components/ui/button'
import { getCurrentMonthRange } from '@/lib/utils'

export const metadata = { title: 'Egg Production' }

export default async function EggsPage() {
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

  const { data: eggLogs } = await supabase
    .from('egg_production')
    .select('*, flock:flocks(name), logger:profiles(full_name)')
    .order('log_date', { ascending: false })

  const { data: monthEggs } = await supabase
    .from('egg_production')
    .select('total_eggs, broken_eggs, good_eggs')
    .gte('log_date', start)
    .lte('log_date', end)

  const totalEggs = monthEggs?.reduce((acc, curr) => acc + curr.total_eggs, 0) || 0
  const goodEggs = monthEggs?.reduce((acc, curr) => acc + curr.good_eggs, 0) || 0
  const brokenEggs = monthEggs?.reduce((acc, curr) => acc + curr.broken_eggs, 0) || 0
  const productionRate = totalEggs > 0 ? ((goodEggs / totalEggs) * 100).toFixed(1) : 0

  return (
    <div>
      <PageHeader
        title="Egg Production"
        description="Track egg production records"
        action={{ label: 'Log Eggs', href: '/eggs/new' }}
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Eggs This Month</p>
          <p className="text-2xl font-bold">{totalEggs.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Good Eggs This Month</p>
          <p className="text-2xl font-bold text-green-600">{goodEggs.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Broken Eggs This Month</p>
          <p className="text-2xl font-bold text-red-600">{brokenEggs.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Production Rate</p>
          <p className="text-2xl font-bold">{productionRate}%</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <EggLogTable logs={eggLogs || []} currentUser={profile} />
      </div>
    </div>
  )
}