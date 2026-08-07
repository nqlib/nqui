import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconChevronsUpDown,
} from "@/components/icons"
import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive, Select as SelectPrimitive } from "radix-ui"

import { getMaskStyle } from "@/components/custom/enhanced-scroll-area"
import { ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { floatingListItemInteractive, floatingSurface } from "@/lib/floating-surface"

/** Right gutter so row highlights clear the w-2 ScrollBar thumb. */
const SELECT_LIST_SCROLL_GUTTER = "pr-3.5"

/** Keyboard nav wins until the pointer intentionally moves (Radix focuses on pointermove). */
const selectPointerGuard = {
  modality: "pointer" as "pointer" | "keyboard",
  x: 0,
  y: 0,
}

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  minWidth = "120px",
  style,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
  /**
   * Minimum width for the trigger. Set to "fit" for content-sized triggers.
   * @default "120px"
   */
  minWidth?: "fit" | string
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground bg-transparent hover:bg-interactive dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-md border px-2 py-1.5 text-sm shadow-none transition-colors duration-[var(--duration-quick)] ease-[var(--ease-in-out)] focus-visible:ring-[2px] aria-invalid:ring-[2px] data-[size=default]:h-7 data-[size=sm]:h-6 *:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-3.5 flex min-w-0 max-w-full w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        minWidth === "120px" && "min-w-[120px]",
        className
      )}
      style={minWidth !== "fit" && minWidth !== "120px" ? { ...style, minWidth } : style}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <IconChevronsUpDown strokeWidth={2} className="text-muted-foreground size-3.5 pointer-events-none" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
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

  // Bridge wheel → ScrollArea viewport (Select scroll-lock often swallows native wheel),
  // and mark keyboard modality so pointermove cannot steal highlight.
  React.useEffect(() => {
    const root = scrollRootRef.current
    const saVp = scrollViewportRef.current
    if (!root || !saVp) return

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      const max = saVp.scrollHeight - saVp.clientHeight
      if (max <= 1) return
      const prev = saVp.scrollTop
      const next = Math.min(max, Math.max(0, prev + e.deltaY))
      if (next === prev) return
      saVp.scrollTop = next
      e.preventDefault()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(e.key)) return
      selectPointerGuard.modality = "keyboard"
    }

    root.addEventListener("wheel", onWheel, { passive: false })
    root.addEventListener("keydown", onKeyDown, true)
    return () => {
      root.removeEventListener("wheel", onWheel)
      root.removeEventListener("keydown", onKeyDown, true)
    }
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

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          floatingSurface,
          "text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 min-w-32 duration-[var(--duration-micro)] relative z-[var(--z-popover)] max-h-(--radix-select-content-available-height) origin-(--radix-select-content-transform-origin) overflow-hidden",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        {/*
          ScrollArea viewport is the scrollport (CommandList contract).
          type="always" keeps the styled thumb mounted — default "hover" Presence left
          no scrollbar in the DOM while Radix also hides the native bar.
          Wheel is bridged above because Select scroll-lock often blocks native wheel.
        */}
        <ScrollAreaPrimitive.Root
          ref={scrollRootRef}
          type="always"
          data-slot="select-content-scroll"
          className="relative z-[var(--z-content)] min-h-0 w-full max-h-[min(24rem,var(--radix-select-content-available-height,24rem))] rounded-lg bg-popover"
        >
          <ScrollAreaPrimitive.Viewport
            ref={scrollViewportRef}
            data-slot="select-content-viewport"
            className="size-full max-h-[inherit] rounded-[inherit] outline-none transition-[mask-image] duration-[var(--duration-standard)] ease-out"
            style={maskStyle}
          >
            <SelectPrimitive.Viewport
              data-position={position}
              style={{ overflow: "visible" }}
              className={cn(
                "w-full min-w-0 py-1 pl-1",
                SELECT_LIST_SCROLL_GUTTER,
                "data-[position=popper]:h-[var(--radix-select-trigger-height)] data-[position=popper]:w-full data-[position=popper]:min-w-[var(--radix-select-trigger-width)]"
              )}
            >
              {children}
            </SelectPrimitive.Viewport>
          </ScrollAreaPrimitive.Viewport>
          <ScrollBar />
          <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function isSelectItemContent(
  child: React.ReactNode
): child is React.ReactElement {
  return React.isValidElement(child) && child.type === SelectItemContent
}

