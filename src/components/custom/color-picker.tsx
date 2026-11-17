"use client"

import {
  IconCheck,
  IconCopy,
} from "@/components/icons"
import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/index"
import { Button } from "@/index"
import { ColorSlider } from "./color-slider"
import { cn } from "@/lib/utils"
import {
  type Oklch,
  formatOklch,
  hexToOklch,
  normalizeHex,
  oklchToHex,
  parseHex,
  parseOklch,
  rgbToHsl,
} from "@/lib/oklch"

/** Value format of `ColorPicker`: `"oklch"` (`oklch(L C H)`, the default) or `"hex"` (`#rrggbb`). */
export type ColorPickerFormat = "hex" | "oklch"

export interface ColorPickerProps {
  /**
   * The colour. In `"oklch"` format (default): `oklch(L C H)`. In `"hex"` format: `#rrggbb`
   * (`#rgb` and uppercase are accepted). Either format is read; `onChange` emits the active one.
   */
  value?: string
  /** Called with `oklch(L C H)` in `"oklch"` format, or lowercase `#rrggbb` in `"hex"` format. */
  onChange?: (_color: string) => void
  /** Value format of `value` and `onChange`. Default `"oklch"`. */
  format?: ColorPickerFormat
  className?: string
  disabled?: boolean
  variant?: 'popover' | 'inline' // Display mode
}

const DEFAULT_OKLCH: Oklch = { L: 0.5, C: 0.15, H: 240 }
const DEFAULT_OKLCH_VALUE = "oklch(0.5 0.15 240)"
const DEFAULT_HEX_VALUE = oklchToHex(DEFAULT_OKLCH)

const QUICK_COLORS: ReadonlyArray<{ name: string; oklch: string }> = [
  { name: "Red", oklch: "oklch(0.55 0.22 25)" },
  { name: "Orange", oklch: "oklch(0.65 0.2 60)" },
  { name: "Yellow", oklch: "oklch(0.75 0.15 100)" },
  { name: "Lime", oklch: "oklch(0.7 0.18 140)" },
  { name: "Green", oklch: "oklch(0.6 0.2 160)" },
  { name: "Cyan", oklch: "oklch(0.65 0.15 200)" },
  { name: "Blue", oklch: "oklch(0.6 0.25 240)" },
  { name: "Purple", oklch: "oklch(0.55 0.22 280)" },
]

interface PickerColor {
  oklch: Oklch
  /** The source hex: kept as given so a passed hex is not regenerated through the float maths. */
  hex: string
}

/** Read a hex or `oklch()` value. Returns null when the value is neither. */
function readColor(value: string): PickerColor | null {
  const hex = normalizeHex(value)
  if (hex) return { hex, oklch: hexToOklch(hex) ?? DEFAULT_OKLCH }
  const oklch = parseOklch(value)
  if (oklch) return { oklch, hex: oklchToHex(oklch) }
  return null
}

/** An achromatic colour has no hue: keep the previous hue so the hue slider does not jump. */
function keepHue(next: PickerColor, prevHue: number): PickerColor {
  return next.oklch.C === 0 ? { ...next, oklch: { ...next.oklch, H: prevHue } } : next
}

