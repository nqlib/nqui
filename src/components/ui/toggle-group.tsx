"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
    showDividers?: boolean
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
  orientation: "horizontal",
  showDividers: false,
})

export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
    /** Auto-inject separators between items. Default true for single (always), true for multiple when spacing=0. */
    separator?: boolean
  }

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  {
    className,
    variant: variantProp,
    size,
    spacing = 0,
    orientation = "horizontal",
    children,
    separator: separatorProp,
    type = "single",
    ...props
  },
  ref
) {
  const resolvedOrientation = orientation ?? "horizontal"
  const hasSegmentedStyle = spacing === 0
  const variant =
    variantProp ?? (type === "single" ? "segmented" : "outline")
  const showDividers = separatorProp ?? (type === "single" || spacing === 0)

  return (
    // @ts-expect-error - Radix ToggleGroup discriminated union doesn't narrow when type is a variable
    <ToggleGroupPrimitive.Root
      ref={ref}
      type={type}
      orientation={resolvedOrientation}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={resolvedOrientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit max-w-full flex-row items-stretch gap-[--spacing(var(--gap))] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:max-w-none data-[orientation=vertical]:max-h-full",
        /* Single row + hidden-scrollbar horizontal scroll when parent is too narrow — never wrap */
        "data-[orientation=horizontal]:overflow-x-auto data-[orientation=vertical]:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        /* Same flush pill for outline (type=multiple) and segmented (type=single): one shell, no hairline track */
        hasSegmentedStyle &&
          "rounded-full border border-input bg-background [--toggle-inner-radius:9999px]",
        !hasSegmentedStyle &&
          "rounded-full",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          spacing,
          orientation: resolvedOrientation,
          showDividers: showDividers && spacing === 0,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
})

ToggleGroup.displayName = "ToggleGroup"

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 focus:z-10 focus-visible:z-10",
        "group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2",
        "group-data-horizontal/toggle-group:data-[spacing=0]:first:!rounded-l-[var(--toggle-inner-radius)] group-data-horizontal/toggle-group:data-[spacing=0]:first:!rounded-r-none group-data-horizontal/toggle-group:data-[spacing=0]:last:!rounded-r-[var(--toggle-inner-radius)] group-data-horizontal/toggle-group:data-[spacing=0]:last:!rounded-l-none",
        "group-data-vertical/toggle-group:data-[spacing=0]:first:!rounded-t-[var(--toggle-inner-radius)] group-data-vertical/toggle-group:data-[spacing=0]:first:!rounded-b-none group-data-vertical/toggle-group:data-[spacing=0]:last:!rounded-b-[var(--toggle-inner-radius)] group-data-vertical/toggle-group:data-[spacing=0]:last:!rounded-t-none",
        "group-data-[spacing=0]/toggle-group:data-[variant=outline]:!border-0 group-data-[spacing=0]/toggle-group:data-[variant=segmented]:!border-0",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}
function ToggleGroupSeparator({
  className,
  orientation = "vertical",
  variant = "solid",
  ...props
}: React.ComponentProps<typeof Separator> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <Separator
      data-slot="toggle-group-separator"
      variant={variant}
      orientation={orientation}
      className={cn(
        "relative self-stretch shrink-0 min-w-px min-h-px",
        "bg-border",
        className
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem, ToggleGroupSeparator }
