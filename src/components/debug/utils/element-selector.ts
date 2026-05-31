/**
 * Element Selection Utilities
 *
 * Reusable utilities for element selection and selector generation.
 * Used by both magnifier and UI tester components.
 */

/**
 * Get the element at a specific point
 */
export function getElementAtPoint(x: number, y: number): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.elementFromPoint(x, y) as HTMLElement | null
}

/**
 * Generate a unique CSS selector for an element
 * Creates a stable selector that can be used to find the element later
 */
export function generateUniqueSelector(element: HTMLElement): string {
  if (!element || element === document.body || element === document.documentElement) {
    return 'body'
  }

  // Try ID first (most specific)
  if (element.id) {
    return `#${element.id}`
  }

  // Build path from element to body
  const path: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== document.body && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase()

    // Add ID if available
    if (current.id) {
      selector += `#${current.id}`
      path.unshift(selector)
      break // ID is unique, we can stop here
    }

    // Add classes if available
    if (current.className && typeof current.className === 'string') {
      const classes = current.className
        .split(' ')
        .filter(Boolean)
        .map(cls => `.${cls}`)
        .join('')
      if (classes) {
        selector += classes
      }
    }

    // Add nth-child if needed for uniqueness
    const parent: HTMLElement | null = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children)
      const index = siblings.indexOf(current)
      if (siblings.length > 1) {
        selector += `:nth-child(${index + 1})`
      }
    }

    path.unshift(selector)
    current = parent
  }

  return path.join(' > ') || 'body'
}

/**
 * Find an element by its CSS selector
 */
export function findElementBySelector(selector: string): HTMLElement | null {
  if (typeof document === 'undefined') return null

  try {
    return document.querySelector(selector) as HTMLElement | null
  } catch (error) {
    console.warn('Invalid selector:', selector, error)
    return null
  }
}

/**
 * Check if an element is a debug UI element (should be excluded from selection)
 */
export function isDebugUIElement(element: HTMLElement | null): boolean {
  if (!element) return false

  return (
    element.closest('[data-debug-panel]') !== null ||
    element.closest('button[title="Debug Tools"]') !== null ||
    element.getAttribute('title') === 'Debug Tools' ||
    element.closest('[data-magnifier-container="true"]') !== null ||
    element.closest('[data-magnifier-viewport="true"]') !== null ||
    element.hasAttribute('data-ui-tester-preview')
  )
}

