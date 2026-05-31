"use client"

import * as React from "react"
import { useState, useEffect, useRef, useMemo, createContext, useContext } from "react"
import { cn } from "@/lib/utils"
import { useScrollSpy } from "@/hooks/use-scroll-spy"

export interface TOCItem {
  id: string
  label: string
  level: number
  children?: TOCItem[]
}

interface TableOfContentsContextValue {
  activeId: string | null
  visibleIds: string[]
  onItemClick: (id: string) => void
  scrollOffset: number
  smoothScroll: boolean
  variant: "normal" | "circuit" | "clerk"
}

const TableOfContentsContext = createContext<TableOfContentsContextValue | undefined>(undefined)

export interface TableOfContentsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Manual TOC items array
   */
  items?: TOCItem[]
  /**
   * Auto-detect headings from the page
   */
  autoDetect?: boolean
  /**
   * CSS selector for headings to detect
   */
  headingSelector?: string
  /**
   * Container element, ref, or selector to scope heading detection.
   * If provided, only headings within this container will be detected.
   * If not provided, searches the entire document (useful for full-page documents).
   */
  container?: HTMLElement | React.RefObject<HTMLElement | null> | string | null
  /**
   * Scroll container element, ref, or selector for actual scrolling.
   * If not provided, uses the container prop or falls back to window scroll.
   * Useful when heading detection container is different from scroll container.
   */
  scrollContainer?: HTMLElement | React.RefObject<HTMLElement | null> | string | null
  /**
   * Controlled active section ID (overrides scroll spy)
   */
  activeId?: string
  /**
   * Callback when active section changes
   */
  onActiveChange?: (id: string | null) => void
  /**
   * Offset for scroll positioning (useful for fixed headers)
   */
  scrollOffset?: number
  /**
   * Enable smooth scrolling
   */
  smoothScroll?: boolean
  /**
   * Enable automatic scroll spy
   */
  enableScrollSpy?: boolean
  /**
   * Title to display above TOC
   */
  title?: string
  /**
   * Visual variant of the TOC
   * - normal: Fumadocs-style with left border and animated thumb indicator
   * - circuit: Clerk-style with continuous line structure (simple linear paths)
   * - clerk: Enhanced Clerk-style with smooth corner radius and quadratic curves
   */
  variant?: "normal" | "circuit" | "clerk"
}

/**
 * Auto-detect headings from the DOM and build TOC structure
 */
function useHeadingDetection(
  enabled: boolean,
  selector: string,
  container?: HTMLElement | React.RefObject<HTMLElement | null> | string | null
): TOCItem[] {
  const [items, setItems] = useState<TOCItem[]>([])

  useEffect(() => {
    if (!enabled) {
      setItems([])
      return
    }

    // Determine the root element for querying
    let rootElement: Document | HTMLElement = document

    if (container) {
      if (typeof container === "string") {
        // CSS selector string
        const found = document.querySelector(container)
        if (found instanceof HTMLElement) {
          rootElement = found
        }
      } else if ("current" in container) {
        // React ref object
        if (container.current instanceof HTMLElement) {
          rootElement = container.current
        }
      } else if (container instanceof HTMLElement) {
        // Direct HTMLElement
        rootElement = container
      }
    }

    const headings = Array.from(rootElement.querySelectorAll(selector))

    if (headings.length === 0) {
      setItems([])
      return
    }

    // Build hierarchical structure
    const tocItems: TOCItem[] = []
    const stack: TOCItem[] = []

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1))
      const text = heading.textContent?.trim() || ""
      let id = heading.id

      // Generate ID if missing
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
        heading.id = id
      }

      const item: TOCItem = {
        id,
        label: text,
        level,
      }

      // Find parent in stack
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length === 0) {
        tocItems.push(item)
      } else {
        const parent = stack[stack.length - 1]
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(item)
      }

      stack.push(item)
    })

    setItems(tocItems)
  }, [enabled, selector, container])

  return items
}

/**
 * Enhanced Table of Contents component with auto-detection and scroll spy
 *
 * Supports two visual variants:
 * - normal: Fumadocs-style with left border and animated thumb indicator
 * - circuit: Clerk-style with continuous line structure and SVG path
 *
 * Features:
 * - Auto-detect headings from DOM or accept manual items
 * - Scroll spy to highlight active section
 * - Smooth scrolling to sections
 * - Support for fixed headers with scroll offset
 *
 * @example
 * ```tsx
 * <TableOfContents autoDetect headingSelector="h2, h3" enableScrollSpy />
 * <TableOfContents variant="circuit" items={tocItems} />
 * ```
 */
