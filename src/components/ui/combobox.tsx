"use client"

import {
  IconChevronDown,
  IconChevronsUpDown,
  IconX,
} from "@/components/icons"

/**
 * Public API (stable, exported from `components/index.ts`):
 * Combobox, ComboboxInput, ComboboxBadgeTrigger, ComboboxContent, ComboboxList, ComboboxItem,
 * ComboboxGroup, ComboboxLabel, ComboboxCollection, ComboboxEmpty, ComboboxSeparator,
 * ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxTrigger, ComboboxValue,
 * ComboboxAnchor, ComboboxClear, useComboboxAnchor — plus CoreCombobox* aliases.
 */

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { floatingSurface } from "@/lib/floating-surface"
import { wrapInlineLabelTextNodes } from "@/lib/wrap-inline-label-text"
import { EnhancedBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

const ENHANCED_COMBOBOX_STYLE_ID = "nqui-combobox-styles-v1"

function useComboboxFieldSurfaceStyles() {
  React.useEffect(() => {
    if (document.getElementById(ENHANCED_COMBOBOX_STYLE_ID)) return

    const style = document.createElement("style")
    style.id = ENHANCED_COMBOBOX_STYLE_ID
    style.textContent = `
      [data-slot="input-group"]:has([data-slot="input-group-control"].enhanced-combobox-input) {
        border: 1px solid color-mix(in oklch, var(--input) 50%, transparent) !important;
        box-shadow:
          0 1px 0 0 color-mix(in oklch, var(--input) 40%, transparent),
          0 1px 2px 0 oklch(0.15 0 0 / 0.05),
          0 2px 4px -1px oklch(0.15 0 0 / 0.03) !important;
        border-top-color: color-mix(in oklch, var(--input) 92%, oklch(1 0 0) 8%) !important;
        border-left-color: color-mix(in oklch, var(--input) 92%, oklch(1 0 0) 8%) !important;
        border-bottom-color: color-mix(in oklch, var(--input) 92%, oklch(0 0 0) 8%) !important;
        border-right-color: color-mix(in oklch, var(--input) 92%, oklch(0 0 0) 8%) !important;
        transition: all 150ms ease-in-out !important;
        outline: none !important;
        --tw-ring-width: 0 !important;
        --tw-ring-offset-width: 0 !important;
        --tw-ring-offset-color: transparent !important;
        --tw-ring-color: transparent !important;
      }

      .dark [data-slot="input-group"]:has([data-slot="input-group-control"].enhanced-combobox-input) {
        border: 1px solid color-mix(in oklch, var(--input) 50%, transparent) !important;
        box-shadow:
          0 1px 0 0 color-mix(in oklch, var(--input) 40%, transparent),
          0 1px 2px 0 oklch(0 0 0 / 0.3),
          0 2px 4px -1px oklch(0 0 0 / 0.2) !important;
      }

      [data-slot="input-group"]:has([data-slot="input-group-control"].enhanced-combobox-input):hover {
        box-shadow:
          0 1px 0 0 color-mix(in oklch, var(--input) 40%, transparent),
          0 1px 3px 0 oklch(0.15 0 0 / 0.08),
          0 2px 6px -1px oklch(0.15 0 0 / 0.04),
          0 4px 8px -2px oklch(0.15 0 0 / 0.02) !important;
      }

      .dark [data-slot="input-group"]:has([data-slot="input-group-control"].enhanced-combobox-input):hover {
        box-shadow:
          0 1px 0 0 color-mix(in oklch, var(--input) 40%, transparent),
          0 1px 3px 0 oklch(0 0 0 / 0.4),
          0 2px 6px -1px oklch(0 0 0 / 0.3),
          0 4px 8px -2px oklch(0 0 0 / 0.2) !important;
      }

      [data-slot="input-group"]:has([data-slot="input-group-control"].enhanced-combobox-input:focus-visible),
      [data-slot="input-group"]:has([data-slot="input-group-control"].enhanced-combobox-input:focus-within) {
        outline: none !important;
        --tw-ring-width: 0 !important;
        --tw-ring-offset-width: 0 !important;
        --tw-ring-offset-color: transparent !important;
        --tw-ring-color: transparent !important;
        box-shadow:
          0 1px 0 0 color-mix(in oklch, var(--input) 40%, transparent),
          0 1px 2px 0 oklch(0.15 0 0 / 0.05),
          0 2px 4px -1px oklch(0.15 0 0 / 0.03),
          0 0 0 2px color-mix(in oklch, var(--ring) 30%, transparent) !important;
      }

      .dark [data-slot="input-group"]:has([data-slot="input-group-control"].enhanced-combobox-input:focus-visible),
      .dark [data-slot="input-group"]:has([data-slot="input-group-control"].enhanced-combobox-input:focus-within) {
        box-shadow:
          0 1px 0 0 color-mix(in oklch, var(--input) 40%, transparent),
          0 1px 2px 0 oklch(0 0 0 / 0.3),
          0 2px 4px -1px oklch(0 0 0 / 0.2),
          0 0 0 2px color-mix(in oklch, var(--ring) 30%, transparent) !important;
      }

      [data-slot="input-group-control"].enhanced-combobox-input {
        outline: none !important;
        --tw-ring-width: 0 !important;
        --tw-ring-offset-width: 0 !important;
      }

      [data-slot="input-group-control"].enhanced-combobox-input:focus,
      [data-slot="input-group-control"].enhanced-combobox-input:focus-visible {
        outline: none !important;
        --tw-ring-width: 0 !important;
        --tw-ring-offset-width: 0 !important;
        box-shadow: none !important;
      }
    `

    document.head.appendChild(style)
  }, [])
}

type ComboboxContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
  value: string | string[] | undefined
  setValue: (v: string | string[]) => void
  search: string
  setSearch: (s: string) => void
  items: readonly unknown[] | undefined
  multiple: boolean
  disabled: boolean
  registerLabel: (value: string, label: string) => void
  getLabel: (value: string) => string | undefined
  selectedLabel: string
  shouldFilter: boolean
  searchPlaceholder: string
  onItemSelect: (itemValue: string, label: string) => void
  isSelected: (itemValue: string) => boolean
  filterItems: (item: unknown) => boolean
  /** cmdk overwrites `Command.List` `id` with its internal id — we mirror the real DOM id here for aria-controls. */
  listboxIdAria: string | undefined
  setListboxIdAria: (id: string | undefined) => void
}

