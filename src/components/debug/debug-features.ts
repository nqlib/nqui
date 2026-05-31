/**
 * Central debug feature helpers: DOM inspection, hit-area visualization, legacy CSS overlays.
 * Observers attach only while a feature is active; highlights use pointer-events-safe patterns.
 */

import { isDebugUIElement } from "./utils/element-selector"

/** Elements we added Bazza's hit-area-debug for (so unmount can remove without stripping user-added debug). */
const HIT_AREA_INJECTED_ATTR = "data-nqui-debug-hit-area-injected"

const OVERLAY_ROOT_ATTR = "data-nqui-debug-overlay-root"

export function shouldSkipInspectableElement(element: HTMLElement): boolean {
  if (isDebugUIElement(element)) return true
  if (element.closest(`[${OVERLAY_ROOT_ATTR}]`)) return true
  return false
}

/** True if element has a Bazza hit-area utility class (not the debug-only class). */
export function hasHitAreaUtilityClass(element: HTMLElement): boolean {
  for (const c of element.classList) {
    if (c.startsWith("hit-area-") && c !== "hit-area-debug") return true
  }
  return false
}

function syncHitAreaDebugClasses(): void {
  if (typeof document === "undefined") return

  for (const el of document.querySelectorAll<HTMLElement>(`[${HIT_AREA_INJECTED_ATTR}]`)) {
    if (!hasHitAreaUtilityClass(el) || shouldSkipInspectableElement(el)) {
      el.classList.remove("hit-area-debug")
      el.removeAttribute(HIT_AREA_INJECTED_ATTR)
    }
  }

  const candidates = document.querySelectorAll<HTMLElement>('[class*="hit-area-"]')
  for (const el of candidates) {
    if (shouldSkipInspectableElement(el)) continue
    if (!hasHitAreaUtilityClass(el)) continue
    if (el.classList.contains("hit-area-debug")) continue
    el.classList.add("hit-area-debug")
    el.setAttribute(HIT_AREA_INJECTED_ATTR, "")
  }
}

function removeAllInjectedHitAreaDebug(): void {
  if (typeof document === "undefined") return
  for (const el of document.querySelectorAll<HTMLElement>(`[${HIT_AREA_INJECTED_ATTR}]`)) {
    el.classList.remove("hit-area-debug")
    el.removeAttribute(HIT_AREA_INJECTED_ATTR)
  }
}

export interface HitAreaDebugController {
  mount: () => void
  unmount: () => void
}

/**
 * Adds Bazza hit-area-debug to elements with hit-area-* utilities while active.
 * Rescans on DOM mutations (throttled rAF). See https://bazza.dev/craft/2026/hit-area
 */
export function createHitAreaDebugController(): HitAreaDebugController {
  let observer: MutationObserver | null = null
  let rafId: number | null = null

  const scheduleSync = () => {
    if (rafId != null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      syncHitAreaDebugClasses()
    })
  }

  return {
    mount() {
      if (typeof document === "undefined") return
      syncHitAreaDebugClasses()
      observer = new MutationObserver(() => {
        scheduleSync()
      })
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      })
    },
    unmount() {
      if (observer) {
        observer.disconnect()
        observer = null
      }
      if (rafId != null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      removeAllInjectedHitAreaDebug()
    },
  }
}

/** Fixed overlay root for future feature visualizers (pointer-events: none, z-debug). */
export function ensureDebugOverlayRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null
  let root = document.querySelector<HTMLElement>(`[${OVERLAY_ROOT_ATTR}]`)
  if (!root) {
    root = document.createElement("div")
    root.setAttribute(OVERLAY_ROOT_ATTR, "")
    root.setAttribute("aria-hidden", "true")
    root.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:var(--z-debug);overflow:visible;"
    document.body.appendChild(root)
  }
  return root
}

export function removeDebugOverlayRoot(): void {
  if (typeof document === "undefined") return
  document.querySelector(`[${OVERLAY_ROOT_ATTR}]`)?.remove()
}

export interface LegacyDebugStyleOptions {
  borders: boolean
  shadows: boolean
  pixelGrid: boolean
}

/**
 * Legacy full-page debug CSS (borders, shadows, 8px background pixel grid — not CSS Grid inspector).
 */
export function buildLegacyDebugCss(opts: LegacyDebugStyleOptions): string {
  let css = ""

  if (opts.borders) {
    css += `
        * {
          outline: 1px solid rgba(255, 0, 0, 0.2) !important;
        }
        *:hover {
          outline: 1px solid rgba(255, 0, 0, 0.5) !important;
        }
      `
  }

  if (opts.shadows) {
    css += `
        * {
          box-shadow: 0 0 0 1px rgba(0, 0, 255, 0.3) !important;
        }
        *:hover {
          box-shadow: 0 0 0 1px rgba(0, 0, 255, 0.6) !important;
        }
      `
  }

  if (opts.pixelGrid) {
    css += `
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 8px 8px;
          pointer-events: none;
          z-index: calc(var(--z-debug) - 1);
        }
      `
  }

  return css
}
