import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bird, Egg, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { ExpenseChart } from '@/components/dashboard/ExpenseChart'
import { FlockStatusChart } from '@/components/dashboard/FlockStatusChart'
import { EggProductionChart } from '@/components/dashboard/EggProductionChart'
import { formatCurrency, getCurrentMonthRange } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { start, end } = getCurrentMonthRange()

  const [
    { count: activeFlocks },
    { data: eggsThisMonth },
    { data: revenueThisMonth },
    { data: expensesThisMonth },
    { data: recentMortality },
    { data: flockSummary },
    { data: monthlyRevenue },
    { data: monthlyExpenses },
    { data: upcomingFollowUps },
    { data: eggProduction30Days },
  ] = await Promise.all([
    supabase.from('flocks').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('egg_production').select('total_eggs').gte('log_date', start).lte('log_date', end),
    supabase.from('sales').select('total_amount').gte('sale_date', start).lte('sale_date', end),
    supabase.from('expenses').select('amount').gte('expense_date', start).lte('expense_date', end),
    supabase.from('mortality_logs').select('quantity').gte('log_date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]),
    supabase.from('flock_summary').select('*'),
    supabase.from('monthly_revenue').select('*').limit(6),
    supabase.from('monthly_expenses').select('*').limit(12),
    supabase.from('health_records').select('*, flock:flocks(name)').not('follow_up_date', 'is', null).gte('follow_up_date', new Date().toISOString().split('T')[0]).order('follow_up_date', { ascending: true }).limit(5),
    supabase.from('egg_production').select('log_date, total_eggs, good_eggs, broken_eggs').gte('log_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]).order('log_date', { ascending: true }),
  ])

  const totalEggs = eggsThisMonth?.reduce((sum, r) => sum + r.total_eggs, 0) ?? 0
  const totalRevenue = revenueThisMonth?.reduce((sum, r) => sum + r.total_amount, 0) ?? 0
  const totalExpenses = expensesThisMonth?.reduce((sum, r) => sum + r.amount, 0) ?? 0
  const netProfit = totalRevenue - totalExpenses
  const mortalityCount = recentMortality?.reduce((sum, r) => sum + r.quantity, 0) ?? 0

  return (
    <div className="space-y-6 lg:space-y-8">

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">Your farm at a glance</h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
              A live snapshot of birds, eggs, money, and follow-ups.
            </p>
          </div>
          <div className="flex gap-3 sm:shrink-0">
            <div className="rounded-xl border border-border/60 bg-background px-4 py-3 text-center min-w-[110px]">
              <p className="text-xs text-muted-foreground font-medium">Active Flocks</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{activeFlocks ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background px-4 py-3 text-center min-w-[140px]">
              <p className="text-xs text-muted-foreground font-medium">Profit This Month</p>
              <p className={`text-2xl font-bold mt-0.5 ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatsCard
          title="Active Flocks"
          value={activeFlocks ?? 0}
          icon={Bird}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Eggs This Month"
          value={totalEggs.toLocaleString()}
          icon={Egg}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatsCard
          title="Revenue This Month"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Expenses This Month"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          iconColor="text-red-500"
          iconBg="bg-red-100"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={DollarSign}
          iconColor={netProfit >= 0 ? 'text-green-600' : 'text-red-500'}
          iconBg={netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Monthly Revenue</h2>
              <p className="text-xs text-muted-foreground">Revenue across the last 6 months</p>
            </div>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Revenue</span>
          </div>
          <RevenueChart data={monthlyRevenue ?? []} />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Flock Distribution</h2>
            <p className="text-xs text-muted-foreground">Split by flock status</p>
          </div>
          <FlockStatusChart data={flockSummary ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Monthly Expenses</h2>
            <p className="text-xs text-muted-foreground">Breakdown by category</p>
          </div>
          <ExpenseChart data={monthlyExpenses ?? []} />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Egg Production (30 days)</h2>
            <p className="text-xs text-muted-foreground">Daily egg output trend</p>
          </div>
          <EggProductionChart data={eggProduction30Days ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">Upcoming Health Follow-ups</h2>
          {!upcomingFollowUps || upcomingFollowUps.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No upcoming follow-ups scheduled.</p>
          ) : (
            <div className="space-y-2">
              {upcomingFollowUps.map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{(record.flock as any)?.name ?? 'Unknown Flock'}</p>
                    <p className="text-xs text-muted-foreground">{record.description}</p>
                  </div>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 rounded-lg px-2.5 py-1">
                    {record.follow_up_date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="flex items-center gap-4 rounded-xl bg-red-50 border border-red-100 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Mortality (Last 7 Days)</p>
              <p className="text-2xl font-bold text-red-600 mt-0.5">{mortalityCount} birds</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}