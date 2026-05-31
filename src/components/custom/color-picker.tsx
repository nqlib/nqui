"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/index"
import { Button } from "@/index"
import { ColorSlider } from "./color-slider"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

export interface ColorPickerProps {
  value?: string // OKLCH string (e.g., "oklch(0.75 0.15 240)")
  onChange?: (_color: string) => void
  className?: string
  disabled?: boolean
  variant?: 'popover' | 'inline' // Display mode
}

// OKLCH to RGB conversion for hex display
function oklchToHex(L: number, C: number, H: number): string {
  // Handle edge cases
  if (!isFinite(L) || L < 0 || L > 1) {
    return "#000000"
  }

  // If chroma is 0 or very low, treat as grayscale
  if (C < 0.001) {
    const grayValue = Math.max(0, Math.min(1, L))
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }
    return `#${toHex(grayValue)}${toHex(grayValue)}${toHex(grayValue)}`
  }

  // Convert OKLCH to RGB
  const h = (H / 360) * 2 * Math.PI
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  // OKLab to linear RGB
  const l = L + 0.3963377774 * a + 0.2158037573 * b
  const m = L - 0.1055613458 * a - 0.0638541728 * b
  const s = L - 0.0894841775 * a - 1.2914855480 * b

  // Linear RGB to sRGB
  const r = Math.max(0, Math.min(1, Math.sign(l) * Math.pow(Math.abs(l) * 0.999999998 * 2 - 1, 1 / 3)))
  const g = Math.max(0, Math.min(1, Math.sign(m) * Math.pow(Math.abs(m) * 0.999999998 * 2 - 1, 1 / 3)))
  const bl = Math.max(0, Math.min(1, Math.sign(s) * Math.pow(Math.abs(s) * 0.999999998 * 2 - 1, 1 / 3)))

  // Convert to hex
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  const hexR = toHex(r)
  const hexG = toHex(g)
  const hexB = toHex(bl)

  // Check for NaN values
  if (hexR === "NaN" || hexG === "NaN" || hexB === "NaN") {
    return "#000000"
  }

  return `#${hexR}${hexG}${hexB}`
}

// Parse OKLCH string
function parseOklch(colorStr: string): { L: number; C: number; H: number } {
  const match = colorStr.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/)
  if (match) {
    return {
      L: parseFloat(match[1]),
      C: parseFloat(match[2]),
      H: parseFloat(match[3]),
    }
  }
  return { L: 0.5, C: 0.15, H: 240 }
}

// RGB to OKLCH conversion
function rgbToOklch(r: number, g: number, b: number): { L: number; C: number; H: number } {
  // Normalize RGB
  r = r / 255
  g = g / 255
  b = b / 255

  // Linearize RGB
  r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  // Convert to OKLab
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  // Convert to OKLCH
  const L = Math.pow(Math.abs(l) * 0.999999998, 1 / 3) * Math.sign(l) * 0.5 + 0.5

  const a = l - m
  const bVal = (l + m - 2 * s) / 2

  const C = Math.sqrt(a * a + bVal * bVal)
  let H = Math.atan2(bVal, a) * (180 / Math.PI)
  if (H < 0) H += 360

  return { L, C, H }
}