type ComboboxProps = Omit<React.ComponentProps<typeof PopoverPrimitive.Root>, "children"> & {
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  items?: readonly unknown[]
  multiple?: boolean
  disabled?: boolean
  /** Placeholder for the filter field inside the dropdown (shadcn-style). */
  searchPlaceholder?: string
  children?: React.ReactNode
  /**
   * When true, logs combobox state in dev only (`console.debug` when `import.meta.env.DEV`).
   * No effect in production builds.
   */
  debug?: boolean
}

function getTextFromNode(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getTextFromNode).filter(Boolean).join(" ")
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    if (props.children != null) return getTextFromNode(props.children)
  }
  return ""
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

function useComboboxContext() {
  const ctx = React.useContext(ComboboxContext)
  if (!ctx) {
    throw new Error("Combobox components must be used within Combobox")
  }
  return ctx
}

function Combobox({
  value: valueProp,
  defaultValue,
  onValueChange,
  items,
  multiple = false,
  disabled = false,
  searchPlaceholder = "Search...",
  open: openProp,
  defaultOpen,
  onOpenChange,
  modal = false,
  debug = false,
  children,
  ...popoverProps
}: ComboboxProps) {
  const [listboxIdAria, setListboxIdAria] = React.useState<string | undefined>(undefined)

  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[] | undefined>(
    defaultValue ?? (multiple ? [] : undefined)
  )
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolledValue

  const setValue = React.useCallback(
    (next: string | string[]) => {
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const isOpenControlled = openProp !== undefined
  const open = isOpenControlled ? openProp : uncontrolledOpen
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(v)
      onOpenChange?.(v)
    },
    [isOpenControlled, onOpenChange]
  )

  const [search, setSearch] = React.useState("")

  const [labelByValue, setLabelByValue] = React.useState<Record<string, string>>({})
  const registerLabel = React.useCallback((itemValue: string, label: string) => {
    setLabelByValue((prev) => (prev[itemValue] === label ? prev : { ...prev, [itemValue]: label }))
  }, [])

  const getLabel = React.useCallback(
    (itemValue: string) => labelByValue[itemValue],
    [labelByValue]
  )

  const selectedLabel = React.useMemo(() => {
    if (multiple) return ""
    if (typeof value !== "string" || !value) return ""
    return labelByValue[value] ?? value
  }, [multiple, value, labelByValue])

  /** cmdk can invoke onSelect twice in one tick (e.g. multi); toggling twice looks like a no-op. */
  const selectGuardRef = React.useRef(false)

  const onItemSelect = React.useCallback(
    (itemValue: string, label: string) => {
      if (selectGuardRef.current) return
      selectGuardRef.current = true
      try {
        registerLabel(itemValue, label)
        if (multiple) {
          const current = Array.isArray(value) ? [...value] : []
          const i = current.indexOf(itemValue)
          if (i >= 0) current.splice(i, 1)
          else current.push(itemValue)
          setValue(current)
          return
        }
        setValue(itemValue)
        setOpen(false)
      } finally {
        queueMicrotask(() => {
          selectGuardRef.current = false
        })
      }
    },
    [multiple, value, setValue, setOpen, registerLabel]
  )

  const isSelected = React.useCallback(
    (itemValue: string) => {
      if (multiple) {
        return Array.isArray(value) && value.includes(itemValue)
      }
      return value === itemValue
    },
    [multiple, value]
  )

  const filterItems = React.useCallback(
    (item: unknown) => {
      if (items == null) return true
      const q = search.trim().toLowerCase()
      if (!q) return true
      const s = String(item).toLowerCase()
      return s.includes(q)
    },
    [items, search]
  )

  const shouldFilter = items == null

  const ctx: ComboboxContextValue = {
    open,
    setOpen,
    value,
    setValue,
    search,
    setSearch,
    items,
    multiple,
    disabled: !!disabled,
    registerLabel,
    getLabel,
    selectedLabel,
    shouldFilter,
    searchPlaceholder,
    onItemSelect,
    isSelected,
    filterItems,
    listboxIdAria,
    setListboxIdAria,
  }

  React.useEffect(() => {
    if (!import.meta.env.DEV || !debug) return
    console.debug("[nqui Combobox]", { open, value, search, listboxIdAria })
  }, [debug, open, value, search, listboxIdAria])

  return (
    <ComboboxContext.Provider value={ctx}>
      <PopoverPrimitive.Root
        data-slot="combobox"
        open={open}
        onOpenChange={(next) => {
          if (disabled) return
          setOpen(next)
          if (!next) setSearch("")
        }}
        modal={modal}
        {...popoverProps}
      >
        {children}
      </PopoverPrimitive.Root>
    </ComboboxContext.Provider>
  )
}

