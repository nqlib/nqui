import { useState, useEffect, useRef, useCallback } from "react"

// Helper function moved outside to avoid recreation
const getHeadingLevel = (el: Element): number => {
  const match = el.tagName.match(/^H(\d)$/i)
  return match ? parseInt(match[1], 10) : 0
}

interface UseScrollSpyOptions {
  /**
   * CSS selector for elements to observe (e.g., "h1, h2, h3")
   */
  selector?: string
  /**
   * Root margin for Intersection Observer (e.g., "-100px 0px -66%")
   */
  rootMargin?: string
  /**
   * Threshold for Intersection Observer (0-1)
   */
  threshold?: number | number[]
  /**
   * Offset from top of viewport to consider element active
   */
  offset?: number
  /**
   * Whether scroll spy is enabled
   */
  enabled?: boolean
  /**
   * Container element to scope element detection and use as root for Intersection Observer.
   * If provided, only elements within this container will be observed, and scrolling
   * will be tracked relative to this container's viewport.
   * If not provided, uses document viewport (default behavior).
   */
  container?: HTMLElement | null
}

interface UseScrollSpyReturn {
  /**
   * Currently active element ID (first visible item for backward compatibility)
   */
  activeId: string | null
  /**
   * Array of all visible element IDs in viewport
   */
  visibleIds: string[]
  /**
   * Manually set the active ID (overrides scroll spy)
   */
  setActiveId: (id: string | null) => void
}

/**
 * Hook to detect which element is currently in viewport using Intersection Observer
 * Supports manual override via setActiveId
 */
