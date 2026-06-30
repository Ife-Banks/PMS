import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { FlockTable } from '@/components/flocks/FlockTable'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Flocks' }

export default async function FlocksPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: flocks } = await supabase
    .from('flocks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Flocks"
        description="Manage your poultry flocks"
        action={
          profile.role === 'admin'
            ? { label: 'Add Flock', href: '/flocks/new' }
            : undefined
        }
      />

      <div className="bg-card rounded-lg border">
        <FlockTable flocks={flocks || []} currentUser={profile} />
      </div>
    </div>
  )
}