/**
 * Wraps any custom control row (e.g. `ComboboxValue` + `ComboboxTrigger`) so `ComboboxContent` receives a
 * Radix popover anchor — same role as the inner wrapper of `ComboboxInput` / `ComboboxBadgeTrigger`.
 * Without this, `setOpen(true)` runs but the panel has no `--radix-popover-trigger-width` / position reference.
 *
 * Also forwards clicks on the anchor surface to `setOpen(true)` (bubble), so `flex gap-*` dead zones
 * between children still open the list — unlike `ComboboxBadgeTrigger`, custom rows often split value + button.
 */
const ComboboxAnchor = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Anchor>,
  React.ComponentProps<typeof PopoverPrimitive.Anchor>
>(function ComboboxAnchor({ className, onClick, ...props }, ref) {
  const { setOpen, disabled } = useComboboxContext()
  return (
    <PopoverPrimitive.Anchor
      ref={ref}
      data-slot="combobox-anchor"
      className={cn("w-full min-w-0", !disabled && "cursor-pointer", className)}
      onClick={(e) => {
        onClick?.(e)
        if (disabled) return
        setOpen(true)
      }}
      {...props}
    />
  )
})
ComboboxAnchor.displayName = "ComboboxAnchor"

type ComboboxValueProps = React.ComponentProps<"span"> & {
  /** Shown when the combobox has no value (same role as `SelectValue` placeholder). */
  placeholder?: string
}