const TableOfContents = React.forwardRef<HTMLDivElement, TableOfContentsProps>(
  (
    {
      className,
      items: manualItems,
      autoDetect = false,
      headingSelector = "h1, h2, h3, h4, h5, h6",
      container,
      scrollContainer: scrollContainerProp,
      activeId: controlledActiveId,
      onActiveChange,
      scrollOffset = 0,
      smoothScroll = true,
      enableScrollSpy = true,
      title = "On this page",
      variant = "normal",
      ...props
    },
    ref
  ) => {
    const isControlled = controlledActiveId !== undefined

    // Auto-detect headings if enabled
    const autoDetectedItems = useHeadingDetection(autoDetect, headingSelector, container)

    // Determine which items to use
    const items = useMemo(() => {
      if (manualItems && manualItems.length > 0) {
        return manualItems
      }
      if (autoDetect && autoDetectedItems.length > 0) {
        return autoDetectedItems
      }
      return []
    }, [manualItems, autoDetectedItems, autoDetect])

    // Resolve container element for heading detection (scoping)
    const containerElement = React.useMemo(() => {
      if (!container) return null
      if (typeof container === "string") {
        const found = document.querySelector(container)
        return found instanceof HTMLElement ? found : null
      }
      if ("current" in container) {
        return container.current
      }
      if (container instanceof HTMLElement) {
        return container
      }
      return null
    }, [container])

    // Resolve scroll container element for actual scrolling
    const scrollContainerElement = React.useMemo(() => {
      // Use scrollContainer prop if provided, otherwise fall back to container
      const target = scrollContainerProp || container
      if (!target) return null
      if (typeof target === "string") {
        const found = document.querySelector(target)
        return found instanceof HTMLElement ? found : null
      }
      if ("current" in target) {
        return target.current
      }
      if (target instanceof HTMLElement) {
        return target
      }
      return null
    }, [scrollContainerProp, container])

    // Use scroll spy if enabled and not controlled
    // Use scrollContainerElement for scroll spy to track scroll position correctly
    const scrollSpy = useScrollSpy({
      selector: headingSelector,
      rootMargin: "-100px 0px -66%",
      threshold: 0,
      offset: scrollOffset,
      enabled: enableScrollSpy && !isControlled && items.length > 0,
      container: scrollContainerElement || containerElement,
    })

    // Determine active ID and visible IDs
    const activeId = isControlled ? controlledActiveId : scrollSpy.activeId
    const visibleIds = isControlled
      ? controlledActiveId
        ? [controlledActiveId]
        : []
      : scrollSpy.visibleIds

    // Remember the last active ID even when it's scrolled out of view (shared across all variants)
    const lastActiveIdRef = React.useRef<string | null>(null)

    // Update lastActiveIdRef when visibleIds changes
    React.useEffect(() => {
      if (visibleIds.length > 0 && items.length > 0) {
        // Find the last active index and update lastActiveIdRef
        let lastActiveIndex = -1
        const flatItems: TOCItem[] = []
        const flatten = (items: TOCItem[]): void => {
          items.forEach((item) => {
            flatItems.push(item)
            if (item.children) {
              flatten(item.children)
            }
          })
        }
        flatten(items)

        for (let i = 0; i < flatItems.length; i++) {
          if (visibleIds.includes(flatItems[i].id)) {
            lastActiveIndex = i
          }
        }
        if (lastActiveIndex >= 0) {
          lastActiveIdRef.current = flatItems[lastActiveIndex].id
        }
      }
      // Note: We don't clear lastActiveIdRef when visibleIds is empty - we keep it for persistence
    }, [visibleIds, items])


    // Handle item click
    const handleItemClick = (id: string) => {
      const element = document.getElementById(id)
      if (element) {
        // Use scrollContainerElement if available, otherwise fall back to containerElement or window
        const scrollTarget = scrollContainerElement || containerElement

        if (scrollTarget) {
          const elementPosition = element.getBoundingClientRect().top
          const containerPosition = scrollTarget.getBoundingClientRect().top
          const offsetPosition = elementPosition - containerPosition + scrollTarget.scrollTop - scrollOffset

          scrollTarget.scrollTo({
            top: offsetPosition,
            behavior: smoothScroll ? "smooth" : "auto",
          })
        } else {
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - scrollOffset

          window.scrollTo({
            top: offsetPosition,
            behavior: smoothScroll ? "smooth" : "auto",
          })
        }

        // Update active state
        if (!isControlled) {
          scrollSpy.setActiveId(id)
        }
        onActiveChange?.(id)
      }
    }

    // Notify parent of active changes
    useEffect(() => {
      if (!isControlled && activeId !== null) {
        onActiveChange?.(activeId)
      }
    }, [activeId, isControlled, onActiveChange])

    // Flatten items for circuit/clerk variants and track active path
    const { flatItems, activePathIds } = useMemo(() => {
      if (variant !== "circuit" && variant !== "clerk") return { flatItems: [], activePathIds: new Set<string>() }

      const flat: (TOCItem & { parentId?: string })[] = []
      const idToParentMap = new Map<string, string>()

      const flatten = (items: TOCItem[], parentId?: string) => {
        items.forEach((item) => {
          flat.push({ ...item, parentId })
          if (parentId) idToParentMap.set(item.id, parentId)
          if (item.children) {
            flatten(item.children, item.id)
          }
        })
      }
      flatten(items)

      // Calculate active path
      const activePath = new Set<string>()
      if (activeId) {
        let currentId: string | undefined = activeId
        while (currentId) {
          activePath.add(currentId)
          currentId = idToParentMap.get(currentId)
        }
      }

      return { flatItems: flat, activePathIds: activePath }
    }, [items, variant, activeId])

    if (items.length === 0) {
      return null
    }

    return (
      <TableOfContentsContext.Provider
        value={{
          activeId,
          visibleIds,
          onItemClick: handleItemClick,
          scrollOffset,
          smoothScroll,
          variant,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "relative min-h-0 text-sm",
            "overflow-auto",
            "[scrollbar-width:none]",
            "[mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)]",
            className
          )}
          {...props}
        >
          {title && (
            <div className="px-4 py-2 font-semibold text-foreground sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-border">
              {title}
            </div>
          )}
          <nav className="py-3">
            {variant === "circuit" ? (
              <CircuitTableOfContentsList
                items={flatItems}
                activePathIds={activePathIds}
                visibleIds={visibleIds}
                lastActiveIdRef={lastActiveIdRef}
              />
            ) : variant === "clerk" ? (
              <ClerkTableOfContentsList
                items={flatItems}
                activePathIds={activePathIds}
                visibleIds={visibleIds}
                lastActiveIdRef={lastActiveIdRef}
              />
            ) : (
              <NormalTableOfContentsList
                items={items}
                visibleIds={visibleIds}
                lastActiveIdRef={lastActiveIdRef}
              />
            )}
          </nav>
        </div>
      </TableOfContentsContext.Provider>
    )
  }
)
TableOfContents.displayName = "TableOfContents"

