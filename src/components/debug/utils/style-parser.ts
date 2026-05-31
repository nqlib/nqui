/**
 * Parse CSS values from computed styles
 */

export interface ParsedBoxShadow {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
}

export interface ParsedTextShadow {
  offsetX: number
  offsetY: number
  blur: number
  color: string
}

export interface ParsedBorder {
  width: string
  style: string
  color: string
}

/**
 * Parse box-shadow value into individual shadows
 */
export function parseBoxShadow(boxShadow: string): ParsedBoxShadow[] {
  if (!boxShadow || boxShadow === "none") return []

  // Split by comma to handle multiple shadows
  const shadows = boxShadow.split(',').map(s => s.trim())
  const parsed: ParsedBoxShadow[] = []

  for (const shadow of shadows) {
    // Match: offsetX offsetY blur spread color
    // or: offsetX offsetY blur color
    const match = shadow.match(/^(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)?\s*(.+)$/)

    if (match) {
      const offsetX = parseFloat(match[1]) || 0
      const offsetY = parseFloat(match[2]) || 0
      const blur = parseFloat(match[3]) || 0
      const spread = match[4] ? parseFloat(match[4]) : 0
      const color = (match[5] || match[4] || "rgba(0, 0, 0, 0)").trim()

      parsed.push({ offsetX, offsetY, blur, spread, color })
    } else {
      // Try simpler pattern: offsetX offsetY blur color
      const simpleMatch = shadow.match(/^(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(.+)$/)
      if (simpleMatch) {
        const offsetX = parseFloat(simpleMatch[1]) || 0
        const offsetY = parseFloat(simpleMatch[2]) || 0
        const blur = parseFloat(simpleMatch[3]) || 0
        const color = simpleMatch[4].trim()

        parsed.push({ offsetX, offsetY, blur, spread: 0, color })
      }
    }
  }

  return parsed
}

/**
 * Parse text-shadow value into individual shadows
 */
export function parseTextShadow(textShadow: string): ParsedTextShadow[] {
  if (!textShadow || textShadow === "none") return []

  // Split by comma to handle multiple shadows
  const shadows = textShadow.split(',').map(s => s.trim())
  const parsed: ParsedTextShadow[] = []

  for (const shadow of shadows) {
    // Match: offsetX offsetY blur color
    const match = shadow.match(/^(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)?\s*(.+)$/)

    if (match) {
      const offsetX = parseFloat(match[1]) || 0
      const offsetY = parseFloat(match[2]) || 0
      const blur = match[3] ? parseFloat(match[3]) : 0
      const color = (match[4] || "rgba(0, 0, 0, 0)").trim()

      parsed.push({ offsetX, offsetY, blur, color })
    } else {
      // Try simpler pattern: offsetX offsetY color
      const simpleMatch = shadow.match(/^(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(.+)$/)
      if (simpleMatch) {
        const offsetX = parseFloat(simpleMatch[1]) || 0
        const offsetY = parseFloat(simpleMatch[2]) || 0
        const color = simpleMatch[3].trim()

        parsed.push({ offsetX, offsetY, blur: 0, color })
      }
    }
  }

  return parsed
}

/**
 * Parse border value
 */
export function parseBorder(border: string, borderWidth?: string, borderStyle?: string, borderColor?: string): ParsedBorder | null {
  // Try to parse from combined border string first
  if (border && border !== "none" && border !== "0px none rgb(0, 0, 0)") {
    const match = border.match(/^(\d+(?:\.\d+)?(?:px|em|rem)?)\s+(\w+)\s+(.+)$/)
    if (match) {
      return {
        width: match[1],
        style: match[2],
        color: match[3].trim()
      }
    }
  }

  // Fallback to individual properties
  if (borderWidth && borderStyle && borderColor) {
    if (borderWidth !== "0px" && borderStyle !== "none" && borderColor !== "rgb(0, 0, 0)") {
      return {
        width: borderWidth,
        style: borderStyle,
        color: borderColor
      }
    }
  }

  return null
}

/**
 * Check if a value is a gradient
 */
export function isGradient(value: string): boolean {
  return value.includes("gradient") || value.includes("linear-gradient") || value.includes("radial-gradient")
}

/**
 * Check if a value is a CSS variable
 */
export function isCssVariable(value: string): boolean {
  return value.startsWith("var(") || value.startsWith("--")
}

/**
 * Extract all styles from an element
 */
export function extractElementStyles(element: HTMLElement | null): {
  boxShadows: ParsedBoxShadow[]
  textShadows: ParsedTextShadow[]
  backgroundColor: string | null
  backgroundImage: string | null
  border: ParsedBorder | null
  outline: ParsedBorder | null
} {
  if (!element || typeof window === "undefined") {
    return {
      boxShadows: [],
      textShadows: [],
      backgroundColor: null,
      backgroundImage: null,
      border: null,
      outline: null
    }
  }

  const computed = window.getComputedStyle(element)

  // Parse box-shadow
  const boxShadow = computed.boxShadow
  const boxShadows = parseBoxShadow(boxShadow)

  // Parse text-shadow
  const textShadow = computed.textShadow
  const textShadows = parseTextShadow(textShadow)

  // Background
  const backgroundColor = computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)" && computed.backgroundColor !== "transparent"
    ? computed.backgroundColor
    : null

  // Extract background-image, filtering out url() values (images) and keeping only gradients
  let backgroundImage: string | null = null
  if (computed.backgroundImage && computed.backgroundImage !== "none") {
    // Remove url() values (image references)
    const withoutUrls = computed.backgroundImage.replace(/url\([^)]+\)/g, "").trim()
    // Check if there are any gradients left
    if (withoutUrls && (withoutUrls.includes("gradient") || withoutUrls.includes("linear-gradient") || withoutUrls.includes("radial-gradient"))) {
      backgroundImage = withoutUrls
    } else if (computed.backgroundImage.includes("gradient")) {
      // If original has gradient, extract just the gradient part
      const gradientMatch = computed.backgroundImage.match(/(linear-gradient|radial-gradient|conic-gradient)\([^)]+\)/g)
      if (gradientMatch && gradientMatch.length > 0) {
        backgroundImage = gradientMatch.join(", ")
      }
    }
  }

  // Border
  const border = parseBorder(
    computed.border,
    computed.borderWidth,
    computed.borderStyle,
    computed.borderColor
  )

  // Outline
  const outline = parseBorder(
    computed.outline,
    computed.outlineWidth,
    computed.outlineStyle,
    computed.outlineColor
  )

  return {
    boxShadows,
    textShadows,
    backgroundColor,
    backgroundImage,
    border,
    outline
  }
}

