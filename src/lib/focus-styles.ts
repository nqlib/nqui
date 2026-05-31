/**
 * Shared focus affordances — SSOT for field vs action controls.
 *
 * Field: inset ring + border (Input, Select, Textarea, InputGroup shell)
 * Action: offset ring (Button, Toggle, Switch, Checkbox core)
 * Menu:  accent fill + inset ring on keyboard focus
 */

/** Text fields and grouped input shells */
export const fieldFocusClasses =
  "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:ring-[2px]"

/** Same as fieldFocusClasses but for focus-within on wrappers */
export const fieldFocusWithinClasses =
  "focus-within:outline-none focus-within:border-ring focus-within:ring-[2px] focus-within:ring-ring/30 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 has-aria-invalid:ring-[2px]"

/** InputGroup shell when a child control is focused */
export const inputGroupShellFocusClasses =
  "has-[[data-slot=input-group-control]:focus-visible]:outline-none has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[2px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-[2px] has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40"

/** Buttons, toggles, and other action targets */
export const actionFocusClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"

/** List/menu rows — keyboard focus without mouse flash */
export const menuItemFocusClasses =
  "outline-none focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground aria-selected:*:[svg]:text-accent-foreground"

/** Combobox / injected CSS focus shadow (matches ring-ring/30) */
export const focusRingBoxShadow =
  "0 0 0 2px color-mix(in oklch, var(--ring) 30%, transparent)"
