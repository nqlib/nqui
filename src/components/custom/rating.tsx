"use client"

import * as React from "react"
import { useMemo, useRef, useEffect, useId } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Full-star mask (one glyph per integer step). Half mode still pairs left/right halves.
const FULL_STAR_MASK =
  "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\"><path d=\"M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.6 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3L288.1 439.8l128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z\"/></svg>')"
const RIGHT_HALF_MASK =
  "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 264 512\"><path d=\"M0 0c12.2.1 23.3 7 28.6 18L93 150.3l143.6 21.2c12 1.8 22 10.2 25.7 21.7 3.7 11.5.7 24.2-7.9 32.7L150.2 329l24.6 145.7c2 12-3 24.2-12.9 31.3-9.9 7.1-23 8-33.8 2.3L0 439.8V0Z\"/></svg>')"
const LEFT_HALF_MASK =
  "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 264 512\"><path d=\"M264 0c-12.2.1-23.3 7-28.6 18L171 150.3 27.4 171.5c-12 1.8-22 10.2-25.7 21.7-3.7 11.5-.7 24.2 7.9 32.7L113.8 329 89.2 474.7c-2 12 3 24.2 12.9 31.3 9.9 7.1 23 8 33.8 2.3L264 439.8V0Z\"/></svg>')"

// Rating Component Styles - CSS-only approach with flex-direction: row-reverse
const ratingStyles = `
  .rating-wrapper {
    --rating-star-size: 1.5rem;
    --rating-half-size: calc(var(--rating-star-size) / 2);
    display: inline-flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: center;
    border: none;
    gap: 0;
    /* Never take Tailwind w-*; fieldset min-content + w-* clips/overflows in Safari */
    width: max-content;
    max-width: none;
    min-width: 0;
    height: var(--rating-star-size);
    margin: 0;
    padding: 0;
    overflow: visible;
  }

  /* Visually hide radio input, but leave accessible to screen readers */
  .rating-wrapper input[type="radio"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Star label styling */
  .rating-wrapper label {
    display: block;
    height: var(--rating-star-size);
    margin: 0 !important;
    padding: 0;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    z-index: 1;
    pointer-events: auto;
  }

  /* Integer mode: one full star glyph per step (first star is always a full star) */
  .rating-wrapper[data-allow-half="false"] label {
    width: var(--rating-star-size);
  }

  .rating-wrapper[data-allow-half="false"] label::before {
    content: '';
    position: absolute;
    inset: 0;
    width: var(--rating-star-size);
    height: var(--rating-star-size);
    mask: ${FULL_STAR_MASK} no-repeat center / contain;
    -webkit-mask: ${FULL_STAR_MASK} no-repeat center / contain;
    transform: translateZ(0);
    background-color: color-mix(in oklch, var(--muted-foreground) 38%, var(--background));
    transition: none;
  }

  /* Half mode: pair left/right halves into one star */
  .rating-wrapper[data-allow-half="true"] label {
    width: var(--rating-half-size);
  }

  .rating-wrapper[data-allow-half="true"] label:nth-of-type(odd)::before,
  .rating-wrapper[data-allow-half="true"] label:nth-of-type(even)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: var(--rating-half-size);
    height: var(--rating-star-size);
    transform: translateZ(0);
    background-color: color-mix(in oklch, var(--muted-foreground) 38%, var(--background));
    transition: none;
  }

  .rating-wrapper[data-allow-half="true"] label:nth-of-type(odd)::before {
    mask: ${RIGHT_HALF_MASK} no-repeat;
    -webkit-mask: ${RIGHT_HALF_MASK} no-repeat;
    mask-size: var(--rating-half-size) var(--rating-star-size);
    -webkit-mask-size: var(--rating-half-size) var(--rating-star-size);
    /* Overlap to kill Chrome subpixel hairline between left/right halves */
    left: -1px;
    width: calc(var(--rating-half-size) + 1px);
  }

  .rating-wrapper[data-allow-half="true"] label:nth-of-type(even)::before {
    mask: ${LEFT_HALF_MASK} no-repeat;
    -webkit-mask: ${LEFT_HALF_MASK} no-repeat;
    mask-size: var(--rating-half-size) var(--rating-star-size);
    -webkit-mask-size: var(--rating-half-size) var(--rating-star-size);
  }

  /* Base: Show checked state - highlight up to checked input (selected stars) */
  /* Only show when NOT hovering */
  .rating-wrapper:not(:has(label:hover)) input[type="radio"]:checked ~ label::before {
    background-color: var(--warning-400) !important;
    filter: none;
  }

  /* Hover state: Always start from 0 (first label visually) and show up to hovered label */
  /* With row-reverse, labels after hovered label in DOM are visually before it */
  /* This ALWAYS highlights from 0 to hovered star (goldenrod color) */
  .rating-wrapper label:hover::before,
  .rating-wrapper label:hover ~ label::before {
    background-color: var(--warning-400) !important;
    filter: none !important;
  }

  /* Hover over selected stars: keep same tone as base hover to avoid half-pair seams. */
  .rating-wrapper input[type="radio"]:checked + label:hover::before,
  .rating-wrapper input[type="radio"]:checked ~ label:hover::before,
  .rating-wrapper input[type="radio"]:checked ~ label:hover ~ label::before,
  .rating-wrapper label:hover ~ input[type="radio"]:checked ~ label::before {
    background-color: var(--warning-400) !important;
    filter: none !important;
  }


  /* Disabled state */
  .rating-wrapper:has(input:disabled) label {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .rating-wrapper input[type="radio"]:focus-visible + label::before {
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--ring) 30%, transparent);
    border-radius: 2px;
  }
`

