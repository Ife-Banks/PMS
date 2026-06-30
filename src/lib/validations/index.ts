import { z } from 'zod'

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const flockSchema = z.object({
  name: z.string().min(1, 'Flock name is required'),
  breed: z.string().optional(),
  bird_type: z.enum(['broiler', 'layer', 'breeder', 'turkey', 'duck', 'other']),
  initial_quantity: z.coerce.number().int().positive('Quantity must be positive'),
  acquisition_date: z.string().min(1, 'Acquisition date is required'),
  status: z.enum(['active', 'sold', 'closed']),
  notes: z.string().optional(),
})

export const feedLogSchema = z.object({
  flock_id: z.string().uuid('Please select a flock'),
  log_date: z.string().min(1, 'Date is required'),
  feed_type: z.string().min(1, 'Feed type is required'),
  quantity_kg: z.coerce.number().positive('Quantity must be positive'),
  cost_per_kg: z.coerce.number().min(0, 'Cost cannot be negative'),
  supplier: z.string().optional(),
  notes: z.string().optional(),
})

export const eggProductionSchema = z.object({
  flock_id: z.string().uuid('Please select a flock'),
  log_date: z.string().min(1, 'Date is required'),
  total_eggs: z.coerce.number().int().min(0, 'Total eggs cannot be negative'),
  broken_eggs: z.coerce.number().int().min(0, 'Broken eggs cannot be negative'),
  notes: z.string().optional(),
}).refine(data => data.broken_eggs <= data.total_eggs, {
  message: 'Broken eggs cannot exceed total eggs',
  path: ['broken_eggs'],
})

export const healthRecordSchema = z.object({
  flock_id: z.string().uuid('Please select a flock'),
  record_date: z.string().min(1, 'Date is required'),
  record_type: z.enum(['vaccination', 'disease', 'treatment', 'deworming', 'checkup']),
  description: z.string().min(1, 'Description is required'),
  medication: z.string().optional(),
  dosage: z.string().optional(),
  vet_name: z.string().optional(),
  cost: z.coerce.number().min(0, 'Cost cannot be negative'),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
})

export const mortalitySchema = z.object({
  flock_id: z.string().uuid('Please select a flock'),
  log_date: z.string().min(1, 'Date is required'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  cause: z.string().optional(),
  notes: z.string().optional(),
})

export const saleSchema = z.object({
  flock_id: z.string().uuid().optional(),
  sale_date: z.string().min(1, 'Date is required'),
  item_type: z.enum(['eggs', 'birds', 'other']),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.coerce.number().min(0, 'Price cannot be negative'),
  buyer_name: z.string().optional(),
  buyer_contact: z.string().optional(),
  payment_status: z.enum(['paid', 'pending', 'partial']),
  notes: z.string().optional(),
})

export const expenseSchema = z.object({
  expense_date: z.string().min(1, 'Date is required'),
  category: z.enum(['feed', 'medication', 'equipment', 'labor', 'utilities', 'maintenance', 'transport', 'other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  vendor: z.string().optional(),
  flock_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})