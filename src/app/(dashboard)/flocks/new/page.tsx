import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { FlockForm } from '@/components/flocks/FlockForm'

export const metadata = { title: 'New Flock' }

export default async function NewFlockPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/flocks')
  }

  return (
    <div>
      <PageHeader
        title="Add New Flock"
        description="Create a new flock record"
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <FlockForm />
      </div>
    </div>
  )
}