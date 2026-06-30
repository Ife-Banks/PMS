export type Role = 'admin' | 'farm_worker'
export type BirdType = 'broiler' | 'layer' | 'breeder' | 'turkey' | 'duck' | 'other'
export type FlockStatus = 'active' | 'sold' | 'closed'
export type HealthRecordType = 'vaccination' | 'disease' | 'treatment' | 'deworming' | 'checkup'
export type ItemType = 'eggs' | 'birds' | 'other'
export type PaymentStatus = 'paid' | 'pending' | 'partial'
export type ExpenseCategory = 'feed' | 'medication' | 'equipment' | 'labor' | 'utilities' | 'maintenance' | 'transport' | 'other'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: Role
  created_at: string
  updated_at: string
}

export interface Flock {
  id: string
  name: string
  breed: string | null
  bird_type: BirdType
  initial_quantity: number
  current_quantity: number
  acquisition_date: string
  status: FlockStatus
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FeedLog {
  id: string
  flock_id: string
  log_date: string
  feed_type: string
  quantity_kg: number
  cost_per_kg: number
  total_cost: number
  supplier: string | null
  notes: string | null
  logged_by: string | null
  created_at: string
  flock?: Flock
  logger?: Profile
}

export interface EggProduction {
  id: string
  flock_id: string
  log_date: string
  total_eggs: number
  broken_eggs: number
  good_eggs: number
  notes: string | null
  logged_by: string | null
  created_at: string
  flock?: Flock
  logger?: Profile
}

export interface HealthRecord {
  id: string
  flock_id: string
  record_date: string
  record_type: HealthRecordType
  description: string
  medication: string | null
  dosage: string | null
  vet_name: string | null
  cost: number
  follow_up_date: string | null
  notes: string | null
  logged_by: string | null
  created_at: string
  flock?: Flock
  logger?: Profile
}

export interface MortalityLog {
  id: string
  flock_id: string
  log_date: string
  quantity: number
  cause: string | null
  notes: string | null
  logged_by: string | null
  created_at: string
  flock?: Flock
  logger?: Profile
}

export interface Sale {
  id: string
  flock_id: string | null
  sale_date: string
  item_type: ItemType
  quantity: number
  unit: string
  unit_price: number
  total_amount: number
  buyer_name: string | null
  buyer_contact: string | null
  payment_status: PaymentStatus
  notes: string | null
  created_by: string | null
  created_at: string
  flock?: Flock
  creator?: Profile
}

export interface Expense {
  id: string
  expense_date: string
  category: ExpenseCategory
  description: string
  amount: number
  vendor: string | null
  flock_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  flock?: Flock
  creator?: Profile
}

export interface FlockSummary {
  id: string
  name: string
  bird_type: BirdType
  breed: string | null
  current_quantity: number
  status: FlockStatus
  acquisition_date: string
  total_eggs_produced: number
  total_broken_eggs: number
  total_mortality: number
  total_feed_cost: number
}

export interface MonthlyRevenue {
  month: string
  total_revenue: number
  total_transactions: number
  item_type: ItemType
}

export interface MonthlyExpense {
  month: string
  total_expenses: number
  category: ExpenseCategory
}