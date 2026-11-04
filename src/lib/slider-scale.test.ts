import { describe, it, expect } from "vitest"
import {
  computeTicks,
  fromFraction,
  fromPosition,
  nearestMark,
  niceInterval,
  normalizeMarks,
  segmentCount,
  segmentsAllowed,
  snap,
  stepPrecision,
  toFraction,
  toPosition,
} from "./slider-scale"

describe("toFraction / fromFraction", () => {
  it("linear maps ends and midpoint", () => {
    const d = { min: -12, max: 12 }
    expect(toFraction(-12, d)).toBe(0)
    expect(toFraction(0, d)).toBe(0.5)
    expect(toFraction(12, d)).toBe(1)
    expect(fromFraction(0.25, d)).toBe(-6)
  })

  it("log puts the geometric midpoint at 50%", () => {
    const d = { min: 25, max: 400, scale: "log" as const }
    expect(toFraction(100, d)).toBeCloseTo(0.5, 10)
    expect(fromFraction(0.5, d)).toBeCloseTo(100, 10)
  })

  it("clamps out-of-range values", () => {
    expect(toFraction(500, { min: 0, max: 100 })).toBe(1)
    expect(toFraction(-5, { min: 0, max: 100 })).toBe(0)
  })

  it("min === max is position 0, not NaN", () => {
    expect(toFraction(3, { min: 3, max: 3 })).toBe(0)
  })

  it("log with min <= 0 throws a clear error", () => {
    expect(() => toFraction(1, { min: 0, max: 10, scale: "log" })).toThrow(/min > 0/)
  })

  it("position round-trips through snap without drift", () => {
    const d = { min: 20, max: 120, scale: "log" as const }
    for (const v of [20, 33, 60, 100, 120]) {
      expect(snap(fromPosition(toPosition(v, d), d), { min: 20, max: 120, step: 1 })).toBe(v)
    }
  })
})

describe("snap", () => {
  it("removes float drift using the step precision", () => {
    expect(snap(0.1 + 0.2, { min: 0, max: 1, step: 0.1 })).toBe(0.3)
    expect(snap(1.2345, { min: 0, max: 3, step: 0.05 })).toBe(1.25)
  })
  it("steps from min, not from zero", () => {
    expect(snap(7, { min: 1, max: 20, step: 5 })).toBe(6)
  })
  it("clamps", () => {
    expect(snap(-3, { min: 0, max: 10, step: 1 })).toBe(0)
  })
  it("reads exponent notation", () => {
    expect(stepPrecision(1e-7)).toBe(7)
  })
})

describe("niceInterval", () => {
  it("keeps the step when there is room", () => {
    expect(niceInterval({ span: 4, widthPx: 400, minPx: 6, base: 0.1 })).toBe(0.1)
  })
  it("thins out on a narrow track", () => {
    expect(niceInterval({ span: 4, widthPx: 120, minPx: 6, base: 0.1 })).toBe(0.2)
  })
  it("uses unit candidates when given", () => {
    expect(niceInterval({ span: 24, widthPx: 200, minPx: 6, base: 0.5, candidates: [0.25, 0.5, 1, 3, 6] })).toBe(1)
  })
})

describe("computeTicks", () => {
  it("bipolar scale always has a labelled tick at the origin", () => {
    const ticks = computeTicks({ min: -2, max: 2, step: 0.1, widthPx: 400, origin: 0 })
    const zero = ticks.find((t) => t.value === 0)
    expect(zero?.major).toBe(true)
    expect(zero?.label).toBe("0")
    expect(ticks[0].value).toBe(-2)
    expect(ticks[ticks.length - 1].value).toBe(2)
  })

  it("tick count shrinks with width", () => {
    const wide = computeTicks({ min: 0, max: 24, step: 0.5, widthPx: 600 })
    const narrow = computeTicks({ min: 0, max: 24, step: 0.5, widthPx: 120 })
    expect(narrow.length).toBeLessThan(wide.length)
    for (const set of [wide, narrow]) {
      const gaps = set.slice(1).map((t, i) => ((t.pct - set[i].pct) / 100) * (set === wide ? 600 : 120))
      expect(Math.min(...gaps)).toBeGreaterThanOrEqual(6 - 1e-6)
    }
  })

  it("labels keep their minimum spacing", () => {
    const ticks = computeTicks({ min: 0, max: 100, step: 1, widthPx: 300, minLabelPx: 48 })
    const majors = ticks.filter((t) => t.major)
    const gaps = majors.slice(1).map((t, i) => ((t.pct - majors[i].pct) / 100) * 300)
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(48)
  })

  it("takes the major interval from unit candidates when one fits", () => {
    const ticks = computeTicks({ min: -180, max: 180, step: 1, widthPx: 270, origin: 0, candidates: [5, 15, 30, 45, 90] })
    expect(ticks.filter((t) => t.major).map((t) => t.value)).toEqual([-180, -90, 0, 90, 180])
  })

  it("formats labels", () => {
    const ticks = computeTicks({ min: 0, max: 10, step: 1, widthPx: 500, format: (v) => `${v}h` })
    expect(ticks.find((t) => t.major)?.label).toMatch(/h$/)
  })

  it("empty for a zero-width or empty domain", () => {
    expect(computeTicks({ min: 0, max: 10, step: 1, widthPx: 0 })).toEqual([])
    expect(computeTicks({ min: 5, max: 5, step: 1, widthPx: 300 })).toEqual([])
  })

  it("log ticks stay evenly spaced along the track", () => {
    const ticks = computeTicks({ min: 25, max: 400, step: 5, widthPx: 400, scale: "log" })
    expect(ticks.length).toBeGreaterThan(2)
    const gaps = ticks.slice(1).map((t, i) => ((t.pct - ticks[i]!.pct) / 100) * 400)
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(6 - 1e-6)
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(1)
    expect(ticks[0]!.pct).toBeCloseTo(0, 6)
    expect(ticks[ticks.length - 1]!.pct).toBeLessThan(100)
  })
})

describe("segments", () => {
  it("counts steps inclusively", () => {
    expect(segmentCount({ min: 1, max: 7, step: 1 })).toBe(7)
  })
  it("allows 5–12 steps only", () => {
    expect(segmentsAllowed({ min: 1, max: 4, step: 1 })).toBe(false)
    expect(segmentsAllowed({ min: 1, max: 5, step: 1 })).toBe(true)
    expect(segmentsAllowed({ min: 1, max: 12, step: 1 })).toBe(true)
    expect(segmentsAllowed({ min: 1, max: 13, step: 1 })).toBe(false)
  })
  it("rejects segments narrower than 14px", () => {
    expect(segmentsAllowed({ min: 1, max: 10, step: 1 }, 100)).toBe(false)
  })
})

describe("marks", () => {
  const d = { min: 0, max: 100 }
  const marks = normalizeMarks([25, { value: 50, label: "Half" }])
  it("normalizes numbers and objects", () => {
    expect(marks).toEqual([{ value: 25 }, { value: 50, label: "Half" }])
  })
  it("finds a mark within the threshold", () => {
    expect(nearestMark(51, marks, d)?.value).toBe(50)
    expect(nearestMark(40, marks, d)).toBeUndefined()
  })
})
