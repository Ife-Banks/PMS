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
import type { Sale, Profile } from '@/lib/types'

interface SaleTableProps {
  sales: Sale[]
  currentUser: Profile
}

export function SaleTable({ sales, currentUser }: SaleTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const supabase = createClient()
    const { error } = await supabase.from('sales').delete().eq('id', deleteId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Sale deleted successfully')
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'partial':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No sales records found.
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
              <TableHead>Item Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>
                <TableCell className="font-medium">{sale.flock?.name || '-'}</TableCell>
                <TableCell className="capitalize">{sale.item_type}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell className="capitalize">{sale.unit}</TableCell>
                <TableCell>{formatCurrency(sale.unit_price)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(sale.total_amount)}</TableCell>
                <TableCell>{sale.buyer_name || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPaymentStatusClass(sale.payment_status)}>
                    {sale.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {currentUser.role === 'admin' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/sales/${sale.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(sale.id)}
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
        title="Delete Sale"
        description="Are you sure you want to delete this sale record?"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}