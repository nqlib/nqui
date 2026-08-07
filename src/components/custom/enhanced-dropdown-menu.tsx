"use client"

/**
 * Public DropdownMenu barrel — historically wrapped the core with
 * button-like 3D trigger shadows (`.enhanced-dropdown-trigger`).
 * Those shadows conflict with flat field chrome; this file now re-exports
 * the core components unchanged.
 *
 * Use a relative import (not `@/`) so emitted `.d.ts` resolves for consumers.
 */

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "../ui/dropdown-menu"
