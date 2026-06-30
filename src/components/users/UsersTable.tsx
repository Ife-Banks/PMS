'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface UsersTableProps {
  users: Profile[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [roleChangeId, setRoleChangeId] = useState<string | null>(null)
  const [isChanging, setIsChanging] = useState(false)
  const [targetRole, setTargetRole] = useState<'admin' | 'farm_worker'>('admin')

  const handleRoleChange = async () => {
    if (!roleChangeId) return
    setIsChanging(true)

    const supabase = createClient()
    const newRole = targetRole === 'admin' ? 'farm_worker' : 'admin'

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', roleChangeId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`User role changed to ${newRole}`)
      router.refresh()
    }

    setIsChanging(false)
    setRoleChangeId(null)
  }

  const openRoleChange = (userId: string, currentRole: 'admin' | 'farm_worker') => {
    setRoleChangeId(userId)
    setTargetRole(currentRole === 'admin' ? 'farm_worker' : 'admin')
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  {user.id !== currentUserId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRoleChange(user.id, user.role)}
                    >
                      {user.role === 'admin' ? 'Demote to Worker' : 'Promote to Admin'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!roleChangeId}
        onOpenChange={() => setRoleChangeId(null)}
        title="Change User Role"
        description={`Are you sure you want to ${targetRole === 'admin' ? 'promote this user to Admin' : 'demote this user to Farm Worker'}?`}
        onConfirm={handleRoleChange}
        loading={isChanging}
      />
    </>
  )
}