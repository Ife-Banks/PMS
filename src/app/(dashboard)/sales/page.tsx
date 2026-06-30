import { redirect } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { SaleTable } from '@/components/sales/SaleTable'
import { getCurrentMonthRange, formatCurrency } from '@/lib/utils'

export const metadata = { title: 'Sales' }

export default async function SalesPage() {
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

  const { data: sales } = await supabase
    .from('sales')
    .select('*, flock:flocks(name)')
    .order('sale_date', { ascending: false })

  const { data: monthSales } = await supabase
    .from('sales')
    .select('total_amount, item_type, payment_status')
    .gte('sale_date', start)
    .lte('sale_date', end)

  const totalRevenue = monthSales?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0
  const pendingPayments = monthSales?.filter((s) => s.payment_status !== 'paid').reduce((acc, curr) => acc + curr.total_amount, 0) || 0
  const eggSalesCount = monthSales?.filter((s) => s.item_type === 'eggs').length || 0
  const birdSalesCount = monthSales?.filter((s) => s.item_type === 'birds').length || 0

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Track sales and revenue"
        action={profile.role === 'admin' ? { label: 'Record Sale', href: '/sales/new' } : undefined}
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Revenue This Month</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending Payments</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingPayments)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Egg Sales</p>
          <p className="text-2xl font-bold">{eggSalesCount}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Bird Sales</p>
          <p className="text-2xl font-bold">{birdSalesCount}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <SaleTable sales={sales || []} currentUser={profile} />
      </div>
    </div>
  )
}