function resolveStarSize(starSize: string): string {
  if (/\bh-3\b|\bw-3\b/.test(starSize)) return "0.75rem"
  if (/\bh-4\b|\bw-4\b/.test(starSize)) return "1rem"
  if (/\bh-5\b|\bw-5\b/.test(starSize)) return "1.25rem"
  if (/\bh-8\b|\bw-8\b/.test(starSize)) return "2rem"
  return "1.5rem"
}

export interface RatingProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  /**
   * Controlled value (0 to maxRating)
   */
  value?: number
  /**
   * Uncontrolled default value
   * @default 0
   */
  defaultValue?: number
  /**
   * Callback when rating changes
   */
  onValueChange?: (value: number) => void
  /**
   * Maximum rating value
   * @default 5
   */
  maxRating?: number
  /**
   * Allow half-star ratings
   * @default true
   */
  allowHalf?: boolean
  /**
   * Show tooltip on hover
   * @default true
   */
  showTooltip?: boolean
  /**
   * Custom tooltip content
   */
  tooltipContent?: (value: number) => React.ReactNode
  /**
   * Star size
   * @default "h-6 w-6"
   */
  starSize?: string
}

/**
 * Rating component with star-based input using native radio inputs
 *
 * Uses native HTML radio inputs for full accessibility:
 * - Keyboard navigation (Arrow keys, Space)
 * - ARIA attributes
 * - Screen reader support
 * - Focus management
 *
 * Visually displays as stars using CSS-only approach with flex-direction: row-reverse
 * and sibling selectors for hover/selection highlighting.
 *
 * @example
 * ```tsx
 * <Rating defaultValue={3} maxRating={5} allowHalf />
 * ```
 */
const Rating = React.forwardRef<
  HTMLFieldSetElement,
  RatingProps
