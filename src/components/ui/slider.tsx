/* eslint-disable react-refresh/only-export-components -- SliderProps + cva variants exported for library consumers */
import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sliderTrackVariants = cva(
  "bg-muted rounded-full relative grow overflow-hidden data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
  {
    variants: {
      size: {
        sm: "data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2",
        default: "data-[orientation=horizontal]:h-[10px] data-[orientation=vertical]:w-[10px]",
        lg: "data-[orientation=horizontal]:h-3 data-[orientation=vertical]:w-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const sliderThumbVariants = cva(
  "border-primary ring-ring/30 block shrink-0 rounded-full border bg-white shadow-[0_2px_6px_rgba(0,0,0,0.22),0_0_1px_rgba(0,0,0,0.12)] transition-colors hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden select-none disabled:pointer-events-none disabled:opacity-50",
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

export type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> &
  VariantProps<typeof sliderTrackVariants>

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  size,
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "data-[orientation=vertical]:min-h-40 relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={sliderTrackVariants({ size })}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={sliderThumbVariants({ size })}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider, sliderTrackVariants, sliderThumbVariants }
