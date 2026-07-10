import * as React from "react"
import { useState, createContext, useContext } from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import {
  Tabs as CoreTabs,
  TabsList as CoreTabsList,
  TabsTrigger as CoreTabsTrigger,
  TabsContent as CoreTabsContent,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export interface EnhancedTabsProps
  extends React.ComponentProps<typeof TabsPrimitive.Root> {}

const EnhancedTabs = React.forwardRef<HTMLDivElement, EnhancedTabsProps>(
  ({ className, value, defaultValue, onValueChange, orientation = "horizontal", ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || "")
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const handleValueChange = (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, orientation }}>
        <CoreTabs
          ref={ref}
          className={className}
          value={currentValue}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          orientation={orientation}
          {...props}
        />
      </TabsContext.Provider>
    )
  }
)
EnhancedTabs.displayName = "EnhancedTabs"

export interface EnhancedTabsListProps
  extends React.ComponentProps<typeof TabsPrimitive.List> {
  orientation?: "horizontal" | "vertical"
}

/** Wraps core TabsList + context orientation. Default tab list uses a sliding pill (h-7 strip, aligned with default controls). */
const EnhancedTabsList = React.forwardRef<HTMLDivElement, EnhancedTabsListProps>(
  ({ className, orientation, ...props }, ref) => {
    const context = useContext(TabsContext)
    const appliedOrientation = orientation || context?.orientation || "horizontal"
    const listClassName = cn(appliedOrientation === "vertical" && "flex-col", className)

    return (
      <CoreTabsList ref={ref} variant="default" className={listClassName} {...props} />
    )
  }
)
EnhancedTabsList.displayName = "EnhancedTabsList"

export interface EnhancedTabsTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger> {}

const EnhancedTabsTrigger = React.forwardRef<HTMLButtonElement, EnhancedTabsTriggerProps>(
  ({ className, ...props }, ref) => {
    const context = useContext(TabsContext)
    if (!context) {
      throw new Error("EnhancedTabsTrigger must be used within EnhancedTabs")
    }

    const orientation = context?.orientation || "horizontal"

    return (
      <CoreTabsTrigger
        ref={ref}
        data-orientation={orientation}
        className={cn(className)}
        {...props}
      />
    )
  }
)
EnhancedTabsTrigger.displayName = "EnhancedTabsTrigger"

export interface EnhancedTabsContentProps
  extends React.ComponentProps<typeof TabsPrimitive.Content> {}

const EnhancedTabsContent = React.forwardRef<HTMLDivElement, EnhancedTabsContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <CoreTabsContent
        ref={ref}
        className={cn("transition-opacity duration-200 ease-in-out", className)}
        {...props}
      />
    )
  }
)
EnhancedTabsContent.displayName = "EnhancedTabsContent"

export {
  EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger,
  EnhancedTabsContent,
}
