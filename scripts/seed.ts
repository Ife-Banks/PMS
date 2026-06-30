import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function seed() {
  console.log('🌱 Starting database seed...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Login with the provided credentials
  console.log('🔐 Logging in...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'ifeoluwa.bankole05@gmail.com',
    password: 'bankole1234',
  })
  
  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  
  const userId = authData.user.id
  console.log('✅ Logged in as:', authData.user.email)
  
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  console.log('👤 Profile:', profile?.full_name, '- Role:', profile?.role)
  
  // Clear existing data for this user (to allow re-running)
  console.log('🧹 Clearing existing data...')
  
  await supabase.from('mortality_logs').delete().eq('logged_by', userId)
  await supabase.from('health_records').delete().eq('logged_by', userId)
  await supabase.from('egg_production').delete().eq('logged_by', userId)
  await supabase.from('feed_logs').delete().eq('logged_by', userId)
  await supabase.from('sales').delete().eq('created_by', userId)
  await supabase.from('expenses').delete().eq('created_by', userId)
  
  const { data: flocks } = await supabase.from('flocks').select('id').eq('created_by', userId)
  if (flocks && flocks.length > 0) {
    const flockIds = flocks.map(f => f.id)
    await supabase.from('flocks').delete().in('id', flockIds)
  }
  
  // Create flocks
  console.log('🐔 Creating flocks...')
  const flocksData = [
    {
      name: 'Broiler Batch 2026-A',
      breed: 'Ross 308',
      bird_type: 'broiler',
      initial_quantity: 500,
      current_quantity: 465,
      acquisition_date: '2026-06-01',
      status: 'active',
      notes: 'Main broiler batch for Q2 2026',
      created_by: userId,
    },
    {
      name: 'Layer Flock Alpha',
      breed: 'Isa Brown',
      bird_type: 'layer',
      initial_quantity: 300,
      current_quantity: 285,
      acquisition_date: '2025-12-15',
      status: 'active',
      notes: 'Primary egg production flock',
      created_by: userId,
    },
    {
      name: 'Turkeys Q1 2026',
      breed: 'Broad White',
      bird_type: 'turkey',
      initial_quantity: 80,
      current_quantity: 72,
      acquisition_date: '2026-03-01',
      status: 'active',
      notes: 'Turkey flock for festive season',
      created_by: userId,
    },
    {
      name: 'Breeder Flock B',
      breed: 'Cobb 500',
      bird_type: 'breeder',
      initial_quantity: 150,
      current_quantity: 142,
      acquisition_date: '2026-02-01',
      status: 'active',
      notes: 'Parent stock for hatching eggs',
      created_by: userId,
    },
    {
      name: 'Duck Flock 2026',
      breed: 'Pekin',
      bird_type: 'duck',
      initial_quantity: 120,
      current_quantity: 115,
      acquisition_date: '2026-04-10',
      status: 'active',
      notes: 'Ducks for meat production',
      created_by: userId,
    },
  ]
  
  const { data: createdFlocks, error: flocksError } = await supabase
    .from('flocks')
    .insert(flocksData)
    .select()
  
  if (flocksError) {
    console.error('❌ Error creating flocks:', flocksError)
    return
  }
  
  console.log('✅ Created', createdFlocks?.length, 'flocks')
  
  const broilerFlock = createdFlocks?.find(f => f.bird_type === 'broiler')
  const layerFlock = createdFlocks?.find(f => f.bird_type === 'layer')
  const turkeyFlock = createdFlocks?.find(f => f.bird_type === 'turkey')
  const breederFlock = createdFlocks?.find(f => f.bird_type === 'breeder')
  const duckFlock = createdFlocks?.find(f => f.bird_type === 'duck')
  
  // Create feed logs (last 30 days)
  console.log('🌾 Creating feed logs...')
  const feedLogs = []
  const feedTypes = ['Starter Mash', 'Grower Feed', 'Finisher Feed', 'Layer Mash', 'Broiler Finisher']
  
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    if (broilerFlock) {
      feedLogs.push({
        flock_id: broilerFlock.id,
        log_date: dateStr,
        feed_type: i < 14 ? 'Starter Mash' : 'Finisher Feed',
        quantity_kg: 25 + Math.floor(Math.random() * 10),
        cost_per_kg: 450,
        supplier: 'Farm Feeds Ltd',
        logged_by: userId,
      })
    }
    
    if (layerFlock) {
      feedLogs.push({
        flock_id: layerFlock.id,
        log_date: dateStr,
        feed_type: 'Layer Mash',
        quantity_kg: 20 + Math.floor(Math.random() * 8),
        cost_per_kg: 420,
        supplier: 'AgriFeed Nigeria',
        logged_by: userId,
      })
    }
    
    if (turkeyFlock && i % 2 === 0) {
      feedLogs.push({
        flock_id: turkeyFlock.id,
        log_date: dateStr,
        feed_type: 'Grower Feed',
        quantity_kg: 12 + Math.floor(Math.random() * 5),
        cost_per_kg: 500,
        supplier: 'Farm Feeds Ltd',
        logged_by: userId,
      })
    }
  }
  
  const { error: feedError } = await supabase.from('feed_logs').insert(feedLogs)
  if (feedError) console.error('Error creating feed logs:', feedError)
  else console.log('✅ Created', feedLogs.length, 'feed log entries')
  
  // Create egg production (last 30 days)
  console.log('🥚 Creating egg production records...')
  const eggLogs = []
  
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    if (layerFlock) {
      const totalEggs = 240 + Math.floor(Math.random() * 40)
      const brokenEggs = Math.floor(Math.random() * 8)
      eggLogs.push({
        flock_id: layerFlock.id,
        log_date: dateStr,
        total_eggs: totalEggs,
        broken_eggs: brokenEggs,
        logged_by: userId,
      })
    }
    
    if (breederFlock && i % 3 === 0) {
      const totalEggs = 80 + Math.floor(Math.random() * 20)
      const brokenEggs = Math.floor(Math.random() * 3)
      eggLogs.push({
        flock_id: breederFlock.id,
        log_date: dateStr,
        total_eggs: totalEggs,
        broken_eggs: brokenEggs,
        logged_by: userId,
      })
    }
  }
  
  const { error: eggError } = await supabase.from('egg_production').insert(eggLogs)
  if (eggError) console.error('Error creating egg logs:', eggError)
  else console.log('✅ Created', eggLogs.length, 'egg production entries')
  
  // Create health records
  console.log('💉 Creating health records...')
  const healthRecords = [
    {
      flock_id: broilerFlock?.id,
      record_date: '2026-06-05',
      record_type: 'vaccination',
      description: 'Newcastle Disease vaccination',
      medication: 'LaSota Vaccine',
      dosage: '2 drops per bird',
      vet_name: 'Dr. Adewale',
      cost: 15000,
      follow_up_date: '2026-06-19',
      notes: 'Routine vaccination completed',
      logged_by: userId,
    },
    {
      flock_id: layerFlock?.id,
      record_date: '2026-06-10',
      record_type: 'treatment',
      description: 'Respiratory infection treatment',
      medication: 'Tylodox',
      dosage: '1g per liter of water',
      vet_name: 'Dr. Fatima',
      cost: 25000,
      follow_up_date: '2026-06-17',
      notes: 'Birds showed signs of cough and nasal discharge',
      logged_by: userId,
    },
    {
      flock_id: layerFlock?.id,
      record_date: '2026-06-15',
      record_type: 'checkup',
      description: 'Monthly health inspection',
      medication: null,
      dosage: null,
      vet_name: 'Dr. Adewale',
      cost: 10000,
      follow_up_date: '2026-07-15',
      notes: 'Overall flock health is good, production is optimal',
      logged_by: userId,
    },
    {
      flock_id: turkeyFlock?.id,
      record_date: '2026-06-12',
      record_type: 'deworming',
      description: 'Routine deworming',
      medication: 'Albendazole',
      dosage: '5mg per kg body weight',
      vet_name: null,
      cost: 8000,
      follow_up_date: null,
      notes: 'Deworming done as part of preventive health program',
      logged_by: userId,
    },
    {
      flock_id: breederFlock?.id,
      record_date: '2026-06-08',
      record_type: 'vaccination',
      description: 'Infectious Bronchitis vaccination',
      medication: 'IB H120',
      dosage: '1 drop per bird',
      vet_name: 'Dr. Fatima',
      cost: 18000,
      follow_up_date: '2026-06-22',
      notes: 'Critical for breeder flock health',
      logged_by: userId,
    },
  ]
  
  const { error: healthError } = await supabase.from('health_records').insert(healthRecords)
  if (healthError) console.error('Error creating health records:', healthError)
  else console.log('✅ Created', healthRecords.length, 'health records')
  
  // Create mortality logs (last 30 days)
  console.log('⚰️ Creating mortality logs...')
  const mortalityLogs = []
  
  for (let i = 0; i < 15; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    if (broilerFlock) {
      mortalityLogs.push({
        flock_id: broilerFlock.id,
        log_date: dateStr,
        quantity: Math.floor(Math.random() * 4) + 1,
        cause: Math.random() > 0.5 ? 'Disease' : 'Heat stress',
        notes: 'Reported during morning count',
        logged_by: userId,
      })
    }
    
    if (layerFlock && i % 3 === 0) {
      mortalityLogs.push({
        flock_id: layerFlock.id,
        log_date: dateStr,
        quantity: Math.floor(Math.random() * 2) + 1,
        cause: 'Natural causes',
        notes: null,
        logged_by: userId,
      })
    }
  }
  
  const { error: mortalityError } = await supabase.from('mortality_logs').insert(mortalityLogs)
  if (mortalityError) console.error('Error creating mortality logs:', mortalityError)
  else console.log('✅ Created', mortalityLogs.length, 'mortality entries')
  
  // Create expenses (last 60 days)
  console.log('💰 Creating expenses...')
  const expenses = [
    {
      expense_date: '2026-06-28',
      category: 'feed',
      description: 'Broiler Finisher Feed - 50 bags',
      amount: 225000,
      vendor: 'Farm Feeds Ltd',
      flock_id: broilerFlock?.id,
      notes: 'Monthly feed purchase',
      created_by: userId,
    },
    {
      expense_date: '2026-06-25',
      category: 'medication',
      description: 'Antibiotics and vitamins',
      amount: 45000,
      vendor: 'VetPharm Nigeria',
      flock_id: layerFlock?.id,
      notes: 'Treatment for respiratory infection',
      created_by: userId,
    },
    {
      expense_date: '2026-06-20',
      category: 'labor',
      description: 'Farm workers salary - June',
      amount: 120000,
      vendor: null,
      flock_id: null,
      notes: 'Monthly salary for 3 workers',
      created_by: userId,
    },
    {
      expense_date: '2026-06-15',
      category: 'utilities',
      description: 'Electricity bill',
      amount: 35000,
      vendor: 'Ikeja Electric',
      flock_id: null,
      notes: 'Monthly electricity',
      created_by: userId,
    },
    {
      expense_date: '2026-06-10',
      category: 'equipment',
      description: 'Feeding troughs replacement',
      amount: 28000,
      vendor: 'Farm Equipment Store',
      flock_id: broilerFlock?.id,
      notes: 'Replaced worn out troughs',
      created_by: userId,
    },
    {
      expense_date: '2026-06-05',
      category: 'maintenance',
      description: 'Poultry house repairs',
      amount: 55000,
      vendor: 'Ibrahim Construction',
      flock_id: null,
      notes: 'Roof repairs after wind damage',
      created_by: userId,
    },
    {
      expense_date: '2026-05-28',
      category: 'feed',
      description: 'Layer Mash - 30 bags',
      amount: 126000,
      vendor: 'AgriFeed Nigeria',
      flock_id: layerFlock?.id,
      notes: null,
      created_by: userId,
    },
    {
      expense_date: '2026-05-20',
      category: 'transport',
      description: 'Feed delivery logistics',
      amount: 15000,
      vendor: 'Logistics Co',
      flock_id: null,
      notes: 'Delivery to farm',
      created_by: userId,
    },
  ]
  
  const { error: expensesError } = await supabase.from('expenses').insert(expenses)
  if (expensesError) console.error('Error creating expenses:', expensesError)
  else console.log('✅ Created', expenses.length, 'expense entries')
  
  // Create sales (last 60 days)
  console.log('🛒 Creating sales...')
  const sales = [
    {
      flock_id: broilerFlock?.id,
      sale_date: '2026-06-27',
      item_type: 'birds',
      quantity: 50,
      unit: 'pieces',
      unit_price: 4500,
      buyer_name: 'Alhaja Meat Market',
      buyer_contact: '08031234567',
      payment_status: 'paid',
      notes: 'First batch of broilers sold',
      created_by: userId,
    },
    {
      flock_id: layerFlock?.id,
      sale_date: '2026-06-25',
      item_type: 'eggs',
      quantity: 20,
      unit: 'crates',
      unit_price: 3500,
      buyer_name: 'Lagos Egg Distributors',
      buyer_contact: '08039876543',
      payment_status: 'paid',
      notes: 'Weekly egg supply',
      created_by: userId,
    },
    {
      flock_id: layerFlock?.id,
      sale_date: '2026-06-20',
      item_type: 'eggs',
      quantity: 15,
      unit: 'crates',
      unit_price: 3500,
      buyer_name: 'Bakery Central',
      buyer_contact: '08034567890',
      payment_status: 'pending',
      notes: 'Monthly order',
      created_by: userId,
    },
    {
      flock_id: turkeyFlock?.id,
      sale_date: '2026-06-15',
      item_type: 'birds',
      quantity: 10,
      unit: 'pieces',
      unit_price: 12000,
      buyer_name: 'Hotel Exclusive',
      buyer_contact: '08032323232',
      payment_status: 'paid',
      notes: null,
      created_by: userId,
    },
    {
      flock_id: null,
      sale_date: '2026-06-10',
      item_type: 'other',
      quantity: 100,
      unit: 'kg',
      unit_price: 800,
      buyer_name: 'Feed Mill旁市场',
      buyer_contact: null,
      payment_status: 'partial',
      notes: 'Eggs rejected from breaker',
      created_by: userId,
    },
    {
      flock_id: broilerFlock?.id,
      sale_date: '2026-05-28',
      item_type: 'birds',
      quantity: 75,
      unit: 'pieces',
      unit_price: 4200,
      buyer_name: 'Alhaja Meat Market',
      buyer_contact: '08031234567',
      payment_status: 'paid',
      notes: null,
      created_by: userId,
    },
    {
      flock_id: layerFlock?.id,
      sale_date: '2026-05-20',
      item_type: 'eggs',
      quantity: 25,
      unit: 'crates',
      unit_price: 3400,
      buyer_name: 'Lagos Egg Distributors',
      buyer_contact: '08039876543',
      payment_status: 'paid',
      notes: null,
      created_by: userId,
    },
  ]
  
  const { error: salesError } = await supabase.from('sales').insert(sales)
  if (salesError) console.error('Error creating sales:', salesError)
  else console.log('✅ Created', sales.length, 'sale entries')
  
  console.log('')
  console.log('🎉 Database seeding completed!')
  console.log('')
  console.log('Summary:')
  console.log('  - 5 Flocks created')
  console.log('  - ~60 Feed log entries (30 days)')
  console.log('  - ~45 Egg production entries (30 days)')
  console.log('  - 5 Health records')
  console.log('  - ~15 Mortality entries')
  console.log('  - 8 Expense entries')
  console.log('  - 7 Sale entries')
  console.log('')
  console.log('Database is ready for use! 🚀')
}

seed().catch(console.error)