// Normal Variant Components (Fumadocs default style)

interface NormalTableOfContentsListProps {
  items: TOCItem[]
  visibleIds?: string[]
  lastActiveIdRef?: React.MutableRefObject<string | null>
}

const NormalTableOfContentsList = React.memo(
  ({ items, visibleIds = [], lastActiveIdRef }: NormalTableOfContentsListProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    // Flatten items for normal variant
    const flatItems = useMemo(() => {
      const flatten = (items: TOCItem[]): TOCItem[] => {
        const result: TOCItem[] = []
        items.forEach((item) => {
          result.push(item)
          if (item.children) {
            result.push(...flatten(item.children))
          }
        })
        return result
      }
      return flatten(items)
    }, [items])

    // Calculate which items should be highlighted (use lastActiveIdRef as fallback)
    const highlightedIds = React.useMemo(() => {
      const currentLastActiveId = lastActiveIdRef?.current

      if (visibleIds.length > 0) {
        return new Set(visibleIds)
      } else if (currentLastActiveId) {
        // Fallback to remembered last active ID when nothing is visible
        // Keep highlighting the last active item until a new one becomes active
        return new Set([currentLastActiveId])
      }
      return new Set<string>()
    }, [visibleIds, lastActiveIdRef])

    return (
      <>
        <NormalThumb containerRef={containerRef} activeIds={visibleIds} lastActiveIdRef={lastActiveIdRef} items={flatItems} />
        <div ref={containerRef} className={cn("flex flex-col border-s border-foreground/10")}>
          {flatItems.map((item) => (
            <NormalTableOfContentsItem
              key={item.id}
              item={item}
              isVisible={highlightedIds.has(item.id)}
            />
          ))}
        </div>
      </>
    )
  }
)
NormalTableOfContentsList.displayName = "NormalTableOfContentsList"

interface NormalThumbProps {
  containerRef: React.RefObject<HTMLElement | null>
  activeIds: string[]
  lastActiveIdRef?: React.MutableRefObject<string | null>
  items?: TOCItem[]
}

const NormalThumb = React.memo(({ containerRef, activeIds, lastActiveIdRef, items: _items }: NormalThumbProps) => {
  const thumbRef = useRef<HTMLDivElement>(null)

  const updateThumb = React.useCallback((top: number, height: number): void => {
    const element = thumbRef.current
    if (!element) return
    element.style.setProperty("--normal-top", `${top}px`)
    element.style.setProperty("--normal-height", `${height}px`)
  }, [])

  const calculateThumb = React.useCallback((): void => {
    if (!containerRef.current) {
      updateThumb(0, 0)
      return
    }

    const container = containerRef.current
    if (container.clientHeight === 0) {
      updateThumb(0, 0)
      return
    }

    // Determine which IDs to use - activeIds if available, otherwise fallback to lastActiveIdRef
    let effectiveActiveIds = activeIds
    if (activeIds.length === 0 && lastActiveIdRef?.current) {
      // Use last active ID as fallback when nothing is visible
      effectiveActiveIds = [lastActiveIdRef.current]
    }

    if (effectiveActiveIds.length === 0) {
      updateThumb(0, 0)
      return
    }

    let upper = Number.MAX_VALUE
    let lower = 0

    for (const id of effectiveActiveIds) {
      const element = container.querySelector<HTMLElement>(`a[href="#${id}"]`)
      if (!element) continue

      const styles = getComputedStyle(element)
      upper = Math.min(upper, element.offsetTop + parseFloat(styles.paddingTop))
      lower = Math.max(
        lower,
        element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom)
      )
    }

    if (upper === Number.MAX_VALUE) {
      updateThumb(0, 0)
    } else {
      updateThumb(upper, lower - upper)
    }
  }, [containerRef, activeIds, updateThumb, lastActiveIdRef])

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const observer = new ResizeObserver(calculateThumb)
    observer.observe(container)

    calculateThumb()

    return () => {
      observer.disconnect()
    }
  }, [calculateThumb])

  useEffect(() => {
    calculateThumb()
  }, [activeIds, calculateThumb])

  return (
    <div
      ref={thumbRef}
      role="none"
      className="absolute top-0 w-px bg-primary transition-[translate,height] ease-linear"
      style={{
        transform: `translateY(var(--normal-top, 0px))`,
        height: "var(--normal-height, 0px)",
      }}
    />
  )
})
NormalThumb.displayName = "NormalThumb"

