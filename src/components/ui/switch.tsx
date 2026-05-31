"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Sizes are stepped below Button defaults on purpose: `default` ≈ Button `sm`, `lg` ≈ Button default.
 * `sm` is extra-compact for dense rows. Thumb + translate are paired per size.
 */
const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  {
    variants: {
      size: {
        // Compact — smaller than previous `sm` (dense lists, tables)
        sm: "h-5 w-9",
        // Previous `sm`: aligns with Button `sm` (h-6)
        default: "h-6 w-11",
        // Previous `default`: aligns with Button default (h-7)
        lg: "h-7 w-[52px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block shrink-0 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.22),0_0_1px_rgba(0,0,0,0.12)] ring-0 transition-transform duration-200 ease-out dark:bg-white",
  {
    variants: {
      size: {
        // Inner 32×16; thumb 16×12; 2px insets → travel 12px
        sm: "h-3 min-w-4 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[14px]",
        // Inner 40×20; thumb 20×16; travel 16px
        default:
          "h-4 min-w-5 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[18px]",
        // Inner 48×24; thumb 24×20; travel 20px
        lg: "h-5 min-w-6 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[22px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ size }), className)}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb className={switchThumbVariants({ size })} />
    </SwitchPrimitives.Root>
  )
)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch, switchVariants, switchThumbVariants }
