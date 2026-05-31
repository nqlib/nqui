"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

export type SeparatorVariant =
  | "default"
  | "solid"
  | "shadow-outset"
  | "shadow-inset"
  | "dotted"
  | "dashed"
  | "glow"
  | "thick"
  | "gradient"
  | "double"
  | "fade-strong"
  | "arrow-down"
  | "tab-down"
  | "stopper"
  | "dot"
  | "text-decoration"
  | "shiny-corner"
  | "shiny-edge"

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /**
   * Visual style variant.
   * - Basic: default (fade at ends), solid
   * - Shadow: shadow-outset, shadow-inset
   * - Line styles: dotted, dashed, double
   * - Effects: glow, gradient, fade-strong
   * - Decorative: arrow-down, tab-down, stopper, dot, text-decoration, shiny-corner, shiny-edge
   * @default "default"
   */
  variant?: SeparatorVariant
  /**
   * Text content for text-decoration variant.
   */
  textContent?: string
}

/**
 * Separator - Horizontal or vertical divider with multiple visual variants.
 *
 * - Basic: default (fade at ends), solid
 * - Shadow: shadow-outset, shadow-inset
 * - Line styles: dotted, dashed, double
 * - Effects: glow, gradient, fade-strong
 * - Decorative: arrow-down, tab-down, stopper, dot, text-decoration, shiny-corner, shiny-edge
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator variant="shadow-outset" />
 * <Separator variant="text-decoration" textContent="OR" />
 * ```
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      variant = "default",
      textContent,
      ...props
    },
    ref
  ) => {
    const isDecorative =
      variant === "arrow-down" ||
      variant === "tab-down" ||
      variant === "stopper" ||
      variant === "dot" ||
      variant === "text-decoration" ||
      variant === "shiny-corner" ||
      variant === "shiny-edge"

    const baseClasses = cn(
      "shrink-0 relative",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
    )

    const variantClasses = React.useMemo(() => {
      if (isDecorative) {
        if (variant === "text-decoration") return "separator-text-decoration"
        if (variant === "shiny-corner")
          return cn(
            "separator-shiny-corner",
            orientation === "vertical" && "w-[2px] h-full"
          )
        if (variant === "shiny-edge")
          return cn(
            "separator-shiny-edge",
            orientation === "vertical" && "w-[1px] h-full"
          )
        return cn(
          "bg-transparent",
          "separator-transparent",
          variant === "arrow-down" && "separator-arrow-down",
          variant === "tab-down" && "separator-tab-down",
          variant === "stopper" && "separator-stopper",
          variant === "dot" && "separator-dot"
        )
      }

      switch (variant) {
        case "default":
          return cn(
            "bg-border",
            orientation === "horizontal"
              ? "bg-gradient-to-r from-transparent via-border to-transparent"
              : "bg-gradient-to-b from-transparent via-border to-transparent"
          )
        case "solid":
          return "bg-border"
        case "shadow-outset":
          return cn(
            "bg-border",
            "shadow-[0_1px_3px_color-mix(in_oklch,var(--foreground)_8%,transparent)]"
          )
        case "shadow-inset":
          return cn(
            "bg-border",
            orientation === "horizontal"
              ? "shadow-[inset_0_1px_2px_color-mix(in_oklch,var(--foreground)_10%,transparent)]"
              : "shadow-[inset_1px_0_2px_color-mix(in_oklch,var(--foreground)_10%,transparent)]"
          )
        case "dotted":
          return cn(
            "bg-transparent border-0",
            orientation === "horizontal"
              ? "border-t border-dotted border-border"
              : "border-l border-dotted border-border"
          )
        case "dashed":
          return cn(
            "bg-transparent border-0",
            orientation === "horizontal"
              ? "border-t border-dashed border-border"
              : "border-l border-dashed border-border"
          )
        case "glow":
          return cn(
            "bg-border",
            "shadow-[0_0_8px_color-mix(in_oklch,var(--primary)_20%,transparent)]"
          )
        case "thick":
          return cn(
            "bg-border",
            orientation === "horizontal" ? "h-[2px]" : "w-[2px]"
          )
        case "gradient":
          return cn(
            orientation === "horizontal"
              ? "bg-gradient-to-r from-primary via-accent to-primary"
              : "bg-gradient-to-b from-primary via-accent to-primary"
          )
        case "double":
          return cn(
            "bg-transparent border-0",
            orientation === "horizontal"
              ? "border-t-2 border-border relative after:content-[''] after:absolute after:top-1 after:left-0 after:w-full after:h-[1px] after:bg-border"
              : "border-l-2 border-border relative after:content-[''] after:absolute after:left-1 after:top-0 after:h-full after:w-[1px] after:bg-border"
          )
        case "fade-strong":
          return cn(
            "bg-border",
            orientation === "horizontal"
              ? "bg-gradient-to-r from-transparent via-border via-border to-transparent"
              : "bg-gradient-to-b from-transparent via-border via-border to-transparent",
            "opacity-60"
          )
        default:
          return "bg-border"
      }
    }, [variant, orientation, isDecorative])

    const style = React.useMemo(() => {
      if (variant === "text-decoration" && textContent) {
        return { "--separator-text-content": `"${textContent}"` } as React.CSSProperties
      }
      return undefined
    }, [variant, textContent])

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(baseClasses, variantClasses, className)}
        style={style}
        {...props}
      />
    )
  }
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
