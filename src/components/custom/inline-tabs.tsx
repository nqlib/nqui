import * as React from "react"
import { ScrollArea } from "@/components/custom/enhanced-scroll-area"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/** Pill tab row inside ScrollArea viewport — width grows with labels (`w-max`). */
export const inlineTabsListClass =
  "min-h-7 w-max justify-start gap-0"

/** Matches core TabsTrigger geometry so the sliding pill animates cleanly. */
export const inlineTabsTriggerClass =
  "flex-none shrink-0 whitespace-nowrap px-3.5 h-[calc(100%-1px)] text-xs font-medium transition-colors motion-safe:duration-[var(--duration-standard)] motion-safe:ease-out"

/** Keeps short tabs (e.g. empty History) from collapsing and shifting page scroll. */
export const inlineTabsPanelsClass = "min-h-[28rem]"

/** Showcase / docs demos — same scroll-preservation idea without 28rem in a small viewport. */
export const inlineTabsPanelsDemoClass = "min-h-[11rem]"

type PendingScroll = {
  el: HTMLElement
  scrollTop: number
  anchor: HTMLElement
  anchorTop: number
}

function findTabAnchor(trigger: HTMLElement): HTMLElement {
  return trigger.closest('[role="tablist"]') ?? trigger
}

/** Horizontal scroller for inline tabs — ScrollArea viewport or legacy overflow-x list. */
function getInlineTabsScroller(tablist: HTMLElement): HTMLElement {
  const viewport = tablist.parentElement
  if (viewport?.getAttribute("data-slot") === "scroll-area-viewport") {
    return viewport
  }
  return tablist
}

/** Page/view scroller — skips horizontal tab ScrollArea viewports and legacy overflow-x bars. */
function findVerticalScrollParent(node: HTMLElement | null): HTMLElement | null {
  for (let el = node?.parentElement; el; el = el.parentElement) {
    if (el.getAttribute("data-slot") === "scroll-area-viewport") {
      const root = el.closest('[data-slot="scroll-area"]')
      if (root?.querySelector('[role="tablist"]')) continue
    }
    const { overflowY } = getComputedStyle(el)
    if (overflowY !== "auto" && overflowY !== "scroll" && overflowY !== "overlay") continue
    if (el.scrollHeight > el.clientHeight + 1) return el
  }
  return null
}

function reconcileAnchor(pending: PendingScroll) {
  const drift = pending.anchor.getBoundingClientRect().top - pending.anchorTop
  if (Math.abs(drift) > 0.5) pending.el.scrollTop += drift
}

function restoreScrollWithAnchor(pending: PendingScroll) {
  pending.el.scrollTop = pending.scrollTop
  reconcileAnchor(pending)
  requestAnimationFrame(() => {
    pending.el.scrollTop = pending.scrollTop
    reconcileAnchor(pending)
    requestAnimationFrame(() => {
      reconcileAnchor(pending)
      requestAnimationFrame(() => reconcileAnchor(pending))
    })
  })
}

export function InlineTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <ScrollArea
      orientation="horizontal"
      hideScrollbar
      fadeMask={false}
      className={cn("min-w-0 w-full max-w-full", className)}
    >
      <TabsList className={inlineTabsListClass} {...props} />
    </ScrollArea>
  )
}

function scrollActiveTabIntoInlineList(trigger: HTMLElement) {
  const tablist = findTabAnchor(trigger)
  const scroller = getInlineTabsScroller(tablist)
  if (scroller.scrollWidth <= scroller.clientWidth) return
  const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth"
  trigger.scrollIntoView({ block: "nearest", inline: "nearest", behavior })
}

/**
 * Use inside scrollable pages (portfolio cards, guide). Preserves page scroll and
 * tab-bar viewport position when Radix moves focus on tab click.
 */
export function InlineTabsTrigger({
  className,
  onMouseDown,
  onFocus,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  const pendingScroll = React.useRef<PendingScroll | null>(null)

  return (
    <TabsTrigger
      className={cn(inlineTabsTriggerClass, className)}
      {...props}
      onMouseDown={(e) => {
        const scrollParent = findVerticalScrollParent(e.currentTarget)
        const anchor = findTabAnchor(e.currentTarget)
        pendingScroll.current = scrollParent
          ? {
              el: scrollParent,
              scrollTop: scrollParent.scrollTop,
              anchor,
              anchorTop: anchor.getBoundingClientRect().top,
            }
          : null
        onMouseDown?.(e)
      }}
      onFocus={(e) => {
        const pending = pendingScroll.current
        if (pending) {
          restoreScrollWithAnchor(pending)
          pendingScroll.current = null
        }
        scrollActiveTabIntoInlineList(e.currentTarget)
        onFocus?.(e)
      }}
    />
  )
}
