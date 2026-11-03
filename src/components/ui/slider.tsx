import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useComposedRefs } from "@/lib/compose-refs"
import {
  POSITION_MAX,
  computeTicks,
  fromPosition,
  nearestMark,
  normalizeMarks,
  segmentsAllowed,
  snap,
  toFraction,
  toPosition,
  type SliderMark,
  type SliderScale,
} from "@/lib/slider-scale"

/**
 * Track is a 4px rail at every size (same weight as Progress) on the foreground-relative
 * `--track` token, so it reads on surface-a, surface-b and popovers in both themes.
 * Size scales the thumb and the row height, not the rail.
 */
const sliderTrackVariants = cva(
  "bg-track group-hover/slider:bg-track-hover rounded-full relative grow overflow-hidden transition-colors duration-[var(--duration-micro)] data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
  {
    variants: {
      size: {
        sm: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
        default: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
        lg: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/**
 * Thumb shares the Switch thumb: same sizes, `--thumb` fill, `--shadow-thumb` lift (the one
 * inline-shadow exception in ELEVATION.md). Hover changes the track colour only (MOTION.md);
 * focus is the 2px ring every form control uses; press darkens slightly (STATES.md).
 */
const sliderThumbVariants = cva(
  "group/thumb block shrink-0 rounded-full bg-thumb shadow-[var(--shadow-thumb)] ring-ring/30 hit-area-2 transition-[background-color,box-shadow] duration-[var(--duration-micro)] active:bg-[color-mix(in_oklch,var(--thumb),var(--foreground)_7%)] focus-visible:ring-[2px] focus-visible:outline-hidden select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-4 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-3",
        default:
          "data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-5 data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-4",
        lg: "data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-6 data-[orientation=vertical]:h-6 data-[orientation=vertical]:w-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Row height matches control height (Button / Toggle / Select) so slider rows align in grids. */
const SLIDER_ROOT_HEIGHT = {
  sm: "data-[orientation=horizontal]:h-6",
  default: "data-[orientation=horizontal]:h-7",
  lg: "data-[orientation=horizontal]:h-8",
} as const

export type SliderVariant = "default" | "field" | "segments" | "ruler"

type RootProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>

export type SliderProps = RootProps &
  VariantProps<typeof sliderTrackVariants> & {
    /**
     * `field` — a flat input-height box with the label and value inside (forms, inspectors).
     * `segments` — discrete blocks for 5–12 steps. `ruler` — a calibrated scale with ticks.
     * Variants other than `default` are horizontal-only and fall back to `default` otherwise.
     */
    variant?: SliderVariant
    /** Label shown above the slider (inside it for `field`). Also labels the thumbs. */
    label?: React.ReactNode
    /** Show the formatted value at the end of the label row (always shown for `field`). */
    showValue?: boolean
    /** Text for a value: the readout, tick labels and each thumb's `aria-valuetext`. */
    formatValue?: (value: number) => string
    /** `field` only: parses typed text back to a number (inverse of `formatValue`). */
    parseValue?: (text: string) => number
    /** `log` spaces values by ratio (zoom, money, frequency). Requires `min > 0`. */
    scale?: SliderScale
    /** Reference values drawn on the track; pointer drags snap to them when close. */
    marks?: Array<number | SliderMark>
    /** Fill grows from this value toward the thumb instead of from `min` (bipolar values). */
    origin?: number
    /** `ruler` only: allowed tick intervals in value units, e.g. `[0.25, 0.5, 1, 3, 6]` hours. */
    tickIntervals?: number[]
    /** CSS `background` for the track, e.g. a gradient. Pair with `showRange={false}`. */
    trackBackground?: string
    /** Draw the filled range. Default `true`. */
    showRange?: boolean
    /** Shows the value and stays focusable, but ignores pointer and keyboard input. */
    readOnly?: boolean
  }

const NAV_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"])

const warned = new Set<string>()
/** Misuse warning, once per message. Only fires when a prop combination can't render as asked. */
function devWarn(message: string) {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(`[nqui Slider] ${message}`)
}

function defaultParse(text: string) {
  const cleaned = text.replace(/−/g, "-").replace(/[^\d.-]/g, "")
  return cleaned === "" ? Number.NaN : Number.parseFloat(cleaned)
}

function useElementWidth<T extends HTMLElement>(enabled: boolean) {
  const [width, setWidth] = React.useState(0)
  const observer = React.useRef<ResizeObserver | null>(null)
  const ref = React.useCallback(
    (node: T | null) => {
      observer.current?.disconnect()
      observer.current = null
      if (!node || !enabled) return
      setWidth(node.getBoundingClientRect().width)
      if (typeof ResizeObserver === "undefined") return
      observer.current = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width
        if (typeof w === "number") setWidth(w)
      })
      observer.current.observe(node)
    },
    [enabled]
  )
  return [ref, width] as const
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  function Slider(
    {
      className,
      style,
      defaultValue,
      value: valueProp,
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      size,
      variant: variantProp = "default",
      label,
      showValue = false,
      formatValue,
      parseValue,
      scale = "linear",
      marks,
      origin,
      tickIntervals,
      trackBackground,
      showRange = true,
      readOnly = false,
      orientation = "horizontal",
      inverted = false,
      dir,
      disabled,
      onKeyDown,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onFocus,
      onBlur,
      onDoubleClick,
      "aria-label": ariaLabel,
      ...props
    },
    forwardedRef
  ) {
    const horizontal = orientation === "horizontal"
    const log = scale === "log"
    const domain = React.useMemo(() => ({ min, max, scale }), [min, max, scale])
    const fmt = React.useCallback((v: number) => (formatValue ? formatValue(v) : String(v)), [formatValue])

    // ── Variant guards ────────────────────────────────────────────────────
    let variant: SliderVariant = variantProp
    if (variant !== "default" && !horizontal) {
      devWarn(`variant="${variant}" is horizontal-only; rendering the default variant.`)
      variant = "default"
    }
    if (variant === "segments" && !segmentsAllowed({ min, max, step })) {
      devWarn(
        `variant="segments" needs 5–12 steps (got ${Math.round((max - min) / step) + 1}). Use ToggleGroup below 5, a continuous slider above 12.`
      )
      variant = "default"
    }

    // ── Value state (value space; Radix runs in position space for log) ───
    const isControlled = valueProp !== undefined
    const [uncontrolled, setUncontrolled] = React.useState<number[]>(() => defaultValue ?? [min])
    const values = isControlled ? valueProp : uncontrolled
    const latest = React.useRef(values)
    latest.current = values

    const toRadix = React.useCallback((v: number) => (log ? toPosition(v, domain) : v), [log, domain])
    const fromRadix = React.useCallback(
      (p: number) => (log ? snap(fromPosition(p, domain), { min, max, step }) : p),
      [log, domain, min, max, step]
    )

    const markList = React.useMemo(() => normalizeMarks(marks), [marks])
    const pointerActive = React.useRef(false)
    const [active, setActive] = React.useState(false)

    const apply = React.useCallback(
      (next: number[], commit: boolean) => {
        if (!isControlled) setUncontrolled(next)
        latest.current = next
        onValueChange?.(next)
        if (commit) onValueCommit?.(next)
      },
      [isControlled, onValueChange, onValueCommit]
    )

    const mapRadix = (radixValues: number[]) => {
      const next = radixValues.map(fromRadix)
      return pointerActive.current && markList.length
        ? next.map((v) => nearestMark(v, markList, domain)?.value ?? v)
        : next
    }

    const handleRadixChange = (radixValues: number[]) => {
      if (readOnly) return
      const next = mapRadix(radixValues)
      if (next.every((v, i) => v === latest.current[i])) return
      apply(next, false)
    }

    // Radix commits with its own values (it can fire before onValueChange has landed), so map
    // those rather than reading `latest`.
    const handleRadixCommit = (radixValues: number[]) => {
      const next = mapRadix(radixValues)
      if (pointerActive.current) {
        pointerActive.current = false
        setActive(false)
      }
      if (!readOnly) onValueCommit?.(next)
    }

    // ── Keyboard: menu-safe, read-only, value-space steps for log, Enter to type ──
    const thumbRefs = React.useRef<Array<HTMLSpanElement | null>>([])
    const [editing, setEditing] = React.useState<number | null>(null)
    const [draft, setDraft] = React.useState("")

    const openEditor = (index: number) => {
      if (readOnly || disabled) return
      setDraft(String(latest.current[index] ?? ""))
      setEditing(index)
    }

    const handleKeyDown = (event: Parameters<NonNullable<RootProps["onKeyDown"]>>[0]) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return
      const index = Number((event.target as HTMLElement).dataset.index ?? 0)
      if (variant === "field" && event.key === "Enter") {
        event.preventDefault()
        openEditor(index)
        return
      }
      if (!NAV_KEYS.has(event.key)) return
      // Keep arrows/Home/End inside the slider when it sits in a menu or listbox.
      event.stopPropagation()
      if (readOnly) {
        event.preventDefault()
        return
      }
      if (!log) return // Radix handles linear stepping
      event.preventDefault()
      const big = step * 10
      const current = latest.current[index] ?? min
      const delta: Record<string, number> = {
        ArrowRight: step,
        ArrowUp: step,
        ArrowLeft: -step,
        ArrowDown: -step,
        PageUp: big,
        PageDown: -big,
      }
      let target =
        event.key === "Home" ? min : event.key === "End" ? max : current + (delta[event.key] ?? 0) * (event.shiftKey ? 10 : 1)
      target = snap(target, { min, max, step })
      const lo = latest.current[index - 1] ?? min
      const hi = latest.current[index + 1] ?? max
      target = Math.min(hi, Math.max(lo, target))
      if (target === current) return
      const next = [...latest.current]
      next[index] = target
      apply(next, true)
    }

    const commitEditor = (keep: boolean) => {
      if (editing === null) return
      const index = editing
      setEditing(null)
      if (keep) {
        const parsed = (parseValue ?? defaultParse)(draft)
        if (Number.isFinite(parsed)) {
          const lo = latest.current[index - 1] ?? min
          const hi = latest.current[index + 1] ?? max
          const target = Math.min(hi, Math.max(lo, snap(parsed, { min, max, step })))
          if (target !== latest.current[index]) {
            const next = [...latest.current]
            next[index] = target
            apply(next, true)
          }
        }
      }
      requestAnimationFrame(() => thumbRefs.current[index]?.focus())
    }

    // ── Geometry (percent along the track, flipped for RTL / inverted) ────
    const flip = horizontal ? (dir === "rtl") !== inverted : inverted
    const pctOf = (v: number) => toFraction(v, domain) * 100
    const edge = (pct: number) => (flip ? 100 - pct : pct)
    const pcts = values.map(pctOf)
    let fillFrom: number
    let fillTo: number
    if (values.length > 1) {
      fillFrom = Math.min(...pcts)
      fillTo = Math.max(...pcts)
    } else if (origin !== undefined) {
      fillFrom = Math.min(pctOf(origin), pcts[0] ?? 0)
      fillTo = Math.max(pctOf(origin), pcts[0] ?? 0)
    } else {
      fillFrom = 0
      fillTo = pcts[0] ?? 0
    }
    const inFill = (pct: number) => pct >= fillFrom - 1e-6 && pct <= fillTo + 1e-6

    const ownFill = origin !== undefined && variant !== "ruler" && variant !== "segments"
    const radixRangeHidden = !showRange || ownFill || variant === "ruler" || variant === "segments"
    const fillStyle: React.CSSProperties = horizontal
      ? { left: `${flip ? 100 - fillTo : fillFrom}%`, width: `${fillTo - fillFrom}%` }
      : { bottom: `${flip ? 100 - fillTo : fillFrom}%`, height: `${fillTo - fillFrom}%` }

    // ── Ruler ticks ───────────────────────────────────────────────────────
    const [measureRef, trackWidth] = useElementWidth<HTMLSpanElement>(variant === "ruler")
    const ticks = React.useMemo(
      () =>
        variant === "ruler"
          ? computeTicks({ min, max, step, widthPx: trackWidth, origin, candidates: tickIntervals, format: fmt }).map(
              (t) => ({ ...t, pct: log ? pctOf(t.value) : t.pct })
            )
          : [],
      // pctOf depends only on domain
      [variant, min, max, step, trackWidth, origin, tickIntervals, fmt, log, domain]
    )

    // ── Segments ──────────────────────────────────────────────────────────
    const segments =
      variant === "segments"
        ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => snap(min + i * step, { min, max, step }))
        : []

    // ── Marks (default variant) ───────────────────────────────────────────
    const shownMarks: SliderMark[] =
      variant === "default" && horizontal
        ? [
            ...markList,
            ...(origin !== undefined && !markList.some((m) => m.value === origin) ? [{ value: origin }] : []),
          ]
        : []
    const labelledMarks = shownMarks.some((m) => m.label)

    // ── Labels and text ───────────────────────────────────────────────────
    const labelId = React.useId()
    const valueText = values.length > 1 ? `${fmt(values[0])} – ${fmt(values[values.length - 1])}` : fmt(values[0] ?? min)
    const valueChars =
      Math.max(fmt(min).length, fmt(max).length) * (values.length > 1 ? 2 : 1) + (values.length > 1 ? 3 : 0)
    const thumbLabelledBy = label && !ariaLabel ? labelId : undefined
    const header = (label || showValue) && variant !== "field"

    const rootRef = useComposedRefs(forwardedRef)

    const root = (
      <SliderPrimitive.Root
        ref={rootRef}
        data-slot="slider"
        data-variant={variant}
        data-active={active ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        data-marks={labelledMarks ? "labelled" : shownMarks.length ? "" : undefined}
        value={values.map(toRadix)}
        min={log ? 0 : min}
        max={log ? POSITION_MAX : max}
        step={log ? 1 : step}
        orientation={orientation}
        inverted={inverted}
        dir={dir}
        disabled={disabled}
        onValueChange={handleRadixChange}
        onValueCommit={handleRadixCommit}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (readOnly) {
            event.preventDefault()
            return
          }
          pointerActive.current = true
          setActive(true)
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event)
          pointerActive.current = false
          setActive(false)
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event)
          pointerActive.current = false
          setActive(false)
        }}
        onFocus={(event) => {
          onFocus?.(event)
          if ((event.target as HTMLElement).matches?.(":focus-visible")) setActive(true)
        }}
        onBlur={(event) => {
          onBlur?.(event)
          if (!pointerActive.current) setActive(false)
        }}
        onDoubleClick={(event) => {
          onDoubleClick?.(event)
          if (variant !== "field") return
          const rect = event.currentTarget.getBoundingClientRect()
          const f = rect.width ? (event.clientX - rect.left) / rect.width : 0
          const at = edge(f * 100)
          let nearest = 0
          pcts.forEach((p, i) => {
            if (Math.abs(p - at) < Math.abs((pcts[nearest] ?? 0) - at)) nearest = i
          })
          openEditor(nearest)
        }}
        className={cn(
          "group/slider data-[orientation=vertical]:min-h-40 relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          SLIDER_ROOT_HEIGHT[size ?? "default"],
          !header && className
        )}
        style={header ? undefined : style}
        {...props}
      >
        <SliderPrimitive.Track
          ref={measureRef}
          data-slot="slider-track"
          data-custom-track={trackBackground ? "" : undefined}
          className={sliderTrackVariants({ size })}
          style={trackBackground ? { background: trackBackground } : undefined}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
              radixRangeHidden && "hidden"
            )}
          />
          {ownFill && showRange && (
            <span
              data-slot="slider-fill"
              aria-hidden
              className={cn("bg-primary absolute", horizontal ? "inset-y-0" : "inset-x-0")}
              style={fillStyle}
            />
          )}
          {segments.map((v) => (
            <span
              key={v}
              aria-hidden
              className="nqui-slider-segment"
              data-on={inFill(pctOf(v)) ? "" : undefined}
              data-current={values.includes(v) ? "" : undefined}
            />
          ))}
          {ticks.map((t) => {
            const d = Math.min(...pcts.map((p) => Math.abs(p - t.pct)))
            return (
              <React.Fragment key={t.value}>
                <span
                  aria-hidden
                  className="nqui-slider-tick"
                  data-major={t.major ? "" : undefined}
                  data-on={inFill(t.pct) ? "" : undefined}
                  style={{ left: `${edge(t.pct)}%`, "--lift": Math.exp(-((d / 5.5) ** 2)).toFixed(3) } as React.CSSProperties}
                />
                {t.label !== undefined && (
                  <span
                    aria-hidden
                    className="nqui-slider-tick-label"
                    data-origin={t.value === origin ? "" : undefined}
                    style={{ left: `${edge(t.pct)}%` }}
                  >
                    {t.label}
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </SliderPrimitive.Track>

        {shownMarks.map((m) => (
          <React.Fragment key={`mark-${m.value}`}>
            <span aria-hidden className="nqui-slider-mark" style={{ left: `${edge(pctOf(m.value))}%` }} />
            {m.label && (
              <span aria-hidden className="nqui-slider-mark-label" style={{ left: `${edge(pctOf(m.value))}%` }}>
                {m.label}
              </span>
            )}
          </React.Fragment>
        ))}

        {variant === "field" && (
          <span className="nqui-slider-field-text" aria-hidden={label ? undefined : true}>
            {label && (
              <span id={labelId} className="nqui-slider-field-label">
                {label}
              </span>
            )}
            <span className="nqui-slider-field-value" style={{ minWidth: `${valueChars}ch` }}>
              {valueText}
            </span>
          </span>
        )}

        {values.map((v, index) => (
          <SliderPrimitive.Thumb
            key={index}
            ref={(node) => {
              thumbRefs.current[index] = node
            }}
            data-slot="slider-thumb"
            data-index={index}
            className={sliderThumbVariants({ size })}
            aria-label={ariaLabel}
            aria-labelledby={thumbLabelledBy}
            aria-valuetext={fmt(v)}
            aria-valuenow={v}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-readonly={readOnly || undefined}
          >
            {variant === "ruler" && <span className="nqui-slider-bubble">{fmt(v)}</span>}
          </SliderPrimitive.Thumb>
        ))}

        {editing !== null && (
          <input
            className="nqui-slider-field-input"
            aria-label={`${typeof label === "string" ? label : "Value"}${values.length > 1 ? (editing ? " maximum" : " minimum") : ""}`}
            value={draft}
            autoFocus
            inputMode="decimal"
            onChange={(e) => setDraft(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") {
                e.preventDefault()
                commitEditor(true)
              } else if (e.key === "Escape") {
                e.preventDefault()
                commitEditor(false)
              }
            }}
            onBlur={() => commitEditor(true)}
          />
        )}
      </SliderPrimitive.Root>
    )

    if (!header) return root

    return (
      <div data-slot="slider-control" className={cn("flex w-full flex-col gap-1.5", className)} style={style}>
        <div className="flex items-baseline justify-between gap-3 text-xs leading-none">
          {label && (
            <span id={labelId} className="text-muted-foreground font-medium">
              {label}
            </span>
          )}
          {showValue && variant !== "ruler" && (
            <span aria-hidden className="text-foreground ml-auto text-right tabular-nums" style={{ minWidth: `${valueChars}ch` }}>
              {valueText}
            </span>
          )}
        </div>
        {root}
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider, sliderTrackVariants, sliderThumbVariants }
