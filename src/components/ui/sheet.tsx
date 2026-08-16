"use client"

import {
  IconX,
} from "@/components/icons"
import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { modalOverlayScrim, modalTrayOuter, modalTrayStage } from "@/lib/floating-surface"
import { Button } from "@/components/ui/button"

/**
 * Sheet component - A modal-like panel that slides in from the edge of the screen.
 *
 * @param modal - When `false`, disables body scroll lock and focus trapping.
 *                Use this for apps with contained scrolling (ScrollArea) to prevent layout shift.
 *                Default: `true`
 *
 * @example
 * // Default modal behavior (body scroll locked)
 * <Sheet open={open} onOpenChange={setOpen}>
 *   <SheetContent>...</SheetContent>
 * </Sheet>
 *
 * @example
 * // Non-modal (no body scroll lock - for contained scroll apps)
 * <Sheet open={open} onOpenChange={setOpen} modal={false}>
 *   <SheetContent>...</SheetContent>
 * </Sheet>
 */
function Sheet({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        modalOverlayScrim,
        className
      )}
      {...props}
    />
  )
}

const sheetVariants = cva(
  cn(
    "group/sheet-content fixed z-[var(--z-modal)] flex flex-col text-foreground transition ease-[var(--ease-in-out)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-[var(--duration-standard)] data-[state=open]:duration-[var(--duration-slow)]",
    modalTrayOuter,
  ),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentProps<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  /**
   * Whether to show the close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean
  /** Muted rim + background stage. Off for mobile Sidebar (owns its own surface). */
  stage?: boolean
}

function SheetContent({
  side = "right",
  className,
  children,
  showCloseButton = true,
  stage = true,
  ...props
}: SheetContentProps) {
  const closeButton = showCloseButton ? (
    <SheetPrimitive.Close data-slot="sheet-close-button" asChild>
      <Button variant="ghost" className="absolute top-2 right-2" size="icon">
        <IconX strokeWidth={2} />
        <span className="sr-only">Close</span>
      </Button>
    </SheetPrimitive.Close>
  ) : null

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(sheetVariants({ side }), !stage && "relative", className)}
        {...props}
      >
        {stage ? (
          <div
            data-slot="sheet-stage"
            className={cn(modalTrayStage, "flex min-h-0 flex-1 flex-col gap-4 p-4")}
          >
            {children}
            {closeButton}
          </div>
        ) : (
          <>
            {children}
            {closeButton}
          </>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function SheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
