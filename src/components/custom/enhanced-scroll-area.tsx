"use client"

import * as React from "react"
import { useRef, useEffect, useCallback, useState } from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"
import { ScrollBar as BaseScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const SCROLL_THRESHOLD = 2
const FADE_SIZE = 16

export interface EnhancedScrollAreaProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /**
   * Enable fade mask effect at edges - only visible when scrolled (hides when content fits)
   * @default true
   */
  fadeMask?: boolean
  /**
   * Hide the scrollbar while keeping scroll functionality (trackpad/cursor)
   * @default false
   */
  hideScrollbar?: boolean
  /**
   * Scroll orientation
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "both"
  /**
   * Callback when the viewport scrolls (e.g. for DataGrid scroll state sync)
   */
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  /**
   * Ref to the scroll container (Viewport) for resize, IntersectionObserver, etc.
   */
  viewportRef?: React.Ref<HTMLDivElement>
  /**
   * Style for the Viewport (e.g. scrollPadding for DataGrid scroll-into-view)
   */
  viewportStyle?: React.CSSProperties
}

/**
 * Compute dynamic mask-image based on scroll position.
 * Fades only show when there's overflow and user has scrolled (top fade when not at top, bottom fade when not at bottom).
 */
function getMaskStyle(
  el: HTMLDivElement | null,
  fadeMask: boolean,
  orientation: "vertical" | "horizontal" | "both"
): React.CSSProperties {
  if (!el || !fadeMask) return {}

  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = el

  const vertical = orientation === "vertical" || orientation === "both"
  const horizontal = orientation === "horizontal" || orientation === "both"

  const hasVerticalOverflow = scrollHeight > clientHeight + SCROLL_THRESHOLD
  const hasHorizontalOverflow = scrollWidth > clientWidth + SCROLL_THRESHOLD

  if (!hasVerticalOverflow && !hasHorizontalOverflow) {
    return { maskImage: "none", WebkitMaskImage: "none" }
  }

  const masks: string[] = []

  if (vertical && hasVerticalOverflow) {
    const atTop = scrollTop <= SCROLL_THRESHOLD
    const atBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD

    if (atTop && atBottom) {
      masks.push("none")
    } else if (atTop) {
      masks.push(
        `linear-gradient(to bottom, white, white calc(100% - ${FADE_SIZE}px), transparent)`
      )
    } else if (atBottom) {
      masks.push(`linear-gradient(to bottom, transparent, white ${FADE_SIZE}px, white)`)
    } else {
      masks.push(
        `linear-gradient(to bottom, transparent, white ${FADE_SIZE}px, white calc(100% - ${FADE_SIZE}px), transparent)`
      )
    }
  }

  if (horizontal && hasHorizontalOverflow) {
    const atLeft = scrollLeft <= SCROLL_THRESHOLD
    const atRight = scrollLeft + clientWidth >= scrollWidth - SCROLL_THRESHOLD

    if (atLeft && atRight) {
      if (masks.length) masks.push("none")
    } else if (atLeft) {
      masks.push(
        `linear-gradient(to right, white, white calc(100% - ${FADE_SIZE}px), transparent)`
      )
    } else if (atRight) {
      masks.push(`linear-gradient(to right, transparent, white ${FADE_SIZE}px, white)`)
    } else {
      masks.push(
        `linear-gradient(to right, transparent, white ${FADE_SIZE}px, white calc(100% - ${FADE_SIZE}px), transparent)`
      )
    }
  }

  const maskImage = masks.filter((m) => m !== "none").join(", ") || "none"
  return maskImage === "none"
    ? { maskImage: "none", WebkitMaskImage: "none" }
    : { maskImage, WebkitMaskImage: maskImage }
}

/**
 * Enhanced ScrollArea component with scroll-aware fade mask
 *
 * - Fade mask only shows when content overflows and user has scrolled
 * - Top fade: visible when scrolled down from top
 * - Bottom fade: visible when more content below
 * - No mask when content fits (avoids covering content)
 */
const EnhancedScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  EnhancedScrollAreaProps
>(
  (
    {
      className,
      children,
      fadeMask = true,
      hideScrollbar = false,
      orientation = "vertical",
      onScroll,
      viewportRef: viewportRefProp,
      viewportStyle,
      ...props
    },
    ref
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null)

    const setViewportRef = useCallback(
      (el: HTMLDivElement | null) => {
        (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        if (viewportRefProp) {
          if (typeof viewportRefProp === "function") {
            viewportRefProp(el)
          } else {
            (viewportRefProp as React.MutableRefObject<HTMLDivElement | null>).current = el
          }
        }
      },
      [viewportRefProp]
    )
    const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({})

    const updateMask = useCallback(() => {
      setMaskStyle((prev) => {
        const next = getMaskStyle(viewportRef.current, fadeMask, orientation)
        return (
          prev.maskImage === next.maskImage &&
          prev.WebkitMaskImage === next.WebkitMaskImage
        )
          ? prev
          : next
      })
    }, [fadeMask, orientation])

    useEffect(() => {
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

    useEffect(() => {
      if (orientation !== "horizontal" && orientation !== "both") return
      const el = viewportRef.current
      if (!el) return

      const LINE_HEIGHT = 20
      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey) return
        const wX = (e as WheelEvent & { wheelDeltaX?: number }).wheelDeltaX
        const wY = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY
        let deltaX = Number.isFinite(e.deltaX) ? e.deltaX : (wX != null ? -wX : 0)
        let deltaY = Number.isFinite(e.deltaY) ? e.deltaY : (wY != null ? -wY : 0)
        if (e.shiftKey && Math.abs(deltaY) > Math.abs(deltaX)) {
          deltaX = deltaY
          deltaY = 0
        }
        if (e.deltaMode === 1) {
          deltaX *= LINE_HEIGHT
          deltaY *= LINE_HEIGHT
        } else if (e.deltaMode === 2) {
          deltaX *= el.clientWidth
          deltaY *= el.clientHeight
        }
        const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = el
        const canScrollH =
          scrollWidth > clientWidth &&
          (deltaX > 0 ? scrollLeft < scrollWidth - clientWidth : scrollLeft > 0)
        const canScrollV =
          orientation === "both" &&
          scrollHeight > clientHeight &&
          (deltaY > 0 ? scrollTop < scrollHeight - clientHeight : scrollTop > 0)
        if (canScrollH || canScrollV) {
          if (canScrollH) el.scrollLeft += deltaX
          if (canScrollV) el.scrollTop += deltaY
          e.preventDefault()
        }
      }
      el.addEventListener("wheel", onWheel, { passive: false })
      return () => el.removeEventListener("wheel", onWheel)
    }, [orientation])

    const viewportClassName = cn(
      "size-full rounded-[inherit] ring-offset-background outline-none transition-[color,box-shadow,mask-image] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      orientation === "vertical" && "overflow-x-hidden",
      orientation === "horizontal" && "overflow-y-hidden"
    )

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        data-slot="scroll-area"
        className={cn("relative", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          ref={setViewportRef}
          data-slot="scroll-area-viewport"
          className={viewportClassName}
          style={{
            ...(viewportStyle ?? {}),
            ...(fadeMask ? maskStyle : {}),
            ...(orientation === "both"
              ? { touchAction: "pan-x pan-y" }
              : orientation === "horizontal"
                ? { touchAction: "pan-x" }
                : {}),
          }}
          onScroll={onScroll}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        {!hideScrollbar && (orientation === "vertical" || orientation === "both") && (
          <BaseScrollBar orientation="vertical" />
        )}
        {!hideScrollbar && (orientation === "horizontal" || orientation === "both") && (
          <BaseScrollBar orientation="horizontal" />
        )}
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    )
  }
)

EnhancedScrollArea.displayName = "EnhancedScrollArea"

export { EnhancedScrollArea, EnhancedScrollArea as ScrollArea }
export { BaseScrollBar as ScrollBar }

