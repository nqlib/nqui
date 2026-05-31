import * as React from "react"

/**
 * Single source of truth for keyboard keys and modifier checks used in custom UI logic.
 * Radix UI primitives keep their built-in keyboard behavior; use these only where
 * the codebase adds its own key handling (data grid, sidebar, charts, carousel, etc.).
 */

/** Key string constants for consistent comparisons (event.key === Keys.Enter). */
export const Keys = {
  Enter: "Enter",
  Escape: "Escape",
  Tab: "Tab",
  Space: " ",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  F2: "F2",
  Backspace: "Backspace",
  Delete: "Delete",
} as const

/** Whether Ctrl (Windows/Linux) or Cmd (macOS) is pressed. */
export function isMod(
  event: KeyboardEvent | React.KeyboardEvent
): boolean {
  return event.ctrlKey || event.metaKey
}

/** True when target is an input, textarea, or contenteditable — skip shortcuts while typing. */
export function shouldIgnoreKeyboardShortcut(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
    return true
  return target.isContentEditable
}

/** App-level shortcut key characters (used with modifiers in components). */
export const SHORTCUT_KEYS = {
  search: "f",
  sidebarToggle: "b",
  commandPalette: "k",
  shortcutsDialog: "/",
  filter: "f",
  sort: "s",
} as const

/** Keys that remove filter/sort when focused on filter/sort trigger (Backspace, Delete). */
export const REMOVE_SHORTCUT_KEYS = [Keys.Backspace, Keys.Delete] as const
