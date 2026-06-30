'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Bird, Wheat, Egg, HeartPulse,
  AlertTriangle, ShoppingCart, Receipt, Users, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

interface SidebarProps {
  profile: Profile
}

const NAV = [
  {
    section: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'FARM OPERATIONS',
    items: [
      { label: 'Flocks', href: '/flocks', icon: Bird },
      { label: 'Feed Logs', href: '/feed', icon: Wheat },
      { label: 'Egg Production', href: '/eggs', icon: Egg },
      { label: 'Health Records', href: '/health', icon: HeartPulse },
      { label: 'Mortality Logs', href: '/mortality', icon: AlertTriangle },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      { label: 'Sales', href: '/sales', icon: ShoppingCart },
      { label: 'Expenses', href: '/expenses', icon: Receipt },
    ],
  },
]

const ADMIN_NAV = {
  section: 'ADMIN',
  items: [
    { label: 'User Management', href: '/users', icon: Users },
  ],
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const allNav = profile.role === 'admin' ? [...NAV, ADMIN_NAV] : NAV

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
  }

  return (
    <aside className="sidebar-clay hidden w-64 shrink-0 flex-col rounded-[calc(var(--radius)*1.8)] lg:flex">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm">
          <Bird className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">PoultryTrack</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Farm Management</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {allNav.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'nav-item flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'active text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/50 px-3 py-3 space-y-1">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-muted/40">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
            {getInitials(profile.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{profile.full_name}</p>
            <span className={cn(
              'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              profile.role === 'admin'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            )}>
              {profile.role === 'admin' ? 'Admin' : 'Farm Worker'}
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="nav-item flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}