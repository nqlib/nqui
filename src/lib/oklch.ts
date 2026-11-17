/**
 * sRGB ↔ OKLCH conversion (Björn Ottosson's OKLab, https://bottosson.github.io/posts/oklab/).
 *
 * ColorPicker and the debug UI tester use this module. Only `colorToHex` and `colorToOklch`
 * are public (re-exported from `src/lib/index.ts`); the other helpers are internal.
 *
 * Forward:  sRGB (gamma) → linear sRGB → LMS → cube root → OKLab → OKLCH
 * Inverse:  OKLCH → OKLab → LMS' → cube → linear sRGB → sRGB gamma → clamp 0..1 → 8-bit
 */

export interface Oklch {
  /** Lightness, 0..1 */
  L: number
  /** Chroma, 0..~0.4 */
  C: number
  /** Hue in degrees, 0..360 */
  H: number
}

export interface Rgb {
  /** 0..255 */
  r: number
  /** 0..255 */
  g: number
  /** 0..255 */
  b: number
}

/** Chroma below this is treated as achromatic (hue is meaningless). */
const ACHROMATIC_EPSILON = 1e-6

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/** 8-bit sRGB channels → OKLCH. */
export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const rl = srgbToLinear(r / 255)
  const gl = srgbToLinear(g / 255)
  const bl = srgbToLinear(b / 255)

  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const C = Math.sqrt(A * A + B * B)
  if (C < ACHROMATIC_EPSILON) return { L, C: 0, H: 0 }

  let H = (Math.atan2(B, A) * 180) / Math.PI
  if (H < 0) H += 360
  return { L, C, H }
}

/**
 * OKLCH → 8-bit sRGB channels. Out-of-gamut colours are clamped per channel.
 */
export function oklchToRgb({ L, C, H }: Oklch): Rgb {
  if (!Number.isFinite(L) || !Number.isFinite(C) || !Number.isFinite(H)) {
    return { r: 0, g: 0, b: 0 }
  }
  const hRad = (H * Math.PI) / 180
  const A = C * Math.cos(hRad)
  const B = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B
  const s_ = L - 0.0894841775 * A - 1.291485548 * B

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const rl = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gl = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  const to8 = (c: number) => Math.round(clamp01(linearToSrgb(c)) * 255)
  return { r: to8(rl), g: to8(gl), b: to8(bl) }
}

/**
 * Parse `#rgb` / `#rrggbb` (the `#` is optional, any case). Returns null when invalid.
 */
export function parseHex(input: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim())
  if (!match) return null
  let digits = match[1]
  if (digits.length === 3) {
    digits = digits
      .split("")
      .map((d) => d + d)
      .join("")
  }
  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
  }
}

/** 8-bit channels → lowercase `#rrggbb`. */
export function rgbToHex({ r, g, b }: Rgb): string {
  const part = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0")
  return `#${part(r)}${part(g)}${part(b)}`
}

/** Normalize a hex input to lowercase `#rrggbb`, or null when invalid. */
export function normalizeHex(input: string): string | null {
  const rgb = parseHex(input)
  return rgb ? rgbToHex(rgb) : null
}

export function hexToOklch(input: string): Oklch | null {
  const rgb = parseHex(input)
  return rgb ? rgbToOklch(rgb) : null
}

export function oklchToHex(oklch: Oklch): string {
  return rgbToHex(oklchToRgb(oklch))
}

/** Parse `oklch(L C H)` (L as 0..1 or a percentage). Returns null when invalid. */
export function parseOklch(input: string): Oklch | null {
  const match =
    /^\s*oklch\(\s*([0-9]*\.?[0-9]+)(%?)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)(?:deg)?\s*(?:\/\s*[0-9.]+%?\s*)?\)\s*$/i.exec(
      input
    )
  if (!match) return null
  const L = parseFloat(match[1]) / (match[2] ? 100 : 1)
  const C = parseFloat(match[3])
  const H = parseFloat(match[4])
  if (![L, C, H].every(Number.isFinite)) return null
  return { L, C, H }
}

/** Format as `oklch(L C H)` with L/C to 5 and H to 3 decimals (trailing zeros dropped). Enough for an exact 8-bit round trip. */
export function formatOklch({ L, C, H }: Oklch): string {
  const round = (n: number, digits: number) => Number(n.toFixed(digits))
  return `oklch(${round(L, 5)} ${round(C, 5)} ${round(H, 3)})`
}

/** 8-bit channels → HSL (h in degrees, s and l in percent). */
export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const diff = max - min
  const l = (max + min) / 2

  let h = 0
  if (diff !== 0) {
    if (max === rn) h = ((gn - bn) / diff) % 6
    else if (max === gn) h = (bn - rn) / diff + 2
    else h = (rn - gn) / diff + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1))
  return { h, s: s * 100, l: l * 100 }
}

/**
 * Convert a colour string to lowercase `#rrggbb`.
 * Accepts `#rgb`, `#rrggbb` (any case) or `oklch(L C H)`. Returns null when the input is neither.
 * Out-of-gamut OKLCH colours are clamped per channel.
 */
export function colorToHex(color: string): string | null {
  const hex = normalizeHex(color)
  if (hex) return hex
  const oklch = parseOklch(color)
  return oklch ? oklchToHex(oklch) : null
}

/**
 * Convert a colour string to `oklch(L C H)`.
 * Accepts `#rgb`, `#rrggbb` (any case) or `oklch(L C H)`. Returns null when the input is neither.
 * The output keeps enough digits for an exact hex → OKLCH → hex round trip.
 */
export function colorToOklch(color: string): string | null {
  const fromHex = hexToOklch(color)
  if (fromHex) return formatOklch(fromHex)
  const oklch = parseOklch(color)
  return oklch ? formatOklch(oklch) : null
}
