'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Edit, Bird, Calendar, Hash, DollarSign, Egg, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Flock, FeedLog, EggProduction, HealthRecord, MortalityLog } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface FlockDetailClientProps {
  flock: Flock
  profile: { role: string; id: string }
  feedLogs: FeedLog[]
  eggProduction: EggProduction[]
  healthRecords: HealthRecord[]
  mortalityLogs: MortalityLog[]
  stats: {
    totalEggs: number
    totalFeedCost: number
    totalMortality: number
    healthEvents: number
  }
}

export function FlockDetailClient({
  flock,
  profile,
  feedLogs,
  eggProduction,
  healthRecords,
  mortalityLogs,
  stats,
}: FlockDetailClientProps) {
  const router = useRouter()
  const isAdmin = profile.role === 'admin'

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    sold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const birdTypeLabels = {
    broiler: 'Broiler',
    layer: 'Layer',
    breeder: 'Breeder',
    turkey: 'Turkey',
    duck: 'Duck',
    other: 'Other',
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/flocks">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{flock.name}</h1>
          <Badge variant="outline" className={`mt-1 ${statusColors[flock.status]}`}>
            {flock.status}
          </Badge>
        </div>
        {isAdmin && (
          <Button onClick={() => router.push(`/flocks/${flock.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Flock
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bird className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Quantity</p>
              <p className="text-xl font-bold">{flock.current_quantity}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Egg className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Eggs Produced</p>
              <p className="text-xl font-bold">{stats.totalEggs.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Feed Cost</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalFeedCost)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Mortality</p>
              <p className="text-xl font-bold">{stats.totalMortality}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <h3 className="font-semibold mb-4">Flock Information</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Bird Type</p>
            <p className="font-medium capitalize">{birdTypeLabels[flock.bird_type]}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Breed</p>
            <p className="font-medium">{flock.breed || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Acquisition Date</p>
            <p className="font-medium">{formatDate(flock.acquisition_date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Initial Quantity</p>
            <p className="font-medium">{flock.initial_quantity}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Health Events</p>
            <p className="font-medium">{stats.healthEvents}</p>
          </div>
          {flock.notes && (
            <div className="md:col-span-3">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{flock.notes}</p>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList>
          <TabsTrigger value="feed">Feed Logs</TabsTrigger>
          <TabsTrigger value="eggs">Egg Production</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="mortality">Mortality</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4">
          <div className="bg-card rounded-lg border">
            {feedLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Feed Type</TableHead>
                      <TableHead>Quantity (kg)</TableHead>
                      <TableHead>Cost/kg</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Supplier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.log_date)}</TableCell>
                        <TableCell>{log.feed_type}</TableCell>
                        <TableCell>{log.quantity_kg}</TableCell>
                        <TableCell>{formatCurrency(log.cost_per_kg)}</TableCell>
                        <TableCell>{formatCurrency(log.total_cost)}</TableCell>
                        <TableCell>{log.supplier || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No feed logs recorded</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="eggs" className="mt-4">
          <div className="bg-card rounded-lg border">
            {eggProduction.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Eggs</TableHead>
                      <TableHead>Broken</TableHead>
                      <TableHead>Good</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eggProduction.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.log_date)}</TableCell>
                        <TableCell>{record.total_eggs}</TableCell>
                        <TableCell className={record.broken_eggs > 0 ? 'text-red-600' : ''}>
                          {record.broken_eggs}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {record.good_eggs}
                        </TableCell>
                        <TableCell>{record.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No egg production recorded</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <div className="bg-card rounded-lg border">
            {healthRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Follow-up</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.record_date)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              record.record_type === 'vaccination' ? 'bg-green-100 text-green-700' :
                              record.record_type === 'disease' ? 'bg-red-100 text-red-700' :
                              record.record_type === 'treatment' ? 'bg-orange-100 text-orange-700' :
                              record.record_type === 'deworming' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                            }
                          >
                            {record.record_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>{record.medication || '-'}</TableCell>
                        <TableCell>{formatCurrency(record.cost)}</TableCell>
                        <TableCell>{record.follow_up_date ? formatDate(record.follow_up_date) : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No health records</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mortality" className="mt-4">
          <div className="bg-card rounded-lg border">
            {mortalityLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Cause</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mortalityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.log_date)}</TableCell>
                        <TableCell className="text-red-600 font-medium">{log.quantity}</TableCell>
                        <TableCell>{log.cause || '-'}</TableCell>
                        <TableCell>{log.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No mortality logs recorded</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}