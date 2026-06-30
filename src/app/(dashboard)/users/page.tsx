import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { UsersTable } from '@/components/users/UsersTable'

export const metadata = { title: 'User Management' }

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (profile.role !== 'admin') {
    redirect('/')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage system users and roles"
      />

      <div className="bg-card rounded-lg border">
        <UsersTable users={users || []} currentUserId={user.id} />
      </div>
    </div>
  )
}