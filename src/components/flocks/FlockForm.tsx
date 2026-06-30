'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
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
import { CalendarIcon, Egg } from 'lucide-react'
import { cn } from '@/lib/utils'
import { flockSchema } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import type { Flock, BirdType, FlockStatus } from '@/lib/types'

type FlockFormData = z.infer<typeof flockSchema>

interface FlockFormProps {
  flock?: Flock
}

export function FlockForm({ flock }: FlockFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FlockFormData>({
    resolver: zodResolver(flockSchema) as any,
    defaultValues: {
      name: flock?.name || '',
      breed: flock?.breed || '',
      bird_type: flock?.bird_type || 'broiler',
      initial_quantity: flock?.initial_quantity || 0,
      acquisition_date: flock?.acquisition_date ? format(new Date(flock.acquisition_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      status: flock?.status || 'active',
      notes: flock?.notes || '',
    },
  })

  const birdType = watch('bird_type')
  const status = watch('status')
  const acquisitionDate = watch('acquisition_date')

  const onSubmit = async (data: FlockFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    if (flock) {
      const { error } = await supabase
        .from('flocks')
        .update({
          name: data.name,
          breed: data.breed || null,
          bird_type: data.bird_type,
          initial_quantity: data.initial_quantity,
          acquisition_date: data.acquisition_date,
          status: data.status,
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', flock.id)

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      toast.success('Flock updated successfully')
      router.push(`/flocks/${flock.id}`)
    } else {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('flocks').insert({
        name: data.name,
        breed: data.breed || null,
        bird_type: data.bird_type,
        initial_quantity: data.initial_quantity,
        current_quantity: data.initial_quantity,
        acquisition_date: data.acquisition_date,
        status: data.status,
        notes: data.notes || null,
        created_by: user?.id,
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      toast.success('Flock created successfully')
      router.push('/flocks')
    }

    router.refresh()
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Flock Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Broiler Batch 2024-01"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bird_type">Bird Type *</Label>
          <Select
            value={birdType}
            onValueChange={(value: BirdType) => setValue('bird_type', value)}
          >
            <SelectTrigger className={errors.bird_type ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select bird type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="broiler">Broiler</SelectItem>
              <SelectItem value="layer">Layer</SelectItem>
              <SelectItem value="breeder">Breeder</SelectItem>
              <SelectItem value="turkey">Turkey</SelectItem>
              <SelectItem value="duck">Duck</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.bird_type && (
            <p className="text-sm text-destructive">{errors.bird_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            placeholder="e.g., Ross 308, Isa Brown"
            {...register('breed')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="initial_quantity">Initial Quantity *</Label>
          <Input
            id="initial_quantity"
            type="number"
            min="1"
            placeholder="Enter number of birds"
            {...register('initial_quantity')}
            className={errors.initial_quantity ? 'border-destructive' : ''}
          />
          {errors.initial_quantity && (
            <p className="text-sm text-destructive">{errors.initial_quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="acquisition_date">Acquisition Date *</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !acquisitionDate && 'text-muted-foreground',
                  errors.acquisition_date && 'border-destructive'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {acquisitionDate ? format(new Date(acquisitionDate), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={acquisitionDate ? new Date(acquisitionDate) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setValue('acquisition_date', format(date, 'yyyy-MM-dd'))
                    setCalendarOpen(false)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.acquisition_date && (
            <p className="text-sm text-destructive">{errors.acquisition_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={status}
            onValueChange={(value: FlockStatus) => setValue('status', value)}
          >
            <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes about this flock..."
          rows={4}
          {...register('notes')}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {flock ? 'Update Flock' : 'Create Flock'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
