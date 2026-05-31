"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PaintBoardIcon,
  LayoutIcon,
  CodeIcon,
  Add01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"
import { Keys } from "@/lib/keyboard"
import { Button, Switch, Label, Slider, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn, Collapsible, CollapsibleContent, CollapsibleTrigger, ColorPicker } from "./dependencies"
import { getColorVariables, type ColorVariable, resolveCssVar } from "./utils/css-variable-parser"
import { removePreviewStyles, updatePreviewStyles, type PreviewStyles } from "./utils/style-injector"
import { isDebugUIElement } from "./utils/element-selector"
import { extractElementStyles } from "./utils/style-parser"

// Number Input Component with stepper buttons
interface NumberInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  unit?: string // Default unit if value doesn't have one
  className?: string
}

function NumberInput({
  value,
  onChange,
  label,
  placeholder,
  min = 0,
  max = 1000,
  step = 1,
  unit = "px",
  className
}: NumberInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [localValue, setLocalValue] = React.useState(value)

  // Parse value to extract number and unit
  const parseValue = (val: string): { num: number; unit: string } => {
    if (!val || val.trim() === "") {
      return { num: 0, unit: unit }
    }
    const match = val.match(/^([\d.]+)(.*)$/)
    if (match) {
      const num = parseFloat(match[1])
      const extractedUnit = match[2].trim() || unit
      return { num: isNaN(num) ? 0 : num, unit: extractedUnit }
    }
    return { num: 0, unit: unit }
  }

  const { num, unit: currentUnit } = parseValue(value)

  const handleIncrement = () => {
    const newNum = Math.min(max, num + step)
    onChange(`${newNum}${currentUnit}`)
    setLocalValue(`${newNum}${currentUnit}`)
  }

  const handleDecrement = () => {
    const newNum = Math.max(min, num - step)
    onChange(`${newNum}${currentUnit}`)
    setLocalValue(`${newNum}${currentUnit}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === Keys.ArrowUp) {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === Keys.ArrowDown) {
      e.preventDefault()
      handleDecrement()
    } else if (e.key === Keys.Enter) {
      e.currentTarget.blur()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    onChange(e.target.value)
  }

  const handleFocus = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    // Ensure value has unit when blurring
    const { num: parsedNum, unit: parsedUnit } = parseValue(localValue)
    if (parsedNum !== num || parsedUnit !== currentUnit) {
      onChange(`${parsedNum}${parsedUnit}`)
    }
    setLocalValue(value)
  }

  // Sync local value when external value changes (but not when editing)
  React.useEffect(() => {
    if (!isEditing) {
      setLocalValue(value)
    }
  }, [value, isEditing])

  const displayValue = isEditing ? localValue : value

  return (
    <div className={cn("space-y-0.5", className)}>
      {label && <Label className="text-[10px] text-muted-foreground">{label}</Label>}
      <div className="flex items-center gap-0.5">
        <Input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="h-6 text-xs flex-1"
        />
        <div className="flex flex-col h-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-3 w-5 p-0 rounded-b-none border-b border-border hover:bg-muted"
            onClick={handleIncrement}
            disabled={num >= max}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="h-2.5 w-2.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-3 w-5 p-0 rounded-t-none hover:bg-muted"
            onClick={handleDecrement}
            disabled={num <= min}
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Color conversion utilities
function rgbaToOklch(rgba: string): string {
  // Handle OKLab format (browser returns this for OKLCH-based colors)
  const oklabMatch = rgba.match(/oklab\(([\d.]+)\s+([\d.\-]+)\s+([\d.\-]+)(?:\s*\/\s*([\d.]+))?\)/)
  if (oklabMatch) {
    const L = parseFloat(oklabMatch[1])
    const a = parseFloat(oklabMatch[2])
    const b = parseFloat(oklabMatch[3])

    // Convert OKLab to OKLCH
    const C = Math.sqrt(a * a + b * b)
    let H = Math.atan2(b, a) * (180 / Math.PI)
    if (H < 0) H += 360

    return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${H.toFixed(0)})`
  }

  // Parse rgba string: rgba(r, g, b, a) or rgb(r, g, b)
  const rgbaMatch = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10)
    const g = parseInt(rgbaMatch[2], 10)
    const b = parseInt(rgbaMatch[3], 10)

    // Use the rgbToOklch conversion from color-picker
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255

    // Linearize RGB
    const rLin = rNorm <= 0.04045 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4)
    const gLin = gNorm <= 0.04045 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4)
    const bLin = bNorm <= 0.04045 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4)

    // Convert to OKLab
    const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin
    const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin
    const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin

    // Convert to OKLCH
    const L = Math.pow(Math.abs(l) * 0.999999998, 1 / 3) * Math.sign(l) * 0.5 + 0.5

    const aVal = l - m
    const bVal = (l + m - 2 * s) / 2

    const C = Math.sqrt(aVal * aVal + bVal * bVal)
    let H = Math.atan2(bVal, aVal) * (180 / Math.PI)
    if (H < 0) H += 360

    return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${H.toFixed(0)})`
  }

  // Try hex format
  const hexMatch = rgba.match(/#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?/i)
  if (hexMatch) {
    const r = parseInt(hexMatch[1], 16)
    const g = parseInt(hexMatch[2], 16)
    const b = parseInt(hexMatch[3], 16)

    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255

    const rLin = rNorm <= 0.04045 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4)
    const gLin = gNorm <= 0.04045 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4)
    const bLin = bNorm <= 0.04045 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4)

    const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin
    const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin
    const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin

    const L = Math.pow(Math.abs(l) * 0.999999998, 1 / 3) * Math.sign(l) * 0.5 + 0.5

    const aVal = l - m
    const bVal = (l + m - 2 * s) / 2

    const C = Math.sqrt(aVal * aVal + bVal * bVal)
    let H = Math.atan2(bVal, aVal) * (180 / Math.PI)
    if (H < 0) H += 360

    return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${H.toFixed(0)})`
  }

  // If already OKLCH, return as-is
  if (rgba.startsWith('oklch(')) {
    return rgba
  }

  // Default fallback
  return "oklch(0.5 0.15 240)"
}

