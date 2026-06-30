'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Bird } from 'lucide-react'
import type { Profile } from '@/lib/types'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Bird as BirdIcon, Wheat, Egg, HeartPulse,
  AlertTriangle, ShoppingCart, Receipt, Users, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface MobileSidebarProps {
  profile: Profile
  open: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  { section: 'OVERVIEW', items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] },
  { section: 'FARM OPERATIONS', items: [
    { label: 'Flocks', href: '/flocks', icon: BirdIcon },
    { label: 'Feed Logs', href: '/feed', icon: Wheat },
    { label: 'Egg Production', href: '/eggs', icon: Egg },
    { label: 'Health Records', href: '/health', icon: HeartPulse },
    { label: 'Mortality Logs', href: '/mortality', icon: AlertTriangle },
  ]},
  { section: 'FINANCE', items: [
    { label: 'Sales', href: '/sales', icon: ShoppingCart },
    { label: 'Expenses', href: '/expenses', icon: Receipt },
  ]},
]

function MobileNav({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const allNav = profile.role === 'admin'
    ? [...NAV_ITEMS, { section: 'ADMIN', items: [{ label: 'User Management', href: '/users', icon: Users }] }]
    : NAV_ITEMS

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
  }

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white">
          <BirdIcon className="h-5 w-5" />
        </div>
        <p className="text-sm font-bold text-foreground">PoultryTrack</p>
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
                    <Link href={item.href} onClick={onClose}
                      className={cn(
                        'nav-item flex items-center gap-3 px-3 py-2.5 text-sm font-medium',
                        isActive ? 'active text-white' : 'text-muted-foreground'
                      )}>
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
      <div className="border-t border-border/50 px-3 py-3">
        <button onClick={handleSignOut}
          className="nav-item flex w-full items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  )
}

export function MobileSidebar({ profile, open, onClose }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="w-64 p-0 bg-card border-r border-border/50">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <MobileNav profile={profile} onClose={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  )
}