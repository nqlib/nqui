/**
 * Style Injector Utilities
 *
 * Utilities for injecting preview-only CSS styles into the document.
 * Uses data attributes and style injection to avoid modifying actual elements.
 */

export interface PreviewStyles {
  boxShadow?: string
  textShadow?: string
  glow?: {
    color: string
    blur: number
    spread: number
  }
  backgroundColor?: string
  backgroundImage?: string // For gradients
  border?: {
    color: string
    width: string
    style: string
  }
  customCss?: string
}

const STYLE_ID = 'ui-tester-preview-styles'
const DATA_ATTR = 'data-ui-tester-preview'

/**
 * Get or create the preview style element
 */
function getStyleElement(): HTMLStyleElement | null {
  if (typeof document === 'undefined') return null

  let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement

  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = STYLE_ID
    document.head.appendChild(styleElement)
  }

  return styleElement
}

/**
 * Generate CSS selector for the selected element
 */
function generateSelector(element: HTMLElement | null): string {
  if (!element) return ''

  // Use data attribute for reliable targeting
  return `[${DATA_ATTR}="true"]`
}

/**
 * Convert PreviewStyles to CSS string
 */
function stylesToCss(styles: PreviewStyles): string {
  const rules: string[] = []

  // Combine box shadows (from boxShadow and glow)
  const boxShadows: string[] = []
  if (styles.boxShadow) {
    boxShadows.push(styles.boxShadow)
  }
  if (styles.glow) {
    const { color, blur, spread } = styles.glow
    const glowShadow = `0 0 ${blur}px ${spread}px ${color}`
    boxShadows.push(glowShadow)
  }
  if (boxShadows.length > 0) {
    rules.push(`box-shadow: ${boxShadows.join(', ')} !important;`)
  }

  // Glow also adds outline
  if (styles.glow) {
    rules.push(`outline: 1px solid ${styles.glow.color} !important;`)
  }

  if (styles.textShadow) {
    rules.push(`text-shadow: ${styles.textShadow} !important;`)
  }

  if (styles.backgroundColor) {
    rules.push(`background-color: ${styles.backgroundColor} !important;`)
  }

  if (styles.backgroundImage) {
    rules.push(`background-image: ${styles.backgroundImage} !important;`)
  }

  if (styles.border) {
    const { color, width, style } = styles.border
    rules.push(`border: ${width} ${style} ${color} !important;`)
  }

  if (styles.customCss) {
    // Custom CSS is added as-is (user is responsible for syntax)
    rules.push(styles.customCss)
  }

  return rules.join('\n  ')
}

/**
 * Inject preview styles for a selected element
 */
export function injectPreviewStyles(
  element: HTMLElement | null,
  styles: PreviewStyles
): void {
  if (typeof document === 'undefined') return

  // Remove existing preview attribute
  removePreviewStyles()

  if (!element) {
    return
  }

  // Add data attribute to element
  element.setAttribute(DATA_ATTR, 'true')

  // Generate selector
  const selector = generateSelector(element)

  if (!selector) return

  // Generate CSS
  const css = stylesToCss(styles)

  if (!css.trim()) return

  // Inject styles
  const styleElement = getStyleElement()
  if (!styleElement) return

  styleElement.textContent = `
    ${selector} {
      ${css}
    }
  `
}

/**
 * Update preview styles for the currently selected element
 */
export function updatePreviewStyles(
  element: HTMLElement | null,
  styles: PreviewStyles
): void {
  injectPreviewStyles(element, styles)
}

/**
 * Remove all preview styles
 */
export function removePreviewStyles(): void {
  if (typeof document === 'undefined') return

  // Remove data attribute from all elements
  const elements = document.querySelectorAll(`[${DATA_ATTR}="true"]`)
  elements.forEach(el => {
    el.removeAttribute(DATA_ATTR)
  })

  // Remove style element
  const styleElement = document.getElementById(STYLE_ID)
  if (styleElement) {
    styleElement.remove()
  }
}

/**
 * Check if preview styles are active
 */
export function hasPreviewStyles(): boolean {
  if (typeof document === 'undefined') return false
  return document.querySelector(`[${DATA_ATTR}="true"]`) !== null
}

