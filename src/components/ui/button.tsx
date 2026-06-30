import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground shadow-[0_18px_32px_-24px_var(--primary)/0.85] hover:-translate-y-0.5 hover:shadow-[0_22px_38px_-26px_var(--primary)/0.95] active:translate-y-0 active:shadow-[0_10px_20px_-16px_var(--primary)/0.75]",
        outline:
          "border border-border/70 bg-background shadow-[0_16px_30px_-24px_var(--foreground)/0.28] hover:-translate-y-0.5 hover:bg-accent/70 hover:shadow-[0_18px_34px_-24px_var(--foreground)/0.35] active:translate-y-0 active:shadow-[0_10px_20px_-18px_var(--foreground)/0.22] dark:border-border/50 dark:bg-background/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_14px_26px_-22px_var(--foreground)/0.25] hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-24px_var(--foreground)/0.3] active:translate-y-0 active:shadow-[0_10px_18px_-16px_var(--foreground)/0.2]",
        ghost:
          "hover:bg-accent/70 hover:shadow-[0_14px_26px_-22px_var(--foreground)/0.24] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_10px_18px_-16px_var(--foreground)/0.18]",
        destructive:
          "bg-destructive/15 text-destructive shadow-[0_14px_26px_-22px_var(--destructive)/0.35] hover:bg-destructive/20 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-24px_var(--destructive)/0.42] active:translate-y-0 active:shadow-[0_10px_18px_-16px_var(--destructive)/0.25] dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-11 px-5 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-8 rounded-lg px-3 text-xs gap-1.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-xl px-4 text-sm gap-1.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 rounded-xl px-8 text-base gap-2 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        icon: "size-11 rounded-2xl [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-2xl [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 rounded-2xl [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