export function ColorPicker({ value, onChange, format = "oklch", className, disabled, variant = 'popover' }: ColorPickerProps) {
  const resolvedValue = value ?? (format === "oklch" ? DEFAULT_OKLCH_VALUE : DEFAULT_HEX_VALUE)
  const [open, setOpen] = React.useState(false)
  const [color, setColor] = React.useState<PickerColor>(
    () => readColor(resolvedValue) ?? { oklch: DEFAULT_OKLCH, hex: DEFAULT_HEX_VALUE }
  )
  const [hexDraft, setHexDraft] = React.useState(color.hex)
  const [hexEditing, setHexEditing] = React.useState(false)
  const [copiedFormat, setCopiedFormat] = React.useState<string | null>(null)
  // The last value this picker emitted. When the caller echoes it back as `value`, the local
  // state is kept, so the sliders do not snap to the quantized (8-bit / gamut-clamped) colour.
  const lastEmitted = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (resolvedValue === lastEmitted.current) return
    const next = readColor(resolvedValue)
    if (next) setColor((prev) => keepHue(next, prev.oklch.H))
  }, [resolvedValue])

  React.useEffect(() => {
    if (!hexEditing) setHexDraft(color.hex)
  }, [color.hex, hexEditing])

  const oklch = color.oklch

  const emit = (next: PickerColor) => {
    const out = format === "oklch" ? formatOklch(next.oklch) : next.hex
    lastEmitted.current = out
    onChange?.(out)
  }

  const commit = (next: PickerColor) => {
    setColor(next)
    emit(next)
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
    const nextOklch = { ...oklch, [field]: val }
    commit({ oklch: nextOklch, hex: oklchToHex(nextOklch) })
  }

  /** Commit a hex from the HEX field. `allowShort` also accepts `#rgb` (on blur / Enter only). */
  const commitHexDraft = (draft: string, allowShort: boolean): boolean => {
    const trimmed = draft.trim()
    if (!allowShort && !/^#?[0-9a-f]{6}$/i.test(trimmed)) return false
    const hex = normalizeHex(trimmed)
    if (!hex) return false
    if (hex !== color.hex) {
      const next = keepHue({ hex, oklch: hexToOklch(hex) ?? DEFAULT_OKLCH }, oklch.H)
      commit(next)
    }
    return true
  }

  const handleHexInput = (draft: string) => {
    setHexDraft(draft)
    commitHexDraft(draft, false)
  }

  const handleHexBlur = () => {
    setHexEditing(false)
    commitHexDraft(hexDraft, true)
    // Valid: show the canonical value. Invalid: revert to the current colour.
    setHexDraft(normalizeHex(hexDraft) ?? color.hex)
  }

  const handleHexKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitHexDraft(hexDraft, true)
      setHexDraft(normalizeHex(hexDraft) ?? color.hex)
    } else if (event.key === "Escape") {
      setHexDraft(color.hex)
    }
  }

  const hexColor = color.hex
  const oklchCss = `oklch(${oklch.L} ${oklch.C} ${oklch.H})`
  const swatchColor = format === "hex" ? hexColor : oklchCss
  const oklchColor = `oklch(${oklch.L.toFixed(3)} ${oklch.C.toFixed(3)} ${Number(oklch.H.toFixed(1))})`
  const hslColor = rgbToHsl(parseHex(hexColor) ?? { r: 0, g: 0, b: 0 })
  const hslString = `hsl(${Math.round(hslColor.h) % 360} ${Math.round(hslColor.s)}% ${Math.round(hslColor.l)}%)`

  const colorPickerContent = (
    <div className="space-y-4">
      {/* Color Display */}
      <div className="flex items-center gap-3">
        <div
          className="h-16 w-16 rounded border border-border flex-shrink-0"
          style={{ backgroundColor: swatchColor }}
        />
        <div className="flex-1 space-y-2">
          {/* OKLCH */}
          <div>
            <div className="text-xs font-semibold mb-1">OKLCH</div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                aria-label="OKLCH color value"
                value={oklchColor}
                readOnly
                className="text-[10px] font-mono w-full px-2 py-1 border border-border rounded bg-muted"
              />
              <Button
                variant="ghost"
                size="sm"
                aria-label="Copy OKLCH value"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(oklchColor, 'oklch')}
              >
                {copiedFormat === 'oklch' ? <IconCheck size={12} className="w-3 h-3 text-success-foreground" /> : <IconCopy size={12} className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* HEX */}
          <div>
            <div className="text-xs font-semibold mb-1">HEX</div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                aria-label="HEX color value"
                value={hexDraft}
                spellCheck={false}
                onFocus={() => setHexEditing(true)}
                onChange={(e) => handleHexInput(e.target.value)}
                onBlur={handleHexBlur}
                onKeyDown={handleHexKeyDown}
                className="text-[10px] font-mono w-full px-2 py-1 border border-border rounded bg-background"
              />
              <Button
                variant="ghost"
                size="sm"
                aria-label="Copy HEX value"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(hexColor, 'hex')}
              >
                {copiedFormat === 'hex' ? <IconCheck size={12} className="w-3 h-3 text-success-foreground" /> : <IconCopy size={12} className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* HSL */}
          <div>
            <div className="text-xs font-semibold mb-1">HSL</div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                aria-label="HSL color value"
                value={hslString}
                readOnly
                className="text-[10px] font-mono w-full px-2 py-1 border border-border rounded bg-muted"
              />
              <Button
                variant="ghost"
                size="sm"
                aria-label="Copy HSL value"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(hslString, 'hsl')}
              >
                {copiedFormat === 'hsl' ? <IconCheck size={12} className="w-3 h-3 text-success-foreground" /> : <IconCopy size={12} className="w-3 h-3" />}
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
            aria-label="Hue"
            value={[oklch.H]}
            onValueChange={(vals) => handleChange("H", vals[0] ?? 0)}
            min={0}
            max={360}
            step={1}
            sliderType="hue"
            thumbColor={oklchCss}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Chroma</label>
            <span className="text-xs text-muted-foreground">{(oklch.C * 100).toFixed(0)}%</span>
          </div>
          <ColorSlider
            aria-label="Chroma"
            value={[oklch.C * 100]}
            onValueChange={(vals) => handleChange("C", (vals[0] ?? 0) / 100)}
            min={0}
            max={50}
            step={1}
            sliderType="saturation"
            currentHue={oklch.H}
            thumbColor={oklchCss}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Lightness</label>
            <span className="text-xs text-muted-foreground">{(oklch.L * 100).toFixed(0)}%</span>
          </div>
          <ColorSlider
            aria-label="Lightness"
            value={[oklch.L * 100]}
            onValueChange={(vals) => handleChange("L", (vals[0] ?? 0) / 100)}
            min={0}
            max={100}
            step={1}
            sliderType="lightness"
            currentHue={oklch.H}
            thumbColor={oklchCss}
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <div className="text-xs font-medium mb-2">Quick Colors</div>
        <div className="grid grid-cols-8 gap-1">
          {QUICK_COLORS.map((preset) => {
            const presetOklch = parseOklch(preset.oklch) ?? DEFAULT_OKLCH
            return (
              <button
                key={preset.name}
                type="button"
                aria-label={preset.name}
                onClick={() => commit({ oklch: presetOklch, hex: oklchToHex(presetOklch) })}
                className="h-8 w-full rounded border border-border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ backgroundColor: format === "hex" ? oklchToHex(presetOklch) : preset.oklch }}
                title={preset.name}
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
          style={{ backgroundColor: swatchColor }}
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

