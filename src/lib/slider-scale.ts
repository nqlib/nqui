/**
 * Slider scale engine — pure value ↔ position math, snapping, and tick layout.
 *
 * Internal (not exported from the package). Radix Slider only understands linear values, so a
 * log-scale Slider runs Radix on positions 0..POSITION_MAX and maps through these functions.
 * Ruler ticks and Segments guards also come from here, so every variant shares one model.
 */

export type SliderScale = "linear" | "log"

export interface ScaleDomain {
  min: number
  max: number
  scale?: SliderScale
}

/** Resolution of the internal position space used for non-linear scales. */
export const POSITION_MAX = 1000

function assertDomain({ min, max, scale = "linear" }: ScaleDomain) {
  if (scale === "log" && (min <= 0 || max <= 0)) {
    throw new Error(`[nqui Slider] scale="log" needs min > 0 and max > 0 (got min=${min}, max=${max}).`)
  }
}

/** Fraction 0..1 along the track for a value. `min === max` returns 0. */
export function toFraction(value: number, domain: ScaleDomain): number {
  const { min, max, scale = "linear" } = domain
  assertDomain(domain)
  if (max === min) return 0
  const v = Math.min(max, Math.max(min, value))
  const f = scale === "log" ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min)
  return Math.min(1, Math.max(0, f))
}

/** Value for a fraction 0..1 along the track (unsnapped). */
export function fromFraction(fraction: number, domain: ScaleDomain): number {
  const { min, max, scale = "linear" } = domain
  assertDomain(domain)
  const f = Math.min(1, Math.max(0, fraction))
  return scale === "log" ? min * Math.pow(max / min, f) : min + f * (max - min)
}

export const toPosition = (value: number, domain: ScaleDomain) =>
  Math.round(toFraction(value, domain) * POSITION_MAX)

export const fromPosition = (position: number, domain: ScaleDomain) =>
  fromFraction(position / POSITION_MAX, domain)

/** Decimal places in a step, so snapping never leaves float drift (0.1 + 0.2). */
export function stepPrecision(step: number): number {
  if (!Number.isFinite(step)) return 0
  const s = String(step)
  if (s.includes("e-")) return Number(s.split("e-")[1])
  return (s.split(".")[1] ?? "").length
}

export function snap(value: number, { min, max, step }: { min: number; max: number; step: number }): number {
  if (max <= min) return min
  const precision = stepPrecision(step)
  const stepped = step > 0 ? Math.round((value - min) / step) * step + min : value
  const clamped = Math.min(max, Math.max(min, stepped))
  return Number(clamped.toFixed(precision))
}

/**
 * Smallest "nice" interval that keeps at least `minPx` between ticks.
 * Default candidates are base × {1, 2, 5} × 10ⁿ starting at `base` (usually the step).
 * Pass `candidates` for unit-aware scales (e.g. hours: [0.25, 0.5, 1, 3, 6, 12]).
 */
export function niceInterval({
  span,
  widthPx,
  minPx,
  base,
  candidates,
}: {
  span: number
  widthPx: number
  minPx: number
  base: number
  candidates?: number[]
}): number {
  if (span <= 0 || widthPx <= 0) return span > 0 ? span : 1
  const fits = (interval: number) => (interval / span) * widthPx >= minPx
  if (candidates?.length) {
    const sorted = [...candidates].filter((c) => c > 0).sort((a, b) => a - b)
    return sorted.find(fits) ?? sorted[sorted.length - 1] ?? span
  }
  const unit = base > 0 ? base : span / 100
  for (let exp = 0; exp < 12; exp++) {
    for (const m of [1, 2, 5]) {
      const interval = unit * m * Math.pow(10, exp)
      if (fits(interval)) return interval
    }
  }
  return span
}

export interface Tick {
  value: number
  /** 0..100, position along the track */
  pct: number
  major: boolean
  label?: string
}

function onGrid(value: number, origin: number, interval: number) {
  const q = (value - origin) / interval
  return Math.abs(q - Math.round(q)) < 1e-6
}

/** Ratios that read as even steps on a log ruler (×1.25, ×2, decades). */
const NICE_LOG_RATIOS = [1.25, 1.5, 2, 2.5, 5, 10, 20, 50, 100]

function onRatioGrid(value: number, anchor: number, ratio: number) {
  if (value <= 0 || anchor <= 0 || ratio <= 1) return false
  const q = Math.log(value / anchor) / Math.log(ratio)
  return Math.abs(q - Math.round(q)) < 1e-4
}

/**
 * Log ruler ticks, spaced by ratio so equal steps take equal pixels. A linear value step
 * mapped onto a log track bunches at the top of the range.
 * `candidates` are ratios greater than 1 (×2, ×10), not value-unit steps.
 */
