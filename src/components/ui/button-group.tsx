import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

/**
 * Flat segmented shell — same dialect as ToggleGroup spacing=0:
 * one border-input pill, transparent segments, interactive wash, secondary when on.
 * No inner hairlines between actions (ToggleGroup “no hairline track”).
 */
const buttonGroupVariants = cva(
  [
    "group/button-group inline-flex w-fit max-w-full items-stretch gap-0 overflow-hidden rounded-full border border-input bg-background",
    "[--toggle-inner-radius:9999px]",
    "has-[>[data-slot=button-group]]:gap-2",
    "[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
    "has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-full",
    // Flat segments — match toggleVariants segmented
    "[&>*]:!border-0 [&>*]:!shadow-none [&>*]:!rounded-none [&>*]:![background-image:none]",
    "[&>button]:!font-normal [&>a]:!font-normal [&>button]:!opacity-100 [&>a]:!opacity-100",
    "[&>button]:active:!scale-100 [&>a]:active:!scale-100",
    "[&>button]:active:!shadow-none [&>a]:active:!shadow-none",
    "[&>*]:focus-visible:z-10 [&>*]:focus-visible:relative",
    // Resting + hover wash (all common variants inside the shell)
    "[&>button]:!bg-transparent [&>a]:!bg-transparent",
    "[&>button]:hover:!bg-interactive [&>a]:hover:!bg-interactive",
    "[&>button]:hover:!text-foreground [&>a]:hover:!text-foreground",
    // Selected — ToggleGroup data-[state=on] equivalent
    "[&>button[aria-current='true']]:!font-bold [&>button[aria-pressed='true']]:!font-bold [&>button[data-active]]:!font-bold",
    "[&>a[aria-current='true']]:!font-bold [&>a[aria-pressed='true']]:!font-bold [&>a[data-active]]:!font-bold",
    "[&>button[aria-pressed='true']]:!bg-secondary [&>button[aria-pressed='true']]:!text-secondary-foreground [&>button[aria-pressed='true']]:hover:!bg-secondary/90",
    "[&>button[aria-current='true']]:!bg-secondary [&>button[aria-current='true']]:!text-secondary-foreground [&>button[aria-current='true']]:hover:!bg-secondary/90",
    "[&>button[data-active]]:!bg-secondary [&>button[data-active]]:!text-secondary-foreground [&>button[data-active]]:hover:!bg-secondary/90",
    "[&>a[aria-pressed='true']]:!bg-secondary [&>a[aria-pressed='true']]:!text-secondary-foreground",
    "[&>a[aria-current='true']]:!bg-secondary [&>a[aria-current='true']]:!text-secondary-foreground [&>a[aria-current='true']]:hover:!bg-secondary/90",
    "[&>a[data-active]]:!bg-secondary [&>a[data-active]]:!text-secondary-foreground [&>a[data-active]]:hover:!bg-secondary/90",
    // Optional Separator (label strips only) — keep hairline; hide when unused
    "[&>[data-slot=button-group-separator]]:w-px [&>[data-slot=button-group-separator]]:min-w-px",
    "[&>[data-slot=button-group-separator]]:shrink-0 [&>[data-slot=button-group-separator]]:self-stretch",
    "[&>[data-slot=button-group-separator]]:!border-0 [&>[data-slot=button-group-separator]]:bg-border",
  ].join(" "),
  {
    variants: {
      orientation: {
        horizontal: [
          "flex-row",
          "[&>*:first-child]:!rounded-l-[var(--toggle-inner-radius)] [&>*:first-child]:!rounded-r-none",
          "[&>*:last-child]:!rounded-r-[var(--toggle-inner-radius)] [&>*:last-child]:!rounded-l-none",
          "[&>*:not(:first-child):not(:last-child)]:!rounded-none",
        ].join(" "),
        vertical: [
          "flex-col",
          "[&>*:first-child]:!rounded-t-[var(--toggle-inner-radius)] [&>*:first-child]:!rounded-b-none",
          "[&>*:last-child]:!rounded-b-[var(--toggle-inner-radius)] [&>*:last-child]:!rounded-t-none",
          "[&>*:not(:first-child):not(:last-child)]:!rounded-none",
          "[&>[data-slot=button-group-separator]]:w-auto [&>[data-slot=button-group-separator]]:h-px",
          "[&>[data-slot=button-group-separator]]:min-h-px [&>[data-slot=button-group-separator]]:min-w-0",
        ].join(" "),
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      className={cn(
        "flex shrink-0 items-center gap-2 bg-transparent px-2 text-xs font-medium text-muted-foreground [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      variant="solid"
      orientation={orientation}
      className={cn(
        "relative shrink-0 self-stretch bg-border",
        orientation === "vertical" ? "h-auto w-px min-w-px" : "h-px min-h-px w-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
