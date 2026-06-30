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
import { feedLogSchema } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import type { Flock } from '@/lib/types'

type FeedLogFormData = z.infer<typeof feedLogSchema>

const FEED_TYPES = ['Starter', 'Grower', 'Finisher', 'Layer Mash', 'Broiler Finisher', 'Custom']

export function FeedLogForm() {
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
  } = useForm<FeedLogFormData>({
    resolver: zodResolver(feedLogSchema) as any,
    defaultValues: {
      log_date: format(new Date(), 'yyyy-MM-dd'),
      quantity_kg: 0,
      cost_per_kg: 0,
    },
  })

  const logDate = watch('log_date')
  const selectedFlockId = watch('flock_id')

  useEffect(() => {
    const fetchFlocks = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('flocks')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (data) setFlocks(data)
    }

    fetchFlocks()
  }, [])

  const onSubmit = async (data: FeedLogFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('feed_logs').insert({
      flock_id: data.flock_id,
      log_date: data.log_date,
      feed_type: data.feed_type,
      quantity_kg: data.quantity_kg,
      cost_per_kg: data.cost_per_kg || 0,
      total_cost: data.quantity_kg * (data.cost_per_kg || 0),
      supplier: data.supplier || null,
      notes: data.notes || null,
      logged_by: user?.id,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Feed log recorded successfully')
    router.push('/feed')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="flock_id">Flock *</Label>
          <Select value={selectedFlockId} onValueChange={(value: string) => setValue('flock_id', value)}>
            <SelectTrigger className={errors.flock_id ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a flock" />
            </SelectTrigger>
            <SelectContent>
              {flocks.map((flock) => (
                <SelectItem key={flock.id} value={flock.id}>
                  {flock.name} ({flock.current_quantity} birds)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.flock_id && (
            <p className="text-sm text-destructive">{errors.flock_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="log_date">Date *</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !logDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {logDate ? format(new Date(logDate), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={logDate ? new Date(logDate) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setValue('log_date', format(date, 'yyyy-MM-dd'))
                    setCalendarOpen(false)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.log_date && (
            <p className="text-sm text-destructive">{errors.log_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="feed_type">Feed Type *</Label>
          <Select onValueChange={(value: string) => setValue('feed_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select feed type" />
            </SelectTrigger>
            <SelectContent>
              {FEED_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {errors.feed_type && (
            <p className="text-sm text-destructive">{errors.feed_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity_kg">Quantity (kg) *</Label>
          <Input
            id="quantity_kg"
            type="number"
            min="0"
            step="0.1"
            placeholder="Enter quantity in kg"
            {...register('quantity_kg')}
            className={errors.quantity_kg ? 'border-destructive' : ''}
          />
          {errors.quantity_kg && (
            <p className="text-sm text-destructive">{errors.quantity_kg.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_per_kg">Cost per kg</Label>
          <Input
            id="cost_per_kg"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter cost per kg"
            {...register('cost_per_kg')}
            className={errors.cost_per_kg ? 'border-destructive' : ''}
          />
          {errors.cost_per_kg && (
            <p className="text-sm text-destructive">{errors.cost_per_kg.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            placeholder="Enter supplier name"
            {...register('supplier')}
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
          Record Feed Log
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
