"use client"

import * as React from "react"
import { useMemo, useRef, useEffect, useId } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
        <Tooltip>
          <TooltipTrigger asChild>
            {ratingContent}
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            {tooltipContent ? tooltipContent(currentValue) : `${currentValue} ${currentValue === 1 ? 'star' : 'stars'}`}
          </TooltipContent>
        </Tooltip>
      )
    }

    return ratingContent
  }
)

Rating.displayName = "Rating"

export { Rating }