function ComboboxValue({ className, placeholder, onClick, ...props }: ComboboxValueProps) {
  const { value, getLabel, setOpen, disabled } = useComboboxContext()
  const v = Array.isArray(value) ? value[0] : value
  const raw = v != null ? getLabel(v) ?? v : ""
  const text = typeof raw === "string" ? raw : String(raw)
  const showPlaceholder = Boolean(placeholder && text.length === 0)
  return (
    <span
      data-slot="combobox-value"
      data-placeholder={showPlaceholder ? "true" : undefined}
      className={cn(
        showPlaceholder ? "text-muted-foreground" : "text-foreground",
        !disabled && "cursor-pointer",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        if (disabled) return
        setOpen(true)
      }}
      {...props}
    >
      {showPlaceholder ? placeholder : text}
    </span>
  )
}

type ComboboxTriggerProps = React.ComponentProps<"button"> & {
  /**
   * When true in single-select mode, the trigger shows the resolved item label (or `fallbackLabel` when empty).
   * Prefer putting the label in `ComboboxValue` only; use this for compact layouts that hide the value.
   */
  showSelectedLabel?: boolean
  /** Label when `showSelectedLabel` and nothing is selected yet. */
  fallbackLabel?: string
  /**
   * Icon chevron beside `ComboboxInput` — the input carries `role="combobox"` and `aria-expanded`.
   * This control is decorative for assistive tech to avoid duplicate announcements.
   */
  variant?: "default" | "icon-addon"
}

