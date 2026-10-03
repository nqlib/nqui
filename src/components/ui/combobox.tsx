"use client"

import {
  IconChevronDown,
  IconChevronsUpDown,
  IconPlus,
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
import { defaultFilter } from "cmdk"
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

/** Flat field shell — same contract as SelectTrigger (no elevation). */
const comboboxFieldShellClassName = cn(
  "border-input bg-transparent shadow-none hover:bg-interactive dark:bg-input/30",
  "rounded-md border transition-colors",
  "focus-within:border-ring focus-within:ring-[2px] focus-within:ring-ring/30"
)

/**
 * Field chrome lives outside the portaled popover content. Radix treats the
 * opening click on Anchor as an outside interact and immediately closes —
 * ignore dismiss when the event target is still on the field.
 */
const COMBOBOX_FIELD_DISMISS_GUARD =
  "[data-slot=combobox-anchor], [data-slot=combobox-trigger], [data-slot=combobox-value], [data-slot=combobox-badge-trigger], [data-slot=combobox-badge-trigger-control], [data-slot=combobox-chips], [data-slot=combobox-chip], [data-slot=combobox-chip-input], [data-slot=combobox-clear], [data-slot=input-group-control], [data-slot=input-group-button]"

function isComboboxFieldTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(COMBOBOX_FIELD_DISMISS_GUARD))
}

