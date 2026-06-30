import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'

export const metadata = { title: 'Edit Expense' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: Props) {
  const { id } = await params
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

  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (!expense) notFound()

  return (
    <div>
      <PageHeader
        title="Edit Expense"
        description={`Editing expense: ${expense.description}`}
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <ExpenseForm expense={expense} />
      </div>
    </div>
  )
}