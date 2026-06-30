'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saleSchema } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import type { Flock, Sale, ItemType, PaymentStatus } from '@/lib/types'

type SaleFormData = z.infer<typeof saleSchema>

interface SaleFormProps {
  sale?: Sale
}

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'eggs', label: 'Eggs' },
  { value: 'birds', label: 'Birds' },
  { value: 'other', label: 'Other' },
]

const UNITS: Record<ItemType, string[]> = {
  eggs: ['crates', 'trays', 'pieces', 'kg'],
  birds: ['pieces', 'kg'],
  other: ['pieces', 'kg', 'units'],
}

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
]

export function SaleForm({ sale }: SaleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [flocks, setFlocks] = useState<Flock[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema) as any,
    defaultValues: {
      sale_date: sale?.sale_date ? format(new Date(sale.sale_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      payment_status: sale?.payment_status || 'pending',
      item_type: sale?.item_type || 'eggs',
      quantity: sale?.quantity || 1,
      unit_price: sale?.unit_price || 0,
      flock_id: sale?.flock_id || undefined,
      unit: sale?.unit || '',
      buyer_name: sale?.buyer_name || '',
      buyer_contact: sale?.buyer_contact || '',
      notes: sale?.notes || '',
    },
  })

  const saleDate = watch('sale_date')
  const itemType = watch('item_type')
  const quantity = watch('quantity')
  const unitPrice = watch('unit_price')
  const totalAmount = (quantity || 0) * (unitPrice || 0)

  useEffect(() => {
    const fetchFlocks = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('flocks')
        .select('*')
        .order('name')

      if (data) setFlocks(data)
    }

    fetchFlocks()
  }, [])

  const onSubmit = async (data: SaleFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (sale) {
      const { error } = await supabase
        .from('sales')
        .update({
          flock_id: data.flock_id || null,
          sale_date: data.sale_date,
          item_type: data.item_type,
          quantity: data.quantity,
          unit: data.unit,
          unit_price: data.unit_price,
          total_amount: data.quantity * data.unit_price,
          buyer_name: data.buyer_name || null,
          buyer_contact: data.buyer_contact || null,
          payment_status: data.payment_status,
          notes: data.notes || null,
        })
        .eq('id', sale.id)

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      toast.success('Sale updated successfully')
      router.push('/sales')
    } else {
      const { error } = await supabase.from('sales').insert({
        flock_id: data.flock_id || null,
        sale_date: data.sale_date,
        item_type: data.item_type,
        quantity: data.quantity,
        unit: data.unit,
        unit_price: data.unit_price,
        total_amount: data.quantity * data.unit_price,
        buyer_name: data.buyer_name || null,
        buyer_contact: data.buyer_contact || null,
        payment_status: data.payment_status,
        notes: data.notes || null,
        created_by: user?.id,
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      toast.success('Sale recorded successfully')
      router.push('/sales')
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sale_date">Sale Date *</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !saleDate && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {saleDate ? format(new Date(saleDate), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={saleDate ? new Date(saleDate) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setValue('sale_date', format(date, 'yyyy-MM-dd'))
                    setCalendarOpen(false)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.sale_date && (
            <p className="text-sm text-destructive">{errors.sale_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="flock_id">Flock (Optional)</Label>
          <Select value={watch('flock_id') || ''} onValueChange={(value: string) => setValue('flock_id', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a flock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {flocks.map((flock) => (
                <SelectItem key={flock.id} value={flock.id}>
                  {flock.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item_type">Item Type *</Label>
          <Select value={itemType} onValueChange={(value: string) => setValue('item_type', value as ItemType)}>
            <SelectTrigger className={errors.item_type ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.item_type && (
            <p className="text-sm text-destructive">{errors.item_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            placeholder="Enter quantity"
            {...register('quantity')}
            className={errors.quantity ? 'border-destructive' : ''}
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">{errors.quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select onValueChange={(value: string) => setValue('unit', value)}>
            <SelectTrigger className={errors.unit ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {UNITS[itemType].map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit && (
            <p className="text-sm text-destructive">{errors.unit.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">Unit Price (₦) *</Label>
          <Input
            id="unit_price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter price per unit"
            {...register('unit_price')}
            className={errors.unit_price ? 'border-destructive' : ''}
          />
          {errors.unit_price && (
            <p className="text-sm text-destructive">{errors.unit_price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Total Amount</Label>
          <div className="h-10 px-3 py-2 rounded-md border bg-muted text-lg font-medium">
            ₦{totalAmount.toLocaleString()}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_status">Payment Status *</Label>
          <Select value={watch('payment_status')} onValueChange={(value: string) => setValue('payment_status', value as PaymentStatus)}>
            <SelectTrigger className={errors.payment_status ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.payment_status && (
            <p className="text-sm text-destructive">{errors.payment_status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer_name">Buyer Name</Label>
          <Input
            id="buyer_name"
            placeholder="Enter buyer name"
            {...register('buyer_name')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer_contact">Buyer Contact</Label>
          <Input
            id="buyer_contact"
            placeholder="Enter contact info"
            {...register('buyer_contact')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes..."
          rows={3}
          {...register('notes')}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {sale ? 'Update Sale' : 'Record Sale'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
