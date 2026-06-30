import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { EggLogForm } from '@/components/eggs/EggLogForm'

export const metadata = { title: 'Log Eggs' }

export default async function NewEggsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div>
      <PageHeader
        title="Log Egg Production"
        description="Record daily egg collection"
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <EggLogForm />
      </div>
    </div>
  )
}