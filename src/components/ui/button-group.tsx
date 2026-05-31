import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

/* Flush pill matches ToggleGroup spacing=0: one shell, transparent segments, secondary when “on” */
const buttonGroupVariants = cva(
  "inline-flex w-fit items-stretch overflow-hidden rounded-full border border-input bg-background [--toggle-inner-radius:9999px] [&>*]:border-0 [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-full [&>button]:!font-normal [&>a]:!font-normal [&>button[aria-current='true']]:!font-bold [&>button[aria-pressed='true']]:!font-bold [&>button[data-active]]:!font-bold [&>a[aria-current='true']]:!font-bold [&>a[aria-pressed='true']]:!font-bold [&>a[data-active]]:!font-bold [&>[data-slot=select-trigger]]:!font-normal [&>button[data-variant=outline]]:!bg-transparent [&>button[data-variant=outline]]:hover:!bg-accent [&>button[data-variant=outline]]:hover:!text-accent-foreground [&>a[data-variant=outline]]:!bg-transparent [&>a[data-variant=outline]]:hover:!bg-accent [&>a[data-variant=outline]]:hover:!text-accent-foreground [&>button[data-variant=ghost]]:!bg-transparent [&>button[data-variant=ghost]]:hover:!bg-accent [&>button[data-variant=ghost]]:hover:!text-accent-foreground [&>a[data-variant=ghost]]:!bg-transparent [&>a[data-variant=ghost]]:hover:!bg-accent [&>a[data-variant=ghost]]:hover:!text-accent-foreground [&>button[aria-pressed='true']]:!bg-secondary [&>button[aria-pressed='true']]:!text-secondary-foreground [&>button[aria-pressed='true']]:hover:!bg-secondary/90 [&>button[aria-current='true']]:!bg-secondary [&>button[aria-current='true']]:!text-secondary-foreground [&>button[aria-current='true']]:hover:!bg-secondary/90 [&>button[data-active]]:!bg-secondary [&>button[data-active]]:!text-secondary-foreground [&>button[data-active]]:hover:!bg-secondary/90 [&>a[aria-pressed='true']]:!bg-secondary [&>a[aria-pressed='true']]:!text-secondary-foreground [&>a[aria-current='true']]:!bg-secondary [&>a[aria-current='true']]:!text-secondary-foreground [&>a[aria-current='true']]:hover:!bg-secondary/90 [&>a[data-active]]:!bg-secondary [&>a[data-active]]:!text-secondary-foreground [&>a[data-active]]:hover:!bg-secondary/90",
  {
    variants: {
      orientation: {
        horizontal:
          "flex-row [&>*:first-child]:!rounded-l-full [&>*:first-child]:!rounded-r-none [&>*:last-child]:!rounded-r-full [&>*:last-child]:!rounded-l-none [&>*:not(:first-child):not(:last-child)]:!rounded-none",
        vertical:
          "flex-col [&>*:first-child]:!rounded-t-full [&>*:first-child]:!rounded-b-none [&>*:last-child]:!rounded-b-full [&>*:last-child]:!rounded-t-none [&>*:not(:first-child):not(:last-child)]:!rounded-none",
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
        "shrink-0 border-0 bg-transparent px-2.5 text-xs font-medium text-muted-foreground flex items-center gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
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
      className={cn("relative min-h-px min-w-px shrink-0 self-stretch bg-border", className)}
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
