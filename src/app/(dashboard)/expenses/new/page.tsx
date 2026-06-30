import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'

export const metadata = { title: 'Add Expense' }

export default async function NewExpensePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/expenses')
  }

  return (
    <div>
      <PageHeader
        title="Add Expense"
        description="Record a new farm expense"
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <ExpenseForm />
      </div>
    </div>
  )
}