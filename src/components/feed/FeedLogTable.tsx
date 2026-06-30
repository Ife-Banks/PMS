'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { FeedLog, Profile } from '@/lib/types'

interface FeedLogTableProps {
  logs: FeedLog[]
  currentUser: Profile
}

export function FeedLogTable({ logs, currentUser }: FeedLogTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    const { error } = await supabase.from('feed_logs').delete().eq('id', deleteId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Feed log deleted successfully')
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No feed logs found. Record your first feed log to get started.
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
              <TableHead>Feed Type</TableHead>
              <TableHead>Quantity (kg)</TableHead>
              <TableHead>Cost/kg</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Logged By</TableHead>
              {currentUser.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.log_date)}</TableCell>
                <TableCell className="font-medium">{log.flock?.name || 'Unknown'}</TableCell>
                <TableCell>{log.feed_type}</TableCell>
                <TableCell>{log.quantity_kg.toLocaleString()}</TableCell>
                <TableCell>{log.cost_per_kg > 0 ? formatCurrency(log.cost_per_kg) : '-'}</TableCell>
                <TableCell>{log.total_cost > 0 ? formatCurrency(log.total_cost) : '-'}</TableCell>
                <TableCell>{log.supplier || '-'}</TableCell>
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
        title="Delete Feed Log"
        description="Are you sure you want to delete this feed log? This action cannot be undone."
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}