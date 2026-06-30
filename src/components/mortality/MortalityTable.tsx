'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { MortalityLog, Profile } from '@/lib/types'

interface MortalityTableProps {
  logs: MortalityLog[]
  currentUser: Profile
}

export function MortalityTable({ logs, currentUser }: MortalityTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    const { error } = await supabase.from('mortality_logs').delete().eq('id', deleteId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Mortality log deleted successfully')
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No mortality logs found.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Flock</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Cause</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Logged By</TableHead>
              {currentUser.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.log_date)}</TableCell>
                <TableCell className="font-medium">{log.flock?.name || 'Unknown'}</TableCell>
                <TableCell className="text-red-600 font-medium">{log.quantity}</TableCell>
                <TableCell>{log.cause || '-'}</TableCell>
                <TableCell>{log.notes || '-'}</TableCell>
                <TableCell>{log.logger?.full_name || '-'}</TableCell>
                {currentUser.role === 'admin' && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(log.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Mortality Log"
        description="Are you sure you want to delete this mortality log?"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}