function computeLogTicks({
  min,
  max,
  widthPx,
  origin,
  minTickPx,
  minLabelPx,
  candidates,
  format,
}: {
  min: number
  max: number
  widthPx: number
  origin?: number
  minTickPx: number
  minLabelPx: number
  candidates?: number[]
  format: (value: number) => string
}): Tick[] {
  if (min <= 0 || max <= min || widthPx <= 0) return []
  const lnSpan = Math.log(max / min)
  const fits = (ratio: number, minPx: number) =>
    ratio > 1 && (Math.log(ratio) / lnSpan) * widthPx >= minPx - 1e-6
  const ratioCandidates = candidates?.filter((c) => c > 1) ?? []
  const pool = (ratioCandidates.length ? ratioCandidates : NICE_LOG_RATIOS).slice().sort((a, b) => a - b)
  const minor = pool.find((r) => fits(r, minTickPx)) ?? pool[pool.length - 1] ?? 10
  let major = minor
  for (const k of [2, 5, 10, 20]) {
    const ratio = minor ** k
    if (fits(ratio, minLabelPx)) {
      major = ratio
      break
    }
  }
  const anchor = origin !== undefined && origin > 0 ? origin : min
  const logMinor = Math.log(minor)
  const start = Math.ceil(Math.log(min / anchor) / logMinor - 1e-9)
  const end = Math.floor(Math.log(max / anchor) / logMinor + 1e-9)
  const ticks: Tick[] = []
  for (let i = start; i <= end && ticks.length < 2000; i++) {
    const raw = anchor * Math.exp(i * logMinor)
    const value = Number(raw.toPrecision(12))
    if (value < min * (1 - 1e-9) || value > max * (1 + 1e-9)) continue
    const isMajor = onRatioGrid(value, anchor, major) || (origin !== undefined && value === origin)
    ticks.push({
      value,
      pct: (Math.log(value / min) / lnSpan) * 100,
      major: isMajor,
      label: isMajor ? format(value) : undefined,
    })
  }
  return ticks
}

/**
 * Ticks for a ruler. Minor ticks keep ≥ `minTickPx` apart; majors (labelled) keep
 * ≥ `minLabelPx` apart. Linear ticks are a ×2 / ×5 / ×10 multiple of the minor interval and
 * align to `origin` when given (so 0 is always a tick on a bipolar scale), otherwise to `min`.
 * `scale="log"` spaces by ratio instead, so the gaps stay even on the track.
 */
export function computeTicks({
  min,
  max,
  step,
  widthPx,
  origin,
  scale = "linear",
  minTickPx = 6,
  minLabelPx = 48,
  candidates,
  format = (v: number) => String(v),
}: {
  min: number
  max: number
  step: number
  widthPx: number
  origin?: number
  scale?: SliderScale
  minTickPx?: number
  minLabelPx?: number
  candidates?: number[]
  format?: (value: number) => string
}): Tick[] {
  if (scale === "log") {
    return computeLogTicks({ min, max, widthPx, origin, minTickPx, minLabelPx, candidates, format })
  }
  const span = max - min
  if (span <= 0 || widthPx <= 0) return []
  const minor = niceInterval({ span, widthPx, minPx: minTickPx, base: step, candidates })
  const labelFits = (interval: number) => (interval / span) * widthPx >= minLabelPx
  // Unit-aware candidates pick the major too (90° not 75°, 3h not 2.5h) when one is a multiple of
  // the minor interval; otherwise fall back to ×2 / ×5 / ×10 of the minor.
  const unitMajor = candidates
    ?.filter((c) => c > minor && onGrid(c, 0, minor))
    .sort((a, b) => a - b)
    .find(labelFits)
  const major =
    unitMajor ?? minor * ([2, 5, 10, 20, 50, 100].find((m) => labelFits(minor * m)) ?? 100)
  const anchor = origin ?? min
  const precision = Math.max(stepPrecision(step), stepPrecision(minor))
  const first = Math.ceil((min - anchor) / minor - 1e-9) * minor + anchor
  const ticks: Tick[] = []
  for (let v = first, i = 0; v <= max + 1e-9 && i < 2000; v += minor, i++) {
    const value = Number(v.toFixed(precision))
    const isMajor = onGrid(value, anchor, major) || value === origin
    ticks.push({
      value,
      pct: ((value - min) / span) * 100,
      major: isMajor,
      label: isMajor ? format(value) : undefined,
    })
  }
  return ticks
}

/** Segments read as discrete blocks only for 5–12 steps (fewer → ToggleGroup). */
export const SEGMENTS_MIN = 5
export const SEGMENTS_MAX = 12

export function segmentCount({ min, max, step }: { min: number; max: number; step: number }) {
  return step > 0 ? Math.round((max - min) / step) + 1 : 0
}

export function segmentsAllowed(domain: { min: number; max: number; step: number }, widthPx?: number) {
  const n = segmentCount(domain)
  if (n < SEGMENTS_MIN || n > SEGMENTS_MAX) return false
  return widthPx === undefined || widthPx / n >= 14
}

export interface SliderMark {
  value: number
  label?: string
}

export function normalizeMarks(marks: Array<number | SliderMark> | undefined): SliderMark[] {
  return (marks ?? []).map((m) => (typeof m === "number" ? { value: m } : m))
}

/** Mark within `threshold` (fraction of the track) of `value`, if any. */
export function nearestMark(
  value: number,
  marks: SliderMark[],
  domain: ScaleDomain,
  threshold = 0.02
): SliderMark | undefined {
  const f = toFraction(value, domain)
  let best: SliderMark | undefined
  let bestD = threshold
  for (const m of marks) {
    const d = Math.abs(toFraction(m.value, domain) - f)
    if (d <= bestD) {
      best = m
      bestD = d
    }
  }
  return best
}
