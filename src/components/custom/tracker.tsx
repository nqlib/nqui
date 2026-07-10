"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export interface TrackerBlockProps {
  /**
   * Unique key for the block (optional, falls back to index)
   */
  key?: string | number
  /**
   * Tailwind color classes for the block (e.g., "bg-emerald-600 dark:bg-emerald-500")
   */
  color?: string
  /**
   * Tooltip text to display on hover
   */
  tooltip?: string
}

const TrackerBlock = ({
  color,
  tooltip,
  defaultBackgroundColor,
  hoverEffect,
  isFirst,
  isLast,
}: TrackerBlockProps & {
  defaultBackgroundColor?: string
  hoverEffect?: boolean
  isFirst?: boolean
  isLast?: boolean
}) => {
  const blockContent = (
    <div
      className={cn(
        "size-full overflow-hidden px-[0.5px] transition sm:px-px cursor-pointer",
        isFirst && "rounded-l-[4px] pl-0",
        isLast && "rounded-r-[4px] pr-0"
      )}
      style={{ minWidth: '4px' }}
    >
      <div
        className={cn(
          "size-full rounded-[1px] transition-opacity duration-200 ease-in-out",
          color || defaultBackgroundColor || "bg-muted",
          hoverEffect && "hover:opacity-50"
        )}
      />
    </div>
  )

  // If tooltip is provided, wrap in Tooltip
  if (tooltip) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {blockContent}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={10} align="center">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }

  return blockContent
}

TrackerBlock.displayName = "TrackerBlock"

export interface TrackerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Array of block data to display
   */
  data: TrackerBlockProps[]
  /**
   * Default background color for blocks without a color prop
   * @default "bg-muted"
   */
  defaultBackgroundColor?: string
  /**
   * Enable hover opacity effect on blocks
   * @default false
   */
  hoverEffect?: boolean
}

/**
 * Tracker component for displaying a horizontal bar of colored blocks
 *
 * Similar to GitHub's contribution graph, displays a series of colored blocks
 * with optional tooltips. Useful for visualizing activity, status, or progress
 * over time.
 *
 * @example
 * ```tsx
 * <Tracker
 *   data={[
 *     { color: "bg-emerald-600", tooltip: "Active" },
 *     { color: "bg-red-600", tooltip: "Error" },
 *     { tooltip: "No data" }
 *   ]}
 * />
 * ```
 */
const Tracker = React.forwardRef<HTMLDivElement, TrackerProps>(
  (
    {
      data = [],
      defaultBackgroundColor = "bg-muted",
      className,
      hoverEffect = false,
      ...props
    },
    ref
  ) => {
    const blocks = data.map((blockProps, index) => (
      <TrackerBlock
        key={blockProps.key ?? index}
        defaultBackgroundColor={defaultBackgroundColor}
        hoverEffect={hoverEffect}
        isFirst={index === 0}
        isLast={index === data.length - 1}
        {...blockProps}
      />
    ))

    return (
      <div
        ref={ref}
        className={cn("group flex h-8 w-full items-center", className)}
        {...props}
      >
        {blocks}
      </div>
    )
  }
)

Tracker.displayName = "Tracker"

export { Tracker }
