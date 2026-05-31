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
          return rangeColor || "oklch(var(--primary))"
      }
    }

    const trackBackground = sliderType !== "custom" ? getGradientBackground() : undefined
    const sliderStyle = {
      ...(props.style || {}),
      "--color-slider-track": trackBackground ?? trackColor ?? "oklch(var(--secondary))",
      "--color-slider-range": sliderType === "custom" ? rangeColor || "oklch(var(--primary))" : "transparent",
      "--color-slider-thumb-outline": thumbOutlineColor || thumbColor || "oklch(var(--primary))",
      "--color-slider-thumb-fill": thumbFillColor || "white",
    } as React.CSSProperties

    return (
      <Slider
        ref={ref}
        className={cn(
          "[&_[data-slot='slider-track']]:[background:var(--color-slider-track)]",
          "[&_[data-slot='slider-range']]:bg-[var(--color-slider-range)]",
          "[&_[data-slot='slider-thumb']]:bg-[var(--color-slider-thumb-fill)]",
          "[&_[data-slot='slider-thumb']]:border-[var(--color-slider-thumb-outline)]",
          "[&_[data-slot='slider-thumb']]:shadow-[0_2px_6px_rgba(0,0,0,0.22),0_0_1px_rgba(0,0,0,0.12)]",
          "[&_[data-slot='slider-thumb']]:ring-offset-background",
          "[&_[data-slot='slider-thumb']]:hover:ring-[var(--color-slider-thumb-outline)]",
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
