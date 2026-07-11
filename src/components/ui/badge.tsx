import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Slot as RadixSlot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { wrapInlineLabelTextNodes } from "@/lib/wrap-inline-label-text"

const coreBadgeVariants = cva(
  "h-5 gap-1 rounded-full border border-transparent px-2 py-0.5 text-[0.625rem] font-medium has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-2.5! inline-flex min-w-0 max-w-full items-center justify-center w-fit whitespace-nowrap [&>svg]:pointer-events-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive text-destructive dark:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-input/20 dark:bg-input/30",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof coreBadgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(coreBadgeVariants({ variant }), className)}
      {...props}
    >
      {asChild ? children : wrapInlineLabelTextNodes(children)}
    </Comp>
  )
}

export interface EnhancedBadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof enhancedBadgeVariants> {
  asChild?: boolean
}

const enhancedBadgeVariants = cva(
  "h-5 gap-1 rounded-full border px-2 py-0.5 text-[0.625rem] font-medium inline-flex min-w-0 max-w-full items-center justify-center w-fit whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-in-out)] [&>svg]:size-2.5 [&>svg]:pointer-events-none has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground border border-primary",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-primary/90 hover:border-primary/90",
          "focus:bg-primary/80 focus:border-primary/80",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground border border-destructive",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-destructive/90 hover:border-destructive/90",
          "focus:bg-destructive/80 focus:border-destructive/80",
          "focus-visible:ring-destructive",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground border border-border",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-secondary/90 hover:border-border",
          "focus:bg-secondary/80 focus:border-border",
        ],
        success: [
          "bg-success text-success-foreground border border-success",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-success/90 hover:border-success/90",
          "focus:bg-success/80 focus:border-success/80",
        ],
        warning: [
          "bg-warning text-warning-foreground border border-warning",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-warning/90 hover:border-warning/90",
          "focus:bg-warning/80 focus:border-warning/80",
        ],
        info: [
          "bg-info text-info-foreground border border-info",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-info/90 hover:border-info/90",
          "focus:bg-info/80 focus:border-info/80",
        ],
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-input/20 dark:bg-input/30",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const EnhancedBadge = React.forwardRef<HTMLSpanElement, EnhancedBadgeProps>(
  ({ className, variant, asChild = false, children, ...props }, ref) => {
    const enhancedVariants = ["default", "destructive", "secondary", "success", "warning", "info"]
    const isEnhanced = variant && enhancedVariants.includes(variant)

    if (!isEnhanced && variant) {
      const coreVariant: "default" | "destructive" | "outline" | "secondary" =
        variant === "outline"
          ? "outline"
          : variant === "ghost" || variant === "link"
            ? "outline"
            : variant === "destructive"
              ? "destructive"
              : variant === "secondary"
                ? "secondary"
                : "default"
      return (
        <Badge variant={coreVariant} className={className} {...props}>
          {children}
        </Badge>
      )
    }

    const Comp = asChild ? RadixSlot : "span"
    return (
      <Comp
        data-slot="badge"
        data-variant={variant}
        className={cn(enhancedBadgeVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {asChild ? children : wrapInlineLabelTextNodes(children)}
      </Comp>
    )
  }
)

Badge.displayName = "Badge"
EnhancedBadge.displayName = "EnhancedBadge"

export { Badge, coreBadgeVariants, EnhancedBadge, enhancedBadgeVariants }
export { Badge as CoreBadge, enhancedBadgeVariants as badgeVariants }
export type { EnhancedBadgeProps as BadgeProps }
