"use client"

import * as React from "react"
import { useRef, useEffect, useMemo, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

// Progress Component Styles - CSS-only approach for block spacing and rounded corners
const progressStyles = `
  .progress-block {
    width: 100%;
    height: 100%;
    border-radius: 1px;
    transition: opacity 0.2s ease;
  }

  .progress-block-hover:hover {
    opacity: 0.5;
  }
`

// Block calculation constants
const DEFAULT_BLOCKS = 50
const MIN_BLOCKS = 20
const MAX_BLOCKS = 100
const IDEAL_BLOCK_WIDTH = 8 // pixels per block

const progressBlockVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-destructive",
      neutral: "bg-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

// Background variants for solid style - lighter accent colors for better visibility
const progressBackgroundVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary/20 dark:bg-primary/30",
      success: "bg-success/20 dark:bg-success/30",
      warning: "bg-warning/20 dark:bg-warning/30",
      error: "bg-destructive/20 dark:bg-destructive/30",
      neutral: "bg-muted dark:bg-muted/80",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface ProgressBlockProps {
  filled: boolean
  isFirst: boolean
  isLast: boolean
  variant: 'default' | 'success' | 'warning' | 'error' | 'neutral'
  hoverEffect?: boolean
}

const ProgressBlock = ({
  filled,
  isFirst,
  isLast,
  variant,
  hoverEffect,
}: ProgressBlockProps) => {
  const blockContent = (
    <div
      className={cn(
        "size-full overflow-hidden px-[0.5px] transition sm:px-px",
        isFirst && "rounded-l-[4px] pl-0",
        isLast && "rounded-r-[4px] pr-0"
      )}
      style={{ minWidth: '4px' }}
    >
      <div
        className={cn(
          "progress-block size-full",
          filled
            ? progressBlockVariants({ variant })
            : progressBackgroundVariants({ variant }),
          hoverEffect && "progress-block-hover"
        )}
      />
    </div>
  )

  return blockContent
}

ProgressBlock.displayName = "ProgressBlock"

export interface EnhancedProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style">,
    VariantProps<typeof progressBlockVariants> {
  /**
   * Progress value (0 to max)
   */
  value: number
  /**
   * Maximum value
   * @default 100
   */
  max?: number
  /**
   * Progress style/appearance
   * - `dash`: Block-based segmented style (default)
   * - `solid`: Smooth continuous bar style
   * @default "dash"
   */
  style?: "dash" | "solid"
  /**
   * Number of blocks to display (optional - auto-calculated if not provided)
   * Only applies when style="dash"
   */
  blocks?: number
  /**
   * Show tooltip on hover showing progress percentage
   * @default false
   */
  showTooltip?: boolean
  /**
   * Enable hover opacity effect on blocks
   * Only applies when style="dash"
   * @default false
   */
  hoverEffect?: boolean
  /**
   * Show animation transition when value changes
   * @default false
   */
  showAnimation?: boolean
  /**
   * Optional label text to display next to progress bar
   * Only applies when style="solid"
   */
  label?: string
  /**
   * Height override (Tailwind class or CSS value)
   * @default "h-8" for dash, "h-2" for solid
   */
  height?: string
}

/**
 * Enhanced Progress component with block-based segmented design or solid bar style
 *
 * Supports two styles:
 * - `dash`: Displays progress as discrete colored blocks, similar to GitHub's contribution graph.
 *   Supports auto-calculated block count based on container width, or manual block count override.
 * - `solid`: Displays progress as a smooth continuous bar with rounded corners.
 *
 * @example
 * ```tsx
 * // Dash style (default)
 * <EnhancedProgress value={75} variant="success" />
 * <EnhancedProgress value={50} blocks={100} height="h-12" />
 *
 * // Solid style
 * <EnhancedProgress value={75} variant="success" style="solid" />
 * <EnhancedProgress value={75} variant="success" style="solid" label="75%" showAnimation />
 * ```
 */
const EnhancedProgress = React.forwardRef<HTMLDivElement, EnhancedProgressProps>(
  (
    {
      value,
      max = 100,
      style = "dash",
      blocks: userBlocks,
      variant = "default",
      showTooltip = false,
      hoverEffect = false,
      showAnimation = false,
      label,
      height,
      className,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [containerWidth, setContainerWidth] = useState<number | null>(null)
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    // Calculate percentage
    const percentage = Math.max(0, Math.min(100, (value / max) * 100))

    // Measure container width for auto-calculation (only for dash style)
    useEffect(() => {
      if (style !== "dash" || userBlocks !== undefined || !containerRef.current) {
        return
      }

      const updateWidth = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth)
        }
      }

      // Initial measurement
      updateWidth()

      // Use ResizeObserver if available
      if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(updateWidth)
        resizeObserver.observe(containerRef.current)

        return () => {
          resizeObserver.disconnect()
        }
      } else {
        // Fallback to window resize listener
        window.addEventListener('resize', updateWidth)
        return () => {
          window.removeEventListener('resize', updateWidth)
        }
      }
    }, [userBlocks, style])

    // Calculate total blocks (only for dash style)
    const totalBlocks = useMemo(() => {
      if (style !== "dash") return 0

      if (userBlocks !== undefined) {
        return Math.max(MIN_BLOCKS, Math.min(MAX_BLOCKS, userBlocks))
      }

      if (containerWidth !== null) {
        const calculatedBlocks = Math.floor(containerWidth / IDEAL_BLOCK_WIDTH)
        return Math.max(MIN_BLOCKS, Math.min(MAX_BLOCKS, calculatedBlocks))
      }

      return DEFAULT_BLOCKS
    }, [userBlocks, containerWidth, style])

    // Calculate filled blocks (only for dash style)
    const filledBlocks = useMemo(() => {
      if (style !== "dash") return 0
      return Math.round((percentage / 100) * totalBlocks)
    }, [percentage, totalBlocks, style])

    // Generate block data (only for dash style)
    const blocks = useMemo(() => {
      if (style !== "dash") return []
      return Array.from({ length: totalBlocks }, (_, index) => ({
        filled: index < filledBlocks,
        isFirst: index === 0,
        isLast: index === totalBlocks - 1,
      }))
    }, [totalBlocks, filledBlocks, style])

    // Get variant colors for solid style
    const barColorClass = progressBlockVariants({ variant })
    const backgroundClass = progressBackgroundVariants({ variant })

    // Render solid style
    if (style === "solid") {
      const solidProgressBar = (
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progress: ${Math.round(percentage)}%`}
          className={cn(
            "flex w-full items-center",
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "relative flex w-full items-center rounded-full",
              backgroundClass,
              height || "h-2"
            )}
          >
            <div
              className={cn(
                "h-full rounded-full",
                barColorClass,
                showAnimation && "transform-gpu transition-all duration-200 ease-in-out"
              )}
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
          {label && (
            <span
              className={cn(
                "ml-2 whitespace-nowrap text-sm font-medium leading-none",
                "text-foreground"
              )}
            >
              {label}
            </span>
          )}
        </div>
      )

      // Wrap with tooltip if enabled
      if (showTooltip) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              {solidProgressBar}
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={10} align="center">
              {Math.round(percentage)}%
            </TooltipContent>
          </Tooltip>
        )
      }

      return solidProgressBar
    }

    // Render dash style (existing block-based rendering)
    const progressBar = (
      <div
        ref={mergedRef}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progress: ${Math.round(percentage)}%`}
        className={cn(
          "group flex w-full items-center",
          height || "h-8",
          className
        )}
        {...props}
      >
        {blocks.map((block, index) => (
          <ProgressBlock
            key={index}
            filled={block.filled}
            isFirst={block.isFirst}
            isLast={block.isLast}
            variant={variant || "default"}
            hoverEffect={hoverEffect}
          />
        ))}
      </div>
    )

    // Wrap with tooltip if enabled
    if (showTooltip) {
      return (
        <>
          <style>{progressStyles}</style>
          <Tooltip>
            <TooltipTrigger asChild>
              {progressBar}
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={10} align="center">
              {Math.round(percentage)}%
            </TooltipContent>
          </Tooltip>
        </>
      )
    }

    return (
      <>
        <style>{progressStyles}</style>
        {progressBar}
      </>
    )
  }
)

EnhancedProgress.displayName = "EnhancedProgress"

export { EnhancedProgress }
