/**
 * Shared surface for popover-like panels: one hairline border + the cloudy
 * float shadow (--shadow-float). Soft wide layers pull focus onto the panel
 * without a modal scrim — select, combobox, command, dropdown, context-menu,
 * menubar, hover-card all inherit it.
 */
export const floatingSurface =
  "rounded-lg border border-border bg-popover text-popover-foreground shadow-(--shadow-float)"

/**
 * Overlay tray chrome — muted rim → background stage + hairline.
 * Lift comes from the scrim, not `--shadow-modal`. Dialog / AlertDialog /
 * Sheet / Drawer share this. CommandDialog and mobile Sidebar opt out via
 * `stage={false}`.
 */
export const modalTrayOuter = "rounded-xl bg-muted p-1 outline-none"

export const modalTrayStage =
  "relative min-w-0 rounded-lg border border-border bg-background"

/** Shared overlay scrim — Dialog / AlertDialog / Sheet / Drawer. */
export const modalOverlayScrim =
  "bg-overlay duration-[var(--duration-micro)] supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-[var(--z-modal-backdrop)]"

/**
 * Interactive wash — `--interactive` (light: soft accent tint; dark: solid accent).
 * Prefer these over raw `bg-accent` / `bg-muted/50` for hover + selection.
 */
export const interactiveWash = "bg-interactive"
export const interactiveWashHover = "hover:bg-interactive"

/**
 * List row: keyboard focus, pointer highlight (Radix), and cmdk selection on [cmdk-item].
 *
 * Use aria-selected (not data-selected) for cmdk highlight: React 19 renders
 * data-selected="false" on unselected rows, and data-selected:bg-* compiles
 * to [data-selected], which matches every row.
 */
export const floatingListItemInteractive =
  "rounded-md outline-none transition-colors duration-[var(--duration-quick)] ease-[var(--ease-in-out)] focus-visible:bg-interactive data-[highlighted]:bg-interactive aria-selected:bg-interactive"

/**
 * Shared menu-row density — the compact command-menu row spec used by
 * ContextMenu and Menubar. DropdownMenu adopts this too so the command-menu
 * family reads as one height/padding/text/icon size. (Form option lists —
 * Select, Combobox — intentionally use a taller row for larger tap targets.)
 */
export const menuRowDensity =
  "min-h-7 gap-2 px-2 py-1 text-xs [&_svg:not([class*='size-'])]:size-3.5"
