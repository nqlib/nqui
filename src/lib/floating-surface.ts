/**
 * Shared surface for popover-like panels: one hairline border, light lift — no ring stack.
 */
export const floatingSurface =
  "rounded-lg border border-border bg-popover text-popover-foreground shadow-sm"

/**
 * List row: keyboard focus, pointer highlight (Radix), and cmdk selection on [cmdk-item].
 * Muted is reserved for labels, shortcuts, empty copy — not selected rows.
 *
 * Use aria-selected (not data-selected) for cmdk highlight: React 19 renders
 * data-selected="false" on unselected rows, and data-selected:bg-accent compiles
 * to [data-selected], which matches every row.
 */
export const floatingListItemInteractive =
  "rounded-md outline-none focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground aria-selected:*:[svg]:text-accent-foreground"
