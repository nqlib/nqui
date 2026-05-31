import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { wrapInlineLabelTextNodes } from "@/lib/wrap-inline-label-text"

const buttonVariants = cva(
  "hit-area-2 inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-7 min-w-7 px-3",
        sm: "h-6 min-w-6 px-2 text-xs",
        lg: "h-8 min-w-8 px-4",
        icon: "h-7 w-7 p-0",
      },
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
    return (
      <Comp
        data-variant={variant}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {wrapInlineLabelTextNodes(children)}
      </Comp>
    )
  }
)
Button.displayName = "Button"

/**
 * Enhanced button variants with meccs-ui styling
 * Base classes match meccs-ui: focus:outline-0, transition-[color,background-color,border-color,box-shadow]
 *
 * Active state: we use active:bg-{semantic}/75 + active:scale-95 + inset shadow only (no active:bg-none).
 * In the showcase app one Tailwind run can emit utilities in an order where primary wins; in consumers
 * the prebuilt nqui styles load order can make active:bg-none win and clear the fill. Omitting
 * active:bg-none keeps the pressed background and shrink animation consistent everywhere.
 *
 * Disabled filled buttons: do not use transparent bg + *-foreground text — on light surfaces
 * primary-foreground reads as white-on-white. Use bg-muted + text-muted-foreground + border-border
 * so disabled state works on any theme without extra wrapper styles.
 */
const enhancedButtonVariants = cva(
  "hit-area-2 inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium leading-normal text-center cursor-pointer select-none touch-manipulation transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-in-out focus:outline-0 focus-visible:outline-0 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-current",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground border border-primary",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-primary/90 hover:border-primary/90",
          "focus:bg-primary/80 focus:border-primary/80",
          "active:bg-primary/75 active:border-primary/75 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)] active:scale-95",
          /* Disabled: avoid *-foreground on transparent (illegible on light surfaces); use muted tokens */
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground border border-destructive",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-destructive/90 hover:border-destructive/90",
          "focus:bg-destructive/80 focus:border-destructive/80",
          "active:bg-destructive/75 active:border-destructive/75 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)] active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground border border-border",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-secondary/90 hover:border-border",
          "focus:bg-secondary/80 focus:border-border",
          "active:bg-secondary/75 active:border-border active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)] active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        success: [
          "bg-success text-success-foreground border border-success",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-success/90 hover:border-success/90",
          "focus:bg-success/80 focus:border-success/80",
          "active:bg-success/75 active:border-success/75 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)] active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        warning: [
          "bg-warning text-warning-foreground border border-warning",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-warning/90 hover:border-warning/90",
          "focus:bg-warning/80 focus:border-warning/80",
          "active:bg-warning/75 active:border-warning/75 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)] active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        info: [
          "bg-info text-info-foreground border border-info",
          "nqui-button-gradient nqui-button-shadow",
          "opacity-90 hover:opacity-100",
          "hover:bg-info/90 hover:border-info/90",
          "focus:bg-info/80 focus:border-info/80",
          "active:bg-info/75 active:border-info/75 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)] active:scale-95",
          "disabled:bg-muted/60 disabled:text-muted-foreground disabled:border-border disabled:shadow-none",
        ],
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-7 min-w-7 px-3",
        sm: "h-6 min-w-6 px-2 text-xs",
        lg: "h-8 min-w-8 px-4",
        icon: "h-7 w-7 p-0",
      },
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
 * - Borders, gradients, and shadows for dimensional appearance
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
        {wrapInlineLabelTextNodes(children)}
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