interface NormalTableOfContentsItemProps {
  item: TOCItem
  isVisible?: boolean
}

const NormalTableOfContentsItem = React.memo(
  ({ item, isVisible = false }: NormalTableOfContentsItemProps) => {
    const context = useContext(TableOfContentsContext)
    const { onItemClick } = context!

    // Only highlight if item is actually visible in viewport
    const isActive = isVisible

    // Padding based on depth (matching fumadocs)
    const paddingLeft = item.level <= 2 ? 12 : item.level === 3 ? 24 : 32

    return (
      <a
        href={`#${item.id}`}
        onClick={(e) => {
          e.preventDefault()
          onItemClick(item.id)
        }}
        style={{
          paddingInlineStart: `${paddingLeft}px`,
        }}
        className={cn(
          "prose relative py-1.5 text-sm transition-colors wrap-anywhere first:pt-0 last:pb-0",
          "text-muted-foreground hover:text-foreground dark:hover:text-foreground",
          "data-[active=true]:text-primary",
          "no-underline hover:no-underline"
        )}
        data-active={isActive}
      >
        {item.label}
      </a>
    )
  }
)
NormalTableOfContentsItem.displayName = "NormalTableOfContentsItem"

// Circuit Variant Components (Clerk Style)

// Helper functions for depth-based offsets (matching Clerk style)
function getItemOffset(depth: number): number {
  if (depth <= 2) return 14
  if (depth === 3) return 26
  return 36
}

function getLineOffset(depth: number): number {
  return depth >= 3 ? 10 : 0
}

// Circuit Thumb Component (animated indicator)
interface CircuitThumbProps {
  containerRef: React.RefObject<HTMLElement | null>
  activeIds: string[]
  className?: string
  lastActiveIdRef?: React.MutableRefObject<string | null>
  items?: (TOCItem & { parentId?: string })[]
}

const CircuitThumb = React.memo(({ containerRef, activeIds, className, lastActiveIdRef, items: _items }: CircuitThumbProps) => {
  const thumbRef = useRef<HTMLDivElement>(null)
  const [thumbPosition, setThumbPosition] = React.useState<{ top: number; height: number }>({
    top: 0,
    height: 0,
  })

  const updateThumb = React.useCallback((top: number, height: number): void => {
    setThumbPosition({ top, height })
  }, [])

  const calculateThumb = React.useCallback((): void => {
    if (!containerRef.current) {
      updateThumb(0, 0)
      return
    }

    const container = containerRef.current
    if (container.clientHeight === 0) {
      updateThumb(0, 0)
      return
    }

    // Determine which IDs to use - activeIds if available, otherwise fallback to lastActiveIdRef
    let effectiveActiveIds = activeIds
    if (activeIds.length === 0 && lastActiveIdRef?.current) {
      // Use last active ID as fallback when nothing is visible
      effectiveActiveIds = [lastActiveIdRef.current]
    }

    if (effectiveActiveIds.length === 0) {
      updateThumb(0, 0)
      return
    }

    let upper = Number.MAX_VALUE
    let lower = 0

    for (const id of effectiveActiveIds) {
      const element = container.querySelector<HTMLElement>(`a[href="#${id}"]`)
      if (!element) continue

      const styles = getComputedStyle(element)
      const paddingTop = parseFloat(styles.paddingTop)
      const paddingBottom = parseFloat(styles.paddingBottom)
      const elementTop = element.offsetTop + paddingTop
      const elementBottom = element.offsetTop + element.clientHeight - paddingBottom

      upper = Math.min(upper, elementTop)
      lower = Math.max(lower, elementBottom)
    }

    if (upper === Number.MAX_VALUE) {
      updateThumb(0, 0)
    } else {
      updateThumb(upper, lower - upper)
    }
  }, [containerRef, activeIds, updateThumb, lastActiveIdRef])

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const observer = new ResizeObserver(() => {
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        calculateThumb()
      })
    })
    observer.observe(container)

    // Initial calculation
    requestAnimationFrame(() => {
      calculateThumb()
    })

    return () => {
      observer.disconnect()
    }
  }, [calculateThumb])

  // Recalculate thumb when activeIds change
  useEffect(() => {
    requestAnimationFrame(() => {
      calculateThumb()
    })
  }, [activeIds, calculateThumb])

  return (
    <div
      ref={thumbRef}
      role="none"
      className={cn("absolute w-full bg-primary transition-[top,height] ease-linear", className)}
      style={{
        top: `${thumbPosition.top}px`,
        height: `${thumbPosition.height}px`,
      }}
    />
  )
})
CircuitThumb.displayName = "CircuitThumb"

