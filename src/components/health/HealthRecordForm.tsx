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
import { healthRecordSchema } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import type { Flock, HealthRecordType } from '@/lib/types'

type HealthRecordFormData = z.infer<typeof healthRecordSchema>

const RECORD_TYPES: { value: HealthRecordType; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'disease', label: 'Disease' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'checkup', label: 'Checkup' },
]

export function HealthRecordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [followUpCalendarOpen, setFollowUpCalendarOpen] = useState(false)
  const [flocks, setFlocks] = useState<Flock[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HealthRecordFormData>({
    resolver: zodResolver(healthRecordSchema) as any,
    defaultValues: {
      record_date: format(new Date(), 'yyyy-MM-dd'),
      cost: 0,
    },
  })

  const recordDate = watch('record_date')
  const followUpDate = watch('follow_up_date')

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

  const onSubmit = async (data: HealthRecordFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('health_records').insert({
      flock_id: data.flock_id,
      record_date: data.record_date,
      record_type: data.record_type,
      description: data.description,
      medication: data.medication || null,
      dosage: data.dosage || null,
      vet_name: data.vet_name || null,
      cost: data.cost || 0,
      follow_up_date: data.follow_up_date || null,
      notes: data.notes || null,
      logged_by: user?.id,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Health record added successfully')
    router.push('/health')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="flock_id">Flock *</Label>
          <Select onValueChange={(value: string) => setValue('flock_id', value)}>
            <SelectTrigger className={errors.flock_id ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a flock" />
            </SelectTrigger>
            <SelectContent>
              {flocks.map((flock) => (
                <SelectItem key={flock.id} value={flock.id}>
                  {flock.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {errors.flock_id && (
            <p className="text-sm text-destructive">{errors.flock_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="record_date">Date *</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !recordDate && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {recordDate ? format(new Date(recordDate), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={recordDate ? new Date(recordDate) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setValue('record_date', format(date, 'yyyy-MM-dd'))
                    setCalendarOpen(false)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.record_date && (
            <p className="text-sm text-destructive">{errors.record_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="record_type">Record Type *</Label>
          <Select onValueChange={(value: string) => setValue('record_type', value as HealthRecordType)}>
            <SelectTrigger className={errors.record_type ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {RECORD_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.record_type && (
            <p className="text-sm text-destructive">{errors.record_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter cost"
            {...register('cost')}
          />
          {errors.cost && (
            <p className="text-sm text-destructive">{errors.cost.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="medication">Medication</Label>
          <Input
            id="medication"
            placeholder="Enter medication name"
            {...register('medication')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            placeholder="e.g., 5ml per bird"
            {...register('dosage')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vet_name">Vet Name</Label>
          <Input
            id="vet_name"
            placeholder="Enter veterinarian name"
            {...register('vet_name')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="follow_up_date">Follow-up Date</Label>
          <Popover open={followUpCalendarOpen} onOpenChange={setFollowUpCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !followUpDate && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {followUpDate ? format(new Date(followUpDate), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={followUpDate ? new Date(followUpDate) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setValue('follow_up_date', format(date, 'yyyy-MM-dd'))
                    setFollowUpCalendarOpen(false)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the health issue or vaccination..."
          rows={3}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
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
          Add Health Record
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
