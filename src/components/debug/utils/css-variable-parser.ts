/**
 * CSS Variable Parser
 *
 * Utilities for extracting and parsing CSS variables from the document.
 * Supports both light and dark mode variables.
 */

export interface CSSVariable {
  name: string
  value: string
  category?: 'primary' | 'semantic' | 'system' | 'other'
}

export interface ColorVariable extends CSSVariable {
  computedValue?: string
  swatchColor?: string
}

/**
 * Extract all CSS variables from the document root
 */
export function extractCssVariables(): CSSVariable[] {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return []
  }

  const root = document.documentElement
  const computed = getComputedStyle(root)
  const variables: CSSVariable[] = []

  // Get all CSS variables (computed style is more reliable for runtime values)

  // Also read from computed style (more reliable for runtime values)
  const rootStyles = root.style.cssText
  const inlineMatches = rootStyles.matchAll(/--([^:]+):\s*([^;]+)/g)

  for (const match of inlineMatches) {
    const name = `--${match[1].trim()}`
    const value = match[2].trim()
    variables.push({
      name,
      value,
      category: categorizeVariable(name)
    })
  }

  // Read from computed style (includes all CSS variables)
  // This is the most reliable method
  const computedVariables = new Set<string>()

  // Iterate through all possible variable names by checking common patterns
  const commonPatterns = [
    'primary', 'secondary', 'accent', 'background', 'foreground',
    'card', 'popover', 'muted', 'border', 'input', 'ring',
    'destructive', 'success', 'warning', 'info',
    'sidebar', 'chart'
  ]

  for (const pattern of commonPatterns) {
    // Check for base variable
    const baseVar = `--${pattern}`
    const value = computed.getPropertyValue(baseVar).trim()
    if (value) {
      computedVariables.add(baseVar)
      variables.push({
        name: baseVar,
        value,
        category: categorizeVariable(baseVar)
      })
    }

    // Check for foreground variant
    const fgVar = `--${pattern}-foreground`
    const fgValue = computed.getPropertyValue(fgVar).trim()
    if (fgValue) {
      computedVariables.add(fgVar)
      variables.push({
        name: fgVar,
        value: fgValue,
        category: categorizeVariable(fgVar)
      })
    }

    // Check for numbered variants (100-600)
    for (let i = 100; i <= 600; i += 100) {
      const numVar = `--${pattern}-${i}`
      const numValue = computed.getPropertyValue(numVar).trim()
      if (numValue) {
        computedVariables.add(numVar)
        variables.push({
          name: numVar,
          value: numValue,
          category: categorizeVariable(numVar)
        })
      }
    }
  }

  // Remove duplicates
  const unique = new Map<string, CSSVariable>()
  for (const variable of variables) {
    if (!unique.has(variable.name)) {
      unique.set(variable.name, variable)
    }
  }

  return Array.from(unique.values())
}

/**
 * Get only color-related CSS variables
 */
export function getColorVariables(): ColorVariable[] {
  const allVars = extractCssVariables()

  return allVars
    .filter(v => isColorVariable(v.name))
    .map(v => ({
      ...v,
      computedValue: resolveCssVar(v.name),
      swatchColor: getSwatchColor(v.name, v.value)
    }))
    .sort((a, b) => {
      // Sort by category, then by name
      const categoryOrder = { primary: 0, semantic: 1, system: 2, other: 3 }
      const aOrder = categoryOrder[a.category || 'other']
      const bOrder = categoryOrder[b.category || 'other']
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.name.localeCompare(b.name)
    })
}

/**
 * Resolve a CSS variable to its computed value
 */
export function resolveCssVar(varName: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return varName
  }

  try {
    const root = document.documentElement
    const value = getComputedStyle(root).getPropertyValue(varName.replace(/^--/, '')).trim()

    if (value) {
      return value
    }

    // If not found, return the variable reference
    return varName.startsWith('var(') ? varName : `var(${varName})`
  } catch (error) {
    return varName
  }
}

/**
 * Categorize a CSS variable name
 */
function categorizeVariable(name: string): CSSVariable['category'] {
  if (name.includes('primary')) return 'primary'
  if (name.includes('destructive') || name.includes('danger') ||
      name.includes('success') || name.includes('warning') ||
      name.includes('info')) return 'semantic'
  if (name.includes('background') || name.includes('foreground') ||
      name.includes('card') || name.includes('popover') ||
      name.includes('muted') || name.includes('border') ||
      name.includes('input') || name.includes('ring') ||
      name.includes('sidebar')) return 'system'
  return 'other'
}

/**
 * Check if a variable name is color-related
 */
function isColorVariable(name: string): boolean {
  const colorKeywords = [
    'primary', 'secondary', 'accent', 'background', 'foreground',
    'card', 'popover', 'muted', 'border', 'input', 'ring',
    'destructive', 'danger', 'success', 'warning', 'info',
    'sidebar', 'chart', 'color'
  ]

  return colorKeywords.some(keyword => name.includes(keyword))
}

/**
 * Get a swatch color for display (converts OKLCH to approximate RGB for preview)
 */
function getSwatchColor(name: string, value: string): string {
  // If already a color format, return as-is
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
    return value
  }

  // If it's a CSS variable reference, try to resolve it
  if (value.startsWith('var(')) {
    const resolved = resolveCssVar(value)
    if (resolved !== value) {
      return getSwatchColor(name, resolved)
    }
  }

  // For OKLCH, we'll use the resolved value
  // The browser will handle the conversion for display
  return value
}

