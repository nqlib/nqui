"use client"

/**
 * Public DropdownMenu barrel — historically wrapped the core with
 * button-like 3D trigger shadows (`.enhanced-dropdown-trigger`).
 * Those shadows conflict with flat field chrome; this file now re-exports
 * the core components unchanged. Prefer importing from `@/components/ui/dropdown-menu`
 * for new code; this path stays for the stable public API.
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
} from "@/components/ui/dropdown-menu"