export function ColorPicker({ value = "oklch(0.5 0.15 240)", onChange, className, disabled, variant = 'popover' }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [oklch, setOklch] = React.useState(() => parseOklch(value))
  const [copiedFormat, setCopiedFormat] = React.useState<string | null>(null)

  React.useEffect(() => {
    setOklch(parseOklch(value))
  }, [value])

  // Convert OKLCH to RGB then to HSL
  const oklchToHsl = (L: number, C: number, H: number): { h: number; s: number; l: number } => {
    // Handle grayscale (low chroma)
    if (C < 0.001 || !isFinite(C)) {
      const lPercent = Math.max(0, Math.min(100, L * 100))
      return { h: 0, s: 0, l: lPercent }
    }

    // Reuse the OKLCH to RGB conversion logic
    // Convert OKLCH to RGB first
    const hRad = (H / 360) * 2 * Math.PI
    const a = C * Math.cos(hRad)
    const b = C * Math.sin(hRad)

    const lOk = L + 0.3963377774 * a + 0.2158037573 * b
    const mOk = L - 0.1055613458 * a - 0.0638541728 * b
    const sOk = L - 0.0894841775 * a - 1.2914855480 * b

    // OKLab to linear RGB
    const rLin = Math.max(0, Math.min(1, Math.sign(lOk) * Math.pow(Math.abs(lOk) * 0.999999998 * 2 - 1, 1 / 3)))
    const gLin = Math.max(0, Math.min(1, Math.sign(mOk) * Math.pow(Math.abs(mOk) * 0.999999998 * 2 - 1, 1 / 3)))
    const bLin = Math.max(0, Math.min(1, Math.sign(sOk) * Math.pow(Math.abs(sOk) * 0.999999998 * 2 - 1, 1 / 3)))

    // Linear RGB to sRGB (gamma correction)
    const toSRGB = (c: number) => {
      if (!isFinite(c)) return 0
      return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055
    }

    const rNorm = Math.max(0, Math.min(1, toSRGB(rLin)))
    const gNorm = Math.max(0, Math.min(1, toSRGB(gLin)))
    const bNorm = Math.max(0, Math.min(1, toSRGB(bLin)))

    // Convert RGB to HSL
    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    const diff = max - min

    let hue = 0
    if (diff !== 0) {
      if (max === rNorm) {
        hue = ((gNorm - bNorm) / diff) % 6
      } else if (max === gNorm) {
        hue = (bNorm - rNorm) / diff + 2
      } else {
        hue = (rNorm - gNorm) / diff + 4
      }
      hue = Math.round(hue * 60)
      if (hue < 0) hue += 360
    }

    const lightness = (max + min) / 2
    const saturation = max === 0 || min === 1 ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1))

    return {
      h: hue,
      s: Math.max(0, Math.min(100, saturation * 100)),
      l: Math.max(0, Math.min(100, lightness * 100))
    }
  }

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleChange = (field: "L" | "C" | "H", val: number) => {
    const newOklch = { ...oklch, [field]: val }
    setOklch(newOklch)
    onChange?.(`oklch(${newOklch.L} ${newOklch.C} ${newOklch.H})`)
  }

  const handleHexChange = (hex: string) => {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (rgb) {
      const r = parseInt(rgb[1], 16)
      const g = parseInt(rgb[2], 16)
      const b = parseInt(rgb[3], 16)
      const newOklch = rgbToOklch(r, g, b)
      setOklch(newOklch)
      onChange?.(`oklch(${newOklch.L} ${newOklch.C} ${newOklch.H})`)
    }
  }

  const hexColor = oklchToHex(oklch.L, oklch.C, oklch.H)
  const oklchColor = `oklch(${oklch.L.toFixed(2)} ${oklch.C.toFixed(2)} ${oklch.H})`
  const hslColor = oklchToHsl(oklch.L, oklch.C, oklch.H)
  const hslString = `hsl(${Math.round(hslColor.h)} ${Math.round(hslColor.s)}% ${Math.round(hslColor.l)}%)`

  const colorPickerContent = (
    <div className="space-y-4">
      {/* Color Display */}
      <div className="flex items-center gap-3">
        <div
          className="h-16 w-16 rounded border border-border flex-shrink-0"
          style={{ backgroundColor: `oklch(${oklch.L} ${oklch.C} ${oklch.H})` }}
        />
        <div className="flex-1 space-y-2">
          {/* OKLCH */}
          <div>
            <div className="text-xs font-semibold mb-1">OKLCH</div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={oklchColor}
                readOnly
                className="text-[10px] font-mono w-full px-2 py-1 border border-border rounded bg-muted"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(oklchColor, 'oklch')}
              >
                {copiedFormat === 'oklch' ? <HugeiconsIcon icon={Tick02Icon} size={12} className="w-3 h-3 text-success-foreground" /> : <HugeiconsIcon icon={Copy01Icon} size={12} className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* HEX */}
          <div>
            <div className="text-xs font-semibold mb-1">HEX</div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={hexColor}
                onChange={(e) => handleHexChange(e.target.value)}
                className="text-[10px] font-mono w-full px-2 py-1 border border-border rounded bg-background"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(hexColor, 'hex')}
              >
                {copiedFormat === 'hex' ? <HugeiconsIcon icon={Tick02Icon} size={12} className="w-3 h-3 text-success-foreground" /> : <HugeiconsIcon icon={Copy01Icon} size={12} className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* HSL */}
          <div>
            <div className="text-xs font-semibold mb-1">HSL</div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={hslString}
                readOnly
                className="text-[10px] font-mono w-full px-2 py-1 border border-border rounded bg-muted"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(hslString, 'hsl')}
              >
                {copiedFormat === 'hsl' ? <HugeiconsIcon icon={Tick02Icon} size={12} className="w-3 h-3 text-success-foreground" /> : <HugeiconsIcon icon={Copy01Icon} size={12} className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* OKLCH Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Hue</label>
            <span className="text-xs text-muted-foreground">{Math.round(oklch.H)}°</span>
          </div>
          <ColorSlider
            value={[oklch.H]}
            onValueChange={(vals) => handleChange("H", vals[0] ?? 0)}
            min={0}
            max={360}
            step={1}
            sliderType="hue"
            thumbColor={`oklch(${oklch.L} ${oklch.C} ${oklch.H})`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Chroma</label>
            <span className="text-xs text-muted-foreground">{(oklch.C * 100).toFixed(0)}%</span>
          </div>
          <ColorSlider
            value={[oklch.C * 100]}
            onValueChange={(vals) => handleChange("C", (vals[0] ?? 0) / 100)}
            min={0}
            max={50}
            step={1}
            sliderType="saturation"
            currentHue={oklch.H}
            thumbColor={`oklch(${oklch.L} ${oklch.C} ${oklch.H})`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Lightness</label>
            <span className="text-xs text-muted-foreground">{(oklch.L * 100).toFixed(0)}%</span>
          </div>
          <ColorSlider
            value={[oklch.L * 100]}
            onValueChange={(vals) => handleChange("L", (vals[0] ?? 0) / 100)}
            min={0}
            max={100}
            step={1}
            sliderType="lightness"
            currentHue={oklch.H}
            thumbColor={`oklch(${oklch.L} ${oklch.C} ${oklch.H})`}
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <div className="text-xs font-medium mb-2">Quick Colors</div>
        <div className="grid grid-cols-8 gap-1">
          {[
            { name: "Red", oklch: "oklch(0.55 0.22 25)" },
            { name: "Orange", oklch: "oklch(0.65 0.20 60)" },
            { name: "Yellow", oklch: "oklch(0.75 0.15 100)" },
            { name: "Lime", oklch: "oklch(0.70 0.18 140)" },
            { name: "Green", oklch: "oklch(0.60 0.20 160)" },
            { name: "Cyan", oklch: "oklch(0.65 0.15 200)" },
            { name: "Blue", oklch: "oklch(0.60 0.25 240)" },
            { name: "Purple", oklch: "oklch(0.55 0.22 280)" },
          ].map((color) => {
            const parsed = parseOklch(color.oklch)
            return (
              <button
                key={color.name}
                onClick={() => {
                  setOklch(parsed)
                  onChange?.(color.oklch)
                }}
                className="h-8 w-full rounded border border-border transition-all hover:scale-110"
                style={{ backgroundColor: color.oklch }}
                title={color.name}
              />
            )
          })}
        </div>
      </div>
    </div>
  )

  if (variant === 'inline') {
    return (
      <div className={cn("w-full", className)}>
        {colorPickerContent}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("h-8 w-8 p-0 border-2", className)}
          style={{ backgroundColor: `oklch(${oklch.L} ${oklch.C} ${oklch.H})` }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 border-border shadow-lg z-[var(--z-popover)]">
        {colorPickerContent}
      </PopoverContent>
    </Popover>
  )
}

