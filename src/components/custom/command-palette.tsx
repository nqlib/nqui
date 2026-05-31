import * as React from "react"
import {
  Command,
  CommandDialog,
} from "@/components/ui/command"
import {
  isMod,
  SHORTCUT_KEYS,
  shouldIgnoreKeyboardShortcut,
} from "@/lib/keyboard"

export interface CommandPaletteProps
  extends Omit<
    React.ComponentProps<typeof CommandDialog>,
    "title" | "description"
  > {
  /** Dialog title (sr-only). */
  title?: string
  /** Dialog description (sr-only). */
  description?: string
  /** Whether Cmd/Ctrl+K listens to open the palette. Default true. */
  shortcutEnabled?: boolean
  /** Command content: CommandInput, CommandList, CommandGroup, CommandItem, etc. */
  children: React.ReactNode
}

/**
 * Global command palette that opens via Cmd/Ctrl+K. Wraps CommandDialog and Command
 * with a keyboard shortcut listener. Use CommandInput, CommandList, CommandGroup,
 * and CommandItem as children.
 */
export function CommandPalette({
  title = "Command Palette",
  description = "Search for a command to run...",
  shortcutEnabled = true,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  ...dialogProps
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const onOpenChange = isControlled
    ? controlledOnOpenChange
    : setInternalOpen

  const openRef = React.useRef(open)

  React.useEffect(() => {
    openRef.current = open
  }, [open])

  React.useEffect(() => {
    if (!shortcutEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboardShortcut(e.target)) return
      if (e.key === SHORTCUT_KEYS.commandPalette && isMod(e)) {
        e.preventDefault()
        onOpenChange?.(!openRef.current)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcutEnabled, onOpenChange])

  return (
    <CommandDialog
      {...dialogProps}
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Command>{children}</Command>
    </CommandDialog>
  )
}
