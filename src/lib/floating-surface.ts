/**
 * Shared surface for popover-like panels: one hairline border + the shared
 * elevated-surface shadow token (--shadow-elevated). Single source of truth for
 * the "elevated" tier of the 2+1 rule — popover, dropdown, select, context-menu,
 * menubar, hover-card, command, combobox all inherit it.
 */
export const floatingSurface =
  "rounded-lg border border-border bg-popover text-popover-foreground shadow-(--shadow-elevated)"

/**
 * List row: keyboard focus, pointer highlight (Radix), and cmdk selection on [cmdk-item].
 * Muted is reserved for labels, shortcuts, empty copy — not selected rows.
 *
 * Use aria-selected (not data-selected) for cmdk highlight: React 19 renders
 * data-selected="false" on unselected rows, and data-selected:bg-accent compiles
 * to [data-selected], which matches every row.
 */
export const floatingListItemInteractive =
  "rounded-md outline-none focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground aria-selected:*:[svg]:text-accent-foreground"

/**
 * Shared menu-row density — the compact command-menu row spec used by
 * ContextMenu and Menubar. DropdownMenu adopts this too so the command-menu
 * family reads as one height/padding/text/icon size. (Form option lists —
 * Select, Combobox — intentionally use a taller row for larger tap targets.)
 */
export const menuRowDensity =
  "min-h-7 gap-2 px-2 py-1 text-xs [&_svg:not([class*='size-'])]:size-3.5"
