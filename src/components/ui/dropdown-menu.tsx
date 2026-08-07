"use client"

/**
 * DropdownMenu composition (distinct from Select / Command):
 *
 * - SubTrigger’s layout box IS the submenu anchor. Row width must match siblings.
 * - ScrollArea is OK for the styled thumb, but NEVER add a content-level pr gutter
 *   (that insets SubTrigger → submenu overlap, or widened SubTrigger → hover bleed).
 * - Scrollbar overlays the panel edge; long lists get the nqui thumb without
 *   changing menu geometry.
 */

import {
  IconCheck,
  IconChevronRight,
  IconCircle,
} from "@/components/icons"
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { getMaskStyle } from "@/components/custom/enhanced-scroll-area"
import { ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  floatingListItemInteractive,
  floatingSurface,
  interactiveWashHover,
  menuRowDensity,
} from "@/lib/floating-surface"

const DropdownMenu = DropdownMenuPrimitive.Root

/**
 * Flat field chrome when used as the button itself.
 * With `asChild`, stay style-neutral so SidebarMenuButton / Button keep their own surface.
 */
const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, asChild = false, style, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    asChild={asChild}
    data-slot="dropdown-menu-trigger"
    className={cn(
      !asChild &&
        cn(
          // Kill UA button chrome — platform default button shadow reads as a heavy drop.
          "appearance-none border-input bg-transparent shadow-none ring-0 [box-shadow:none]",
          "data-[state=open]:bg-interactive",
          interactiveWashHover,
          "inline-flex h-7 w-fit items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-solid px-2.5 text-sm",
          "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-in-out)]",
          "outline-none focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0"
        ),
      className
    )}
    style={asChild ? style : { boxShadow: "none", ...style }}
    {...props}
  />
))
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center transition-colors data-[state=open]:bg-interactive [&_svg]:pointer-events-none [&_svg]:shrink-0",
      menuRowDensity,
      floatingListItemInteractive,
      interactiveWashHover,
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <IconChevronRight size={16} className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

function useDropdownScrollMask() {
  const scrollRootRef = React.useRef<HTMLDivElement>(null)
  const scrollViewportRef = React.useRef<HTMLDivElement>(null)
  const [maskStyle, setMaskStyle] = React.useState<React.CSSProperties>({})

  const updateMask = React.useCallback(() => {
    setMaskStyle((prev) => {
      const next = getMaskStyle(scrollViewportRef.current, true, "vertical")
      return (
        prev.maskImage === next.maskImage &&
        prev.WebkitMaskImage === next.WebkitMaskImage
      )
        ? prev
        : next
    })
  }, [])

  React.useEffect(() => {
    const root = scrollRootRef.current
    const vp = scrollViewportRef.current
    if (!root || !vp) return
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      const max = vp.scrollHeight - vp.clientHeight
      if (max <= 1 || e.deltaY === 0) return
      const next = Math.min(max, Math.max(0, vp.scrollTop + e.deltaY))
      if (next === vp.scrollTop) return
      vp.scrollTop = next
      e.preventDefault()
    }
    root.addEventListener("wheel", onWheel, { passive: false, capture: true })
    return () => root.removeEventListener("wheel", onWheel, true)
  }, [])

  React.useEffect(() => {
    const element = scrollViewportRef.current
    if (!element) return
    updateMask()
    element.addEventListener("scroll", updateMask, { passive: true })
    const resizeObserver = new ResizeObserver(updateMask)
    resizeObserver.observe(element)
    return () => {
      resizeObserver.disconnect()
      element.removeEventListener("scroll", updateMask)
    }
  }, [updateMask])

  return { scrollRootRef, scrollViewportRef, maskStyle }
}

function DropdownScrollBody({ children }: { children: React.ReactNode }) {
  const { scrollRootRef, scrollViewportRef, maskStyle } = useDropdownScrollMask()

  return (
    <ScrollAreaPrimitive.Root
      ref={scrollRootRef}
      type="always"
      data-slot="dropdown-menu-scroll"
      className="relative z-[var(--z-content)] min-h-0 w-full max-h-[min(24rem,var(--radix-dropdown-menu-content-available-height,24rem))] rounded-lg bg-popover"
    >
      {/*
        No pr gutter — SubTrigger width must match siblings for submenu anchoring.
        Thumb overlays the edge (Select/Command can use a reserved gutter; menus cannot).
      */}
      <ScrollAreaPrimitive.Viewport
        ref={scrollViewportRef}
        data-slot="dropdown-menu-viewport"
        className="size-full max-h-[inherit] rounded-[inherit] outline-none transition-[mask-image] duration-[var(--duration-standard)] ease-out"
        style={maskStyle}
      >
        <div className="p-1">{children}</div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, sideOffset = 6, alignOffset = -4, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    sideOffset={sideOffset}
    alignOffset={alignOffset}
    className={cn(
      floatingSurface,
      "z-[var(--z-popover)] min-w-[8rem] overflow-hidden p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    )}
    {...props}
  >
    <DropdownScrollBody>{children}</DropdownScrollBody>
  </DropdownMenuPrimitive.SubContent>
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        floatingSurface,
        "z-[var(--z-popover)] max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-hidden p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      )}
      {...props}
    >
      <DropdownScrollBody>{children}</DropdownScrollBody>
    </DropdownMenuPrimitive.Content>
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      menuRowDensity,
      floatingListItemInteractive,
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex min-h-7 cursor-default select-none items-center py-1 pl-8 pr-2 text-xs transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      floatingListItemInteractive,
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCheck size={16} className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex min-h-7 cursor-default select-none items-center py-1 pl-8 pr-2 text-xs transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      floatingListItemInteractive,
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCircle size={8} className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("bg-border/50 -mx-1 my-1 h-px", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

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