interface CircuitTableOfContentsListProps {
  items: (TOCItem & { parentId?: string })[]
  activePathIds: Set<string>
  visibleIds?: string[]
  lastActiveIdRef?: React.MutableRefObject<string | null>
}

const CircuitTableOfContentsList = React.memo(
  ({ items, activePathIds: _activePathIds, visibleIds = [], lastActiveIdRef }: CircuitTableOfContentsListProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    const [svg, setSvg] = useState<{
      path: string
      width: number
      height: number
    }>()

    // Use visibleIds directly for thumb calculation

    useEffect(() => {
      if (!containerRef.current) return
      const container = containerRef.current

      function onResize(): void {
        // Defensive check for container dimensions
        if (container.clientHeight === 0 || container.clientWidth === 0) return

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          // Double-check dimensions after RAF
          if (container.clientHeight === 0 || container.clientWidth === 0) return

          let w = 0
          let h = 0
          const d: string[] = []

          for (let i = 0; i < items.length; i++) {
            const element: HTMLElement | null = container.querySelector(`a[href="#${items[i].id}"]`)
            if (!element) continue

            const styles = getComputedStyle(element)
            const offset = getLineOffset(items[i].level) + 1
            const top = element.offsetTop + parseFloat(styles.paddingTop)
            const bottom =
              element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom)

            w = Math.max(offset, w)
            h = Math.max(h, bottom)

            // Create continuous path: move to top, line to bottom
            d.push(`${i === 0 ? "M" : "L"}${offset} ${top}`)
            d.push(`L${offset} ${bottom}`)
          }

          setSvg({
            path: d.join(" "),
            width: w + 1,
            height: h,
          })
        })
      }

      const observer = new ResizeObserver(onResize)

      // Add small delay for initial render to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        onResize()
      }, 50)

      observer.observe(container)
      return () => {
        clearTimeout(timeoutId)
        observer.disconnect()
      }
    }, [items])

    return (
      <>
        {svg && (
          <>
            {/* Base line structure (always visible) */}
            <svg
              className="absolute start-0 top-0 rtl:-scale-x-100 pointer-events-none"
              width={svg.width}
              height={svg.height}
              style={{
                zIndex: 0,
                color: "color-mix(in oklch, var(--foreground) 15%, transparent)",
              }}
              aria-hidden="true"
            >
              <path
                d={svg.path}
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* Thumb indicator (masked by path) */}
            <div
              className="absolute start-0 top-0 rtl:-scale-x-100"
              style={{
                width: svg.width,
                height: svg.height,
                maskImage: `url("data:image/svg+xml,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`
                )}")`,
                zIndex: 1,
              }}
            >
              <CircuitThumb containerRef={containerRef} activeIds={visibleIds} lastActiveIdRef={lastActiveIdRef} items={items} />
            </div>
          </>
        )}
        <div ref={containerRef} className="flex flex-col">
          {items.map((item, i) => {
            // Calculate if item should be highlighted (use lastActiveIdRef as fallback)
            const currentLastActiveId = lastActiveIdRef?.current
            const isHighlighted = visibleIds.length > 0
              ? visibleIds.includes(item.id)
              : currentLastActiveId === item.id

            return (
              <CircuitTableOfContentsItem
                key={item.id}
                item={item}
                upper={items[i - 1]?.level}
                lower={items[i + 1]?.level}
                isVisible={isHighlighted}
              />
            )
          })}
        </div>
      </>
    )
  }
)
CircuitTableOfContentsList.displayName = "CircuitTableOfContentsList"

interface CircuitTableOfContentsItemProps {
  item: TOCItem
  upper?: number
  lower?: number
  isVisible?: boolean
}

