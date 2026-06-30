'use client'

import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileSidebar } from './MobileSidebar'
import { useState } from 'react'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  profile: Profile
}

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/flocks': 'Flocks',
  '/feed': 'Feed Logs',
  '/eggs': 'Egg Production',
  '/health': 'Health Records',
  '/mortality': 'Mortality Logs',
  '/sales': 'Sales',
  '/expenses': 'Expenses',
  '/users': 'User Management',
}

function getTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname]
  const prefix = Object.keys(TITLES).find(k => k !== '/dashboard' && pathname.startsWith(k))
  return prefix ? TITLES[prefix] : 'PoultryTrack'
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="flex items-center gap-4 border-b border-border/50 px-5 py-3.5">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="rounded-full border border-border/60 px-2.5 py-0.5 font-medium uppercase tracking-wider">
              PoultryTrack
            </span>
            <span>·</span>
            <span className="font-semibold uppercase tracking-wider">Farm Management Workspace</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4.5 w-4.5" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
            {getInitials(profile.full_name)}
          </div>
        </div>
      </header>

      <div className="border-b border-border/40 px-5 py-3">
        <h1 className="text-xl font-bold text-foreground">{getTitle(pathname)}</h1>
      </div>

      <MobileSidebar profile={profile} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}