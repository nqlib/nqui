import { describe, expect, it } from "vitest"
import {
  colorToHex,
  colorToOklch,
  formatOklch,
  hexToOklch,
  normalizeHex,
  oklchToHex,
  parseOklch,
  rgbToHex,
} from "./oklch"

function roundTrip(hex: string): string {
  const oklch = hexToOklch(hex)
  if (!oklch) throw new Error(`invalid hex ${hex}`)
  return oklchToHex(oklch)
}

describe("oklch conversions", () => {
  it.each([
    "#000000",
    "#ffffff",
    "#808080",
    "#27272a",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#091f65",
  ])("round-trips %s exactly", (hex) => {
    expect(roundTrip(hex)).toBe(hex)
  })

  it("round-trips 200 random colours exactly", () => {
    // Deterministic LCG so a failure is reproducible.
    let seed = 0x2f6e2b1
    const next = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed
    }
    for (let i = 0; i < 200; i++) {
      const n = next() & 0xffffff
      const hex = rgbToHex({ r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 })
      expect(roundTrip(hex)).toBe(hex)
      // The oklch() string keeps enough digits for the same exact round trip.
      expect(oklchToHex(parseOklch(formatOklch(hexToOklch(hex)!))!)).toBe(hex)
    }
  })

  it("matches reference values", () => {
    const red = hexToOklch("#ff0000")!
    expect(Math.abs(red.L - 0.628)).toBeLessThan(0.001)
    expect(Math.abs(red.C - 0.258)).toBeLessThan(0.001)
    expect(Math.abs(red.H - 29.2)).toBeLessThan(0.5)

    const white = hexToOklch("#ffffff")!
    expect(Math.abs(white.L - 1)).toBeLessThan(0.001)
    expect(white.C).toBeLessThan(0.001)
  })

  it("maps sRGB red in OKLCH back to #ff0000", () => {
    expect(oklchToHex({ L: 0.628, C: 0.258, H: 29.2 })).toBe("#ff0000")
  })

  it("clamps out-of-gamut colours to a valid hex", () => {
    expect(oklchToHex({ L: 0.6, C: 0.4, H: 240 })).toMatch(/^#[0-9a-f]{6}$/)
  })

  it("normalizes hex input", () => {
    expect(normalizeHex("#ABC")).toBe("#aabbcc")
    expect(normalizeHex("FF8800")).toBe("#ff8800")
    expect(normalizeHex("#ff88")).toBeNull()
    expect(normalizeHex("oklch(0.5 0.1 20)")).toBeNull()
  })

  it("parses and formats oklch strings", () => {
    expect(parseOklch("oklch(0.5 0.15 240)")).toEqual({ L: 0.5, C: 0.15, H: 240 })
    expect(parseOklch("oklch(50% 0.15 240)")).toEqual({ L: 0.5, C: 0.15, H: 240 })
    expect(parseOklch("#ff0000")).toBeNull()
    expect(formatOklch({ L: 0.5, C: 0.15, H: 240 })).toBe("oklch(0.5 0.15 240)")
  })

  it("converts colour strings with the public helpers", () => {
    expect(colorToHex("#ABC")).toBe("#aabbcc")
    expect(colorToHex("oklch(0.62796 0.25768 29.234)")).toBe("#ff0000")
    expect(colorToHex("red")).toBeNull()
    expect(colorToOklch("#ff0000")).toBe("oklch(0.62796 0.25768 29.234)")
    expect(colorToOklch("oklch(0.5 0.15 240)")).toBe("oklch(0.5 0.15 240)")
    expect(colorToOklch("nope")).toBeNull()
    expect(colorToHex(colorToOklch("#27272a")!)).toBe("#27272a")
  })
})
