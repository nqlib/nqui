import {
  IconChevronLeft,
  IconChevronRight,
  IconMoreHorizontal,
} from "@/components/icons"
import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { ScrollArea } from "@/components/custom/enhanced-scroll-area"
import type { EnhancedScrollAreaProps } from "@/components/custom/enhanced-scroll-area"
import { useComposedRefs } from "@/lib/compose-refs"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/** `size-7` cell + `gap-1` — 4px grid, and the ResizeObserver divisor. */
const PAGINATION_STRIDE_PX = 32

const paginationCellFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"

/** Every mark in the strip occupies the same 28px chrome cell. */
const paginationCellClasses = cn(
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sm tabular-nums",
  "transition-colors duration-[var(--duration-quick)]",
  paginationCellFocus
)

// Prev/Next arrows are hover-revealed on pointer devices, but must also appear
// on keyboard focus and on touch (no hover) so they stay reachable everywhere.
const paginationArrowClasses = cn(
  paginationCellClasses,
  "z-10 opacity-0 pointer-events-none",
  "group-hover/pagination:pointer-events-auto group-hover/pagination:opacity-70",
  "focus-visible:pointer-events-auto focus-visible:opacity-100",
  "[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-70"
)

// ─── Context ─────────────────────────────────────────────────────────────────

type PaginationContextValue = {
  canGoPrev: boolean
  canGoNext: boolean
}

const PaginationContext = React.createContext<PaginationContextValue>({
  canGoPrev: false,
  canGoNext: true,
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getVisiblePages(
  active: number,
  total: number,
  maxVisible: number
): (number | "ellipsis")[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1) as number[]
  }

  const half = Math.floor((maxVisible - 1) / 2)
  const start = Math.max(2, active - half)

  let finalStart = Math.max(2, Math.min(start, total - 1 - (maxVisible - 3)))
  let finalEnd = Math.min(total - 1, finalStart + maxVisible - 3)

  // When the middle window is narrower than the ideal range, `start`-based math can
  // leave `active` outside [finalStart, finalEnd] (e.g. maxVisible=3, active=3 → only "2").
  // Always slide the window so the current page is included when it is not an edge page.
  const span = Math.max(1, finalEnd - finalStart + 1)
  if (active > 1 && active < total) {
    let centeredStart = active - Math.floor((span - 1) / 2)
    centeredStart = Math.max(2, Math.min(centeredStart, total - 1 - (span - 1)))
    finalStart = centeredStart
    finalEnd = centeredStart + span - 1
  }

  const pages: (number | "ellipsis")[] = [1]

  if (finalStart > 2) pages.push("ellipsis")
  for (let i = finalStart; i <= finalEnd; i++) pages.push(i)
  if (finalEnd < total - 1) pages.push("ellipsis")
  pages.push(total)

  return pages
}

// ─── Root ───────────────────────────────────────────────────────────────────

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("relative flex w-full min-w-0 items-center gap-1", className)}
      {...props}
    />
  )
}

// ─── Content (scrollable) ───────────────────────────────────────────────────

export type PaginationContentProps = Omit<
  EnhancedScrollAreaProps,
  "orientation" | "hideScrollbar" | "children"
> & {
  children?: React.ReactNode
}

const PaginationContent = React.forwardRef<HTMLDivElement, PaginationContentProps>(
  function PaginationContent(
    {
      className,
      children,
      viewportStyle,
      style,
      viewportRef: viewportRefProp,
      fadeMask = true,
      ...scrollRest
    },
    ref
  ) {
    const viewportRef = useComposedRefs(ref, viewportRefProp)
    return (
      <ScrollArea
        {...scrollRest}
        orientation="horizontal"
        hideScrollbar
        fadeMask={fadeMask}
        viewportRef={viewportRef}
        viewportStyle={{
          ...(typeof style === "object" && style ? style : {}),
          ...(viewportStyle ?? {}),
        }}
        className={cn("min-w-0 flex-1", className)}
      >
        <ul
          data-slot="pagination-content"
          className="flex w-max min-w-full items-center justify-center gap-1"
        >
          {children}
        </ul>
      </ScrollArea>
    )
  }
)
PaginationContent.displayName = "PaginationContent"

// ─── Item ────────────────────────────────────────────────────────────────────

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

// ─── Ellipsis ───────────────────────────────────────────────────────────────

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(paginationCellClasses, "text-muted-foreground", className)}
      {...props}
    >
      <IconMoreHorizontal strokeWidth={2} className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

// ─── Link ───────────────────────────────────────────────────────────────────

type PaginationLinkProps = VariantProps<typeof buttonVariants> &
  React.ComponentProps<"a"> & {
    isActive?: boolean
  }

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, size: _size = "icon", onClick, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          paginationCellClasses,
          isActive ? "bg-muted text-foreground" : "hover:bg-interactive",
          className
        )}
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        onClick={onClick}
        {...props}
      />
    )
  }
)
PaginationLink.displayName = "PaginationLink"

// ─── Previous / Next ──────────────────────────────────────────────────────────

