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
import { expenseSchema } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import type { Flock, Expense, ExpenseCategory } from '@/lib/types'

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  expense?: Expense
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'feed', label: 'Feed' },
  { value: 'medication', label: 'Medication' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'labor', label: 'Labor' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
]

export function ExpenseForm({ expense }: ExpenseFormProps) {
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
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      expense_date: expense?.expense_date ? format(new Date(expense.expense_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      category: expense?.category || 'feed',
      description: expense?.description || '',
      amount: expense?.amount || 0,
      vendor: expense?.vendor || '',
      flock_id: expense?.flock_id || undefined,
      notes: expense?.notes || '',
    },
  })

  const expenseDate = watch('expense_date')

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

  const onSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (expense) {
      const { error } = await supabase
        .from('expenses')
        .update({
          expense_date: data.expense_date,
          category: data.category,
          description: data.description,
          amount: data.amount,
          vendor: data.vendor || null,
          flock_id: data.flock_id || null,
          notes: data.notes || null,
        })
        .eq('id', expense.id)

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      toast.success('Expense updated successfully')
      router.push('/expenses')
    } else {
      const { error } = await supabase.from('expenses').insert({
        expense_date: data.expense_date,
        category: data.category,
        description: data.description,
        amount: data.amount,
        vendor: data.vendor || null,
        flock_id: data.flock_id || null,
        notes: data.notes || null,
        created_by: user?.id,
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      toast.success('Expense added successfully')
      router.push('/expenses')
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense_date">Date *</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !expenseDate && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expenseDate ? format(new Date(expenseDate), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expenseDate ? new Date(expenseDate) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setValue('expense_date', format(date, 'yyyy-MM-dd'))
                    setCalendarOpen(false)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.expense_date && (
            <p className="text-sm text-destructive">{errors.expense_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={watch('category')} onValueChange={(value: string) => setValue('category', value as ExpenseCategory)}>
            <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="Enter expense description"
            {...register('description')}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₦) *</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter amount"
            {...register('amount')}
            className={errors.amount ? 'border-destructive' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            placeholder="Enter vendor name"
            {...register('vendor')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="flock_id">Linked Flock</Label>
          <Select value={watch('flock_id') || ''} onValueChange={(value: string) => setValue('flock_id', value || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Select flock (optional)" />
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
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
