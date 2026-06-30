import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[1.35rem] border border-border/60 bg-gradient-to-r from-background via-background to-primary/5 px-4 py-4 shadow-[0_18px_40px_-28px_hsl(var(--foreground)/0.28)] backdrop-blur-sm md:flex-row md:items-end md:justify-between md:px-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Section</p>
        <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          className="w-full md:mt-0 md:w-auto"
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  )
}