function PaginationPrevious({ className, ...props }: React.ComponentProps<"a">) {
  const { canGoPrev } = React.useContext(PaginationContext)
  return (
    <a
      data-slot="pagination-previous"
      aria-label="Go to previous page"
      className={cn(
        paginationArrowClasses,
        canGoPrev
          ? "text-foreground hover:opacity-100"
          : "text-muted-foreground/30 cursor-not-allowed",
        className
      )}
      aria-disabled={!canGoPrev}
      {...props}
    >
      <IconChevronLeft strokeWidth={2} />
      <span className="sr-only">Previous</span>
    </a>
  )
}

function PaginationNext({ className, ...props }: React.ComponentProps<"a">) {
  const { canGoNext } = React.useContext(PaginationContext)
  return (
    <a
      data-slot="pagination-next"
      aria-label="Go to next page"
      className={cn(
        paginationArrowClasses,
        canGoNext
          ? "text-foreground hover:opacity-100"
          : "text-muted-foreground/30 cursor-not-allowed",
        className
      )}
      aria-disabled={!canGoNext}
      {...props}
    >
      <IconChevronRight strokeWidth={2} />
      <span className="sr-only">Next</span>
    </a>
  )
}

// ─── Strip scroll (adaptive) ─────────────────────────────────────────────────

type StripAlign = "start" | "center" | "end"

function stripScrollBehavior(): ScrollBehavior {
  if (typeof window.matchMedia !== "function") return "smooth"
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
}

function parseScrollPadding(value: string): number {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Pan the active page number inside the strip viewport only.
 * `Element.scrollIntoView` also moves ancestor page scrollers (catalog, long lists).
 */
function scrollActivePageInStrip(
  viewport: HTMLElement,
  active: HTMLElement,
  align: StripAlign,
  behavior: ScrollBehavior = stripScrollBehavior()
) {
  if (viewport.scrollWidth <= viewport.clientWidth) return

  const viewRect = viewport.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const style = getComputedStyle(viewport)
  const padStart = parseScrollPadding(
    style.scrollPaddingInlineStart || style.scrollPaddingLeft
  )
  const padEnd = parseScrollPadding(
    style.scrollPaddingInlineEnd || style.scrollPaddingRight
  )

  let delta = 0
  if (align === "start") {
    delta = activeRect.left - viewRect.left - padStart
  } else if (align === "end") {
    delta = activeRect.right - viewRect.right + padEnd
  } else {
    const activeCenter = activeRect.left + activeRect.width / 2
    const viewCenter = viewRect.left + viewRect.width / 2
    delta = activeCenter - viewCenter
  }

  if (Math.abs(delta) < 1) return

  const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
  const next = Math.max(0, Math.min(max, viewport.scrollLeft + delta))
  viewport.scrollTo({ left: next, behavior })
}

// ─── Adaptive Pagination ──────────────────────────────────────────────────────

type PaginationAdaptiveProps = React.ComponentProps<"nav"> & {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisible?: number
}

function PaginationAdaptive({
  page,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className,
  ...props
}: PaginationAdaptiveProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = React.useState(maxVisible)

  const pages = React.useMemo(
    () => getVisiblePages(page, totalPages, visibleCount),
    [page, totalPages, visibleCount]
  )

  React.useEffect(() => {
    const viewport = contentRef.current
    const active = viewport?.querySelector<HTMLElement>("[data-active='true']")
    if (!viewport || !active) return
    const align: StripAlign =
      page <= 1 ? "start" : page >= totalPages ? "end" : "center"
    scrollActivePageInStrip(viewport, active, align)
  }, [pages, page, totalPages])

  React.useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        /* Viewport is only the number strip (arrows sit outside ScrollArea). */
        const available = entry.contentRect.width
        const count = Math.max(3, Math.floor(available / PAGINATION_STRIDE_PX))
        setVisibleCount(count)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <PaginationContext.Provider value={{ canGoPrev: page > 1, canGoNext: page < totalPages }}>
      <Pagination className={cn("group/pagination", className)} {...props}>
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault()
            if (page > 1) onPageChange(page - 1)
          }}
        />
        <PaginationContent ref={contentRef}>
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault()
                    if (p !== page) onPageChange(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
        </PaginationContent>
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault()
            if (page < totalPages) onPageChange(page + 1)
          }}
        />
      </Pagination>
    </PaginationContext.Provider>
  )
}

// ─── Scroller (legacy) ─────────────────────────────────────────────────────

type PaginationScrollerProps = {
  canGoPrev: boolean
  canGoNext: boolean
  children: React.ReactNode
}

function PaginationScroller({ canGoPrev, canGoNext, children }: PaginationScrollerProps) {
  return (
    <PaginationContext.Provider value={{ canGoPrev, canGoNext }}>
      <Pagination className="group/pagination">{children}</Pagination>
    </PaginationContext.Provider>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationScroller,
  PaginationAdaptive,
}

/** @internal Test helper — not part of the public `@nqlib/nqui` entry. */
export { scrollActivePageInStrip }
