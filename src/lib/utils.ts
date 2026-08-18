import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Matches an explicit Tailwind gap utility (`gap-4`, `gap-x-2`, `gap-[3px]`). */
const GAP_UTILITY = /(?:^|\s)gap(?:-[xy])?-\S+/

/**
 * Resolve a `gap` prop to an inline style.
 *
 * Numeric gap is emitted as an inline style (N × 0.25rem, the Tailwind spacing
 * scale) because a gap-N utility class built at runtime is invisible to the
 * consumer's Tailwind scanner and generates no CSS. String gap is a class and
 * passes through untouched (callers put it in `cn`).
 *
 * Pass `className` when the consumer's class lands on the *same element* as the
 * gap: an explicit `gap-*` utility there must still win, because an inline
 * style would otherwise silently beat it.
 */
export function gapStyle(
  gap: number | string | undefined,
  className?: string
): { gap: string } | undefined {
  if (typeof gap !== "number") return undefined
  if (className && GAP_UTILITY.test(className)) return undefined
  return { gap: `${gap * 0.25}rem` }
}
