"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons"

import { EnhancedButton as Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export interface ThemeAppearanceMenuProps {
  align?: "start" | "center" | "end"
}

/**
 * Light / dark / system appearance control for apps using `next-themes` `ThemeProvider`
 * with `enableSystem`. Uses nqui Button + DropdownMenu patterns.
 */
export function ThemeAppearanceMenu({
  align = "end",
}: ThemeAppearanceMenuProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const label =
    !mounted ? "Theme" : theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 px-2"
          aria-label="Choose color theme"
        >
          <HugeiconsIcon
            icon={PaintBoardIcon}
            strokeWidth={2}
            size={16}
            className="opacity-80"
          />
          <span className="hidden sm:inline">{label}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            size={14}
            className="opacity-70"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={mounted ? (theme ?? "system") : "system"}
          onValueChange={setTheme}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
