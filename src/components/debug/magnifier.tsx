"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"

export interface MagnifierProps {
  enabled: boolean
  zoom?: number
  size?: number
  lockedElement?: HTMLElement | null
  onElementChange?: (element: HTMLElement | null) => void
}

export function Magnifier({
  enabled,
  zoom = 3,
  size = 200,
  lockedElement,
  onElementChange
}: MagnifierProps) {
  const location = useLocation()
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = React.useState(false)
  const [sidebarState, setSidebarState] = React.useState<string | null>(null)
  const [debugPanelOpen, setDebugPanelOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const cloneRef = React.useRef<HTMLDivElement | null>(null)
  // Clone body content into viewport for CSS-based magnifier
  // Recreate clone when sidebar state changes to account for layout shifts
  React.useEffect(() => {
    if (!enabled || !isVisible || !viewportRef.current) {
      // Clean up clone when not visible
      if (cloneRef.current && cloneRef.current.parentNode) {
        cloneRef.current.parentNode.removeChild(cloneRef.current)
        cloneRef.current = null
      }
      return
    }

    // Remove old clone if it exists (will be recreated below)
    if (cloneRef.current && cloneRef.current.parentNode) {
      cloneRef.current.parentNode.removeChild(cloneRef.current)
      cloneRef.current = null
    }

    // Wait for layout to settle after sidebar state change
    // Use triple RAF + small delay to ensure React has finished DOM updates
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Additional small delay to ensure React has finished removing/adding elements
          setTimeout(() => {
            if (!viewportRef.current || typeof document === 'undefined') return

            const body = document.body
            const clone = body.cloneNode(true) as HTMLDivElement

            // Remove only the magnifier container and viewport from the clone (to avoid seeing the magnifier in itself)
          // Keep everything else that's visible in the DOM - the magnifier should show what's actually on the page
          const magnifierInClone = clone.querySelector('[data-magnifier-container="true"]')
          if (magnifierInClone) {
            magnifierInClone.remove()
          }

          // Also remove the magnifier viewport from the clone
          const magnifierViewportInClone = clone.querySelector('[data-magnifier-viewport="true"]')
          if (magnifierViewportInClone) {
            magnifierViewportInClone.remove()
          }

          // Note: We don't remove debug panel/button from clone anymore
          // Instead, we hide the magnifier when cursor is over debug UI (see mouse move handler)

          // Style the clone to match the body
          clone.style.position = 'absolute'
          clone.style.left = '0'
          clone.style.top = '0'
          clone.style.width = `${document.documentElement.scrollWidth}px`
          clone.style.height = `${document.documentElement.scrollHeight}px`
          clone.style.pointerEvents = 'none'
          clone.style.background = 'transparent'
          clone.style.transformOrigin = '0 0'
          clone.style.willChange = 'transform'

          viewportRef.current.appendChild(clone)

          // Sync scroll positions from live DOM so clone shows same content
          const isMagnifier = (el: Element) =>
            el.hasAttribute?.('data-magnifier-container') || el.hasAttribute?.('data-magnifier-viewport')
          const syncScroll = (live: Element, cl: Element) => {
            if (live instanceof HTMLElement && cl instanceof HTMLElement) {
              if (live.scrollHeight > live.clientHeight || live.scrollWidth > live.clientWidth) {
                cl.scrollLeft = live.scrollLeft
                cl.scrollTop = live.scrollTop
              }
            }
            const liveChildren = Array.from(live.children).filter(c => !isMagnifier(c))
            const cloneChildren = Array.from(cl.children)
            for (let i = 0; i < liveChildren.length && i < cloneChildren.length; i++) {
              syncScroll(liveChildren[i], cloneChildren[i])
            }
          }
          syncScroll(body, clone)
          cloneRef.current = clone
          }, 10) // Small delay to ensure React DOM updates complete
        })
      })
    })

    return () => {
      // Clean up clone when component unmounts or becomes invisible
      if (cloneRef.current && cloneRef.current.parentNode) {
        cloneRef.current.parentNode.removeChild(cloneRef.current)
        cloneRef.current = null
      }
    }
  }, [enabled, isVisible, sidebarState, debugPanelOpen, location.pathname])

  React.useEffect(() => {
    if (!enabled) {
      setIsVisible(false)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Check if debug panel visibility has changed (for clone recreation)
      const panelExists = document.querySelector('[data-debug-panel]') !== null
      if (panelExists !== debugPanelOpen) {
        setDebugPanelOpen(panelExists)
      }

      // Get element under cursor
      const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement

      // Check if cursor is over debug panel or debug button
      // If so, hide the magnifier to avoid interfering with panel interactions
      const isOverDebugPanel = element?.closest('[data-debug-panel]') !== null
      const isOverDebugButton = element?.closest('button[title="Debug Tools"]') !== null ||
                               element?.getAttribute('title') === 'Debug Tools'
      const isOverDebugUI = isOverDebugPanel || isOverDebugButton

      // Update position and visibility
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY })
        setIsVisible(!isOverDebugUI)
      })

      if (!lockedElement) {
        onElementChange?.(element || null)
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Don't hide when cursor moved into an iframe (e.g. Sandpack preview)
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el?.tagName === 'IFRAME') return
      setIsVisible(false)
      onElementChange?.(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [enabled, onElementChange, debugPanelOpen, lockedElement])

  // Listen to sidebar state changes and update state to trigger clone recreation
  React.useEffect(() => {
    if (!enabled) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
          const target = mutation.target as HTMLElement;
          const newState = target.getAttribute('data-state');

          // Update state to trigger clone recreation
          // The clone effect depends on sidebarState, so it will recreate automatically
          if (sidebarState !== newState) {
            setSidebarState(newState)
          }
        }
      });
    });

    const sidebarWrapper = document.querySelector('[data-state]');
    if (sidebarWrapper) {
      // Initialize sidebar state
      const initialState = sidebarWrapper.getAttribute('data-state');
      if (sidebarState !== initialState) {
        setSidebarState(initialState)
      }

      observer.observe(sidebarWrapper, {
        attributes: true,
        attributeFilter: ['data-state']
      });
    }

    return () => observer.disconnect();
  }, [enabled, sidebarState]);

  // Listen to debug panel visibility changes and trigger clone recreation
  React.useEffect(() => {
    if (!enabled) return;

    const checkPanelVisibility = () => {
      const panelExists = document.querySelector('[data-debug-panel]') !== null
      if (panelExists !== debugPanelOpen) {
        setDebugPanelOpen(panelExists)
      }
    }

    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false
      mutations.forEach((mutation) => {
        // Check if debug panel was added or removed from DOM
        if (mutation.type === 'childList') {
          // Check if the mutation affects elements with data-debug-panel
          const addedNodes = Array.from(mutation.addedNodes)
          const removedNodes = Array.from(mutation.removedNodes)

          const hasDebugPanel = (node: Node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement
              return el.hasAttribute?.('data-debug-panel') ||
                     el.querySelector?.('[data-debug-panel]') !== null ||
                     el.closest?.('[data-debug-panel]') !== null
            }
            return false
          }

          if (addedNodes.some(hasDebugPanel) || removedNodes.some(hasDebugPanel)) {
            shouldCheck = true
          }
        }
      });

      if (shouldCheck) {
        // Use setTimeout to ensure DOM has settled after React's update
        setTimeout(checkPanelVisibility, 0)
      }
    });

    // Observe body for debug panel additions/removals
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial check
    checkPanelVisibility()

    // Also poll periodically as a fallback (in case MutationObserver misses changes)
    const pollInterval = setInterval(checkPanelVisibility, 100)

    return () => {
      observer.disconnect()
      clearInterval(pollInterval)
    }
  }, [enabled, debugPanelOpen]);

  // Keep clone scroll in sync when user scrolls; force transform re-run
  const [scrollVersion, setScrollVersion] = React.useState(0)
  const syncCloneScroll = React.useCallback(() => {
    if (!cloneRef.current) return
    const isMagnifier = (el: Element) =>
      el.hasAttribute?.('data-magnifier-container') || el.hasAttribute?.('data-magnifier-viewport')
    const syncScroll = (live: Element, cl: Element) => {
      if (live instanceof HTMLElement && cl instanceof HTMLElement) {
        if (live.scrollHeight > live.clientHeight || live.scrollWidth > live.clientWidth) {
          cl.scrollLeft = live.scrollLeft
          cl.scrollTop = live.scrollTop
        }
      }
      const liveChildren = Array.from(live.children).filter(c => !isMagnifier(c))
      const cloneChildren = Array.from(cl.children)
      for (let i = 0; i < liveChildren.length && i < cloneChildren.length; i++) {
        syncScroll(liveChildren[i], cloneChildren[i])
      }
    }
    syncScroll(document.body, cloneRef.current)
  }, [])

  React.useEffect(() => {
    if (!enabled || !isVisible) return
    const scheduleSync = () => setScrollVersion((v) => v + 1)
    const scrollables = document.querySelectorAll(
      '[data-main-scroll="true"], [class*="overflow-y-auto"], [class*="overflow-auto"], [class*="overflow-x-auto"]'
    )
    scrollables.forEach((el) => el.addEventListener('scroll', scheduleSync, { passive: true }))
    // Listen to scroll events on window to catch all scrolling methods (wheel, scrollbar, keyboard, etc.)
    window.addEventListener('scroll', scheduleSync, { passive: true })
    document.addEventListener('wheel', scheduleSync, { passive: true })
    let rafId: number
    const loop = () => {
      setScrollVersion((v) => v + 1)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafId)
      scrollables.forEach((el) => el.removeEventListener('scroll', scheduleSync))
      window.removeEventListener('scroll', scheduleSync)
      document.removeEventListener('wheel', scheduleSync)
    }
  }, [enabled, isVisible])

  // Update viewport transform when position or scroll changes
  React.useEffect(() => {
    if (!enabled || !isVisible || !viewportRef.current || !cloneRef.current) return

    // Always sync clone scroll before computing transform so we use latest scroll state
    syncCloneScroll()

    // Coordinate mapping: viewport (clientX, clientY) -> clone (docX, docY).
    // - Nested scroll (body overflow hidden, main content in overflow div): clone is viewport-sized,
    //   scroll synced per-container. Viewport coords map 1:1 to clone—same content at same position.
    // - Window scroll: add window scroll offset.
    const winScrollX = window.scrollX || window.pageXOffset || 0
    const winScrollY = window.scrollY || window.pageYOffset || 0
    const mainScroll = document.querySelector('[data-main-scroll="true"]') as HTMLElement | null
    const docX = mainScroll ? position.x : position.x + winScrollX
    const docY = mainScroll ? position.y : position.y + winScrollY

    // The clone represents the document starting at (0,0) in document coordinates
    // We want the point at (docX, docY) in document coordinates to appear at (position.x, position.y) in the viewport
    // After scaling by zoom, point (docX, docY) becomes (docX * zoom, docY * zoom) in the clone's coordinate system
    // To position it at (position.x, position.y) in the viewport, we need:
    // translateX = position.x - docX * zoom
    // translateY = position.y - docY * zoom
    const translateX = position.x - docX * zoom
    const translateY = position.y - docY * zoom

    // Update viewport to show zoomed content
    // The viewport stays fixed, we transform the clone inside it
    if (viewportRef.current) {
      // Apply clip-path to viewport (in screen coordinates)
      const clipPath = `circle(${size / 2}px at ${position.x}px ${position.y}px)`
      viewportRef.current.style.clipPath = clipPath
      viewportRef.current.style.transform = 'none' // Viewport stays fixed

      // Transform the clone inside the viewport
      // The transform ensures the point at (docX, docY) appears at (position.x, position.y) after scaling
      const cloneTransform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`
      cloneRef.current.style.transform = cloneTransform
      cloneRef.current.style.transformOrigin = '0 0'
    }
  }, [position, enabled, isVisible, zoom, size, scrollVersion, syncCloneScroll])

  if (!enabled || !isVisible) return null

  const magnifierSize = size

  return (
    <>
      {/* Full-page viewport that shows the actual rendered content */}
      {/* The body content is cloned into this viewport, then transformed and clipped */}
      <div
        ref={viewportRef}
        className="magnifier-viewport"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
          overflow: 'hidden',
          // Transform and clip-path are set via useEffect above
        }}
        data-magnifier-viewport="true"
      />

      {/* Magnifier border/ring - visual indicator */}
      <div
        ref={containerRef}
        className="fixed pointer-events-none z-[var(--z-debug)]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
          width: `${magnifierSize}px`,
          height: `${magnifierSize}px`,
        }}
        data-magnifier-container="true"
      >
        <div
          className="rounded-full border-2 border-border shadow-2xl"
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Inject CSS for the magnifier viewport */}
      <style>{`
        /* Hide the magnifier container from being visible in the viewport */
        [data-magnifier-viewport="true"] [data-magnifier-container="true"],
        [data-magnifier-container="true"] {
          visibility: hidden !important;
        }

        /* Make sure the viewport doesn't interfere with page interaction */
        .magnifier-viewport * {
          pointer-events: none !important;
        }

        /* Ensure the viewport and clone are visible */
        .magnifier-viewport {
          visibility: visible !important;
          opacity: 1 !important;
          /* Temporary: add a subtle background to verify viewport is visible */
          /* background: rgba(255, 0, 0, 0.1) !important; */
        }

        .magnifier-viewport > * {
          visibility: visible !important;
          opacity: 1 !important;
          /* Ensure clone content is visible */
          display: block !important;
        }

        /* Ensure all content inside clone is visible */
        .magnifier-viewport * {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  )
}
