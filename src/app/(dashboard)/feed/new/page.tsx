import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { FeedLogForm } from '@/components/feed/FeedLogForm'

export const metadata = { title: 'Log Feed' }

export default async function NewFeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div>
      <PageHeader
        title="Log Feed Consumption"
        description="Record feed given to a flock"
      />

      <div className="bg-card rounded-lg border p-6 max-w-2xl">
        <FeedLogForm />
      </div>
    </div>
  )
}