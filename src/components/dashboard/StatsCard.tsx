import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  iconBg: string
  description?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  description,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5',
        'shadow-[0_4px_24px_-8px_hsl(0_0%_0%/0.08)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-8px_hsl(0_0%_0%/0.12)]',
        className
      )}
    >
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
        <Icon className={cn('h-5 w-5', iconColor)} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-2xl font-bold leading-tight tracking-tight text-foreground">
          {value}
        </p>
        {description && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}