'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { HealthRecord, Profile } from '@/lib/types'

interface HealthRecordTableProps {
  records: HealthRecord[]
  currentUser: Profile
}

export function HealthRecordTable({ records, currentUser }: HealthRecordTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    const { error } = await supabase.from('health_records').delete().eq('id', deleteId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Health record deleted successfully')
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  const getRecordTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'disease':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'treatment':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'deworming':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'checkup':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const isFollowUpSoon = (date: string | null) => {
    if (!date) return false
    const followUp = new Date(date)
    const today = new Date()
    const diffDays = Math.ceil((followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }

  const isFollowUpOverdue = (date: string | null) => {
    if (!date) return false
    const followUp = new Date(date)
    const today = new Date()
    return followUp < today
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No health records found.
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
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Vet</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Logged By</TableHead>
              {currentUser.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{formatDate(record.record_date)}</TableCell>
                <TableCell className="font-medium">{record.flock?.name || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRecordTypeBadgeClass(record.record_type)}>
                    {record.record_type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{record.description}</TableCell>
                <TableCell>{record.medication || '-'}</TableCell>
                <TableCell>{record.vet_name || '-'}</TableCell>
                <TableCell>${record.cost.toFixed(2)}</TableCell>
                <TableCell>
                  {record.follow_up_date ? (
                    <span
                      className={
                        isFollowUpOverdue(record.follow_up_date)
                          ? 'text-red-600 font-medium'
                          : isFollowUpSoon(record.follow_up_date)
                          ? 'text-orange-600 font-medium'
                          : ''
                      }
                    >
                      {formatDate(record.follow_up_date)}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{record.logger?.full_name || '-'}</TableCell>
                {currentUser.role === 'admin' && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(record.id)}
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
        title="Delete Health Record"
        description="Are you sure you want to delete this health record?"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}