>(
  (
    {
      className,
      value,
      defaultValue = 0,
      onValueChange,
      maxRating = 5,
      allowHalf = true,
      disabled = false,
      showTooltip = true,
      tooltipContent,
      starSize = "h-6 w-6",
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLFieldSetElement>(null)
    const fieldsetRef = ref || internalRef
    // Generate rating options (0.5, 1, 1.5, 2, ... maxRating if allowHalf, else 1, 2, 3, ... maxRating)
    const ratingOptions = useMemo(() => {
      const options: number[] = []
      if (allowHalf) {
        for (let i = 0.5; i <= maxRating; i += 0.5) {
          options.push(i)
        }
      } else {
        for (let i = 1; i <= maxRating; i += 1) {
          options.push(i)
        }
      }
      // Reverse so highest rating is first (will be displayed last due to row-reverse)
      return options.reverse()
    }, [maxRating, allowHalf])

    // Current value (controlled or uncontrolled)
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const rawValue = value !== undefined ? value : internalValue
    // Whole-star mode: snap fractions so the first star is never a half glyph.
    const currentValue = allowHalf
      ? rawValue
      : Number.isFinite(rawValue)
        ? Math.max(0, Math.min(maxRating, Math.round(rawValue)))
        : 0

    // Handle change
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value)
      const newValue = allowHalf ? parsed : Math.round(parsed)
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [value, onValueChange, allowHalf])

    // Sync internal value when defaultValue changes
    useEffect(() => {
      if (value === undefined) {
        setInternalValue(defaultValue)
      }
    }, [defaultValue, value])

    // Generate unique name for radio group using useId for SSR compatibility
    // useId() must be called unconditionally at the top level (rules of hooks)
    const uniqueId = useId()
    // Use ref with lazy initializer to ensure ID is only computed once per component instance
    const ratingNameRef = useRef<string | undefined>(undefined)
    if (ratingNameRef.current === undefined) {
      ratingNameRef.current = `rating-${uniqueId.replace(/:/g, '')}`
    }
    const ratingName = ratingNameRef.current

    const resolvedStarSize = resolveStarSize(starSize)

    const ratingContent = (
      <fieldset
        ref={fieldsetRef}
        data-allow-half={allowHalf ? "true" : "false"}
        className={cn("rating-wrapper", disabled && "opacity-50", className)}
        disabled={disabled}
        role="radiogroup"
        aria-label={`Rating: ${currentValue} out of ${maxRating} stars`}
        {...props}
        style={
          {
            ...(typeof props.style === "object" && props.style ? props.style : null),
            ["--rating-star-size" as string]: resolvedStarSize,
          } as React.CSSProperties
        }
      >
        {ratingOptions.map((rating) => {
          const ratingStr = rating.toString()
          const inputId = `rating-${ratingName}-${ratingStr.replace('.', '-')}`
          const isHalf = allowHalf && rating % 1 !== 0
          const labelText = isHalf
            ? `${Math.floor(rating)} 1/2 ${rating === 0.5 ? 'star' : 'stars'}`
            : `${rating} ${rating === 1 ? 'star' : 'stars'}`
          return (
            <React.Fragment key={ratingStr}>
              <input
                type="radio"
                id={inputId}
                name={ratingName}
                value={ratingStr}
                checked={currentValue === rating}
                onChange={handleChange}
                disabled={disabled}
                aria-label={labelText}
              />
              <label
                htmlFor={inputId}
                title={labelText}
                aria-label={labelText}
              />
            </React.Fragment>
          )
        })}
      </fieldset>
    )

    // Wrap with tooltip if enabled
    if (showTooltip) {
      return (
        <>
          <style>{ratingStyles}</style>
          <Tooltip>
            <TooltipTrigger asChild>
              {ratingContent}
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              {tooltipContent ? tooltipContent(currentValue) : `${currentValue} ${currentValue === 1 ? 'star' : 'stars'}`}
            </TooltipContent>
          </Tooltip>
        </>
      )
    }

    return (
      <>
        <style>{ratingStyles}</style>
        {ratingContent}
      </>
    )
  }
)

Rating.displayName = "Rating"

export { Rating }
