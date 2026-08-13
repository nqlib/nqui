import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { useComposedRefs } from "@/lib/compose-refs"
import { wrapInlineLabelTextNodes } from "@/lib/wrap-inline-label-text"

function useSlidingTabPill(
  listRef: React.RefObject<HTMLElement | null>,
  slide: boolean
) {
  const [pill, setPill] = React.useState<{
    left: number
    top: number
    width: number
    height: number
    visible: boolean
  }>({ left: 0, top: 0, width: 0, height: 0, visible: false })

  const measure = React.useCallback(() => {
    const list = listRef.current
    if (!list || !slide) return
    const active = list.querySelector<HTMLElement>(
      '[data-slot="tabs-trigger"][data-state="active"]'
    )
    if (!active) {
      setPill((p) => ({ ...p, visible: false }))
      return
    }
    const lr = list.getBoundingClientRect()
    const ar = active.getBoundingClientRect()
    setPill({
      left: ar.left - lr.left + list.scrollLeft,
      top: ar.top - lr.top + list.scrollTop,
      width: ar.width,
      height: ar.height,
      visible: true,
    })
  }, [listRef, slide])

  React.useLayoutEffect(() => {
    if (!slide) return
    measure()
    const list = listRef.current
    if (!list) return

    const ro = new ResizeObserver(measure)
    ro.observe(list)

    const mo = new MutationObserver(measure)
    mo.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
      childList: true,
    })

    const onWin = () => measure()
    window.addEventListener("resize", onWin)
    list.addEventListener("scroll", measure, { passive: true })

    return () => {
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener("resize", onWin)
      list.removeEventListener("scroll", measure)
    }
  }, [listRef, slide, measure])

  return pill
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentProps<typeof TabsPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => {
  return (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
})
Tabs.displayName = "Tabs"

const tabsListVariants = cva(
  /* h-7 matches default Button / Input / Toggle / pagination (28px strip) */
  /* --tabs-pill-radius = outer shell. Inner indicator / triggers use
   * --tabs-pill-inner-radius = max(0, outer − inset) so the 3px pad stays
   * concentric (R_inner = R_outer − padding). Override --tabs-pill-radius on
   * TabsList (e.g. 9999px) and both layers follow. Default matches Button. */
  "[--tabs-pill-radius:var(--radius-md)] [--tabs-pill-inset:3px] [--tabs-pill-inner-radius:max(0px,calc(var(--tabs-pill-radius)-var(--tabs-pill-inset)))] rounded-(--tabs-pill-radius) p-[var(--tabs-pill-inset)] group-data-horizontal/tabs:h-7 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>
>(({ className, variant = "default", children, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null)
  const composedRef = useComposedRefs(ref, listRef)
  const slide = variant === "default"
  const pill = useSlidingTabPill(listRef, slide)

  return (
    <TabsPrimitive.List
      ref={composedRef}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        tabsListVariants({ variant }),
        slide && "relative isolate",
        className
      )}
      {...props}
    >
      {slide && (
        <span
          aria-hidden
          data-slot="tabs-pill"
          className={cn(
            /* Outer shell uses --tabs-pill-radius; this layer is inset by
             * --tabs-pill-inset so it uses --tabs-pill-inner-radius. */
            "pointer-events-none absolute z-0 rounded-(--tabs-pill-inner-radius) border border-input bg-background",
            "motion-safe:transition-[left,top,width,height,opacity] motion-safe:duration-[var(--duration-standard)] motion-safe:ease-out",
            "motion-reduce:transition-none",
            !pill.visible && "opacity-0"
          )}
          style={{
            left: pill.left,
            top: pill.top,
            width: pill.width,
            height: pill.height,
            opacity: pill.visible ? 1 : 0,
          }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentProps<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        /* Inactive: ghost-like (matches PaginationLink ghost); active: outline (matches PaginationLink isActive) */
        /* text-sm + icon size-4 match default Button */
        "gap-1.5 rounded-(--tabs-pill-inner-radius) border border-transparent px-1.5 py-0.5 text-sm font-medium text-muted-foreground hover:bg-interactive hover:text-foreground group-data-[variant=line]/tabs-list:rounded-md group-data-vertical/tabs:py-[calc(--spacing(1.25))] [&_svg:not([class*='size-'])]:size-4 ring-offset-background relative z-10 inline-flex h-[calc(100%-1px)] min-w-0 max-w-full flex-1 items-center justify-center whitespace-nowrap transition-colors motion-safe:duration-[var(--duration-standard)] group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent",
        /* default: sliding pill — active chip is transparent; pill layer supplies fill */
        "group-data-[variant=default]/tabs-list:data-[state=active]:border-transparent group-data-[variant=default]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none",
        "data-[state=active]:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    >
      {wrapInlineLabelTextNodes(children)}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentProps<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn("text-xs flex-1 outline-none", className)}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
