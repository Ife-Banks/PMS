import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wheat } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { FeedLogTable } from '@/components/feed/FeedLogTable'
import { Button } from '@/components/ui/button'
import { formatCurrency, getCurrentMonthRange } from '@/lib/utils'

export const metadata = { title: 'Feed Logs' }

export default async function FeedPage() {
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

  const { data: feedLogs } = await supabase
    .from('feed_logs')
    .select('*, flock:flocks(name), logger:profiles(full_name)')
    .order('log_date', { ascending: false })

  const { data: monthFeed } = await supabase
    .from('feed_logs')
    .select('quantity_kg, total_cost')
    .gte('log_date', start)
    .lte('log_date', end)

  const totalFeedThisMonth = monthFeed?.reduce((acc, curr) => acc + curr.quantity_kg, 0) || 0
  const totalFeedCostThisMonth = monthFeed?.reduce((acc, curr) => acc + curr.total_cost, 0) || 0

  return (
    <div>
      <PageHeader
        title="Feed Logs"
        description="Track feed consumption and costs"
        action={{ label: 'Log Feed', href: '/feed/new' }}
      />

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Feed This Month</p>
          <p className="text-2xl font-bold">{totalFeedThisMonth.toLocaleString()} kg</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Feed Cost This Month</p>
          <p className="text-2xl font-bold">{formatCurrency(totalFeedCostThisMonth)}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <FeedLogTable logs={feedLogs || []} currentUser={profile} />
      </div>
    </div>
  )
}