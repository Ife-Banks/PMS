import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { SaleForm } from '@/components/sales/SaleForm'

export const metadata = { title: 'Edit Sale' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSalePage({ params }: Props) {
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
    redirect('/sales')
  }

  const { data: sale } = await supabase
    .from('sales')
    .select('*')
    .eq('id', id)
    .single()

  if (!sale) notFound()

  return (
    <div>
      <PageHeader
        title="Edit Sale"
        description={`Editing sale from ${new Date(sale.sale_date).toLocaleDateString()}`}
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <SaleForm sale={sale} />
      </div>
    </div>
  )
}