const CircuitTableOfContentsItem = React.memo(
  ({ item, upper = item.level, lower = item.level, isVisible = false }: CircuitTableOfContentsItemProps) => {
    const context = useContext(TableOfContentsContext)
    const { onItemClick } = context!

    // Only highlight if item is actually visible in viewport
    const isActive = isVisible
    const offset = getLineOffset(item.level)
    const upperOffset = getLineOffset(upper)
    const lowerOffset = getLineOffset(lower)

    return (
      <a
        href={`#${item.id}`}
        onClick={(e) => {
          e.preventDefault()
          onItemClick(item.id)
        }}
        style={{
          paddingInlineStart: getItemOffset(item.level),
        }}
        className={cn(
          "prose relative py-1.5 text-sm transition-colors wrap-anywhere first:pt-0 last:pb-0",
          "text-muted-foreground",
          "hover:text-foreground dark:hover:text-foreground",
          "data-[active=true]:text-primary",
          "no-underline hover:no-underline"
        )}
        data-active={isActive}
      >
        {/* Horizontal connector when depth changes */}
        {offset !== upperOffset && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100"
          >
            <line
              x1={upperOffset}
              y1="0"
              x2={offset}
              y2="12"
              className="stroke-foreground/10"
              strokeWidth="1"
            />
          </svg>
        )}
        {/* Vertical line indicator - individual item line (backup, main line is in SVG) */}
        <div
          className={cn(
            "absolute inset-y-0 w-px",
            offset !== upperOffset && "top-1.5",
            offset !== lowerOffset && "bottom-1.5"
          )}
          style={{
            insetInlineStart: `${offset}px`,
            backgroundColor: "color-mix(in oklch, var(--foreground) 15%, transparent)",
          }}
        />
        {item.label}
      </a>
    )
  }
)
CircuitTableOfContentsItem.displayName = "CircuitTableOfContentsItem"

// Clerk Variant Components (Enhanced Clerk Style with Corner Radius)

const CORNER_RADIUS = 4
const MIN_X_OFFSET = 4

// Helper functions for depth-based offsets (matching reference implementation)
function getClerkLineOffset(depth: number): number {
  return depth <= 2 ? 0 : 13
}

function getClerkItemOffset(depth: number): number {
  if (depth <= 2) return 15
  if (depth === 3) return 27
  return 39
}

// Helper function to calculate X position along path based on Y position
function getCircleX(segments: { offset: number; top: number; bottom: number }[], y: number): number {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const nextSeg = segments[i + 1]

    if (y >= seg.top && y <= seg.bottom) return seg.offset

    if (nextSeg && y > seg.bottom && y < nextSeg.top) {
      const t = (y - seg.bottom) / (nextSeg.top - seg.bottom)
      return seg.offset + t * (nextSeg.offset - seg.offset)
    }
  }
  return segments[segments.length - 1]?.offset ?? 1
}

interface ClerkThumbProps {
  containerRef: React.RefObject<HTMLElement | null>
  activeIds: string[]
  items: (TOCItem & { parentId?: string })[]
  className?: string
  onCircleYChange?: (y: number) => void
  lastActiveIdRef?: React.MutableRefObject<string | null>
}

interface ClerkThumbCircleProps {
  circleX: number
  circleY: number
  opacity: number
}

const ClerkThumb = React.memo(({ containerRef, activeIds, items, className, onCircleYChange, lastActiveIdRef }: ClerkThumbProps) => {
  const thumbRef = useRef<HTMLDivElement>(null)
  const [thumbPosition, setThumbPosition] = React.useState<{ top: number; height: number; circleY: number }>({
    top: 0,
    height: 0,
    circleY: 0,
  })

  const updateThumb = React.useCallback((top: number, height: number, circleY: number): void => {
    setThumbPosition({ top, height, circleY })
    onCircleYChange?.(circleY)
  }, [onCircleYChange])

  const calculateThumb = React.useCallback((): void => {
    if (!containerRef.current) {
      updateThumb(0, 0, 0)
      return
    }

    const container = containerRef.current
    if (container.clientHeight === 0) {
      updateThumb(0, 0, 0)
      return
    }

    // Determine which IDs to use - activeIds if available, otherwise fallback to lastActiveIdRef
    let effectiveActiveIds = activeIds
    if (activeIds.length === 0 && lastActiveIdRef?.current) {
      // Use last active ID as fallback when nothing is visible
      effectiveActiveIds = [lastActiveIdRef.current]
    }

    if (effectiveActiveIds.length === 0) {
      updateThumb(0, 0, 0)
      return
    }

    // Find last active index (most recent active item)
    let lastActiveIndex = -1
    for (let i = 0; i < items.length; i++) {
      if (effectiveActiveIds.includes(items[i].id)) {
        lastActiveIndex = i
      }
    }

    if (lastActiveIndex === -1) {
      updateThumb(0, 0, 0)
      return
    }

    // Get the last active element
    const lastActiveElement = container.querySelector<HTMLElement>(
      `a[href="#${items[lastActiveIndex].id}"]`
    )
    if (!lastActiveElement) {
      updateThumb(0, 0, 0)
      return
    }

    // Calculate center of last active item
    const lastStyles = getComputedStyle(lastActiveElement)
    const paddingTop = parseFloat(lastStyles.paddingTop)
    const paddingBottom = parseFloat(lastStyles.paddingBottom)
    const contentHeight = lastActiveElement.clientHeight - paddingTop - paddingBottom
    const lastItemCenter = lastActiveElement.offsetTop + paddingTop + contentHeight / 2

    // Get the first TOC item (top of container) - fill from top
    const firstElement = container.querySelector<HTMLElement>(
      `a[href="#${items[0]?.id}"]`
    )
    if (!firstElement) {
      updateThumb(0, lastItemCenter, lastItemCenter)
      return
    }

    const firstStyles = getComputedStyle(firstElement)
    const lineStart = firstElement.offsetTop + parseFloat(firstStyles.paddingTop)

    // Thumb fills from top (lineStart) to center of last active item
    const height = lastItemCenter - lineStart
    updateThumb(lineStart, Math.max(0, height), lastItemCenter)
  }, [containerRef, activeIds, items, updateThumb, lastActiveIdRef])

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        calculateThumb()
      })
    })
    observer.observe(container)

    requestAnimationFrame(() => {
      calculateThumb()
    })

    return () => {
      observer.disconnect()
    }
  }, [calculateThumb])

  useEffect(() => {
    requestAnimationFrame(() => {
      calculateThumb()
    })
  }, [activeIds, calculateThumb])

  return (
    <div
      ref={thumbRef}
      role="none"
      className={cn("absolute w-full bg-primary transition-[top,height] duration-150 ease-out", className)}
      style={{
        top: `${thumbPosition.top}px`,
        height: `${thumbPosition.height}px`,
      }}
    />
  )
})
ClerkThumb.displayName = "ClerkThumb"

