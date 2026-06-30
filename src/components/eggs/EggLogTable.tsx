'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { EggProduction, Profile } from '@/lib/types'

interface EggLogTableProps {
  logs: EggProduction[]
  currentUser: Profile
}

export function EggLogTable({ logs, currentUser }: EggLogTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    const { error } = await supabase.from('egg_production').delete().eq('id', deleteId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Egg log deleted successfully')
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No egg production records found.
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
              <TableHead>Total Eggs</TableHead>
              <TableHead>Broken</TableHead>
              <TableHead>Good</TableHead>
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
                <TableCell>{log.total_eggs.toLocaleString()}</TableCell>
                <TableCell className={log.broken_eggs > 0 ? 'text-red-600' : ''}>
                  {log.broken_eggs.toLocaleString()}
                </TableCell>
                <TableCell className="text-green-600 font-medium">
                  {log.good_eggs.toLocaleString()}
                </TableCell>
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
        title="Delete Egg Log"
        description="Are you sure you want to delete this egg production record?"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}