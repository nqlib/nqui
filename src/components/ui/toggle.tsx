"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { wrapInlineLabelTextNodes } from "@/lib/wrap-inline-label-text"

const toggleVariants = cva(
  "hit-area-2 hover:text-foreground gap-1 rounded-md text-xs font-medium data-[state=on]:font-bold transition-[color,background-color,border-color,box-shadow] [&_svg:not([class*='size-'])]:size-3.5 group/toggle inline-flex min-w-0 max-w-full items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive dark:aria-invalid:border-destructive/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:data-[state=on]:bg-none active:data-[state=on]:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)]",
  {
    variants: {
      variant: {
        default: [
          /* Aligned with ButtonGroup shell: border-input + bg-background; on = secondary. */
          "border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:border-border",
        ],
        outline: [
          "border border-input bg-transparent",
          "hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:border-border",
        ],
        segmented: [
          /* Flush pill with outline groups: fill only, no inner border (see ToggleGroupItem !border-0). */
          "border-0 bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground data-[state=on]:shadow-none data-[state=on]:hover:bg-secondary/90",
        ],
      },
      size: {
        default: "h-7 min-w-7 px-2",
        sm: "h-6 min-w-6 rounded-[min(var(--radius-md),8px)] px-1.5 text-[0.625rem] [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 min-w-8 px-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    >
      {wrapInlineLabelTextNodes(children)}
    </TogglePrimitive.Root>
  )
}

export { Toggle, toggleVariants }
