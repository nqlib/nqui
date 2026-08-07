import {
  IconCheck,
  IconSearch,
} from "@/components/icons"
import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { floatingListItemInteractive, floatingSurface } from "@/lib/floating-surface"
import { getMaskStyle } from "@/components/custom/enhanced-scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { ScrollBar } from "@/components/ui/scroll-area"

/** Right gutter so row highlights clear the w-2 ScrollBar thumb. */
const COMMAND_LIST_SCROLL_GUTTER = "pr-3.5"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        floatingSurface,
        "p-1 flex size-full flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "border-0 bg-transparent p-0 shadow-none ring-0 rounded-lg! overflow-hidden",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="shrink-0 px-1 pt-1 pb-1.5">
      <InputGroup className="bg-input/20 dark:bg-input/30">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "w-full text-xs outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <IconSearch strokeWidth={2} className="size-3.5 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

type CommandListProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
> & {
  /**
   * Max height of the scrollable list. Sets `--command-list-max-height`
   * (default `18rem`). Prefer this or the CSS variable over `max-h-*!`.
   */
  maxHeight?: number | string
}

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ className, maxHeight, style, ...props }, ref) => {
  const maxHeightValue =
    maxHeight == null
      ? undefined
      : typeof maxHeight === "number"
        ? `${maxHeight}px`
        : maxHeight
  const rootRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [maskStyle, setMaskStyle] = React.useState<React.CSSProperties>({})

  const updateMask = React.useCallback(() => {
    setMaskStyle((prev) => {
      const next = getMaskStyle(viewportRef.current, true, "vertical")
      return (
        prev.maskImage === next.maskImage &&
        prev.WebkitMaskImage === next.WebkitMaskImage
      )
        ? prev
        : next
    })
  }, [])

  // Bridge wheel → viewport when popover scroll-lock swallows native wheel.
  React.useEffect(() => {
    const root = rootRef.current
    const vp = viewportRef.current
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
    const element = viewportRef.current
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

  return (
    <ScrollAreaPrimitive.Root
      ref={rootRef}
      type="always"
      data-slot="command-list-scroll"
      className={cn(
        "relative min-h-0 w-full max-h-(--command-list-max-height)",
        className
      )}
      style={
        {
          "--command-list-max-height": maxHeightValue ?? "18rem",
          ...style,
        } as React.CSSProperties
      }
    >
      {/*
        Viewport is the scrollport. Cap with max-height (not size-full/%) — under
        Command's h-auto flex column, height:100% resolved to content height so
        scrollHeight === clientHeight and wheel did nothing.
      */}
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="command-list-viewport"
        className="w-full max-h-(--command-list-max-height) scroll-py-1 rounded-[inherit] outline-none transition-[mask-image] duration-[var(--duration-standard)] ease-out"
        style={maskStyle}
      >
        <CommandPrimitive.List
          ref={ref}
          data-slot="command-list"
          className={cn(
            "outline-none overflow-visible py-0.5 pl-1",
            COMMAND_LIST_SCROLL_GUTTER
          )}
          {...props}
        />
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
CommandList.displayName = "CommandList"

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-xs", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground overflow-hidden [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border/50 -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        floatingListItemInteractive,
        "relative mx-1 my-0.5 flex min-h-7 cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-xs select-none [&_svg:not([class*='size-'])]:size-3.5 [[data-slot=dialog-content]_&]:rounded-md group/command-item data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        // Search-result stack: keep py-1.5; grow the text block, not the padding.
        "has-[[data-slot=command-item-content]]:items-start has-[[data-slot=command-item-content]]:min-h-0",
        "has-[[data-slot=command-item-content]]:[&>*:first-child]:mt-0.5",
        className
      )}
      {...props}
    >
      {children}
      <IconCheck
        strokeWidth={2}
        className="ml-auto opacity-0 group-has-[[data-slot=command-shortcut]]/command-item:hidden group-data-[checked=true]/command-item:opacity-100 group-has-[[data-slot=command-item-content]]/command-item:mt-0.5 group-has-[[data-slot=command-item-content]]/command-item:self-start"
      />
    </CommandPrimitive.Item>
  )
}

function CommandItemContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-item-content"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-0.5",
        className
      )}
      {...props}
    />
  )
}

function CommandItemTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-item-title"
      className={cn(
        "line-clamp-1 text-xs font-medium leading-snug",
        className
      )}
      {...props}
    />
  )
}

function CommandItemMeta({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-item-meta"
      className={cn(
        "line-clamp-1 text-[0.625rem] leading-snug text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandItemDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="command-item-description"
      className={cn(
        "line-clamp-2 text-[0.625rem] font-normal leading-snug text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground group-aria-selected/command-item:text-accent-foreground ml-auto text-[0.625rem] tracking-widest",
        "group-has-[[data-slot=command-item-content]]/command-item:self-start group-has-[[data-slot=command-item-content]]/command-item:mt-0.5",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandItemContent,
  CommandItemTitle,
  CommandItemMeta,
  CommandItemDescription,
  CommandShortcut,
  CommandSeparator,
}