export function useScrollSpy({
  selector = "h1, h2, h3, h4, h5, h6",
  rootMargin = "-100px 0px -66%",
  threshold = 0,
  offset = 0,
  enabled = true,
  container = null,
}: UseScrollSpyOptions = {}): UseScrollSpyReturn {
  const [activeId, setActiveIdState] = useState<string | null>(null)
  const [visibleIds, setVisibleIds] = useState<string[]>([])
  const [manualId, setManualId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const visibleObserverRef = useRef<IntersectionObserver | null>(null)
  const contentSectionObserverRef = useRef<IntersectionObserver | null>(null)
  const elementsRef = useRef<Map<string, Element>>(new Map())
  const contentSectionsRef = useRef<Map<string, Element>>(new Map()) // Maps heading ID to its content section sentinel
  const visibleSetRef = useRef<Set<string>>(new Set())
  const contentVisibleSetRef = useRef<Set<string>>(new Set()) // Headings whose content sections are visible

  // Manual override function
  const setActiveId = useCallback((id: string | null) => {
    setManualId(id)
    setActiveIdState(id)
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Determine root element for querying
    const rootElement = container || document

    // Find all elements matching the selector within the container
    const elements = Array.from(rootElement.querySelectorAll(selector))

    if (elements.length === 0) {
      return
    }

    // Store elements in map for quick lookup
    elementsRef.current.clear()
    contentSectionsRef.current.clear()

    // Helper to get heading level from tag name (h1 = 1, h2 = 2, etc.)
    // Now using module-level function

    // Create content section sentinels for each heading
    // A content section is everything from a heading until the next heading of same or higher level
    elements.forEach((el, index) => {
      const id = el.id || el.getAttribute("data-id") || el.textContent?.trim().toLowerCase().replace(/\s+/g, "-") || ""
      if (id) {
        elementsRef.current.set(id, el)
        // Ensure element has an ID
        if (!el.id && !el.getAttribute("data-id")) {
          el.id = id
        }

        // Find the next heading of same or higher level to determine content section boundary
        const currentLevel = getHeadingLevel(el)
        let contentEnd: Element | null = null

        // Look ahead to find the next heading of same or higher level
        for (let i = index + 1; i < elements.length; i++) {
          const nextEl = elements[i]
          const nextLevel = getHeadingLevel(nextEl)
          if (nextLevel > 0 && nextLevel <= currentLevel) {
            contentEnd = nextEl
            break
          }
        }

        // Create a sentinel element right before the next heading (or at end of document)
        // This sentinel marks the end of this heading's content section
        if (contentEnd) {
          // Check if sentinel already exists
          let sentinel = document.querySelector(`[data-content-section="${id}"]`) as HTMLElement | null
          if (!sentinel) {
            sentinel = document.createElement("div")
            sentinel.setAttribute("data-content-section", id)
            sentinel.style.position = "absolute"
            sentinel.style.width = "1px"
            sentinel.style.height = "1px"
            sentinel.style.pointerEvents = "none"
            sentinel.style.visibility = "hidden"
            // Insert sentinel right before the next heading
            contentEnd.parentElement?.insertBefore(sentinel, contentEnd)
          }
          contentSectionsRef.current.set(id, sentinel)
        } else {
          // Last heading - create sentinel at end of document body
          let sentinel = document.querySelector(`[data-content-section="${id}"]`) as HTMLElement | null
          if (!sentinel) {
            sentinel = document.createElement("div")
            sentinel.setAttribute("data-content-section", id)
            sentinel.style.position = "absolute"
            sentinel.style.width = "1px"
            sentinel.style.height = "1px"
            sentinel.style.pointerEvents = "none"
            sentinel.style.visibility = "hidden"
            document.body.appendChild(sentinel)
          }
          contentSectionsRef.current.set(id, sentinel)
        }
      }
    })

    // Create Intersection Observer for activeId (backward compatibility)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Only update if not manually overridden
        if (manualId !== null) {
          return
        }

        // Find the entry with the highest intersection ratio
        let maxRatio = -1
        let maxEntry: IntersectionObserverEntry | null = null

        for (const entry of entries) {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            maxEntry = entry
          }
        }

        // If we have an entry in view, use it
        if (maxEntry && maxEntry.isIntersecting) {
          const id = maxEntry.target.id || maxEntry.target.getAttribute("data-id") || ""
          if (id) {
            setActiveIdState(id)
          }
        } else {
          // Fallback: find the first element above viewport
          const viewportTop = container ? container.getBoundingClientRect().top : 0
          const sortedElements = Array.from(elementsRef.current.entries())
            .map(([id, el]) => ({ id, el, rect: el.getBoundingClientRect() }))
            .filter(({ rect }) => {
              const relativeTop = container ? rect.top - viewportTop : rect.top
              return relativeTop <= offset + 100
            })
            .sort((a, b) => {
              const aTop = container ? a.rect.top - viewportTop : a.rect.top
              const bTop = container ? b.rect.top - viewportTop : b.rect.top
              return bTop - aTop
            })

          if (sortedElements.length > 0) {
            setActiveIdState(sortedElements[0].id)
          }
        }
      },
      {
        root: container || null,
        rootMargin,
        threshold,
      }
    )

    // Create separate Intersection Observer for visibleIds (tracks all visible items)
    // Uses fumadocs-style settings: threshold 0.98, rootMargin '0px'
    visibleObserverRef.current = new IntersectionObserver(
      (entries) => {
        // Only update if not manually overridden
        if (manualId !== null) {
          return
        }

        const visibleSet = visibleSetRef.current

        // Update visible set based on intersection entries
        entries.forEach((entry) => {
          const id = entry.target.id || entry.target.getAttribute("data-id") || ""
          if (!id) return

          if (entry.isIntersecting) {
            visibleSet.add(id)
          } else {
            visibleSet.delete(id)
          }
        })

        // Merge heading visibility with content section visibility
        const allVisible = new Set(visibleSet)
        contentVisibleSetRef.current.forEach((id) => allVisible.add(id))

        // Convert to array and update state
        const visibleArray = Array.from(allVisible)

        setVisibleIds(visibleArray)

        // Update activeId to first visible item if no activeId is set
        if (visibleArray.length > 0 && !activeId) {
          setActiveIdState(visibleArray[0])
        }
      },
      {
        root: container || null,
        rootMargin: "0px",
        threshold: 0.98,
      }
    )

    // Create Intersection Observer for content sections
    // Observes sentinel elements that mark the end of each heading's content section
    contentSectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        // Only update if not manually overridden
        if (manualId !== null) {
          return
        }

        const contentVisibleSet = contentVisibleSetRef.current

        // Update content section visibility based on sentinel intersections
        entries.forEach((entry) => {
          const headingId = entry.target.getAttribute("data-content-section")
          if (!headingId) return

          // Check if heading itself is already visible (to avoid double-counting)
          const headingIsVisible = visibleSetRef.current.has(headingId)

          // If heading is visible, don't mark content section as visible (heading observer handles it)
          if (headingIsVisible) {
            contentVisibleSet.delete(headingId)
            return
          }

          // Content section is visible if we haven't scrolled past the sentinel yet
          // The sentinel marks the end of the content section
          const rect = entry.target.getBoundingClientRect()
          const containerRect = container ? container.getBoundingClientRect() : null
          const viewportTop = container ? containerRect!.top : 0
          const viewportBottom = container ? containerRect!.bottom : window.innerHeight

          // Get the heading element to check its position
          const headingEl = elementsRef.current.get(headingId)
          const headingRect = headingEl ? headingEl.getBoundingClientRect() : null

          // Content section is visible if:
          // 1. Heading is not visible (we've scrolled past it), AND
          // 2. Sentinel is above viewport bottom (we haven't scrolled past the content section yet)
          // This means: heading is above viewport AND sentinel is below viewport top
          const headingIsAboveViewport = headingRect ? headingRect.bottom < viewportTop : false
          const sentinelIsBelowViewportTop = rect.top > viewportTop
          const sentinelIsAboveViewportBottom = rect.top < viewportBottom

          // Content section is visible if heading is scrolled past but sentinel is still in/above viewport
          if (headingIsAboveViewport && sentinelIsBelowViewportTop && sentinelIsAboveViewportBottom) {
            contentVisibleSet.add(headingId)
          } else {
            contentVisibleSet.delete(headingId)
          }
        })

        // Trigger update of visibleIds by merging with heading visibility
        const visibleSet = visibleSetRef.current
        const allVisible = new Set(visibleSet)
        contentVisibleSetRef.current.forEach((id) => allVisible.add(id))
        const visibleArray = Array.from(allVisible)
        setVisibleIds(visibleArray)
      },
      {
        root: container || null,
        rootMargin: "0px",
        threshold: 0,
      }
    )

    // Observe all elements with both observers
    elements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el)
      }
      if (visibleObserverRef.current) {
        visibleObserverRef.current.observe(el)
      }
    })

    // Observe all content section sentinels
    contentSectionsRef.current.forEach((sentinel) => {
      if (contentSectionObserverRef.current) {
        contentSectionObserverRef.current.observe(sentinel)
      }
    })

    // Initial check for active element and visible elements
    const checkInitialActive = () => {
      if (manualId !== null) {
        return
      }

      const containerRect = container ? container.getBoundingClientRect() : null
      const viewportHeight = container ? container.clientHeight : window.innerHeight
      const viewportTop = container ? containerRect!.top : 0
      const viewportBottom = container ? containerRect!.bottom : window.innerHeight

      const sortedElements = Array.from(elementsRef.current.entries())
        .map(([id, el]) => ({ id, el, rect: el.getBoundingClientRect() }))
        .filter(({ rect }) => {
          const relativeTop = container ? rect.top - viewportTop : rect.top
          return relativeTop <= viewportHeight / 2
        })
        .sort((a, b) => {
          const aTop = container ? a.rect.top - viewportTop : a.rect.top
          const bTop = container ? b.rect.top - viewportTop : b.rect.top
          return bTop - aTop
        })

      if (sortedElements.length > 0) {
        setActiveIdState(sortedElements[0].id)
      }

      // Check for initially visible elements (headings)
      const initiallyVisible: string[] = []
      elementsRef.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect()
        // Element is visible if it intersects with viewport
        if (rect.top < viewportBottom && rect.bottom > viewportTop) {
          initiallyVisible.push(id)
        }
      })

      // Check for initially visible content sections
      // Only mark as visible if heading itself is not visible
      const initiallyVisibleContent: string[] = []
      contentSectionsRef.current.forEach((sentinel, headingId) => {
        // Skip if heading is already visible
        if (initiallyVisible.includes(headingId)) {
          return
        }
        const headingEl = elementsRef.current.get(headingId)
        const headingRect = headingEl ? headingEl.getBoundingClientRect() : null
        const sentinelRect = sentinel.getBoundingClientRect()

        // Content section is visible if heading is scrolled past but sentinel is still in viewport
        const headingIsAboveViewport = headingRect ? headingRect.bottom < viewportTop : false
        const sentinelIsBelowViewportTop = sentinelRect.top > viewportTop
        const sentinelIsAboveViewportBottom = sentinelRect.top < viewportBottom

        if (headingIsAboveViewport && sentinelIsBelowViewportTop && sentinelIsAboveViewportBottom) {
          initiallyVisibleContent.push(headingId)
        }
      })

      // Merge heading and content section visibility
      const allInitiallyVisible = new Set([...initiallyVisible, ...initiallyVisibleContent])
      if (allInitiallyVisible.size > 0) {
        setVisibleIds(Array.from(allInitiallyVisible))
        visibleSetRef.current = new Set(initiallyVisible)
        contentVisibleSetRef.current = new Set(initiallyVisibleContent)
      }
    }

    // Check after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(checkInitialActive, 100)

    // Add scroll listener to update content section visibility on scroll
    // IntersectionObserver might not fire frequently enough for smooth updates
    const updateContentSectionVisibility = () => {
      if (manualId !== null) {
        return
      }

      const containerRect = container ? container.getBoundingClientRect() : null
      const viewportTop = container ? containerRect!.top : 0
      const viewportBottom = container ? containerRect!.bottom : window.innerHeight
      let hasChanges = false

      // Check each content section
      contentSectionsRef.current.forEach((sentinel, headingId) => {
        // Skip if heading is already visible
        if (visibleSetRef.current.has(headingId)) {
          if (contentVisibleSetRef.current.has(headingId)) {
            contentVisibleSetRef.current.delete(headingId)
            hasChanges = true
          }
          return
        }

        const headingEl = elementsRef.current.get(headingId)
        const headingRect = headingEl ? headingEl.getBoundingClientRect() : null
        const sentinelRect = sentinel.getBoundingClientRect()

        // Content section is visible if heading is scrolled past but sentinel is still in viewport
        const headingIsAboveViewport = headingRect ? headingRect.bottom < viewportTop : false
        const sentinelIsBelowViewportTop = sentinelRect.top > viewportTop
        const sentinelIsAboveViewportBottom = sentinelRect.top < viewportBottom

        const shouldBeVisible = headingIsAboveViewport && sentinelIsBelowViewportTop && sentinelIsAboveViewportBottom
        const isCurrentlyVisible = contentVisibleSetRef.current.has(headingId)

        if (shouldBeVisible && !isCurrentlyVisible) {
          contentVisibleSetRef.current.add(headingId)
          hasChanges = true
        } else if (!shouldBeVisible && isCurrentlyVisible) {
          contentVisibleSetRef.current.delete(headingId)
          hasChanges = true
        }
      })

      // Only update state if there were changes
      if (!hasChanges) {
        return
      }

      // Merge and update visibleIds
      const visibleSet = visibleSetRef.current
      const allVisible = new Set(visibleSet)
      contentVisibleSetRef.current.forEach((id) => allVisible.add(id))
      const visibleArray = Array.from(allVisible)

      setVisibleIds(visibleArray)
    }

    // Throttle scroll events for performance
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null
    const onScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      scrollTimeout = setTimeout(() => {
        updateContentSectionVisibility()
      }, 16) // ~60fps
    }

    // Use container's scroll event if container is provided, otherwise use window scroll
    const scrollTarget = container || window
    scrollTarget.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      const scrollTarget = container || window
      scrollTarget.removeEventListener("scroll", onScroll)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (visibleObserverRef.current) {
        visibleObserverRef.current.disconnect()
      }
      if (contentSectionObserverRef.current) {
        contentSectionObserverRef.current.disconnect()
      }
      // Clean up sentinel elements
      contentSectionsRef.current.forEach((sentinel) => {
        sentinel.remove()
      })
      elementsRef.current.clear()
      contentSectionsRef.current.clear()
      visibleSetRef.current.clear()
      contentVisibleSetRef.current.clear()
    }
  }, [selector, rootMargin, threshold, offset, enabled, manualId, container])

  // Reset manual override after scroll completes (allows temporary override for smooth scrolling)
  useEffect(() => {
    if (manualId !== null) {
      let scrollTimeout: ReturnType<typeof setTimeout>
      const onScroll = () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          setManualId(null)
        }, 150)
      }

      const scrollTarget = container || window
      scrollTarget.addEventListener("scroll", onScroll, { passive: true })
      const timeoutId = setTimeout(() => {
        setManualId(null)
      }, 500) // Fallback: reset after 500ms if no scroll

      return () => {
        clearTimeout(timeoutId)
        scrollTarget.removeEventListener("scroll", onScroll)
        clearTimeout(scrollTimeout)
      }
    }
  }, [manualId, container])

  return {
    activeId: manualId !== null ? manualId : activeId,
    visibleIds: manualId !== null ? [manualId] : visibleIds,
    setActiveId,
  }
}

