import { redirect } from 'next/navigation'
import { HeartPulse, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { HealthRecordTable } from '@/components/health/HealthRecordTable'
import { getCurrentMonthRange, formatCurrency } from '@/lib/utils'

export const metadata = { title: 'Health Records' }

export default async function HealthPage() {
  const supabase = await createClient()
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { start, end } = getCurrentMonthRange()

  const { data: healthRecords } = await supabase
    .from('health_records')
    .select('*, flock:flocks(name), logger:profiles(full_name)')
    .order('record_date', { ascending: false })

  const { data: monthRecords } = await supabase
    .from('health_records')
    .select('*')
    .gte('record_date', start)
    .lte('record_date', end)

  const { data: upcomingFollowUps } = await supabase
    .from('health_records')
    .select('*')
    .gte('follow_up_date', new Date().toISOString().split('T')[0])
    .lte('follow_up_date', nextWeek.toISOString().split('T')[0])

  const totalRecords = monthRecords?.length || 0
  const upcomingCount = upcomingFollowUps?.length || 0
  const vaccinationsThisMonth = monthRecords?.filter((r) => r.record_type === 'vaccination').length || 0

  return (
    <div>
      <PageHeader
        title="Health Records"
        description="Track flock health, vaccinations, and treatments"
        action={{ label: 'Add Record', href: '/health/new' }}
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Records This Month</p>
          <p className="text-2xl font-bold">{totalRecords}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Upcoming Follow-ups</p>
          <p className="text-2xl font-bold text-orange-600">{upcomingCount}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Vaccinations This Month</p>
          <p className="text-2xl font-bold text-green-600">{vaccinationsThisMonth}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <HealthRecordTable records={healthRecords || []} currentUser={profile} />
      </div>
    </div>
  )
}
