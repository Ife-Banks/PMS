import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { MortalityForm } from '@/components/mortality/MortalityForm'

export const metadata = { title: 'Log Mortality' }

export default async function NewMortalityPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div>
      <PageHeader
        title="Log Mortality"
        description="Record bird deaths and causes"
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <MortalityForm />
      </div>
    </div>
  )
}