/** Drop legacy injected elevation sheets from earlier Combobox iterations. */
function usePurgeLegacyComboboxFieldStyles() {
  React.useEffect(() => {
    document.getElementById("nqui-combobox-styles-v1")?.remove()
    document.getElementById("nqui-combobox-styles-v2")?.remove()
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
  /**
   * Values that were selected at the moment the panel opened.
   * Row order uses this set, not the live value, so a click cannot move a row while the panel stays open.
   */
  pinnedValues: ReadonlySet<string>
  pinSelected: boolean
  /**
   * Called with the trimmed search when the user creates a value that is not already an option.
   * Absent means the create row is not shown.
   */
  onCreate?: (value: string) => void
  /** True when `query` already matches an item value or registered label, ignoring case. */
  hasExactOption: (query: string) => boolean
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
  /**
   * On open, render the selected rows first and keep that order until the panel closes.
   * `false` leaves the list in the order the caller wrote.
   * @default true
   */
  pinSelected?: boolean
  /**
   * When the search text is not already an option, the panel shows a create row.
   * Add the value to `items` here; the combobox also selects it.
   */
  onCreate?: (value: string) => void
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

/** Prefer title slot for trigger/badge label when multi-line content is used. */
function getComboboxItemLabel(node: React.ReactNode): string {
  const kids = React.Children.toArray(node)
  for (const child of kids) {
    if (!React.isValidElement(child)) continue
    const slot = (child.props as { "data-slot"?: string })["data-slot"]
    // ComboboxItemContent uses command-item-content slot for CommandItem layout hooks.
    if (slot === "command-item-content") {
      const nested = React.Children.toArray(
        (child.props as { children?: React.ReactNode }).children
      )
      for (const n of nested) {
        if (!React.isValidElement(n)) continue
        const nSlot = (n.props as { "data-slot"?: string })["data-slot"]
        if (nSlot === "command-item-title") {
          return getTextFromNode((n.props as { children?: React.ReactNode }).children)
        }
      }
    }
  }
  return getTextFromNode(node)
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

/** Panel chrome. `true` when this content shows the selected-chip strip. */
const ComboboxPanelContext = React.createContext(false)

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
  pinSelected = true,
  onCreate,
  children,
  ...popoverProps
}: ComboboxProps) {
  usePurgeLegacyComboboxFieldStyles()
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

  // Snapshot selection when the panel opens. Later value changes must not reshuffle rows.
  const [wasOpen, setWasOpen] = React.useState(open)
  const [pinnedValues, setPinnedValues] = React.useState<ReadonlySet<string>>(() =>
    open && pinSelected ? selectedValueSet(value) : EMPTY_SELECTED
  )
  if (open !== wasOpen) {
    setWasOpen(open)
    setPinnedValues(open && pinSelected ? selectedValueSet(value) : EMPTY_SELECTED)
  }

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

  const hasExactOption = React.useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      if (items?.some((item) => String(item).trim().toLowerCase() === q)) return true
      for (const [itemValue, label] of Object.entries(labelByValue)) {
        if (itemValue.trim().toLowerCase() === q || label.trim().toLowerCase() === q) return true
      }
      return selectedValueList(value).some((itemValue) => itemValue.trim().toLowerCase() === q)
    },
    [items, labelByValue, value]
  )

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
    pinnedValues,
    pinSelected,
    onCreate,
    hasExactOption,
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

  return (
    <PopoverPrimitive.Anchor asChild>
      <div data-slot="combobox-anchor" className={cn("w-full min-w-0", className)}>
        <InputGroup
          className={cn(
            "w-auto !bg-transparent !shadow-none hover:!bg-interactive dark:!bg-input/30",
            comboboxFieldShellClassName
          )}
          style={{ boxShadow: "none" }}
        >
          <InputGroupInput
            data-slot="input-group-control"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={open ? listboxIdAria : undefined}
            disabled={isDisabled}
            value={displayValue}
            placeholder={placeholder}
            className="shadow-none"
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
  /**
   * Show the current selection as removable chips above the search.
   * The list stays in the order the caller wrote. `pinSelected` still applies when this is off.
   * @default false
   */
  showSelected?: boolean
  /**
   * Render the panel in place (no Popover portal). Use inside a menu submenu whose
   * content already positions the flyout — a second popover would steal focus.
   * @default false
   */
  inline?: boolean
}

/**
 * Panel content mirrors `CommandPalette`’s inner tree: `Command` → `CommandInput` → list (`children`).
 * Default: Popover + Anchor. With `inline`, the same Command tree mounts in place (menu submenus).
 * The cmdk search input must remain mounted and not `display:none` (see `sr-only` branch).
 */
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  onOpenAutoFocus,
  onInteractOutside,
  onPointerDownOutside,
  onFocusOutside,
  showPanelSearch = false,
  showSelected = false,
  inline = false,
  children,
  onPointerDownCapture: userPointerDownCapture,
  ...props
}: ComboboxContentProps) {
  const { shouldFilter, search, setSearch, setOpen, disabled, searchPlaceholder, pinSelected } =
    useComboboxContext()
  const preserveListOrder = pinSelected || showSelected

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
      onKeyDown={
        inline
          ? (e) => {
              // Keep menu typeahead from eating characters typed in the panel search.
              e.stopPropagation()
            }
          : undefined
      }
    />
  )

  const panel = (
    <ComboboxPanelContext.Provider value={showSelected}>
      <Command
        className={cn(
          "group/cmdk relative flex !h-auto min-h-0 w-full max-w-full flex-col overflow-hidden rounded-none! border-0 bg-transparent p-1 shadow-none",
          inline
            ? "max-h-[min(24rem,70vh)]"
            : "max-h-[min(24rem,var(--radix-popover-content-available-height,24rem))]"
        )}
        shouldFilter={shouldFilter}
        filter={preserveListOrder ? comboboxOrderPreservingFilter : undefined}
        disablePointerSelection={false}
        loop
      >
        {showSelected ? <ComboboxSelectedSummary /> : null}
        {showPanelSearch ? (
          searchInput
        ) : (
          <div className="sr-only pointer-events-none">{searchInput}</div>
        )}
        <ComboboxCreateOption />
        {children}
      </Command>
    </ComboboxPanelContext.Provider>
  )

  if (inline) {
    return (
      <div
        data-slot="combobox-content"
        data-inline=""
        className={cn("w-full min-w-0 overflow-hidden p-0 outline-hidden", className)}
      >
        {panel}
      </div>
    )
  }

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
        onInteractOutside={(e) => {
          if (isComboboxFieldTarget(e.target)) e.preventDefault()
          onInteractOutside?.(e)
        }}
        onPointerDownOutside={(e) => {
          if (isComboboxFieldTarget(e.target)) e.preventDefault()
          onPointerDownOutside?.(e)
        }}
        onFocusOutside={(e) => {
          if (isComboboxFieldTarget(e.target)) e.preventDefault()
          onFocusOutside?.(e)
        }}
        onPointerDownCapture={userPointerDownCapture}
        {...props}
      >
        {panel}
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
      <div data-slot="combobox-anchor" className={cn("w-full min-w-0", className)} {...props}>
        {/* Flat SelectTrigger-like shell — avoid InputGroup's filled field chrome. */}
        <div
          data-slot="combobox-badge-trigger"
          data-disabled={disabled ? "" : undefined}
          className={cn(
            "flex h-auto min-h-8 w-auto items-start gap-1.5 px-2 py-0.5",
            comboboxFieldShellClassName,
            disabled && "pointer-events-none opacity-50"
          )}
          style={{ boxShadow: "none" }}
        >
          <div
            id={id}
            data-slot="combobox-badge-trigger-control"
            role="combobox"
            tabIndex={disabled ? -1 : 0}
            aria-expanded={open}
            aria-controls={open ? listboxIdAria : undefined}
            aria-disabled={disabled}
            className={cn(
              "text-foreground flex min-h-7 min-w-0 flex-1 cursor-pointer flex-wrap items-center gap-1 border-0 bg-transparent py-1 text-left text-sm shadow-none outline-none",
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
                    className="max-w-full !rounded-md py-0 pl-1.5 pr-0.5 !shadow-none"
                  >
                    <span className="min-w-0 max-w-[10rem] truncate">{getLabel(val) ?? val}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${getLabel(val) ?? val}`}
                      className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-70 outline-none hover:bg-interactive hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
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
                    className="cursor-pointer !rounded-md !shadow-none"
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
          <IconChevronsUpDown
            strokeWidth={2}
            className="text-muted-foreground size-3.5 mt-1.5 shrink-0 pointer-events-none"
            aria-hidden
          />
        </div>
      </div>
    </PopoverPrimitive.Anchor>
  )
}

const EMPTY_SELECTED: ReadonlySet<string> = new Set()

function selectedValueList(value: string | string[] | undefined): string[] {
  if (typeof value === "string") return value.length > 0 ? [value] : []
  if (Array.isArray(value)) return value.filter((entry) => entry.length > 0)
  return []
}

/** Shown only when `onCreate` is set and the trimmed search is not already an option. */
function ComboboxCreateOption() {
  const { search, onCreate, hasExactOption, registerLabel, onItemSelect, setSearch, disabled } =
    useComboboxContext()
  const query = search.trim()
  if (!onCreate || disabled || !query || hasExactOption(query)) return null

  const create = () => {
    onCreate(query)
    registerLabel(query, query)
    onItemSelect(query, query)
    setSearch("")
  }

  return (
    <button
      type="button"
      data-slot="combobox-create"
      className="mx-1 mt-0.5 flex min-h-8 w-auto cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground outline-none hover:bg-interactive focus-visible:bg-interactive"
      onMouseDown={(e) => {
        e.preventDefault()
      }}
      onClick={create}
    >
      <IconPlus strokeWidth={2} className="size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 truncate">Create “{query}”</span>
    </button>
  )
}

/**
 * Removable chips for the current selection, above the panel search.
 * Empty selection renders nothing so the list is the whole panel.
 */
function ComboboxSelectedSummary() {
  const { value, getLabel, setValue, multiple } = useComboboxContext()
  const selected = selectedValueList(value)
  if (selected.length === 0) return null

  const remove = (itemValue: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : []
      setValue(current.filter((entry) => entry !== itemValue))
      return
    }
    setValue("")
  }

  return (
    <div
      data-slot="combobox-selected-summary"
      className="flex flex-wrap items-center gap-1 border-b border-border px-1.5 pt-1 pb-1.5"
    >
      {selected.map((itemValue) => {
        const label = getLabel(itemValue) ?? itemValue
        return (
          <EnhancedBadge
            key={itemValue}
            variant="outline"
            className="max-w-full !rounded-md py-0 pl-1.5 pr-0.5 !shadow-none"
          >
            <span className="min-w-0 max-w-[10rem] truncate">{label}</span>
            <button
              type="button"
              aria-label={`Remove ${label}`}
              className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-70 outline-none hover:bg-interactive hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
                remove(itemValue)
              }}
            >
              <IconX strokeWidth={2} className="size-3 pointer-events-none" />
            </button>
          </EnhancedBadge>
        )
      })}
    </div>
  )
}

function selectedValueSet(value: string | string[] | undefined): ReadonlySet<string> {
  if (typeof value === "string") {
    return value.length > 0 ? new Set([value]) : EMPTY_SELECTED
  }
  if (Array.isArray(value)) {
    const next = value.filter((entry) => entry.length > 0)
    return next.length > 0 ? new Set(next) : EMPTY_SELECTED
  }
  return EMPTY_SELECTED
}

/**
 * cmdk reorders matches by score. A flat score of 1 keeps React order (stable sort)
 * so a selected match stays above the other matches, and a score of 0 still hides a miss.
 */
function comboboxOrderPreservingFilter(value: string, search: string, keywords?: string[]): number {
  return defaultFilter(value, search, keywords) > 0 ? 1 : 0
}

function isComboboxItemElement(
  node: React.ReactNode
): node is React.ReactElement<{ value: string; pinned?: "start" }> {
  return React.isValidElement(node) && node.type === ComboboxItem
}

function isComboboxGroupElement(
  node: React.ReactNode
): node is React.ReactElement<{ children?: React.ReactNode }> {
  return (
    React.isValidElement(node) &&
    (node.type === ComboboxGroup || node.type === ComboboxCollection)
  )
}

/** Unwrap arrays and fragments without rewriting element identity or keys. */
function flattenComboboxNodes(children: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const visit = (node: React.ReactNode) => {
    if (node == null || typeof node === "boolean") return
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    if (React.isValidElement(node) && node.type === React.Fragment) {
      visit((node.props as { children?: React.ReactNode }).children)
      return
    }
    out.push(node)
  }
  visit(children)
  return out
}

/**
 * Selected rows first, `pinned="start"` above those, everyone else after.
 * Each bucket keeps the source relative order. No selected row in this run → leave it alone.
 */
function partitionComboboxItems(
  items: React.ReactElement<{ value: string; pinned?: "start" }>[],
  selected: ReadonlySet<string>
): React.ReactElement[] {
  const start: React.ReactElement[] = []
  const picked: React.ReactElement[] = []
  const rest: React.ReactElement[] = []
  let hasSelected = false
  for (const item of items) {
    if (item.props.pinned === "start") {
      start.push(item)
      continue
    }
    if (selected.has(item.props.value)) {
      picked.push(item)
      hasSelected = true
      continue
    }
    rest.push(item)
  }
  if (!hasSelected) return items
  return [...start, ...picked, ...rest]
}

/**
 * Pin selected ComboboxItem rows inside their own sibling run.
 * ComboboxEmpty, ComboboxSeparator, and other non-items stay put, so a separator
 * keeps the same neighboring runs. Groups (and collections) pin inside themselves.
 */
function reorderComboboxNodes(
  nodes: readonly React.ReactNode[],
  selected: ReadonlySet<string>
): React.ReactNode[] {
  if (selected.size === 0) return [...nodes]
  const prepared = nodes.map((node, index) => reorderComboboxGroup(node, selected, index))
  const result: React.ReactNode[] = []
  let run: React.ReactElement<{ value: string; pinned?: "start" }>[] = []
  const flush = () => {
    if (run.length === 0) return
    result.push(...partitionComboboxItems(run, selected))
    run = []
  }
  for (const node of prepared) {
    if (isComboboxItemElement(node)) run.push(node)
    else {
      flush()
      result.push(node)
    }
  }
  flush()
  return result
}

function reorderComboboxGroup(
  node: React.ReactNode,
  selected: ReadonlySet<string>,
  index = 0
): React.ReactNode {
  if (!isComboboxGroupElement(node)) return node
  const prevChildren = flattenComboboxNodes(node.props.children)
  const nextChildren = reorderComboboxNodes(prevChildren, selected)
  if (
    nextChildren.length === prevChildren.length &&
    nextChildren.every((child, index) => child === prevChildren[index])
  ) {
    return node
  }
  // A cloned group is a new element. Give it a real key so the list div does not
  // warn. Index is stable: groups stay in place and only their rows move.
  const keyed = nextChildren.map((child, childIndex) => explicitChildKey(child, childIndex))
  const groupKey = node.key ?? `combobox-group-${index}`
  if (keyed.length === 0) return React.cloneElement(node, { key: groupKey, children: null })
  return React.cloneElement(node, { key: groupKey }, ...keyed)
}

function explicitChildKey(node: React.ReactNode, index: number): React.ReactNode {
  if (!React.isValidElement(node) || node.key != null) return node
  const key = isComboboxItemElement(node) ? `item-${node.props.value}` : `node-${index}`
  return React.cloneElement(node, { key })
}

type RenderedComboboxEntry = { item: unknown; node: React.ReactNode }

function reorderRenderedComboboxEntries(
  entries: readonly RenderedComboboxEntry[],
  selected: ReadonlySet<string>
): RenderedComboboxEntry[] {
  const prepared = entries.map((entry) => ({
    item: entry.item,
    node: reorderComboboxGroup(entry.node, selected),
  }))
  if (selected.size === 0) return prepared

  const result: RenderedComboboxEntry[] = []
  let run: RenderedComboboxEntry[] = []
  const flush = () => {
    if (run.length === 0) return
    const items = run.map((entry) => entry.node)
    if (!items.every(isComboboxItemElement)) {
      result.push(...run)
      run = []
      return
    }
    const ordered = partitionComboboxItems(items, selected)
    const byNode = new Map(run.map((entry) => [entry.node, entry]))
    for (const node of ordered) {
      const entry = byNode.get(node)
      if (entry) result.push(entry)
    }
    run = []
  }
  for (const entry of prepared) {
    if (isComboboxItemElement(entry.node)) run.push(entry)
    else {
      flush()
      result.push(entry)
    }
  }
  flush()
  return result
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

interface ComboboxListProps
  extends Omit<React.ComponentProps<typeof CommandList>, "children"> {
  children?: React.ReactNode | ((item: unknown) => React.ReactNode)
  /** Render each entry from the parent `Combobox` `items` array (typed alternative to a function child). */
  renderItem?: (item: unknown) => React.ReactNode
}

function ComboboxList({
  className,
  children,
  renderItem,
  style,
  ...props
}: ComboboxListProps) {
  const { items, filterItems, search: listSearch, open, setListboxIdAria, pinSelected, pinnedValues } =
    useComboboxContext()
  const showSelected = React.useContext(ComboboxPanelContext)
  const pinRows = pinSelected && !showSelected

  const { staticNodes, renderFn } = splitComboboxListChildren(children)
  const itemRenderer = renderItem ?? renderFn
  const orderedStaticNodes = pinRows
    ? reorderComboboxNodes(staticNodes, pinnedValues)
    : staticNodes

  const mappedItems = React.useMemo(() => {
    if (!itemRenderer || !items) return null
    const rendered = items.map((item) => ({ item, node: itemRenderer(item) }))
    const ordered = pinRows ? reorderRenderedComboboxEntries(rendered, pinnedValues) : rendered
    return ordered.filter((entry) => filterItems(entry.item)).map((entry) => entry.node)
  }, [itemRenderer, items, filterItems, listSearch, pinRows, pinnedValues])

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
      style={
        {
          // Viewport scroll cap (CommandList reads --command-list-max-height).
          ["--command-list-max-height" as string]:
            "min(18rem, max(0px, calc(var(--radix-popover-content-available-height, 24rem) - 5.5rem)))",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {orderedStaticNodes}
      {mappedItems}
    </CommandList>
  )
}

function ComboboxItem({
  className,
  children,
  value: itemValue,
  keywords: keywordsProp,
  pinned: _pinned,
  onPointerDown: userPointerDown,
  onMouseDown: userMouseDown,
  onSelect: userOnSelect,
  ...props
}: Omit<React.ComponentProps<typeof CommandItem>, "value"> & {
  value: string
  /** Extra strings for cmdk filtering when children include icons or non-text UI. */
  keywords?: string[]
  /**
   * Keep this row above the selected rows. Use for a sentinel such as "All".
   * Ignored when `pinSelected` is false, and when `ComboboxContent` `showSelected` is set.
   */
  pinned?: "start"
}) {
  const ctx = useComboboxContext()
  const label = React.useMemo(() => getComboboxItemLabel(children), [children])
  const filterText = React.useMemo(() => getTextFromNode(children), [children])

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
      keywords={[itemValue, searchLabel, filterText, ...(keywordsProp ?? [])].filter(Boolean)}
      data-checked={ctx.isSelected(itemValue) ? true : undefined}
      onSelect={(cmdkValue) => {
        if (skipSelectFromPointerRef.current) {
          skipSelectFromPointerRef.current = false
          return
        }
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
        userMouseDown?.(e)
      }}
      className={cn(
        // No CSS :hover fill — cmdk sets aria-selected for both pointer + keyboard.
        // hover:bg-accent + aria-selected together painted two “active” rows (hover fight).
        "min-h-8 my-0.5 mx-1 gap-2 rounded-md px-2.5 py-1.5 text-sm [&_svg:not([class*='size-'])]:size-3.5 relative flex w-auto cursor-pointer items-center outline-none select-none aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        // Multi-line (ComboboxItemContent): start-align like Command search hits.
        "has-[[data-slot=command-item-content]]:items-start has-[[data-slot=command-item-content]]:min-h-0",
        "has-[[data-slot=command-item-content]]:[&>*:first-child]:mt-0.5",
        className
      )}
      {...props}
    >
      {children}
    </CommandItem>
  )
}

/** Form-density multi-line stack (reuses Command item-content slot for layout). */
function ComboboxItemContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-item-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function ComboboxItemTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-item-title"
      className={cn("line-clamp-1 text-sm font-medium leading-snug", className)}
      {...props}
    />
  )
}

function ComboboxItemDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="command-item-description"
      className={cn(
        "line-clamp-2 text-xs font-normal leading-snug text-muted-foreground",
        className
      )}
      {...props}
    />
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
        "bg-transparent hover:bg-interactive dark:bg-input/30 border-input shadow-none focus-within:border-ring focus-within:ring-ring/30 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-7 flex-wrap items-center gap-1 rounded-md border bg-clip-padding px-2 py-0.5 text-xs transition-colors focus-within:ring-[2px] has-aria-invalid:ring-[2px] has-data-[slot=combobox-chip]:px-1",
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
        "bg-muted-foreground/10 text-foreground flex h-[calc(--spacing(4.75))] min-w-0 max-w-full w-fit items-center justify-center gap-1 overflow-hidden rounded-xs px-1.5 text-xs font-medium whitespace-nowrap has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
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
  ComboboxItemContent,
  ComboboxItemTitle,
  ComboboxItemDescription,
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
