"use client"

import { useTheme } from "next-themes"
import { useMemo } from "react"

export type ResolvedTheme = "light" | "dark"

/**
 * Returns the visual mode for light-vs-dark logic (e.g. status colors).
 * `light` resolves to "light"; `dark` resolves to "dark".
 */
export function useResolvedTheme(): ResolvedTheme {
  const { resolvedTheme } = useTheme()

  return useMemo((): ResolvedTheme => {
    if (resolvedTheme === "dark") {
      return "dark"
    }
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "dark"
    }
    return "light"
  }, [resolvedTheme])
}
