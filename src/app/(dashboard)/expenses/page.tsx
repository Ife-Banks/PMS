import { redirect } from 'next/navigation'
import { Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { getCurrentMonthRange, formatCurrency } from '@/lib/utils'

export const metadata = { title: 'Expenses' }

export default async function ExpensesPage() {
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

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, flock:flocks(name), creator:profiles(full_name)')
    .order('expense_date', { ascending: false })

  const { data: monthExpenses } = await supabase
    .from('expenses')
    .select('amount, category')
    .gte('expense_date', start)
    .lte('expense_date', end)

  const { data: ytdExpenses } = await supabase
    .from('expenses')
    .select('amount, category')

  const totalExpenses = monthExpenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  const expensesByCategory = monthExpenses?.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  const biggestCategory = expensesByCategory
    ? Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null

  const ytdTotal = ytdExpenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track farm expenses"
        action={profile.role === 'admin' ? { label: 'Add Expense', href: '/expenses/new' } : undefined}
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Expenses This Month</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Biggest Category This Month</p>
          <p className="text-2xl font-bold capitalize">{biggestCategory || 'N/A'}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">YTD Total Expenses</p>
          <p className="text-2xl font-bold">{formatCurrency(ytdTotal)}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <ExpenseTable expenses={expenses || []} currentUser={profile} />
      </div>
    </div>
  )
}