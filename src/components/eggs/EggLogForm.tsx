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
import { eggProductionSchema } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import type { Flock } from '@/lib/types'

type EggLogFormData = z.infer<typeof eggProductionSchema>

export function EggLogForm() {
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
  } = useForm<EggLogFormData>({
    resolver: zodResolver(eggProductionSchema) as any,
    defaultValues: {
      log_date: format(new Date(), 'yyyy-MM-dd'),
      total_eggs: 0,
      broken_eggs: 0,
    },
  })

  const logDate = watch('log_date')
  const totalEggs = watch('total_eggs')
  const brokenEggs = watch('broken_eggs')
  const goodEggs = (totalEggs || 0) - (brokenEggs || 0)

  useEffect(() => {
    const fetchFlocks = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('flocks')
        .select('*')
        .eq('status', 'active')
        .eq('bird_type', 'layer')
        .order('name')

      if (data) setFlocks(data)
    }

    fetchFlocks()
  }, [])

  const onSubmit = async (data: EggLogFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const goodEggsValue = data.total_eggs - data.broken_eggs

    const { error } = await supabase.from('egg_production').insert({
      flock_id: data.flock_id,
      log_date: data.log_date,
      total_eggs: data.total_eggs,
      broken_eggs: data.broken_eggs,
      good_eggs: goodEggsValue,
      notes: data.notes || null,
      logged_by: user?.id,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Egg production logged successfully')
    router.push('/eggs')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="flock_id">Flock *</Label>
          <Select onValueChange={(value: string) => setValue('flock_id', value)}>
            <SelectTrigger className={errors.flock_id ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a layer flock" />
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
          <Label htmlFor="total_eggs">Total Eggs *</Label>
          <Input
            id="total_eggs"
            type="number"
            min="0"
            placeholder="Enter total eggs collected"
            {...register('total_eggs')}
            className={errors.total_eggs ? 'border-destructive' : ''}
          />
          {errors.total_eggs && (
            <p className="text-sm text-destructive">{errors.total_eggs.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="broken_eggs">Broken Eggs</Label>
          <Input
            id="broken_eggs"
            type="number"
            min="0"
            placeholder="Enter broken eggs"
            {...register('broken_eggs')}
            className={errors.broken_eggs ? 'border-destructive' : ''}
          />
          {errors.broken_eggs && (
            <p className="text-sm text-destructive">{errors.broken_eggs.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Good Eggs</Label>
          <div className="h-10 px-3 py-2 rounded-md border bg-muted text-lg font-medium">
            {goodEggs >= 0 ? goodEggs.toLocaleString() : 'Invalid'}
          </div>
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
          Log Egg Production
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