function ComboboxTrigger({
  className,
  children,
  onClick,
  showSelectedLabel = false,
  fallbackLabel = "Pick",
  variant = "default",
  "aria-label": ariaLabelProp,
  ...props
}: ComboboxTriggerProps) {
  const { setOpen, disabled, multiple, selectedLabel, open, listboxIdAria } = useComboboxContext()
  const triggerLabel =
    showSelectedLabel && !multiple ? (selectedLabel ? selectedLabel : fallbackLabel) : null
  const isIconAddon = variant === "icon-addon"

  const hasVisibleTriggerText =
    triggerLabel != null ||
    (children != null &&
      children !== false &&
      (typeof children === "string"
        ? children.trim().length > 0
        : React.Children.count(children as React.ReactNode) > 0))

  const primaryAriaLabel =
    ariaLabelProp ??
    (!isIconAddon && !hasVisibleTriggerText && !showSelectedLabel && !multiple
      ? selectedLabel
        ? `${selectedLabel}, open to change`
        : "Open to choose"
      : undefined)

  return (
    <button
      type="button"
      data-slot="combobox-trigger"
      data-variant={variant}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 text-center [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      disabled={disabled}
      aria-hidden={isIconAddon ? true : undefined}
      tabIndex={isIconAddon ? -1 : undefined}
      aria-expanded={isIconAddon ? undefined : open}
      aria-controls={isIconAddon ? undefined : open ? listboxIdAria : undefined}
      aria-haspopup={isIconAddon ? undefined : "listbox"}
      aria-label={primaryAriaLabel}
      onClick={(e) => {
        onClick?.(e)
        e.preventDefault()
        setOpen(true)
      }}
      {...props}
    >
      {triggerLabel != null
        ? wrapInlineLabelTextNodes(
            <span className="min-w-0 max-w-[12rem] truncate">{triggerLabel}</span>
          )
        : wrapInlineLabelTextNodes(children)}
      <IconChevronDown strokeWidth={2} className="text-muted-foreground size-3.5 pointer-events-none" />
    </button>
  )
}

function ComboboxClear({
  className,
  disabled: disabledProp,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  const { setValue, setSearch, multiple, disabled } = useComboboxContext()
  const isDisabled = disabled || disabledProp
  return (
    <InputGroupButton
      variant="ghost"
      size="icon-xs"
      data-slot="combobox-clear"
      disabled={isDisabled}
      className={cn(className)}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setSearch("")
        setValue(multiple ? [] : "")
      }}
      {...props}
    >
      <IconX strokeWidth={2} className="pointer-events-none" />
    </InputGroupButton>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  placeholder,
  onChange,
  onFocus,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "value" | "readOnly"> & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  const ctx = useComboboxContext()
  const { setOpen, selectedLabel, disabled: ctxDisabled, open, search, setSearch, multiple, listboxIdAria } =
    ctx
  const isDisabled = ctxDisabled || disabled

  const displayValue = multiple ? (open ? search : "") : open ? search : selectedLabel

  useComboboxFieldSurfaceStyles()

  return (
    <PopoverPrimitive.Anchor asChild>
      <div className={cn("w-full min-w-0", className)}>
        <InputGroup className="w-auto">
          <InputGroupInput
            data-slot="input-group-control"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={open ? listboxIdAria : undefined}
            disabled={isDisabled}
            value={displayValue}
            placeholder={placeholder}
            className="enhanced-combobox-input"
            onClick={() => setOpen(true)}
            onChange={(e) => {
              setSearch(e.target.value)
              setOpen(true)
              onChange?.(e)
            }}
            onFocus={(e) => {
              setOpen(true)
              onFocus?.(e)
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && open) {
                e.preventDefault()
                const panelInput = document.querySelector(
                  "[data-slot=combobox-content] [data-slot=command-input]"
                ) as HTMLInputElement | null
                panelInput?.focus()
              }
              onKeyDown?.(e)
            }}
            {...props}
          />
          <InputGroupAddon align="inline-end">
            {showTrigger && (
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                asChild
                data-slot="input-group-button"
                className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
                disabled={isDisabled}
              >
                <ComboboxTrigger variant="icon-addon" />
              </InputGroupButton>
            )}
            {showClear && <ComboboxClear disabled={isDisabled} />}
          </InputGroupAddon>
          {children}
        </InputGroup>
      </div>
    </PopoverPrimitive.Anchor>
  )
}

export type ComboboxContentProps = React.ComponentProps<typeof PopoverPrimitive.Content> & {
  /** When true, the cmdk search field is visible in the panel (typical for multi-select badge trigger). */
  showPanelSearch?: boolean
}

