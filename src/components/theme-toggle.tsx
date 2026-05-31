"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon01Icon, PaintBoardIcon } from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"

import { Button } from "@/index"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <HugeiconsIcon icon={PaintBoardIcon} size={16} className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const currentTheme = theme || "light"

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative"
      onClick={toggleTheme}
    >
      <HugeiconsIcon
        icon={PaintBoardIcon}
        size={16}
        className={`absolute h-4 w-4 transition-all duration-200 ${
          currentTheme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <HugeiconsIcon
        icon={Moon01Icon}
        size={16}
        className={`absolute h-4 w-4 transition-all duration-200 ${
          currentTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

