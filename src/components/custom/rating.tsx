"use client"

import * as React from "react"
import { useMemo, useRef, useEffect, useId } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Rating Component Styles - CSS-only approach with flex-direction: row-reverse
const ratingStyles = `
  .rating-wrapper {
    display: inline-flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    border: none;
    gap: 0;
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
    height: 1.5rem;
    width: 0.75rem;
    margin: 0 !important;
    padding: 0;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    z-index: 1;
    /* Ensure label covers the full clickable area */
    pointer-events: auto;
  }

  /* Full star steps (odd labels) - right-handed half star */
  /* These form the right half of each complete star, sit immediately after left half with no gap */
  .rating-wrapper label:nth-of-type(odd) {
    width: 0.75rem;
    margin-left: 0 !important;
  }

  /* Half star steps (even labels) - left-handed half star */
  /* Keep zero margin so left/right halves stitch into one star with no seam. */
  .rating-wrapper label:nth-of-type(even) {
    width: 0.75rem;
    margin-left: 0 !important;
  }

  /* Defensive reset (kept for overrides): first visual item should never offset. */
  .rating-wrapper label:last-of-type {
    margin-left: 0 !important;
  }

  /* Star SVG mask for full stars (right half) */
  .rating-wrapper label:nth-of-type(odd)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0.75rem;
    height: 1.5rem;
    mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 512"><path d="M0 0c12.2.1 23.3 7 28.6 18L93 150.3l143.6 21.2c12 1.8 22 10.2 25.7 21.7 3.7 11.5.7 24.2-7.9 32.7L150.2 329l24.6 145.7c2 12-3 24.2-12.9 31.3-9.9 7.1-23 8-33.8 2.3L0 439.8V0Z"/></svg>') no-repeat;
    mask-size: 0.75rem 1.5rem;
    transform: translateZ(0);
    /* Opaque mix: transparent + overlapping halves produced a darker seam between inactive halves. */
    background-color: color-mix(in oklch, var(--muted-foreground) 38%, var(--background));
    transition: none;
  }

  /* Star SVG mask for half stars (left half) */
  .rating-wrapper label:nth-of-type(even)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0.75rem;
    height: 1.5rem;
    mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 512"><path d="M264 0c-12.2.1-23.3 7-28.6 18L171 150.3 27.4 171.5c-12 1.8-22 10.2-25.7 21.7-3.7 11.5-.7 24.2 7.9 32.7L113.8 329 89.2 474.7c-2 12 3 24.2 12.9 31.3 9.9 7.1 23 8 33.8 2.3L264 439.8V0Z"/></svg>') no-repeat;
    mask-size: 0.75rem 1.5rem;
    transform: translateZ(0);
    background-color: color-mix(in oklch, var(--muted-foreground) 38%, var(--background));
    transition: none;
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
    const currentValue = value !== undefined ? value : internalValue

    // Handle change
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [value, onValueChange])

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

    const ratingContent = (
      <fieldset
        ref={fieldsetRef}
        className={cn("rating-wrapper", starSize, disabled && "opacity-50", className)}
        disabled={disabled}
        role="radiogroup"
        aria-label={`Rating: ${currentValue} out of ${maxRating} stars`}
        {...props}
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
