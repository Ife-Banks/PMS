import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FlockDetailClient } from '@/components/flocks/FlockDetailClient'

export const metadata = { title: 'Flock Details' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function FlockDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: flock } = await supabase
    .from('flocks')
    .select('*')
    .eq('id', id)
    .single()

  if (!flock) notFound()

  const [
    { data: feedLogs },
    { data: eggProduction },
    { data: healthRecords },
    { data: mortalityLogs },
  ] = await Promise.all([
    supabase.from('feed_logs').select('*').eq('flock_id', id).order('log_date', { ascending: false }),
    supabase.from('egg_production').select('*').eq('flock_id', id).order('log_date', { ascending: false }),
    supabase.from('health_records').select('*').eq('flock_id', id).order('record_date', { ascending: false }),
    supabase.from('mortality_logs').select('*').eq('flock_id', id).order('log_date', { ascending: false }),
  ])

  const stats = {
    totalEggs: eggProduction?.reduce((acc, curr) => acc + curr.good_eggs, 0) || 0,
    totalFeedCost: feedLogs?.reduce((acc, curr) => acc + curr.total_cost, 0) || 0,
    totalMortality: mortalityLogs?.reduce((acc, curr) => acc + curr.quantity, 0) || 0,
    healthEvents: healthRecords?.length || 0,
  }

  return (
    <FlockDetailClient
      flock={flock}
      profile={profile}
      feedLogs={feedLogs || []}
      eggProduction={eggProduction || []}
      healthRecords={healthRecords || []}
      mortalityLogs={mortalityLogs || []}
      stats={stats}
    />
  )
}