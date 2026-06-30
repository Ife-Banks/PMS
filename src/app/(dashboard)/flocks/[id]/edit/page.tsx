import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { FlockForm } from '@/components/flocks/FlockForm'

export const metadata = { title: 'Edit Flock' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditFlockPage({ params }: Props) {
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
    redirect('/flocks')
  }

  const { data: flock } = await supabase
    .from('flocks')
    .select('*')
    .eq('id', id)
    .single()

  if (!flock) notFound()

  return (
    <div>
      <PageHeader
        title="Edit Flock"
        description={`Editing ${flock.name}`}
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <FlockForm flock={flock} />
      </div>
    </div>
  )
}