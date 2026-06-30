'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Expense, Profile } from '@/lib/types'

interface ExpenseTableProps {
  expenses: Expense[]
  currentUser: Profile
}

const categoryColors: Record<string, string> = {
  feed: 'bg-amber-100 text-amber-700 border-amber-200',
  medication: 'bg-red-100 text-red-700 border-red-200',
  equipment: 'bg-blue-100 text-blue-700 border-blue-200',
  labor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  utilities: 'bg-purple-100 text-purple-700 border-purple-200',
  maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  transport: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
}

export function ExpenseTable({ expenses, currentUser }: ExpenseTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    const { error } = await supabase.from('expenses').delete().eq('id', deleteId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Expense deleted successfully')
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No expenses found.
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
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Flock</TableHead>
              <TableHead>Created By</TableHead>
              {currentUser.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.expense_date)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={categoryColors[expense.category]}>
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell className="text-red-600 font-medium">{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{expense.vendor || '-'}</TableCell>
                <TableCell>{expense.flock?.name || '-'}</TableCell>
                <TableCell>{expense.creator?.full_name || '-'}</TableCell>
                {currentUser.role === 'admin' && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/expenses/${expense.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(expense.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
        title="Delete Expense"
        description="Are you sure you want to delete this expense?"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}