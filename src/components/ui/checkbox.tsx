"use client"

import {
  IconCheck,
} from "@/components/icons"
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Checkbox as RadixCheckbox } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { useId } from "react"

import { cn, gapStyle } from "@/lib/utils"

const checkboxVariants = cva("", {
  variants: {
    variant: {
      square: "",
      round: "",
    },
  },
  defaultVariants: {
    variant: "square",
  },
})

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { children?: React.ReactNode; gap?: number | string }
>(({ className, children, id, gap = 3, ...props }, ref) => {
  const stableId = useId()
  const inputId = id || stableId
  const gapIsNumber = typeof gap === "number"
  const labelGapStyle = gapStyle(gap)

  const checkboxElement = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={inputId}
      className={cn(
        "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("grid place-content-center text-current")}>
        <IconCheck size={16} className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!children) return checkboxElement

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-center cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        !gapIsNumber && gap
      )}
      style={labelGapStyle}
    >
      {checkboxElement}
      {children}
    </label>
  )
})

export interface EnhancedCheckboxProps
  extends React.ComponentProps<typeof RadixCheckbox.Root>,
    VariantProps<typeof checkboxVariants> {
  children?: React.ReactNode
  gap?: number | string
}

const EnhancedCheckbox = React.forwardRef<
  React.ElementRef<typeof RadixCheckbox.Root>,
  EnhancedCheckboxProps
>(({ className, variant = "square", children, disabled, gap = 3, id, ...props }, ref) => {
  const stableId = useId()
  const inputId = id ?? stableId
  const controlClass = cn(
    "hit-area-2",
    variant === "round" ? "checkbox-round-input" : "checkbox-animated-input",
    className,
  )

  const checkboxEl = (
    <RadixCheckbox.Root
      ref={ref}
      id={inputId}
      data-slot="checkbox"
      className={controlClass}
      disabled={disabled}
      {...props}
    >
      <RadixCheckbox.Indicator data-slot="checkbox-indicator" className="grid place-content-center text-current" />
    </RadixCheckbox.Root>
  )

  if (!children) return checkboxEl

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "checkbox-animated-label",
        "flex items-center",
        typeof gap !== "number" && gap,
        "cursor-pointer",
        "relative",
        disabled && "cursor-not-allowed opacity-50"
      )}
      style={typeof gap === "number" ? { gap: `${gap * 0.25}rem` } : undefined}
      data-disabled={disabled ? "true" : undefined}
    >
      {checkboxEl}
      <span className="checkbox-animated-text text-foreground">{children}</span>
    </label>
  )
})

Checkbox.displayName = CheckboxPrimitive.Root.displayName
EnhancedCheckbox.displayName = "EnhancedCheckbox"

export { Checkbox, EnhancedCheckbox, checkboxVariants }
export { Checkbox as CoreCheckbox }
export type { EnhancedCheckboxProps as CheckboxProps }
