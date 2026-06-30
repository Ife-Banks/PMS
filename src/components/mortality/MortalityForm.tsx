'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'
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
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { mortalitySchema } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import type { Flock } from '@/lib/types'

type MortalityFormData = z.infer<typeof mortalitySchema>

export function MortalityForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [flocks, setFlocks] = useState<Flock[]>([])
  const [showWarning, setShowWarning] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MortalityFormData>({
    resolver: zodResolver(mortalitySchema) as any,
    defaultValues: {
      log_date: format(new Date(), 'yyyy-MM-dd'),
      quantity: 1,
    },
  })

  const logDate = watch('log_date')
  const selectedFlockId = watch('flock_id')
  const quantity = watch('quantity')

  const selectedFlock = flocks.find((f) => f.id === selectedFlockId)

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

  useEffect(() => {
    if (selectedFlock && quantity > selectedFlock.current_quantity) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [selectedFlock, quantity])

  const onSubmit = async (data: MortalityFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('mortality_logs').insert({
      flock_id: data.flock_id,
      log_date: data.log_date,
      quantity: data.quantity,
      cause: data.cause || null,
      notes: data.notes || null,
      logged_by: user?.id,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    if (selectedFlock) {
      const newQuantity = Math.max(0, selectedFlock.current_quantity - data.quantity)
      await supabase
        .from('flocks')
        .update({ current_quantity: newQuantity })
        .eq('id', selectedFlock.id)
    }

    toast.success('Mortality logged successfully')
    router.push('/mortality')
    router.refresh()
  }

  return (
    <>
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
                  className={cn('w-full justify-start text-left font-normal', !logDate && 'text-muted-foreground')}
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
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Number of birds"
              {...register('quantity')}
              className={errors.quantity ? 'border-destructive' : ''}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cause">Cause</Label>
            <Input
              id="cause"
              placeholder="e.g., Disease, Injury, Unknown"
              {...register('cause')}
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
            Log Mortality
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              The quantity entered exceeds the current flock size ({selectedFlock?.current_quantity} birds).
              The flock&apos;s quantity will be reduced to 0.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowWarning(false)}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