function oklchToRgba(oklch: string): string {
  // If already rgba/hex, return as-is
  if (oklch.startsWith('rgba(') || oklch.startsWith('rgb(') || oklch.startsWith('#')) {
    return oklch
  }

  // Parse OKLCH
  const match = oklch.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/)
  if (!match) return oklch

  const L = parseFloat(match[1])
  const C = parseFloat(match[2])
  const H = parseFloat(match[3])

  // Convert OKLCH to RGB (reuse logic from color-picker)
  const h = (H / 360) * 2 * Math.PI
  const aVal = C * Math.cos(h)
  const bVal = C * Math.sin(h)

  const l = L + 0.3963377774 * aVal + 0.2158037573 * bVal
  const m = L - 0.1055613458 * aVal - 0.0638541728 * bVal
  const s = L - 0.0894841775 * aVal - 1.2914855480 * bVal

  const r = Math.max(0, Math.min(1, Math.sign(l) * Math.pow(Math.abs(l) * 0.999999998 * 2 - 1, 1 / 3)))
  const g = Math.max(0, Math.min(1, Math.sign(m) * Math.pow(Math.abs(m) * 0.999999998 * 2 - 1, 1 / 3)))
  const bl = Math.max(0, Math.min(1, Math.sign(s) * Math.pow(Math.abs(s) * 0.999999998 * 2 - 1, 1 / 3)))

  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(bl * 255)}, 1)`
}

export interface UITesterProps {
  enabled: boolean
  selectedElement: HTMLElement | null
  onElementSelect?: (element: HTMLElement | null) => void
  onElementHover?: (element: HTMLElement | null) => void
  lockedElement?: HTMLElement | null
  setLockedElement?: (element: HTMLElement | null) => void
  lockedElementRef?: React.MutableRefObject<HTMLElement | null>
  className?: string
}

interface ShadowLayer {
  id: string
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
}

interface TextShadowLayer {
  id: string
  offsetX: number
  offsetY: number
  blur: number
  color: string
}

interface GlowLayer {
  id: string
  color: string
  blur: number
  spread: number
}

interface BackgroundLayer {
  id: string
  type: "color" | "gradient"
  value: string // color value or gradient string
  colorType?: "variable" | "custom" // for color type
}

interface BorderLayer {
  id: string
  color: string
  width: string
  style: string
  type: "border" | "outline" // border or outline for additional layers
}

export function UITester({ enabled, selectedElement, onElementSelect, onElementHover, lockedElement: externalLockedElement, setLockedElement: externalSetLockedElement, lockedElementRef: externalLockedElementRef, className }: UITesterProps) {
  const [previewEnabled, setPreviewEnabled] = React.useState(true)
  const [colorVariables, setColorVariables] = React.useState<ColorVariable[]>([])
  const [boxShadows, setBoxShadows] = React.useState<ShadowLayer[]>([])
  const [textShadows, setTextShadows] = React.useState<TextShadowLayer[]>([])
  const [glows, setGlows] = React.useState<GlowLayer[]>([])
  const [backgroundLayers, setBackgroundLayers] = React.useState<BackgroundLayer[]>([])
  const [borderLayers, setBorderLayers] = React.useState<BorderLayer[]>([])
  const [customCss, setCustomCss] = React.useState("")

  // Use external lock if provided, otherwise use internal lock (for backward compatibility)
  const [internalLockedElement, setInternalLockedElement] = React.useState<HTMLElement | null>(null)
  const internalLockedElementRef = React.useRef<HTMLElement | null>(null)
  const lockedElement = externalLockedElement !== undefined ? externalLockedElement : internalLockedElement
  const setLockedElement = externalSetLockedElement || setInternalLockedElement
  const lockedElementRef = externalLockedElementRef || internalLockedElementRef

  // Load current styles from element
  const loadCurrentStyles = React.useCallback((element: HTMLElement) => {
    const styles = extractElementStyles(element)

    // Load box shadows
    if (styles.boxShadows.length > 0) {
      const shadowLayers = styles.boxShadows.map(shadow => ({
        id: Math.random().toString(36).substr(2, 9),
        offsetX: shadow.offsetX,
        offsetY: shadow.offsetY,
        blur: shadow.blur,
        spread: shadow.spread,
        color: shadow.color
      }))
      setBoxShadows(shadowLayers)
    } else {
      setBoxShadows([])
    }

    // Load text shadows
    if (styles.textShadows.length > 0) {
      const textShadowLayers = styles.textShadows.map(shadow => ({
        id: Math.random().toString(36).substr(2, 9),
        offsetX: shadow.offsetX,
        offsetY: shadow.offsetY,
        blur: shadow.blur,
        color: shadow.color
      }))
      setTextShadows(textShadowLayers)
    } else {
      setTextShadows([])
    }

    // Load background
    const bgLayers: typeof backgroundLayers = []
    if (styles.backgroundColor) {
      // Resolve CSS variables to actual color values for display
      let bgValue = styles.backgroundColor
      let colorType: "variable" | "custom" = "custom"

      if (styles.backgroundColor.startsWith("var(")) {
        // It's a CSS variable - try to resolve it
        const resolved = resolveCssVar(styles.backgroundColor)

        if (resolved && !resolved.startsWith("var(")) {
          // Successfully resolved to a color value
          bgValue = resolved
          colorType = "custom"
        } else {
          // Couldn't resolve, keep as variable
          colorType = "variable"
        }
      }

      bgLayers.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "color",
        value: bgValue,
        colorType: colorType
      })
    }
    if (styles.backgroundImage) {
      bgLayers.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "gradient",
        value: styles.backgroundImage
      })
    }
    setBackgroundLayers(bgLayers)

    // Load border
    const borderLayersList: typeof borderLayers = []
    if (styles.border) {
      // Resolve CSS variables in border color
      let borderColor = styles.border.color
      if (borderColor.startsWith("var(")) {
        const resolved = resolveCssVar(borderColor)
        if (resolved && !resolved.startsWith("var(")) {
          borderColor = resolved
        }
      }

      borderLayersList.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "border",
        color: borderColor,
        width: styles.border.width,
        style: styles.border.style
      })
    }
    if (styles.outline) {
      borderLayersList.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "outline",
        color: styles.outline.color,
        width: styles.outline.width,
        style: styles.outline.style
      })
    }
    setBorderLayers(borderLayersList)
  }, [])

  // Update locked element when selectedElement changes (but only if using internal lock and not already locked)
  React.useEffect(() => {
    // Only auto-lock if using internal lock mechanism (external lock is managed by parent)
    if (externalLockedElement !== undefined) {
      // External lock is managed by parent, just load styles when element changes
      if (selectedElement && selectedElement !== lockedElementRef.current) {
        lockedElementRef.current = selectedElement
        loadCurrentStyles(selectedElement)
      }
      return
    }

    // Internal lock: auto-lock when element is selected
    if (selectedElement && selectedElement !== lockedElementRef.current) {
      setLockedElement(selectedElement)
      lockedElementRef.current = selectedElement

      // Load current styles from the element
      loadCurrentStyles(selectedElement)
    } else if (!selectedElement) {
      setLockedElement(null)
      lockedElementRef.current = null
    }
  }, [selectedElement, loadCurrentStyles, externalLockedElement])

  // Use locked element for style application
  const elementForStyling = lockedElement || selectedElement

  // Collapsible states for each section
  const [shadowsOpen, setShadowsOpen] = React.useState(true)
  const [effectsOpen, setEffectsOpen] = React.useState(false)
  const [colorsOpen, setColorsOpen] = React.useState(false)
  const [borderOpen, setBorderOpen] = React.useState(false)
  const [advancedOpen, setAdvancedOpen] = React.useState(false)

  // Load color variables on mount
  React.useEffect(() => {
    if (enabled) {
      const colors = getColorVariables()
      setColorVariables(colors)
    }
  }, [enabled])

  // Update preview styles when any style changes
  React.useEffect(() => {
    if (!enabled || !previewEnabled || !elementForStyling) {
      removePreviewStyles()
      return
    }

    // Combine all box shadows (from boxShadows and glows)
    const allBoxShadows: string[] = []
    boxShadows.forEach(s => {
      allBoxShadows.push(`${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`)
    })
    glows.forEach(g => {
      if (g.color) {
        allBoxShadows.push(`0 0 ${g.blur}px ${g.spread}px ${g.color}`)
      }
    })

    // Combine text shadows
    const allTextShadows = textShadows
      .filter(ts => ts.color)
      .map(ts => `${ts.offsetX}px ${ts.offsetY}px ${ts.blur}px ${ts.color}`)
      .join(", ")

    // Combine background layers (colors and gradients)
    const backgroundColors: string[] = []
    const backgroundImages: string[] = []
    backgroundLayers.forEach(bg => {
      if (bg.type === "color" && bg.value) {
        const bgValue = bg.colorType === "variable"
          ? resolveCssVar(bg.value)
          : bg.value
        backgroundColors.push(bgValue)
      } else if (bg.type === "gradient" && bg.value) {
        backgroundImages.push(bg.value)
      }
    })

    // Get first border (CSS only supports one border, others use outline)
    const firstBorder = borderLayers.find(b => b.type === "border" && b.color)
    const outlineLayers = borderLayers.filter(b => b.type === "outline" && b.color)

    const styles: PreviewStyles = {
      boxShadow: allBoxShadows.length > 0 ? allBoxShadows.join(", ") : undefined,
      textShadow: allTextShadows || undefined,
      glow: glows.length > 0 && glows[0].color ? { color: glows[0].color, blur: glows[0].blur, spread: glows[0].spread } : undefined, // Keep for outline
      backgroundColor: backgroundColors.length > 0 ? backgroundColors[0] : undefined,
      backgroundImage: backgroundImages.length > 0 ? backgroundImages.join(", ") : undefined,
      border: firstBorder ? { color: firstBorder.color, width: firstBorder.width, style: firstBorder.style } : undefined,
      customCss: customCss || undefined,
    }

    // Add outline layers as custom CSS
    if (outlineLayers.length > 0) {
      const outlineCss = outlineLayers.map(ol =>
        `outline: ${ol.width} ${ol.style} ${ol.color} !important;`
      ).join("\n  ")
      styles.customCss = styles.customCss
        ? `${styles.customCss}\n  ${outlineCss}`
        : outlineCss
    }

    updatePreviewStyles(elementForStyling, styles)
  }, [enabled, previewEnabled, elementForStyling, lockedElement, boxShadows, textShadows, glows, backgroundLayers, borderLayers, customCss])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      removePreviewStyles()
    }
  }, [])

  // Handle hover tracking (like magnifier)
  React.useEffect(() => {
    if (!enabled || !onElementHover) return

    const handleMouseMove = (e: MouseEvent) => {
      const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement

      // Don't track debug UI elements
      if (isDebugUIElement(element)) {
        onElementHover(null)
        return
      }

      // Don't track if over debug panel
      if (element?.closest('[data-debug-panel]')) {
        onElementHover(null)
        return
      }

      onElementHover(element || null)
    }

    const handleMouseLeave = () => {
      onElementHover(null)
    }

    if (enabled) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [enabled, onElementHover])

  // Handle click-to-select when enabled (but don't allow selection if element is locked)
  React.useEffect(() => {
    if (!enabled || !onElementSelect) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Don't select debug UI elements
      if (isDebugUIElement(target)) {
        return
      }

      // Don't select if clicking on debug panel
      if (target.closest('[data-debug-panel]')) {
        return
      }

      // If element is locked, don't allow new selection (user must explicitly unlock)
      if (lockedElement) {
        return
      }

      e.preventDefault()
      e.stopPropagation()
      onElementSelect(target)
    }

    if (enabled) {
      document.addEventListener("click", handleClick, true)
    }

    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [enabled, onElementSelect, selectedElement, lockedElement])

  const addBoxShadow = () => {
    setBoxShadows([...boxShadows, {
      id: Math.random().toString(36).substr(2, 9),
      offsetX: 0,
      offsetY: 2,
      blur: 4,
      spread: 0,
      color: "rgba(0, 0, 0, 0.1)"
    }])
  }

  const removeBoxShadow = (id: string) => {
    setBoxShadows(boxShadows.filter(s => s.id !== id))
  }

  const updateBoxShadow = (id: string, updates: Partial<ShadowLayer>) => {
    setBoxShadows(boxShadows.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const resetAll = () => {
    setBoxShadows([])
    setTextShadows([])
    setGlows([])
    setBackgroundLayers([])
    setBorderLayers([])
    setCustomCss("")
  }

  const exportCss = () => {
    const styles: string[] = []

    // Combine all box shadows (from boxShadows and glows)
    const allBoxShadows: string[] = []
    boxShadows.forEach(s => {
      allBoxShadows.push(`${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`)
    })
    glows.forEach(g => {
      if (g.color) {
        allBoxShadows.push(`0 0 ${g.blur}px ${g.spread}px ${g.color}`)
      }
    })
    if (allBoxShadows.length > 0) {
      styles.push(`box-shadow: ${allBoxShadows.join(", ")};`)
    }

    // Text shadows
    if (textShadows.length > 0) {
      const textShadowStr = textShadows
        .filter(ts => ts.color)
        .map(ts => `${ts.offsetX}px ${ts.offsetY}px ${ts.blur}px ${ts.color}`)
        .join(", ")
      if (textShadowStr) {
        styles.push(`text-shadow: ${textShadowStr};`)
      }
    }

    // Background layers
    const backgroundColors: string[] = []
    const backgroundImages: string[] = []
    backgroundLayers.forEach(bg => {
      if (bg.type === "color" && bg.value) {
        const bgValue = bg.colorType === "variable"
          ? resolveCssVar(bg.value)
          : bg.value
        backgroundColors.push(bgValue)
      } else if (bg.type === "gradient" && bg.value) {
        backgroundImages.push(bg.value)
      }
    })
    if (backgroundColors.length > 0) {
      styles.push(`background-color: ${backgroundColors[0]};`)
    }
    if (backgroundImages.length > 0) {
      styles.push(`background-image: ${backgroundImages.join(", ")};`)
    }

    // Border layers
    const firstBorder = borderLayers.find(b => b.type === "border" && b.color)
    if (firstBorder) {
      styles.push(`border: ${firstBorder.width} ${firstBorder.style} ${firstBorder.color};`)
    }
    const outlineLayers = borderLayers.filter(b => b.type === "outline" && b.color)
    outlineLayers.forEach(ol => {
      styles.push(`outline: ${ol.width} ${ol.style} ${ol.color};`)
    })

    if (customCss) {
      styles.push(customCss)
    }

    const css = styles.join("\n  ")
    navigator.clipboard.writeText(css).catch(console.error)
  }

  const groupedColors = React.useMemo(() => {
    const groups: Record<string, ColorVariable[]> = {}
    for (const color of colorVariables) {
      const category = color.category || "other"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(color)
    }
    return groups
  }, [colorVariables])

  if (!enabled) return null

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Preview Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={PaintBoardIcon}
            size={16}
            className={cn("h-4 w-4", previewEnabled ? "text-primary" : "text-muted-foreground")}
          />
          <div className="flex flex-col">
            <Label className="text-sm font-semibold">Preview</Label>
            <span className="text-[10px] text-muted-foreground">Show live style changes</span>
          </div>
        </div>
        <Switch
          checked={previewEnabled}
          onCheckedChange={setPreviewEnabled}
        />
      </div>

      {/* Element Selection Info */}
      {elementForStyling ? (
        <div className="text-xs text-muted-foreground p-1.5 bg-muted rounded mb-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              Selected: <span className="font-mono text-foreground">{elementForStyling.tagName.toLowerCase()}</span>
              {lockedElement && <span className="ml-2 text-[10px] text-primary">(Locked)</span>}
            </div>
            {lockedElement && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs"
                  onClick={() => loadCurrentStyles(elementForStyling)}
                  title="Reload current styles from element"
                >
                  <HugeiconsIcon icon={LayoutIcon} className="h-3 w-3 mr-0.5" />
                  Reload
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs"
                  onClick={() => {
                    setLockedElement(null)
                    lockedElementRef.current = null
                    onElementSelect?.(null)
                  }}
                  title="Unlock and select new element"
                >
                  Unlock
                </Button>
              </div>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground italic">
            Current styles loaded. Edit below or add new layers.
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground p-1.5 bg-muted rounded italic mb-2">
          Click on an element to select it
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">

        {/* Shadows Section */}
        <Collapsible open={shadowsOpen} onOpenChange={setShadowsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-1.5 rounded hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={LayoutIcon} className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium cursor-pointer">Shadows</Label>
            </div>
            {shadowsOpen ? <HugeiconsIcon icon={ArrowUp01Icon} className="h-3.5 w-3.5" /> : <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-1.5 px-2 pb-2 rounded-md bg-background border border-input shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            {/* Box Shadow */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Box Shadow</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs"
                  onClick={addBoxShadow}
                >
                  <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-0.5" />
                  Add
                </Button>
              </div>
              {boxShadows.map((shadow) => (
                <div key={shadow.id} className="space-y-1.5 p-1.5 border border-border rounded bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Layer {boxShadows.indexOf(shadow) + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeBoxShadow(shadow.id)}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">X</Label>
                      <Slider
                        value={[shadow.offsetX]}
                        onValueChange={([v]) => updateBoxShadow(shadow.id, { offsetX: v })}
                        min={-20}
                        max={20}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{shadow.offsetX}px</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Y</Label>
                      <Slider
                        value={[shadow.offsetY]}
                        onValueChange={([v]) => updateBoxShadow(shadow.id, { offsetY: v })}
                        min={-20}
                        max={20}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{shadow.offsetY}px</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Blur</Label>
                      <Slider
                        value={[shadow.blur]}
                        onValueChange={([v]) => updateBoxShadow(shadow.id, { blur: v })}
                        min={0}
                        max={50}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{shadow.blur}px</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Spread</Label>
                      <Slider
                        value={[shadow.spread]}
                        onValueChange={([v]) => updateBoxShadow(shadow.id, { spread: v })}
                        min={-10}
                        max={10}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{shadow.spread}px</div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">Color</Label>
                    <div className="flex items-center gap-1">
                      <ColorPicker
                        value={shadow.color ? rgbaToOklch(shadow.color) : "oklch(0.5 0.15 240)"}
                        onChange={(oklch) => updateBoxShadow(shadow.id, { color: oklchToRgba(oklch) })}
                        className="h-6 w-6"
                      />
                      <Input
                        value={shadow.color}
                        onChange={(e) => updateBoxShadow(shadow.id, { color: e.target.value })}
                        placeholder="rgba(0,0,0,0.1)"
                        className="h-6 text-xs flex-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Text Shadow */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Text Shadow</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs"
                  onClick={() => {
                    setTextShadows([...textShadows, {
                      id: Math.random().toString(36).substr(2, 9),
                      offsetX: 0,
                      offsetY: 2,
                      blur: 4,
                      color: "rgba(0, 0, 0, 0.5)"
                    }])
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-0.5" />
                  Add
                </Button>
              </div>
              {textShadows.map((ts) => (
                <div key={ts.id} className="space-y-1.5 p-1.5 border border-border rounded bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Layer {textShadows.indexOf(ts) + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setTextShadows(textShadows.filter(s => s.id !== ts.id))}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">X</Label>
                      <Slider
                        value={[ts.offsetX]}
                        onValueChange={([v]) => setTextShadows(textShadows.map(s => s.id === ts.id ? { ...s, offsetX: v } : s))}
                        min={-10}
                        max={10}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{ts.offsetX}px</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Y</Label>
                      <Slider
                        value={[ts.offsetY]}
                        onValueChange={([v]) => setTextShadows(textShadows.map(s => s.id === ts.id ? { ...s, offsetY: v } : s))}
                        min={-10}
                        max={10}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{ts.offsetY}px</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Blur</Label>
                      <Slider
                        value={[ts.blur]}
                        onValueChange={([v]) => setTextShadows(textShadows.map(s => s.id === ts.id ? { ...s, blur: v } : s))}
                        min={0}
                        max={20}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{ts.blur}px</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Color</Label>
                      <div className="flex items-center gap-1">
                        <ColorPicker
                          value={ts.color ? rgbaToOklch(ts.color) : "oklch(0.5 0.15 240)"}
                          onChange={(oklch) => setTextShadows(textShadows.map(s => s.id === ts.id ? { ...s, color: oklchToRgba(oklch) } : s))}
                          className="h-6 w-6"
                        />
                        <Input
                          value={ts.color}
                          onChange={(e) => setTextShadows(textShadows.map(s => s.id === ts.id ? { ...s, color: e.target.value } : s))}
                          placeholder="rgba(0,0,0,0.5)"
                          className="h-6 text-xs flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Effects Section */}
        <Collapsible open={effectsOpen} onOpenChange={setEffectsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-1.5 rounded hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={LayoutIcon} className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium cursor-pointer">Effects</Label>
            </div>
            {effectsOpen ? <HugeiconsIcon icon={ArrowUp01Icon} className="h-3.5 w-3.5" /> : <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 pt-1.5 px-2 pb-2 rounded-md bg-background border border-input shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            {/* Glow Effect */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Glow</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs"
                  onClick={() => {
                    setGlows([...glows, {
                      id: Math.random().toString(36).substr(2, 9),
                      color: "rgba(59, 130, 246, 0.5)",
                      blur: 20,
                      spread: 0
                    }])
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-0.5" />
                  Add
                </Button>
              </div>
              {glows.map((glow) => (
                <div key={glow.id} className="space-y-1.5 p-1.5 border border-border rounded bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Layer {glows.indexOf(glow) + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setGlows(glows.filter(g => g.id !== glow.id))}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Blur</Label>
                      <Slider
                        value={[glow.blur]}
                        onValueChange={([v]) => setGlows(glows.map(g => g.id === glow.id ? { ...g, blur: v } : g))}
                        min={0}
                        max={50}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{glow.blur}px</div>
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Spread</Label>
                      <Slider
                        value={[glow.spread]}
                        onValueChange={([v]) => setGlows(glows.map(g => g.id === glow.id ? { ...g, spread: v } : g))}
                        min={-10}
                        max={20}
                        step={1}
                        className="h-1"
                      />
                      <div className="text-[10px] font-mono text-foreground">{glow.spread}px</div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">Color</Label>
                    <div className="flex items-center gap-1">
                      <ColorPicker
                        value={glow.color ? rgbaToOklch(glow.color) : "oklch(0.5 0.15 240)"}
                        onChange={(oklch) => setGlows(glows.map(g => g.id === glow.id ? { ...g, color: oklchToRgba(oklch) } : g))}
                        className="h-6 w-6"
                      />
                      <Input
                        value={glow.color}
                        onChange={(e) => setGlows(glows.map(g => g.id === glow.id ? { ...g, color: e.target.value } : g))}
                        placeholder="rgba(59, 130, 246, 0.5)"
                        className="h-6 text-xs flex-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Colors Section */}
        <Collapsible open={colorsOpen} onOpenChange={setColorsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-1.5 rounded hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={PaintBoardIcon} className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium cursor-pointer">Colors</Label>
            </div>
            {colorsOpen ? <HugeiconsIcon icon={ArrowUp01Icon} className="h-3.5 w-3.5" /> : <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 pt-1.5 px-2 pb-2 rounded-md bg-background border border-input shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            {/* Background Layers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Background</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-xs"
                    onClick={() => {
                      setBackgroundLayers([...backgroundLayers, {
                        id: Math.random().toString(36).substr(2, 9),
                        type: "color",
                        value: "",
                        colorType: "custom"
                      }])
                    }}
                    title="Add color layer"
                  >
                    <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-0.5" />
                    Color
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-xs"
                    onClick={() => {
                      setBackgroundLayers([...backgroundLayers, {
                        id: Math.random().toString(36).substr(2, 9),
                        type: "gradient",
                        value: ""
                      }])
                    }}
                    title="Add gradient layer"
                  >
                    <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-0.5" />
                    Gradient
                  </Button>
                </div>
              </div>
              {backgroundLayers.map((bg) => (
                <div key={bg.id} className="space-y-1.5 p-1.5 border border-border rounded bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Layer {backgroundLayers.indexOf(bg) + 1} ({bg.type})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setBackgroundLayers(backgroundLayers.filter(b => b.id !== bg.id))}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                  {bg.type === "color" ? (
                    <>
                      <Select
                        value={bg.colorType || "custom"}
                        onValueChange={(v) => setBackgroundLayers(backgroundLayers.map(b => b.id === bg.id ? { ...b, colorType: v as "variable" | "custom" } : b))}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[var(--z-debug)]" position="popper">
                          <SelectItem value="variable">CSS Variable</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {bg.colorType === "variable" ? (
                        <Select
                          value={bg.value}
                          onValueChange={(v) => setBackgroundLayers(backgroundLayers.map(b => b.id === bg.id ? { ...b, value: v } : b))}
                        >
                          <SelectTrigger className="h-6 text-xs">
                            <SelectValue placeholder="Select color variable" />
                          </SelectTrigger>
                          <SelectContent className="z-[var(--z-debug)] max-h-[200px]" position="popper">
                            {Object.entries(groupedColors).map(([category, colors]) => (
                              <div key={category}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </div>
                                {colors.map((color) => (
                                  <SelectItem key={color.name} value={color.name}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded border border-border"
                                        style={{ backgroundColor: color.swatchColor || color.value }}
                                      />
                                      <span className="font-mono text-xs">{color.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-1">
                          <ColorPicker
                            value={bg.value ? (bg.value.startsWith('oklch(') ? bg.value : rgbaToOklch(bg.value)) : "oklch(0.5 0.15 240)"}
                            onChange={(oklch) => setBackgroundLayers(backgroundLayers.map(b => b.id === bg.id ? { ...b, value: oklch } : b))}
                            className="h-6 w-6"
                          />
                          <Input
                            value={bg.value}
                            onChange={(e) => setBackgroundLayers(backgroundLayers.map(b => b.id === bg.id ? { ...b, value: e.target.value } : b))}
                            placeholder="oklch(0.5 0.2 240) or #3b82f6"
                            className="h-6 text-xs flex-1"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <Textarea
                      value={bg.value}
                      onChange={(e) => setBackgroundLayers(backgroundLayers.map(b => b.id === bg.id ? { ...b, value: e.target.value } : b))}
                      placeholder="linear-gradient(to right, #ff0000, #0000ff)"
                      className="h-12 text-xs font-mono"
                    />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Border Section */}
        <Collapsible open={borderOpen} onOpenChange={setBorderOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-1.5 rounded hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={LayoutIcon} className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium cursor-pointer">Border</Label>
            </div>
            {borderOpen ? <HugeiconsIcon icon={ArrowUp01Icon} className="h-3.5 w-3.5" /> : <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 pt-1.5 px-2 pb-2 rounded-md bg-background border border-input shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Border</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-xs"
                    onClick={() => {
                      setBorderLayers([...borderLayers, {
                        id: Math.random().toString(36).substr(2, 9),
                        type: "border",
                        color: "",
                        width: "1px",
                        style: "solid"
                      }])
                    }}
                    title="Add border layer"
                  >
                    <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-0.5" />
                    Border
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-xs"
                    onClick={() => {
                      setBorderLayers([...borderLayers, {
                        id: Math.random().toString(36).substr(2, 9),
                        type: "outline",
                        color: "",
                        width: "1px",
                        style: "solid"
                      }])
                    }}
                    title="Add outline layer"
                  >
                    <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-0.5" />
                    Outline
                  </Button>
                </div>
              </div>
              {borderLayers.map((border) => (
                <div key={border.id} className="space-y-1.5 p-1.5 border border-border rounded bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Layer {borderLayers.indexOf(border) + 1} ({border.type})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setBorderLayers(borderLayers.filter(b => b.id !== border.id))}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 items-start">
                    <NumberInput
                      label="Width"
                      value={border.width}
                      onChange={(value) => setBorderLayers(borderLayers.map(b => b.id === border.id ? { ...b, width: value } : b))}
                      placeholder="1px"
                      min={0}
                      max={100}
                      step={1}
                      unit="px"
                    />
                    <div className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">Style</Label>
                      <Select
                        value={border.style}
                        onValueChange={(v) => setBorderLayers(borderLayers.map(b => b.id === border.id ? { ...b, style: v } : b))}
                      >
                        <SelectTrigger className="h-6 text-xs w-full" size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[var(--z-debug)]" position="popper">
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-0.5 flex flex-col">
                      <Label className="text-[10px] text-muted-foreground">Color</Label>
                      <div className="flex items-center h-6">
                        <ColorPicker
                          value={border.color ? rgbaToOklch(border.color) : "oklch(0.5 0.15 240)"}
                          onChange={(oklch) => setBorderLayers(borderLayers.map(b => b.id === border.id ? { ...b, color: oklchToRgba(oklch) } : b))}
                          className="h-6 w-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Advanced Section */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-1.5 rounded hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={CodeIcon} className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium cursor-pointer">Advanced</Label>
            </div>
            {advancedOpen ? <HugeiconsIcon icon={ArrowUp01Icon} className="h-3.5 w-3.5" /> : <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 pt-1.5 px-2 pb-2 rounded-md bg-background border border-input shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            {/* Custom CSS */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Custom CSS</Label>
              <Textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder="Enter custom CSS properties..."
                className="h-16 text-xs font-mono"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 pt-2 mt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={resetAll}
        >
          <HugeiconsIcon icon={LayoutIcon} className="h-3 w-3 mr-1" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={exportCss}
        >
          <HugeiconsIcon icon={CodeIcon} className="h-3 w-3 mr-1" />
          Export CSS
        </Button>
      </div>
    </div>
  )
}

