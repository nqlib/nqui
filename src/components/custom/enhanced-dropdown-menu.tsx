"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import {
  DropdownMenu as CoreDropdownMenu,
  DropdownMenuTrigger as CoreDropdownMenuTrigger,
  DropdownMenuContent as CoreDropdownMenuContent,
  DropdownMenuItem as CoreDropdownMenuItem,
  DropdownMenuCheckboxItem as CoreDropdownMenuCheckboxItem,
  DropdownMenuRadioItem as CoreDropdownMenuRadioItem,
  DropdownMenuLabel as CoreDropdownMenuLabel,
  DropdownMenuSeparator as CoreDropdownMenuSeparator,
  DropdownMenuShortcut as CoreDropdownMenuShortcut,
  DropdownMenuGroup as CoreDropdownMenuGroup,
  DropdownMenuPortal as CoreDropdownMenuPortal,
  DropdownMenuSub as CoreDropdownMenuSub,
  DropdownMenuSubContent as CoreDropdownMenuSubContent,
  DropdownMenuSubTrigger as CoreDropdownMenuSubTrigger,
  DropdownMenuRadioGroup as CoreDropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/**
 * Enhanced DropdownMenu components with button-like 3D effects (no gradient)
 *
 * Adds button-like styling to menu items with:
 * - 3D shadow effects on trigger
 * - Border highlights
 * - Inset highlights
 * - No gradient overlay
 */

const DropdownMenu = CoreDropdownMenu

