import * as React from "react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/custom/enhanced-scroll-area"

// Context to pass stickyHeader state to child components
const CardContext = React.createContext<{ stickyHeader: boolean }>({
  stickyHeader: false,
})

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable sticky header
   * When true, CardHeader becomes sticky and CardContent becomes scrollable with fade mask
   * @default false
   */
  stickyHeader?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, stickyHeader = false, ...props }, ref) => (
    <CardContext.Provider value={{ stickyHeader }}>
      <div
        ref={ref}
        className={cn(
          "nqui-card relative min-w-0 overflow-visible rounded-lg bg-card text-card-foreground",
          stickyHeader && "flex flex-col",
          className
        )}
        {...props}
      />
    </CardContext.Provider>
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { stickyHeader } = React.useContext(CardContext)

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-w-0 flex-col space-y-1.5 p-6",
        stickyHeader &&
          "relative sticky top-0 z-[var(--z-sticky-content)] flex-shrink-0 rounded-t-lg bg-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { stickyHeader } = React.useContext(CardContext)

  if (stickyHeader) {
    return (
      <ScrollArea className={cn("min-h-0 w-full min-w-0 flex-1", className)}>
        <div ref={ref} className="min-w-0 p-6 pt-0" {...props}>
          {children}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div ref={ref} className={cn("min-w-0 p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex min-w-0 items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
