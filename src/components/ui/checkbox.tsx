"use client"

import {
  IconCheck,
} from "@/components/icons"
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Checkbox as RadixCheckbox } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { useId } from "react"

import { cn } from "@/lib/utils"

const checkboxStyles = `
  .checkbox-animated-label {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  .checkbox-animated-label::before {
    position: absolute;
    content: "";
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 45px;
    z-index: -1;
    /* Was cubic-bezier(0.68, -0.55, 0.265, 1.55) — elastic/overshoot curve,
     * banned per MOTION.md. Replaced with standard ease-out. */
    transition: all var(--duration-standard) var(--ease-out);
    border-radius: 10px;
    border: 1px solid transparent;
    background-color: transparent;
  }

  .checkbox-animated-label:hover::before {
    transition: all 0.2s ease;
    background-color: var(--muted);
  }

  .checkbox-animated-label:has([data-state="checked"])::before {
    background-color: var(--card);
    border-color: var(--primary);
    height: 50px;
  }

  .checkbox-animated-label:has([data-disabled])::before {
    opacity: 0.5;
  }

  .checkbox-animated-input {
    appearance: none;
    -webkit-appearance: none;
    width: 17px;
    height: 17px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--card);
    border: 1px solid color-mix(in oklch, var(--foreground) 50%, var(--border));
    position: relative;
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    transition: all 0.2s ease;
  }

  .checkbox-animated-input:hover:not([data-state="checked"]):not([data-disabled]) {
    border-color: color-mix(in oklch, var(--foreground) 70%, var(--border));
  }

  .checkbox-animated-input[data-state="checked"] {
    background-color: var(--primary);
    border-color: var(--primary);
    animation: checkbox-pulse 0.7s forwards;
  }

  .checkbox-animated-input[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Checkmark uses ::after so ::before stays free for hit-area-* on the same root */
  .checkbox-animated-input::after {
    content: "";
    width: 5px;
    height: 8px;
    border: 1.5px solid var(--primary-foreground);
    border-top: none;
    border-left: none;
    transform: rotate(45deg) scale(0);
    transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
    position: absolute;
    margin-top: -2px;
    z-index: var(--z-content);
  }

  .checkbox-animated-input[data-state="checked"]::after {
    transform: rotate(45deg) scale(1);
  }

  .checkbox-animated-input:focus-visible,
  .checkbox-round-input:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--ring) 30%, transparent);
  }

  @keyframes checkbox-pulse {
    0% {
      box-shadow: 0 0 0 0 color-mix(in oklch, var(--ring) 35%, transparent);
    }
    70% {
      box-shadow: 0 0 0 8px color-mix(in oklch, var(--ring) 0%, transparent);
    }
    100% {
      box-shadow: 0 0 0 0 color-mix(in oklch, var(--ring) 0%, transparent);
    }
  }

  .checkbox-animated-text {
    color: var(--foreground);
    user-select: none;
  }

  .checkbox-round-input {
    appearance: none;
    -webkit-appearance: none;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--card);
    border: 1px solid color-mix(in oklch, var(--foreground) 50%, var(--border));
    position: relative;
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    transition: all 0.2s ease;
  }

  .checkbox-round-input:hover:not([data-state="checked"]):not([data-disabled]) {
    border-color: color-mix(in oklch, var(--foreground) 70%, var(--border));
  }

  .checkbox-round-input[data-state="checked"] {
    background-color: var(--primary);
    border-color: var(--primary);
    animation: checkbox-pulse 0.7s forwards;
  }

  .checkbox-round-input[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox-round-input::after {
    content: "";
    width: 5px;
    height: 8px;
    border: 1.5px solid var(--primary-foreground);
    border-top: none;
    border-left: none;
    transform: rotate(45deg) scale(0);
    transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
    position: absolute;
    margin-top: -2px;
    z-index: var(--z-content);
  }

  .checkbox-round-input[data-state="checked"]::after {
    transform: rotate(45deg) scale(1);
  }
`

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
  const gapClass = typeof gap === "number" ? `gap-${gap}` : gap

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
        gapClass
      )}
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

  if (!children) {
    return (
      <>
        <style>{checkboxStyles}</style>
        {checkboxEl}
      </>
    )
  }

  return (
    <>
      <style>{checkboxStyles}</style>
      <label
        htmlFor={inputId}
        className={cn(
          "checkbox-animated-label",
          typeof gap === "number" ? `flex items-center gap-${gap}` : `flex items-center ${gap}`,
          "cursor-pointer",
          "relative",
          disabled && "cursor-not-allowed opacity-50"
        )}
        data-disabled={disabled ? "true" : undefined}
      >
        {checkboxEl}
        <span className="checkbox-animated-text text-foreground">{children}</span>
      </label>
    </>
  )
})

Checkbox.displayName = CheckboxPrimitive.Root.displayName
EnhancedCheckbox.displayName = "EnhancedCheckbox"

export { Checkbox, EnhancedCheckbox, checkboxVariants }
export { Checkbox as CoreCheckbox }
export type { EnhancedCheckboxProps as CheckboxProps }