const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  React.useEffect(() => {
    const styleId = "enhanced-dropdown-menu-styles"
    if (document.getElementById(styleId)) return

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      /* Enhanced DropdownMenu Trigger - Layered shadow with semi-transparent border */
      .enhanced-dropdown-trigger {
        border: 1px solid color-mix(in oklch, var(--border) 50%, transparent) !important;
        box-shadow:
          /* First layer: Darker border effect on bottom where shadow overlaps */
          0 1px 0 0 color-mix(in oklch, var(--border) 40%, transparent),
          /* Second layer: Main shadow for depth */
          0 1px 2px 0 oklch(0.15 0 0 / 0.05),
          /* Third layer: Additional depth */
          0 2px 4px -1px oklch(0.15 0 0 / 0.03) !important;
        border-top-color: color-mix(in oklch, var(--border) 92%, oklch(1 0 0) 8%) !important;
        border-left-color: color-mix(in oklch, var(--border) 92%, oklch(1 0 0) 8%) !important;
        border-bottom-color: color-mix(in oklch, var(--border) 92%, oklch(0 0 0) 8%) !important;
        border-right-color: color-mix(in oklch, var(--border) 92%, oklch(0 0 0) 8%) !important;
        transition: all 150ms ease-in-out !important;
      }

      .dark .enhanced-dropdown-trigger {
        border: 1px solid color-mix(in oklch, var(--border) 50%, transparent) !important;
        box-shadow:
          /* First layer: Darker border effect on bottom where shadow overlaps */
          0 1px 0 0 color-mix(in oklch, var(--border) 40%, transparent),
          /* Second layer: Main shadow for depth (darker for dark mode) */
          0 1px 2px 0 oklch(0 0 0 / 0.3),
          /* Third layer: Additional depth */
          0 2px 4px -1px oklch(0 0 0 / 0.2) !important;
      }

      .enhanced-dropdown-trigger:hover {
        box-shadow:
          /* First layer: Darker border effect on bottom */
          0 1px 0 0 color-mix(in oklch, var(--border) 40%, transparent),
          /* Second layer: Enhanced shadow on hover */
          0 1px 3px 0 oklch(0.15 0 0 / 0.08),
          /* Third layer: Additional depth */
          0 2px 6px -1px oklch(0.15 0 0 / 0.04),
          /* Fourth layer: Subtle outer glow */
          0 4px 8px -2px oklch(0.15 0 0 / 0.02) !important;
      }

      .dark .enhanced-dropdown-trigger:hover {
        box-shadow:
          /* First layer: Darker border effect on bottom */
          0 1px 0 0 color-mix(in oklch, var(--border) 40%, transparent),
          /* Second layer: Enhanced shadow on hover */
          0 1px 3px 0 oklch(0 0 0 / 0.4),
          /* Third layer: Additional depth */
          0 2px 6px -1px oklch(0 0 0 / 0.3),
          /* Fourth layer: Subtle outer glow */
          0 4px 8px -2px oklch(0 0 0 / 0.2) !important;
      }

      .enhanced-dropdown-trigger[data-state="open"] {
        box-shadow:
          /* First layer: Darker border effect on bottom */
          0 1px 0 0 color-mix(in oklch, var(--border) 40%, transparent),
          /* Second layer: Main shadow */
          0 1px 2px 0 oklch(0.15 0 0 / 0.05),
          /* Third layer: Additional depth */
          0 2px 4px -1px oklch(0.15 0 0 / 0.03) !important;
      }

      .dark .enhanced-dropdown-trigger[data-state="open"] {
        box-shadow:
          /* First layer: Darker border effect on bottom */
          0 1px 0 0 color-mix(in oklch, var(--border) 40%, transparent),
          /* Second layer: Main shadow */
          0 1px 2px 0 oklch(0 0 0 / 0.3),
          /* Third layer: Additional depth */
          0 2px 4px -1px oklch(0 0 0 / 0.2) !important;
      }

      .enhanced-dropdown-trigger:focus-visible {
        box-shadow:
          /* First layer: Darker border effect on bottom */
          0 1px 0 0 color-mix(in oklch, var(--border) 40%, transparent),
          /* Second layer: Main shadow */
          0 1px 2px 0 oklch(0.15 0 0 / 0.05),
          /* Third layer: Additional depth */
          0 2px 4px -1px oklch(0.15 0 0 / 0.03),
          /* Focus ring */
          0 0 0 2px color-mix(in oklch, var(--ring) 30%, transparent) !important;
      }

      .dark .enhanced-dropdown-trigger:focus-visible {
        box-shadow:
          /* First layer: Darker border effect on bottom */
          0 1px 0 0 color-mix(in oklch, var(--border) 40%, transparent),
          /* Second layer: Main shadow */
          0 1px 2px 0 oklch(0 0 0 / 0.3),
          /* Third layer: Additional depth */
          0 2px 4px -1px oklch(0 0 0 / 0.2),
          /* Focus ring */
          0 0 0 2px color-mix(in oklch, var(--ring) 30%, transparent) !important;
      }
    `
    document.head.appendChild(style)
  }, [])

  return (
    <CoreDropdownMenuTrigger
      ref={ref}
      className={cn("enhanced-dropdown-trigger", className)}
      {...props}
    />
  )
})
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, ...props }, ref) => {
  return <CoreDropdownMenuContent ref={ref} className={className} {...props} />
})
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, ...props }, ref) => {
  return <CoreDropdownMenuItem ref={ref} className={className} {...props} />
})
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, ...props }, ref) => {
  return <CoreDropdownMenuCheckboxItem ref={ref} className={className} {...props} />
})
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, ...props }, ref) => {
  return <CoreDropdownMenuRadioItem ref={ref} className={className} {...props} />
})
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, ...props }, ref) => {
  return <CoreDropdownMenuLabel ref={ref} className={className} {...props} />
})
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => {
  return <CoreDropdownMenuSeparator ref={ref} className={className} {...props} />
})
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <CoreDropdownMenuShortcut className={className} {...props} />
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

const DropdownMenuGroup = CoreDropdownMenuGroup

const DropdownMenuPortal = CoreDropdownMenuPortal

const DropdownMenuSub = CoreDropdownMenuSub

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => {
  return <CoreDropdownMenuSubContent ref={ref} className={className} {...props} />
})
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, ...props }, ref) => {
  return <CoreDropdownMenuSubTrigger ref={ref} className={className} {...props} />
})
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuRadioGroup = CoreDropdownMenuRadioGroup

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
