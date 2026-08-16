"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { floatingSurface } from "@/lib/floating-surface"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          floatingSurface,
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 flex flex-col gap-4 p-2.5 text-xs duration-[var(--duration-micro)] z-[var(--z-popover)] w-72 origin-(--radix-popover-content-transform-origin) outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  asChild: _asChild,
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  // Always a real DOM host (`asChild` ignored). Radix starts with
  // hasCustomAnchor=false, so Trigger also registers as the popper
  // reference; when the custom Anchor wins, that first node is detached
  // (0×0 → viewport origin) if Trigger is a sibling. Remount after
  // layout so the host re-registers.
  const [anchorGen, setAnchorGen] = React.useState(0)

  React.useLayoutEffect(() => {
    setAnchorGen(1)
  }, [])

  return (
    <PopoverPrimitive.Anchor
      key={anchorGen}
      data-slot="popover-anchor"
      className={cn("inline-flex", className)}
      {...props}
      ref={ref}
    >
      {children}
    </PopoverPrimitive.Anchor>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-xs", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