const ClerkThumbCircle = React.memo(({ circleX, circleY, opacity }: ClerkThumbCircleProps) => {
  return (
    <div
      role="none"
      aria-hidden="true"
      className="bg-primary pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left,top,opacity] duration-150 ease-out"
      style={{
        left: `${circleX}px`,
        top: `${circleY}px`,
        opacity,
      }}
    />
  )
})
ClerkThumbCircle.displayName = "ClerkThumbCircle"

interface ClerkTableOfContentsListProps {
  items: (TOCItem & { parentId?: string })[]
  activePathIds: Set<string>
  visibleIds?: string[]
  lastActiveIdRef?: React.MutableRefObject<string | null>
}

const ClerkTableOfContentsList = React.memo(
  ({ items, activePathIds: _activePathIds, visibleIds = [], lastActiveIdRef }: ClerkTableOfContentsListProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    const [svg, setSvg] = useState<{
      path: string
      width: number
      height: number
      segments: { offset: number; top: number; bottom: number }[]
    }>()
    const [circleY, setCircleY] = React.useState<number>(0)
    const [circleOpacity, setCircleOpacity] = React.useState<number>(0)

    // Calculate which items should be highlighted (from first item to last active item)
    const highlightedIds = React.useMemo(() => {
      // Use ref value for immediate access (avoids state update delays)
      const currentLastActiveId = lastActiveIdRef?.current

      // Determine which ID to use for highlighting
      let targetId: string | null = null

      if (visibleIds.length > 0) {
        // Find last active index from visibleIds
        let lastActiveIndex = -1
        for (let i = 0; i < items.length; i++) {
          if (visibleIds.includes(items[i].id)) {
            lastActiveIndex = i
          }
        }
        if (lastActiveIndex >= 0) {
          targetId = items[lastActiveIndex].id
        }
      } else if (currentLastActiveId) {
        // Fallback to remembered last active ID when nothing is visible
        targetId = currentLastActiveId
      }

      if (!targetId) {
        return new Set<string>()
      }

      // Find the index of the target ID
      const targetIndex = items.findIndex(item => item.id === targetId)
      if (targetIndex === -1) {
        return new Set<string>()
      }

      // Highlight all items from index 0 to targetIndex (inclusive)
      const highlighted = new Set<string>()
      for (let i = 0; i <= targetIndex; i++) {
        highlighted.add(items[i].id)
      }

      return highlighted
    }, [items, visibleIds, lastActiveIdRef])

    useEffect(() => {
      if (!containerRef.current) return
      const container = containerRef.current

      function onResize(): void {
        if (container.clientHeight === 0 || container.clientWidth === 0) return

        requestAnimationFrame(() => {
          if (container.clientHeight === 0 || container.clientWidth === 0) return

          let w = 0
          let h = 0
          const d: string[] = []
          const segments: { offset: number; top: number; bottom: number }[] = []

          // Build segments array
          for (let i = 0; i < items.length; i++) {
            const element: HTMLElement | null = container.querySelector(`a[href="#${items[i].id}"]`)
            if (!element) continue

            const styles = getComputedStyle(element)
            const offset = Math.max(MIN_X_OFFSET, getClerkLineOffset(items[i].level) + 1)
            const top = element.offsetTop + parseFloat(styles.paddingTop)
            const paddingBottom = parseFloat(styles.paddingBottom)
            const bottom = element.offsetTop + element.clientHeight - paddingBottom

            w = Math.max(offset, w)
            h = Math.max(h, bottom)
            segments.push({ offset, top, bottom })
          }

          // Build path with corner radius
          for (let i = 0; i < segments.length; i++) {
            const seg = segments[i]
            const prevSeg = segments[i - 1]
            const nextSeg = segments[i + 1]

            if (i === 0) {
              d.push(`M${seg.offset} ${seg.top}`)
            } else if (prevSeg && seg.offset !== prevSeg.offset) {
              // Corner at top: quadratic curve
              d.push(`Q${seg.offset} ${seg.top},${seg.offset} ${seg.top + CORNER_RADIUS}`)
            } else {
              d.push(`L${seg.offset} ${seg.top}`)
            }

            if (nextSeg && seg.offset !== nextSeg.offset) {
              // Corner at bottom: diagonal transition with quadratic curve
              const cornerBottom = seg.bottom
              d.push(`L${seg.offset} ${cornerBottom - CORNER_RADIUS}`)
              const nextTop = nextSeg.top
              const dx = nextSeg.offset - seg.offset
              const dy = nextTop - cornerBottom
              const diagLength = Math.sqrt(dx * dx + dy * dy)
              const ratio = Math.min(CORNER_RADIUS / diagLength, 0.5)
              const midX = seg.offset + dx * ratio
              const midY = cornerBottom + dy * ratio
              d.push(`Q${seg.offset} ${cornerBottom},${midX} ${midY}`)
              const endRatio = 1 - Math.min(CORNER_RADIUS / diagLength, 0.5)
              const endX = seg.offset + dx * endRatio
              const endY = cornerBottom + dy * endRatio
              d.push(`L${endX} ${endY}`)
            } else {
              d.push(`L${seg.offset} ${seg.bottom}`)
            }
          }

          setSvg({
            path: d.join(" "),
            width: w + 1,
            height: h,
            segments,
          })
        })
      }

      const observer = new ResizeObserver(onResize)
      const timeoutId = setTimeout(() => {
        onResize()
      }, 50)

      observer.observe(container)
      return () => {
        clearTimeout(timeoutId)
        observer.disconnect()
      }
    }, [items])

    return (
      <>
        {svg && (
          <>
            {/* Base line structure (always visible) */}
            <svg
              className="absolute start-0 top-0 rtl:-scale-x-100 pointer-events-none"
              width={svg.width + 3}
              height={svg.height + 3}
              style={{
                zIndex: 0,
                color: "color-mix(in oklch, var(--foreground) 15%, transparent)",
              }}
              aria-hidden="true"
            >
              <path
                d={svg.path}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* Thumb indicator (masked by path) */}
            <div
              className="absolute start-0 top-0 rtl:-scale-x-100"
              style={{
                width: svg.width,
                height: svg.height,
                maskImage: `url("data:image/svg+xml,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none" /></svg>`
                )}")`,
                zIndex: 1,
              }}
              >
              <ClerkThumb
                containerRef={containerRef}
                activeIds={visibleIds}
                items={items}
                lastActiveIdRef={lastActiveIdRef}
                onCircleYChange={(y) => {
                  setCircleY(y)
                  setCircleOpacity(y > 0 ? 1 : 0)
                }}
              />
            </div>
          </>
        )}
        {svg && svg.segments && circleY > 0 && (
          <ClerkThumbCircle
            circleX={getCircleX(svg.segments, circleY)}
            circleY={circleY}
            opacity={circleOpacity}
          />
        )}
        <div ref={containerRef} className="flex flex-col">
          {items.map((item, i) => (
            <ClerkTableOfContentsItem
              key={item.id}
              item={item}
              upper={items[i - 1]?.level}
              lower={items[i + 1]?.level}
              isVisible={highlightedIds.has(item.id)}
            />
          ))}
        </div>
      </>
    )
  }
)
ClerkTableOfContentsList.displayName = "ClerkTableOfContentsList"

interface ClerkTableOfContentsItemProps {
  item: TOCItem
  upper?: number
  lower?: number
  isVisible?: boolean
}

const ClerkTableOfContentsItem = React.memo(
  ({ item, upper: _upper = item.level, lower: _lower = item.level, isVisible = false }: ClerkTableOfContentsItemProps) => {
    const context = useContext(TableOfContentsContext)
    const { onItemClick } = context!

    const isActive = isVisible

    return (
      <a
        href={`#${item.id}`}
        onClick={(e) => {
          e.preventDefault()
          onItemClick(item.id)
        }}
        style={{
          paddingInlineStart: getClerkItemOffset(item.level),
        }}
        className={cn(
          "prose relative py-1.5 text-sm transition-colors duration-150 ease-out wrap-anywhere first:pt-0 last:pb-0",
          "text-muted-foreground",
          "hover:text-foreground dark:hover:text-foreground",
          "data-[active=true]:text-primary",
          "no-underline hover:no-underline"
        )}
        data-active={isActive}
      >
        {item.label}
      </a>
    )
  }
)
ClerkTableOfContentsItem.displayName = "ClerkTableOfContentsItem"

export { TableOfContents }

