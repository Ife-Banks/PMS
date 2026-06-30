import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { HealthRecordForm } from '@/components/health/HealthRecordForm'

export const metadata = { title: 'Add Health Record' }

export default async function NewHealthPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div>
      <PageHeader
        title="Add Health Record"
        description="Record a health event for a flock"
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <HealthRecordForm />
      </div>
    </div>
  )
}