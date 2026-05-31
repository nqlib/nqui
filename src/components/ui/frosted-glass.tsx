import * as React from "react"
import { cn } from "@/lib/utils"

interface FrostedGlassProps {
  /**
   * Blur radius in pixels
   * @default 16
   */
  blur?: number
  /**
   * Border radius in pixels
   * @default 0
   */
  borderRadius?: number
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * FrostedGlass component creates an Apple-inspired frosted glass effect
 * using backdrop-filter with extended backdrop to capture nearby elements.
 *
 * Based on Josh Comeau's method: https://www.joshwcomeau.com/css/backdrop-filter/
 *
 * Key features:
 * - Extended backdrop (height: 200%) to capture nearby elements for blur
 * - SVG mask for rounded corners
 * - Gradient background to prevent top-edge flickering
 * - Pointer events disabled to allow interactions
 * - Feature queries for browser support
 */
function FrostedGlass({
  blur = 16,
  borderRadius = 0,
  className,
}: FrostedGlassProps) {
  const maskId = React.useId()
  const uniqueMaskId = `frostyGlassMask-${maskId.replace(/:/g, "-")}`

  // For rounded corners, use SVG mask; otherwise use linear gradient mask
  const useSvgMask = borderRadius > 0

  return (
    <>
      {/* SVG mask for rounded corners (only when borderRadius > 0) */}
      {useSvgMask && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <mask id={uniqueMaskId}>
            <rect
              width="100%"
              height="100%"
              fill="white"
              rx={borderRadius}
              ry={borderRadius}
            />
          </mask>
        </svg>
      )}

      {/* Backdrop element with blur effect */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          // Extended height to capture nearby elements (key optimization)
          "h-[200%]",
          // Very light background to make blur effect visible (3% opacity for subtle visibility)
          "bg-background/3",
          className
        )}
        style={
          {
            "--blur": `${blur}px`,
            // Backdrop filter with webkit prefix for Safari - moved to inline styles to avoid Tailwind scanning issues
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            // Use SVG mask for rounded corners, linear gradient mask otherwise
            maskImage: useSvgMask
              ? `url(#${uniqueMaskId})`
              : "linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)",
            WebkitMaskImage: useSvgMask
              ? `url(#${uniqueMaskId})`
              : "linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)",
          } as React.CSSProperties
        }
      />
    </>
  )
}

export { FrostedGlass }
export type { FrostedGlassProps }
