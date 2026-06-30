import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { SaleForm } from '@/components/sales/SaleForm'

export const metadata = { title: 'Record Sale' }

export default async function NewSalePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/sales')
  }

  return (
    <div>
      <PageHeader
        title="Record Sale"
        description="Add a new sale transaction"
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <SaleForm />
      </div>
    </div>
  )
}