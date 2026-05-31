"use client"

import {
  IconCircle,
} from "@/components/icons"
import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { createContext, useContext, useId } from "react"
import { cn } from "@/lib/utils"

// Context for variant and state propagation
interface RadioGroupContextValue {
  variant: "animated" | "sliding"
  disabled?: boolean
  value?: string // Track current value for checked state
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined)

export interface EnhancedRadioGroupProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {
  /**
   * Visual variant of the radio group.
   * - `animated`: Default variant with circular radio buttons and pulse animation on selection
   * - `sliding`: Tab-like sliding indicator that moves to the selected item
   *
   * @default "animated"
   */
  variant?: "animated" | "sliding"
  /**
   * Disables all radio items in the group.
   *
   * @default false
   */
  disabled?: boolean
  /**
   * Gap between radio items. Can be a number (gap in pixels) or a Tailwind gap class.
   * - `0` or `"gap-0"`: No gap
   * - `1` or `"gap-1"` (4px)
   * - `2` or `"gap-2"` (8px) - compact
   * - `3` or `"gap-3"` (12px) - default
   * - `4` or `"gap-4"` (16px)
   *
   * @default 3
   */
  gap?: number | string
}

/**
 * Enhanced RadioGroup component with variant support
 *
 * Wraps Radix UI RadioGroup primitives with enhanced styling and variants.
 * Maintains all Radix UI accessibility and state management.
 *
 * **Usage Tips:**
 * - Pass content directly as children to RadioGroupItem (don't wrap in Label)
 * - Use the `spacing` prop on RadioGroupItem to control gap between radio and content
 * - The "animated" variant is best for most use cases
 *
 * @example
 * ```tsx
 * // Basic usage
 * <RadioGroup variant="animated" value={value} onValueChange={setValue}>
 *   <RadioGroupItem value="option1">Option 1</RadioGroupItem>
 *   <RadioGroupItem value="option2">Option 2</RadioGroupItem>
 * </RadioGroup>
 *
 * // With custom content and spacing
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <RadioGroupItem value="option1" spacing="compact">
 *     <div>
 *       <div className="font-medium">Option 1</div>
 *       <div className="text-sm text-muted-foreground">Description</div>
 *     </div>
 *   </RadioGroupItem>
 * </RadioGroup>
 * ```
 */
const EnhancedRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  EnhancedRadioGroupProps
>(({ className, variant = "animated", disabled, gap = 3, children, ...props }, ref) => {
  const groupRef = React.useRef<HTMLDivElement | null>(null)
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({})
  const [showIndicatorElement, setShowIndicatorElement] = React.useState(false)
  const [currentValue, setCurrentValue] = React.useState<string>(
    props.value || props.defaultValue || ""
  )

  // Track value changes from Radix
  const handleValueChange = React.useCallback(
    (value: string) => {
      setCurrentValue(value)
      props.onValueChange?.(value)
    },
    [props, currentValue, variant]
  )

  // Sync with controlled value prop
  React.useEffect(() => {
    if (props.value !== undefined && props.value !== null) {
      setCurrentValue(props.value)
    }
  }, [props.value, currentValue, variant])

  // Combine refs
  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
      (groupRef as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref]
  )

  // Calculate indicator position for sliding variant
  const updateIndicatorPosition = React.useCallback(() => {
    if (variant !== "sliding" || !groupRef.current) {
      setShowIndicatorElement(false)
      return
    }

    if (!currentValue) {
      setShowIndicatorElement(false)
      return
    }

    // Try to find checked input if currentValue is not set
    let checkedValue = currentValue
    if (!checkedValue && groupRef.current) {
      // Try Radix data-state first
      const checkedRadixItem = groupRef.current.querySelector(
        '[data-slot="radio-group-item"][data-state="checked"]'
      ) as HTMLElement
      if (checkedRadixItem) {
        const input = checkedRadixItem.querySelector('input[type="radio"]') as HTMLInputElement
        if (input) {
          checkedValue = input.value
        }
      } else {
        // Fallback to regular input query
        const checkedInput = groupRef.current.querySelector(
          'input[type="radio"]:checked'
        ) as HTMLInputElement
        if (checkedInput) {
          checkedValue = checkedInput.value
        }
      }
    }

    if (!checkedValue) {
      setShowIndicatorElement(false)
      return
    }

    // Find the checked RadioGroupPrimitive.Item using data-state="checked"
    const checkedRadixItem = groupRef.current.querySelector(
      '[data-slot="radio-group-item"][data-state="checked"]'
    ) as HTMLElement

    // If not found by data-state, try finding by value in input
    let activeItem: HTMLElement | null = null
    if (checkedRadixItem) {
      const radixItemId = checkedRadixItem.id
      if (radixItemId) {
        // Find the label with 'for' attribute matching the id (HTML uses 'for', not 'htmlFor')
        activeItem = groupRef.current.querySelector(
          `label[for="${radixItemId}"]`
        ) as HTMLElement
        // If not found, try finding by parent div relationship
        if (!activeItem) {
          const parentDiv = checkedRadixItem.parentElement
          activeItem = parentDiv?.querySelector('label') as HTMLElement
        }
      }
    } else {
      // Fallback: find by searching all labels with sliding-indicator-target class
      const allLabels = Array.from(groupRef.current.querySelectorAll('label.sliding-indicator-target')) as HTMLLabelElement[]
      // Find the label whose associated input has the checked value
      for (const label of allLabels) {
        const inputId = label.htmlFor
        if (inputId) {
          const input = groupRef.current.querySelector(`#${inputId}`) as HTMLElement
          const inputElement = input?.querySelector('input[type="radio"]') as HTMLInputElement
          if (inputElement && inputElement.value === checkedValue && inputElement.checked) {
            activeItem = label
            break
          }
        }
      }
    }

    if (!activeItem) {
      setShowIndicatorElement(false)
      return
    }

    // Calculate position relative to the RadioGroup container
    const containerRect = groupRef.current.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()
    // Account for scroll position when container overflows
    const scrollLeft = groupRef.current.scrollLeft || 0
    const scrollTop = groupRef.current.scrollTop || 0
    const indicatorStyleValue = {
      left: `${itemRect.left - containerRect.left + scrollLeft}px`,
      top: `${itemRect.top - containerRect.top + scrollTop}px`,
      width: `${itemRect.width}px`,
      height: `${itemRect.height}px`,
    }
    setIndicatorStyle(indicatorStyleValue)

    setShowIndicatorElement(true)
  }, [variant, currentValue])

  // Update indicator position on value/children changes
  React.useEffect(() => {
    if (variant !== "sliding") return

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updateIndicatorPosition)
    })

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(updateIndicatorPosition)
      })
    })

    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(updateIndicatorPosition)
      })
    })

    // Handle window resize for responsive indicator positioning
    const handleResize = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(updateIndicatorPosition)
      })
    }

    if (groupRef.current) {
      resizeObserver.observe(groupRef.current)
      mutationObserver.observe(groupRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-state", "class", "checked"],
      })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener("resize", handleResize)
    }
  }, [variant, updateIndicatorPosition, currentValue, children])

  // Container className based on variant
  const gapClass = typeof gap === "number" ? `gap-${gap}` : gap
  const containerClassName = cn(
    variant === "sliding"
      ? /* Capsule + inset padding match TabsList (default) + sliding pill */
        "sliding-indicator-container isolate flex flex-row items-center gap-0 rounded-full bg-muted p-[3px] box-border overflow-x-auto min-h-7 min-w-0"
      : `grid ${gapClass} w-full`, // animated (default)
    className
  )

  return (
    <RadioGroupContext.Provider value={{ variant, disabled, value: currentValue }}>
      <RadioGroupPrimitive.Root
        ref={combinedRef}
        data-slot="radio-group"
        className={containerClassName}
        disabled={disabled}
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={handleValueChange}
        {...(Object.fromEntries(
          Object.entries(props).filter(
            ([key]) => !["value", "defaultValue", "onValueChange", "disabled"].includes(key)
          )
        ) as typeof props)}
      >
        {/* Tab-like sliding indicator for sliding variant */}
        {variant === "sliding" && showIndicatorElement && (
          <div
            className={cn(
              "sliding-indicator rounded-full border border-input bg-background shadow-sm box-border"
            )}
            style={indicatorStyle}
            aria-hidden="true"
          />
        )}

        {children}
      </RadioGroupPrimitive.Root>
    </RadioGroupContext.Provider>
  )
})

EnhancedRadioGroup.displayName = "EnhancedRadioGroup"

export interface EnhancedRadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  /**
   * The content to display next to the radio button.
   *
   * **Important:** Pass children directly to RadioGroupItem. Do NOT wrap RadioGroupItem
   * in a separate Label component, as RadioGroupItem already provides the label wrapper.
   *
   * @example
   * ```tsx
   * // ✅ Correct usage
   * <RadioGroupItem value="option1">
   *   <div>
   *     <div className="font-medium">Option 1</div>
   *     <div className="text-sm text-muted-foreground">Description</div>
   *   </div>
   * </RadioGroupItem>
   *
   * // ❌ Incorrect usage - don't wrap in Label
   * <Label>
   *   <RadioGroupItem value="option1" />
   *   <span>Option 1</span>
   * </Label>
   * ```
   */
  children?: React.ReactNode
  /**
   * Controls the spacing between the radio button and its content.
   * - `compact`: 8px gap (gap-2)
   * - `default`: 12px gap (gap-3) - default
   * - `comfortable`: 16px gap (gap-4)
   *
   * Only applies to the "animated" variant.
   *
   * @default "default"
   */
  spacing?: "compact" | "default" | "comfortable"
}

/**
 * Enhanced RadioGroupItem component with variant-specific rendering.
 *
 * This component automatically wraps the radio button in a label and handles
 * accessibility. Pass your content directly as children - do not wrap this
 * component in additional Label components.
 *
 * @example
 * ```tsx
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <RadioGroupItem value="option1" spacing="compact">
 *     <div>
 *       <div className="font-medium">Option 1</div>
 *       <div className="text-sm text-muted-foreground">Description</div>
 *     </div>
 *   </RadioGroupItem>
 * </RadioGroup>
 * ```
 */
const EnhancedRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  EnhancedRadioGroupItemProps
>(({ className, children, spacing = "default", ...props }, ref) => {
  const context = useContext(RadioGroupContext)
  if (!context) {
    throw new Error("EnhancedRadioGroupItem must be used within EnhancedRadioGroup")
  }

  const { variant, disabled: groupDisabled, value: currentValue } = context
  const isDisabled = groupDisabled || props.disabled
  const stableId = useId() // Generate stable ID for SSR compatibility
  const isChecked = currentValue === props.value

  // Animated variant (default) - use Radix structure with Hugeicons
  if (variant === "animated") {
    const spacingClasses = {
      compact: "gap-2",
      default: "gap-3",
      comfortable: "gap-4",
    }

    return (
      <label
        className={cn(
          // Without children, avoid w-full so a sibling Label/htmlFor row does not gap to the far edge.
          "flex items-center cursor-pointer relative",
          children ? "w-full" : "inline-flex w-auto max-w-full",
          spacingClasses[spacing],
          "group/radio-item",
          isDisabled && "cursor-not-allowed opacity-50"
        )}
        data-disabled={isDisabled}
      >
        <RadioGroupPrimitive.Item
          ref={ref}
          data-slot="radio-group-item"
          className={cn(
            "border-input text-primary dark:data-[state=unchecked]:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary data-[state=checked]:border-transparent flex size-4 rounded-full transition-none focus-visible:ring-[2px] aria-invalid:ring-[2px] peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
            // Pulse animation on selection
            "data-[state=checked]:animate-[radio-pulse_0.7s_forwards]",
            className
          )}
          disabled={isDisabled}
          {...props}
        >
          <RadioGroupPrimitive.Indicator
            data-slot="radio-group-indicator"
            className="group-aria-invalid/radio-group-item:text-destructive flex size-4 items-center justify-center text-primary-foreground"
          >
            <IconCircle
              strokeWidth={2}
              className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current"
            />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        {children && (
          <span className="text-sm font-medium leading-normal text-foreground select-none">
            {children}
          </span>
        )}
      </label>
    )
  }

  // Sliding variant - tab-like with sliding indicator
  if (variant === "sliding") {
    const hasIcons = React.Children.toArray(children).some(
      (child) => {
        if (!React.isValidElement(child)) return false
        const props = child.props as { className?: string }
        return props?.className?.includes("h-") || props?.className?.includes("w-")
      }
    )

    const inputId = props.id || `radio-sliding-${props.value}-${stableId.replace(/:/g, '-')}`

    return (
      <div
        className={cn(
          "relative min-w-0",
          hasIcons ? "shrink-0" : "flex-1"
        )}
      >
        <RadioGroupPrimitive.Item
          ref={ref}
          data-slot="radio-group-item"
          id={inputId}
          className="sr-only"
          disabled={isDisabled}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "sliding-indicator-target relative z-[var(--z-content)] inline-flex cursor-pointer items-center justify-center rounded-full border border-transparent text-xs font-medium leading-normal transition-colors motion-safe:duration-200",
            /* Match TabsTrigger: inactive muted + hover; active label stays transparent — pill supplies fill */
            hasIcons ? "size-7 p-0" : "h-7 w-full min-w-0 px-1.5 py-0.5",
            isChecked
              ? "text-foreground shadow-none"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isDisabled && "cursor-not-allowed opacity-50"
          )}
        >
          {children && <span>{children}</span>}
        </label>
      </div>
    )
  }

  // Fallback to animated variant
  const spacingClasses = {
    compact: "gap-2",
    default: "gap-3",
    comfortable: "gap-4",
  }

  return (
    <label
      className={cn(
        "flex items-center cursor-pointer relative",
        children ? "w-full" : "inline-flex w-auto max-w-full",
        spacingClasses[spacing],
        isDisabled && "cursor-not-allowed opacity-50"
      )}
    >
      <RadioGroupPrimitive.Item
        ref={ref}
        data-slot="radio-group-item"
        className={cn(
          "border-input text-primary dark:data-[state=unchecked]:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary data-[state=checked]:border-transparent flex size-4 rounded-full transition-none focus-visible:ring-[2px] aria-invalid:ring-[2px] peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="group-aria-invalid/radio-group-item:text-destructive flex size-4 items-center justify-center text-primary-foreground"
        >
          <IconCircle
            strokeWidth={2}
            className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {children && (
        <span className="text-sm font-medium leading-normal text-foreground select-none">
          {children}
        </span>
      )}
    </label>
  )
})

EnhancedRadioGroupItem.displayName = "EnhancedRadioGroupItem"

export { EnhancedRadioGroup, EnhancedRadioGroup as RadioGroup, EnhancedRadioGroupItem, EnhancedRadioGroupItem as RadioGroupItem }
export type { EnhancedRadioGroupProps as RadioGroupProps, EnhancedRadioGroupItemProps as RadioGroupItemProps }
