'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, Egg, ShieldCheck, Sparkles, Tractor } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type AuthShellProps = {
  title: string
  description: string
  eyebrow: string
  children: ReactNode
  footnote?: ReactNode
}

const features = [
  { icon: Egg, label: 'Egg production' },
  { icon: Tractor, label: 'Farm operations' },
  { icon: BarChart3, label: 'Profit tracking' },
  { icon: ShieldCheck, label: 'Role-based access' },
]

export function AuthShell({ title, description, eyebrow, children, footnote }: AuthShellProps) {
  return (
    <div className="min-h-screen app-shell px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl gap-5 lg:grid-cols-[1.15fr_0.95fr]">
        <aside className="hidden overflow-hidden app-panel-strong lg:flex lg:flex-col">
          <div className="flex h-full flex-col justify-between p-8 xl:p-10">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-3xl border border-primary/15 bg-primary/10 shadow-[0_18px_36px_-24px_hsl(var(--primary)/0.75)]">
                  <Egg className="size-7 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    PoultryTrack
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight">{eyebrow}</h1>
                </div>
              </div>

              <div className="max-w-xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Farm operations, made calm
                </p>
                <h2 className="mt-3 text-5xl font-bold tracking-tight text-foreground xl:text-6xl">
                  {title}
                </h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
                  {description}
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {features.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/75 px-4 py-3 shadow-[0_14px_30px_-24px_hsl(var(--foreground)/0.28)]">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="rounded-[1.35rem] bg-background/75 p-5 shadow-[0_18px_40px_-28px_hsl(var(--foreground)/0.3)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">System status</p>
                    <p className="mt-1 text-lg font-semibold">Ready for the day&apos;s work</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Sparkles className="size-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-600">Live</span>
                  <span>Inventory, feed, and health logs connected</span>
                </div>
              </Card>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Need help getting started?</span>
                <Link href="/register" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                  Create account
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 shadow-[0_14px_28px_-22px_hsl(var(--primary)/0.65)]">
                <Egg className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">PoultryTrack</p>
                <h1 className="text-xl font-bold tracking-tight">{eyebrow}</h1>
              </div>
            </div>
            {children}
            {footnote && <div className="mt-4 lg:hidden">{footnote}</div>}
          </div>
        </main>
      </div>
    </div>
  )
}