function SelectItem({
  className,
  children,
  onPointerMove,
  textValue,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const childArray = React.Children.toArray(children)
  const usesContentSlots = childArray.some(isSelectItemContent)
  // Prefer explicit textValue; otherwise derive from title slot for typeahead.
  const derivedTextValue =
    textValue ??
    (usesContentSlots
      ? childArray.reduce<string | undefined>((found, child) => {
          if (found || !React.isValidElement(child) || child.type !== SelectItemContent) {
            return found
          }
          const nested = React.Children.toArray(
            (child.props as { children?: React.ReactNode }).children
          )
          const title = nested.find(
            (n) => React.isValidElement(n) && n.type === SelectItemTitle
          )
          if (!React.isValidElement(title)) return found
          const t = (title.props as { children?: React.ReactNode }).children
          return typeof t === "string" ? t : found
        }, undefined)
      : undefined)

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      textValue={derivedTextValue}
      className={cn(
        "group/select-item not-data-[variant=destructive]:focus:**:text-accent-foreground my-0.5 mx-1 min-h-8 gap-2 px-2.5 py-1.5 pr-8 text-sm [&_svg:not([class*='size-'])]:size-3.5 relative flex w-auto cursor-default select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        // Multi-line: start-align; keep py stable and grow the text stack.
        "has-[[data-slot=select-item-content]]:items-start has-[[data-slot=select-item-content]]:min-h-0",
        "has-[[data-slot=select-item-content]]:[&>*:first-child]:mt-0.5",
        floatingListItemInteractive,
        className
      )}
      {...props}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (event.defaultPrevented) return
        // After keyboard nav, ignore stationary hover (scrollIntoView moves rows under the cursor).
        if (selectPointerGuard.modality === "keyboard") {
          const moved =
            Math.abs(event.clientX - selectPointerGuard.x) > 4 ||
            Math.abs(event.clientY - selectPointerGuard.y) > 4
          if (!moved) {
            event.preventDefault()
            return
          }
          selectPointerGuard.modality = "pointer"
        }
        selectPointerGuard.x = event.clientX
        selectPointerGuard.y = event.clientY
      }}
    >
      <span
        className={cn(
          "pointer-events-none absolute right-2 flex items-center justify-center",
          "top-1/2 -translate-y-1/2 group-has-[[data-slot=select-item-content]]/select-item:top-2.5 group-has-[[data-slot=select-item-content]]/select-item:translate-y-0"
        )}
      >
        <SelectPrimitive.ItemIndicator>
          <IconCheck strokeWidth={2} className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {usesContentSlots ? (
        children
      ) : (
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      )}
    </SelectPrimitive.Item>
  )
}

function SelectItemContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-item-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function SelectItemTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-item-title"
      className={cn("line-clamp-1 text-sm font-medium leading-snug", className)}
      {...props}
    >
      {/* ItemText = what SelectValue shows in the trigger */}
      <SelectPrimitive.ItemText className="contents">{children}</SelectPrimitive.ItemText>
    </div>
  )
}

function SelectItemDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="select-item-description"
      className={cn(
        "line-clamp-2 text-xs font-normal leading-snug text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border/50 -mx-1 my-1 h-px pointer-events-none", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("bg-popover z-[var(--z-popover)] flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    >
      <IconChevronUp strokeWidth={2} />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("bg-popover z-[var(--z-popover)] flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    >
      <IconChevronDown strokeWidth={2} />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemContent,
  SelectItemTitle,
  SelectItemDescription,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
