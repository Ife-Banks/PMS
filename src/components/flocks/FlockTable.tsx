'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Eye } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Flock, Profile } from '@/lib/types'

interface FlockTableProps {
  flocks: Flock[]
  currentUser: Profile
}

export function FlockTable({ flocks, currentUser }: FlockTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    const { error } = await supabase.from('flocks').delete().eq('id', deleteId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Flock deleted successfully')
      router.refresh()
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    sold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const birdTypeLabels = {
    broiler: 'Broiler',
    layer: 'Layer',
    breeder: 'Breeder',
    turkey: 'Turkey',
    duck: 'Duck',
    other: 'Other',
  }

  if (flocks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No flocks found. Create your first flock to get started.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead>Initial Qty</TableHead>
              <TableHead>Current Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acquisition Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flocks.map((flock) => (
              <TableRow key={flock.id}>
                <TableCell className="font-medium">
                  <button
                    onClick={() => router.push(`/flocks/${flock.id}`)}
                    className="hover:text-primary hover:underline"
                  >
                    {flock.name}
                  </button>
                </TableCell>
                <TableCell className="capitalize">{birdTypeLabels[flock.bird_type]}</TableCell>
                <TableCell>{flock.breed || '-'}</TableCell>
                <TableCell>{flock.initial_quantity}</TableCell>
                <TableCell>{flock.current_quantity}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[flock.status]}>
                    {flock.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(flock.acquisition_date)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/flocks/${flock.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {currentUser.role === 'admin' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/flocks/${flock.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(flock.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Flock"
        description="Are you sure you want to delete this flock? This action cannot be undone."
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}