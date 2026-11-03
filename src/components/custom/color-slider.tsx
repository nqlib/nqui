"use client"

import * as React from "react"

import { Slider, type SliderProps } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export interface ColorSliderProps
  extends Omit<SliderProps, "onChange"> {
  trackColor?: string
  rangeColor?: string
  thumbColor?: string
  thumbFillColor?: string
  thumbOutlineColor?: string
  gradientBackground?: string
  sliderType?: "hue" | "saturation" | "lightness" | "custom"
  currentHue?: number
  currentChroma?: number
}

const ColorSlider = React.forwardRef<React.ElementRef<typeof Slider>, ColorSliderProps>(
  (
    {
      className,
      trackColor,
      rangeColor,
      thumbColor,
      thumbFillColor,
      thumbOutlineColor,
      gradientBackground,
      sliderType = "custom",
      currentHue,
      currentChroma,
      style,
      ...props
    },
    ref
  ) => {
    void currentChroma
    const getGradientBackground = () => {
      if (gradientBackground) return gradientBackground

      switch (sliderType) {
        case "hue":
          return "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))"
        case "saturation": {
          const hue = currentHue !== undefined ? currentHue : (props.value?.[0] ?? props.defaultValue?.[0] ?? 0)
          return `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`
        }
        case "lightness": {
          const hue = currentHue !== undefined ? currentHue : (props.value?.[0] ?? props.defaultValue?.[0] ?? 0)
          return `linear-gradient(to right, hsl(${hue}, 100%, 0%), hsl(${hue}, 100%, 100%))`
        }
        default:
          return rangeColor || "var(--primary)"
      }
    }

    const trackBackground = sliderType !== "custom" ? getGradientBackground() : undefined
    // Token fallbacks must be bare var(): --primary etc. hold full oklch() values, so the old
    // `oklch(var(--primary))` was invalid and silently dropped (transparent range/track).
    const sliderStyle = {
      ...(style || {}),
      "--color-slider-track": trackBackground ?? trackColor ?? "var(--track)",
      "--color-slider-range": sliderType === "custom" ? rangeColor || "var(--primary)" : "transparent",
      "--color-slider-thumb-outline": thumbOutlineColor || thumbColor || "var(--primary)",
      "--color-slider-thumb-fill": thumbFillColor || "var(--thumb)",
    } as React.CSSProperties

    return (
      <Slider
        ref={ref}
        className={cn(
          "[&_[data-slot='slider-track']]:[background:var(--color-slider-track)]",
          // The gradient is content, not chrome: keep it 8px so the colours read (base rail is 4px).
          "[&_[data-slot='slider-track'][data-orientation=horizontal]]:h-2",
          "[&_[data-slot='slider-track'][data-orientation=vertical]]:w-2",
          "[&_[data-slot='slider-range']]:bg-[var(--color-slider-range)]",
          "[&_[data-slot='slider-thumb']]:bg-[var(--color-slider-thumb-fill)]",
          // The base thumb is borderless; ColorSlider keeps its outline so the knob reads on
          // any gradient. Shadow comes from the base thumb's --shadow-thumb.
          "[&_[data-slot='slider-thumb']]:border",
          "[&_[data-slot='slider-thumb']]:border-[var(--color-slider-thumb-outline)]",
          "[&_[data-slot='slider-thumb']]:focus-visible:ring-[var(--color-slider-thumb-outline)]",
          className
        )}
        style={sliderStyle}
        {...props}
      />
    )
  }
)

ColorSlider.displayName = "ColorSlider"

export { ColorSlider }