/**
 * Panel content mirrors `CommandPalette`’s inner tree: `Command` → `CommandInput` → list (`children`).
 * We use Popover + Anchor instead of CommandDialog so the field stays inline. The cmdk search input must
 * remain mounted and not `display:none` (see `sr-only` branch) so cmdk’s internal state matches palette behavior.
 */
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  onOpenAutoFocus,
  showPanelSearch = false,
  children,
  onPointerDownCapture: userPointerDownCapture,
  ...props
}: ComboboxContentProps) {
  const { shouldFilter, search, setSearch, setOpen, disabled, searchPlaceholder } = useComboboxContext()

  const searchInput = (
    <CommandInput
      value={search}
      onValueChange={(v) => {
        setSearch(v)
        setOpen(true)
      }}
      placeholder={searchPlaceholder}
      disabled={disabled}
      tabIndex={showPanelSearch ? 0 : -1}
      className="pointer-events-auto"
    />
  )

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="combobox-content"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          floatingSurface,
          "!pointer-events-auto data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-[min(24rem,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] max-w-[min(100vw,var(--radix-popover-content-available-width))] min-w-[var(--radix-popover-trigger-width)] origin-[var(--radix-popover-content-transform-origin)] p-0 z-[var(--z-popover)] outline-hidden overflow-hidden",
          className
        )}
        onOpenAutoFocus={(e) => {
          if (!showPanelSearch) e.preventDefault()
          onOpenAutoFocus?.(e)
        }}
        onPointerDownCapture={userPointerDownCapture}
        {...props}
      >
        <Command
          className="group/cmdk relative flex !h-auto min-h-0 w-full max-w-full flex-col overflow-hidden rounded-none! border-0 bg-transparent p-1 shadow-none max-h-[min(24rem,var(--radix-popover-content-available-height,24rem))]"
          shouldFilter={shouldFilter}
          disablePointerSelection={false}
          loop
        >
          {showPanelSearch ? (
            searchInput
          ) : (
            <div className="sr-only pointer-events-none">
              {searchInput}
            </div>
          )}
          {children}
        </Command>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function ComboboxBadgeTrigger({
  className,
  placeholder = "Select…",
  maxShownItems = 2,
  id: idProp,
  ...props
}: React.ComponentProps<"div"> & {
  placeholder?: string
  maxShownItems?: number
}) {
  const { value, setOpen, open, disabled, getLabel, setValue, listboxIdAria } = useComboboxContext()
  const [expanded, setExpanded] = React.useState(false)
  const generatedId = React.useId()
  const id = idProp ?? generatedId

  useComboboxFieldSurfaceStyles()

  const selected = Array.isArray(value) ? value : []
  const visible = expanded ? selected : selected.slice(0, maxShownItems)
  const hiddenCount = selected.length - visible.length

  const removeOne = React.useCallback(
    (v: string) => {
      setValue(selected.filter((x) => x !== v))
    },
    [selected, setValue]
  )

  return (
    <PopoverPrimitive.Anchor asChild>
      <div className={cn("w-full min-w-0", className)} {...props}>
        <InputGroup
          className={cn(
            "h-auto min-h-8 w-auto items-start gap-0 py-0.5",
            disabled && "pointer-events-none opacity-50"
          )}
          data-disabled={disabled ? "" : undefined}
        >
          <div
            id={id}
            data-slot="input-group-control"
            role="combobox"
            tabIndex={disabled ? -1 : 0}
            aria-expanded={open}
            aria-controls={open ? listboxIdAria : undefined}
            aria-disabled={disabled}
            className={cn(
              "enhanced-combobox-input text-foreground flex min-h-7 min-w-0 flex-1 cursor-pointer flex-wrap items-center gap-1 border-0 bg-transparent px-2.5 py-1 text-left text-sm shadow-none outline-none",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => !disabled && setOpen(!open)}
            onKeyDown={(e) => {
              if (disabled) return
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setOpen(!open)
              }
            }}
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {visible.map((val) => (
                  <EnhancedBadge
                    key={val}
                    variant="outline"
                    className="max-w-full !rounded-md py-0 pl-1.5 pr-0.5"
                  >
                    <span className="min-w-0 max-w-[10rem] truncate">{getLabel(val) ?? val}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${getLabel(val) ?? val}`}
                      className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-70 outline-none hover:bg-accent hover:text-accent-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeOne(val)
                      }}
                    >
                      <IconX strokeWidth={2} className="size-3 pointer-events-none" />
                    </button>
                  </EnhancedBadge>
                ))}
                {(hiddenCount > 0 || expanded) && (
                  <EnhancedBadge
                    variant="outline"
                    className="cursor-pointer !rounded-md"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded((x) => !x)
                    }}
                  >
                    {expanded ? "Show less" : `+${hiddenCount} more`}
                  </EnhancedBadge>
                )}
              </>
            )}
          </div>
          <InputGroupAddon align="inline-end" className="self-start pt-1">
            <IconChevronsUpDown
              strokeWidth={2}
              className="text-muted-foreground/80 size-4 shrink-0"
              aria-hidden
            />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </PopoverPrimitive.Anchor>
  )
}

/** React.Children.toArray / forEach drop function children — we need them for the items render prop. */
function splitComboboxListChildren(
  children: React.ReactNode | ((item: unknown) => React.ReactNode)
): {
  staticNodes: React.ReactNode[]
  renderFn: ((item: unknown) => React.ReactNode) | undefined
} {
  if (typeof children === "function") {
    return { staticNodes: [], renderFn: children as (item: unknown) => React.ReactNode }
  }

  const staticNodes: React.ReactNode[] = []
  let renderFn: ((item: unknown) => React.ReactNode) | undefined

  const visit = (node: React.ReactNode) => {
    if (node == null || node === true || node === false) return
    if (typeof node === "function") {
      renderFn = node as (item: unknown) => React.ReactNode
      return
    }
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    if (React.isValidElement(node) && node.type === React.Fragment) {
      const fch = (node.props as { children?: React.ReactNode }).children
      if (fch == null) return
      if (Array.isArray(fch)) fch.forEach(visit)
      else visit(fch)
      return
    }
    staticNodes.push(node)
  }

  visit(children)
  return { staticNodes, renderFn }
}

function ComboboxList({
  className,
  children,
  renderItem,
  ...props
}: Omit<React.ComponentProps<typeof CommandList>, "children"> & {
  children?: React.ReactNode
  /** Render each entry from the parent `Combobox` `items` array (typed alternative to a function child). */
  renderItem?: (item: unknown) => React.ReactNode
}) {
  const { items, filterItems, search: listSearch, open, setListboxIdAria } = useComboboxContext()

  const { staticNodes, renderFn } = splitComboboxListChildren(children)
  const itemRenderer = renderItem ?? renderFn

  const mappedItems = React.useMemo(() => {
    if (!itemRenderer || !items) return null
    const filtered = items.filter(filterItems)
    return filtered.map((item) => itemRenderer(item))
  }, [itemRenderer, items, filterItems, listSearch])

  const listRef = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    if (!open) {
      setListboxIdAria(undefined)
      return
    }
    requestAnimationFrame(() => {
      const el = listRef.current
      const domId = el?.id
      if (domId) setListboxIdAria(domId)
    })
  }, [open, setListboxIdAria, items, mappedItems, staticNodes])

  return (
    <CommandList
      ref={listRef}
      data-slot="combobox-list"
      className={cn(
        "pointer-events-auto relative z-[1] min-h-0 flex-1",
        "max-h-[min(18rem,max(0px,calc(var(--radix-popover-content-available-height,24rem)-5.5rem)))]",
        className
      )}
      {...props}
    >
      {staticNodes}
      {mappedItems}
    </CommandList>
  )
}

function ComboboxItem({
  className,
  children,
  value: itemValue,
  keywords: keywordsProp,
  onPointerDown: userPointerDown,
  onMouseDown: userMouseDown,
  onSelect: userOnSelect,
  ...props
}: Omit<React.ComponentProps<typeof CommandItem>, "value"> & {
  value: string
  /** Extra strings for cmdk filtering when children include icons or non-text UI. */
  keywords?: string[]
}) {
  const ctx = useComboboxContext()
  const label = React.useMemo(() => getTextFromNode(children), [children])

  React.useEffect(() => {
    ctx.registerLabel(itemValue, label || itemValue)
  }, [ctx, itemValue, label])

  const searchLabel = label || itemValue

  /** Mouse selection uses onMouseDown (reliable with Popover); keyboard uses cmdk onSelect. Skip duplicate if both fire. */
  const skipSelectFromPointerRef = React.useRef(false)

  return (
    <CommandItem
      data-slot="combobox-item"
      value={searchLabel}
      keywords={[itemValue, searchLabel, ...(keywordsProp ?? [])]}
      data-checked={ctx.isSelected(itemValue) ? true : undefined}
      onSelect={(cmdkValue) => {
        if (skipSelectFromPointerRef.current) return
        ctx.onItemSelect(itemValue, label || itemValue)
        userOnSelect?.(cmdkValue)
      }}
      onPointerDown={(e) => {
        userPointerDown?.(e)
      }}
      onMouseDown={(e) => {
        if (e.button !== 0) return
        e.preventDefault()
        skipSelectFromPointerRef.current = true
        ctx.onItemSelect(itemValue, label || itemValue)
        window.setTimeout(() => {
          skipSelectFromPointerRef.current = false
        }, 0)
        userMouseDown?.(e)
      }}
      className={cn(
        "transition-colors hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground min-h-8 my-0.5 mx-1 gap-2 rounded-md px-2.5 py-1.5 text-sm [&_svg:not([class*='size-'])]:size-3.5 relative flex w-auto cursor-pointer items-center outline-none select-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </CommandItem>
  )
}

function ComboboxGroup({ className, ...props }: React.ComponentProps<typeof CommandGroup>) {
  return (
    <CommandGroup data-slot="combobox-group" className={cn(className)} {...props} />
  )
}

function ComboboxLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-label"
      className={cn("cmdk-group-heading text-muted-foreground px-2 py-1.5 text-xs [&_svg]:hidden", className)}
      {...props}
    />
  )
}

function ComboboxCollection({ ...props }: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup data-slot="combobox-collection" {...props} />
}

function ComboboxEmpty({ className, ...props }: React.ComponentProps<typeof CommandEmpty>) {
  return (
    <CommandEmpty
      data-slot="combobox-empty"
      className={cn("text-muted-foreground py-6 text-center text-xs", className)}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandSeparator>) {
  return (
    <CommandSeparator data-slot="combobox-separator" className={cn(className)} {...props} />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-chips"
      className={cn(
        "bg-input/20 dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/30 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-7 flex-wrap items-center gap-1 rounded-md border bg-clip-padding px-2 py-0.5 text-xs transition-colors focus-within:ring-[2px] has-aria-invalid:ring-[2px] has-data-[slot=combobox-chip]:px-1",
        className
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  value: chipValue,
  ...props
}: React.ComponentProps<"div"> & { value: string; showRemove?: boolean }) {
  const { setValue, value, getLabel, multiple } = useComboboxContext()

  const remove = React.useCallback(() => {
    if (!multiple || !Array.isArray(value)) return
    setValue(value.filter((v) => v !== chipValue))
  }, [chipValue, multiple, setValue, value])

  return (
    <div
      data-slot="combobox-chip"
      className={cn(
        "bg-muted-foreground/10 text-foreground flex h-[calc(--spacing(4.75))] min-w-0 max-w-full w-fit items-center justify-center gap-1 overflow-hidden rounded-[calc(var(--radius-sm)-2px)] px-1.5 text-xs font-medium whitespace-nowrap has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {wrapInlineLabelTextNodes(children ?? getLabel(chipValue) ?? chipValue)}
      {showRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          onClick={(e) => {
            e.stopPropagation()
            remove()
          }}
        >
          <IconX strokeWidth={2} className="pointer-events-none" />
        </Button>
      )}
    </div>
  )
}

function ComboboxChipsInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof CommandInput>, "value" | "onValueChange">) {
  const { disabled, setSearch, setOpen, search } = useComboboxContext()
  return (
    <CommandInput
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 border-0 bg-transparent p-0 text-xs shadow-none outline-none", className)}
      disabled={disabled}
      value={search}
      onValueChange={(v) => {
        setSearch(v)
        setOpen(true)
      }}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxBadgeTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxAnchor,
  ComboboxClear,
  useComboboxAnchor,
}
