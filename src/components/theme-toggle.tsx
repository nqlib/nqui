"use client"

import {
  IconMoon,
  IconPalette,
} from "@/components/icons"
import * as React from "react"
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
        <IconPalette size={16} className="h-4 w-4" />
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
      <IconPalette
        size={16}
        className={`absolute h-4 w-4 transition-all duration-[var(--duration-standard)] ${
          currentTheme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <IconMoon
        size={16}
        className={`absolute h-4 w-4 transition-all duration-[var(--duration-standard)] ${
          currentTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

