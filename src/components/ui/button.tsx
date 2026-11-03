import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { actionFocusClasses } from "@/lib/focus-styles"
import { wrapInlineLabelTextNodes } from "@/lib/wrap-inline-label-text"

/**
 * Shared button size scale — single source of truth for both the Core and
 * Enhanced buttons so the h-6/h-7/h-8 (sm/default/lg) scale can't drift.
 */
const buttonSizeVariants = {
  default: "h-7 min-w-7 px-3",
  sm: "h-6 min-w-6 px-2 text-xs",
  lg: "h-8 min-w-8 px-4",
  icon: "h-7 w-7 p-0",
} as const

const buttonVariants = cva(
  cn(
    "hit-area-2 inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    actionFocusClasses,
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-none hover:bg-interactive",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-interactive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: buttonSizeVariants,
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CoreButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, CoreButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    // Slot requires a single element child to merge onto; wrapping text nodes
    // would turn children into an array and break it. Only wrap when rendering
    // a real <button>.
    return (
      <Comp
        data-variant={variant}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {asChild ? children : wrapInlineLabelTextNodes(children)}
      </Comp>
    )
  }
)
Button.displayName = "Button"

/**
 * Enhanced button variants with meccs-ui styling
 * Base classes match meccs-ui: focus:outline-0, transition-[color,background-color,border-color,box-shadow]
 *
 * Active state: a solid darken — active:bg-[color-mix(in_oklch,var(--{semantic}),black_10%)] +
 * active:shadow-none + active:scale-95. Never a translucent fill (/75 let the surface show
 * through) and never an inset shadow (it read as a dark band along the top edge). No
 * active:bg-none: load order in consumers can make it win and clear the fill. No focus:bg-*
 * either — mouse clicks trigger :focus, which left the button tinted after release.
 *
 * Disabled filled buttons: do not use transparent bg + *-foreground text — on light surfaces
 * primary-foreground reads as white-on-white. Use bg-muted + text-muted-foreground + border-border
 * so disabled state works on any theme without extra wrapper styles.
 */
const enhancedButtonVariants = cva(
  cn(
    "hit-area-2 inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium leading-normal text-center cursor-pointer select-none touch-manipulation transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-[var(--duration-quick)] ease-[var(--ease-in-out)] focus:outline-0 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-current",
    actionFocusClasses,
  ),
  {
    variants: {
      variant: {
        /* Pressed = the same fill mixed 10% toward black: solid, so the surface never shows
         * through, and flat (no lift, no inset band). Mouse focus does not change the fill;
         * keyboard focus is the focus-visible ring (actionFocusClasses). */
        default: [
          "bg-primary text-primary-foreground border border-primary",
          "nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-primary/90 hover:border-primary/90",
          "active:bg-[color-mix(in_oklch,var(--primary),black_10%)] active:border-[color-mix(in_oklch,var(--primary),black_10%)] active:opacity-100 active:shadow-none active:scale-95",
          /* Disabled: avoid *-foreground on transparent (illegible on light surfaces); use muted tokens */
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground border border-destructive",
          "nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-destructive/90 hover:border-destructive/90",
          "active:bg-[color-mix(in_oklch,var(--destructive),black_10%)] active:border-[color-mix(in_oklch,var(--destructive),black_10%)] active:opacity-100 active:shadow-none active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground border border-border",
          "nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-secondary/90 hover:border-border",
          "active:bg-[color-mix(in_oklch,var(--secondary),black_10%)] active:border-border active:opacity-100 active:shadow-none active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        success: [
          "bg-success text-success-foreground border border-success",
          "nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-success/90 hover:border-success/90",
          "active:bg-[color-mix(in_oklch,var(--success),black_10%)] active:border-[color-mix(in_oklch,var(--success),black_10%)] active:opacity-100 active:shadow-none active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        warning: [
          "bg-warning text-warning-foreground border border-warning",
          "nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-warning/90 hover:border-warning/90",
          "active:bg-[color-mix(in_oklch,var(--warning),black_10%)] active:border-[color-mix(in_oklch,var(--warning),black_10%)] active:opacity-100 active:shadow-none active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        info: [
          "bg-info text-info-foreground border border-info",
          "nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-info/90 hover:border-info/90",
          "active:bg-[color-mix(in_oklch,var(--info),black_10%)] active:border-[color-mix(in_oklch,var(--info),black_10%)] active:opacity-100 active:shadow-none active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        outline:
          "border border-input bg-transparent shadow-none hover:bg-interactive",
        ghost: "hover:bg-interactive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: buttonSizeVariants,
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
}

/**
 * Enhanced Button component with meccs-ui styling
 *
 * Wraps the base shadcn Button component with enhanced styling:
 * - Borders and shadows for filled CTAs (no gradient overlay)
 * - Enhanced focus and active states with scale animation
 * - Smooth opacity and transform transitions
 *
 * Enhanced variants: default, destructive, secondary, success, warning, info
 * Unchanged variants: outline, ghost, link (fallback to core button)
 *
 * @example
 * ```tsx
 * <EnhancedButton variant="default">Click me</EnhancedButton>
 * <EnhancedButton variant="destructive">Delete</EnhancedButton>
 * ```
 */
const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const enhancedVariants = ["default", "destructive", "secondary", "success", "warning", "info"]
    const isEnhanced = variant && enhancedVariants.includes(variant)

    if (!isEnhanced && variant) {
      const coreVariant =
        variant === "outline" || variant === "ghost" || variant === "link" ? variant : "default"
      return (
        <Button
          ref={ref}
          variant={coreVariant}
          size={size}
          className={className}
          asChild={asChild}
          data-variant={variant}
          {...props}
        >
          {children}
        </Button>
      )
    }

    const Comp = asChild ? Slot : "button"
    const baseClassName = cn(enhancedButtonVariants({ variant, size, className }))

    return (
      <Comp
        data-variant={variant}
        className={baseClassName}
        style={props.style}
        ref={ref}
        {...props}
      >
        {asChild ? children : wrapInlineLabelTextNodes(children)}
      </Comp>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

export {
  Button,
  buttonVariants,
  EnhancedButton,
  enhancedButtonVariants,
}
export { Button as CoreButton }
