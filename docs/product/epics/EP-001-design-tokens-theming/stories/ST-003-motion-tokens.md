---
id: ST-003
epic: EP-001
title: Motion tokens wired into Tailwind
status: done
priority: must
release: 0.7.2
breaking: false
scope: [src/styles/motion.css, src/index.css, src/components, docs, skills]
api: src/styles/motion.css
---

# ST-003 — Motion tokens wired into Tailwind

As an app author using bare `transition` / `transition-colors` utilities,
I want Tailwind's defaults to resolve to nqui's motion tokens,
so that timing is tunable from one file and no component hard-codes `duration-150 ease-in-out`.

## Acceptance criteria

- [x] `src/styles/motion.css` defines the duration scale: `--duration-instant` (0ms),
      `--duration-micro` (100ms), `--duration-quick` (150ms, the default),
      `--duration-standard` (200ms), `--duration-slow` (250ms), `--duration-dramatic` (350ms).
- [x] It defines the easing vocabulary: `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`,
      `--ease-in` `cubic-bezier(0.4, 0, 1, 1)`, `--ease-in-out` `cubic-bezier(0.4, 0, 0.2, 1)`,
      `--ease-linear`, and `--ease-spring` `cubic-bezier(0.34, 1.2, 0.64, 1)`.
- [x] `src/index.css`'s `@theme inline` block sets
      `--default-transition-duration: var(--duration-quick)` and
      `--default-transition-timing-function: var(--ease-in-out)`, so bare Tailwind transitions
      follow the tokens.
- [x] A global `@media (prefers-reduced-motion: reduce)` block in `motion.css` collapses animation
      and transition durations to `0.01ms` and forces `scroll-behavior: auto`.
- [x] `.sliding-indicator` (enhanced tabs) transitions on `--duration-quick` + `--ease-in-out` and
      has its own reduced-motion opt-out.
- [x] The vocabulary and "default if unsure: quick / ease-in-out" rule is documented in
      `docs/nqui-skills/MOTION.md`.

## Technical notes

- The `@theme` wiring was chosen to be *feel-identical* to Tailwind's own defaults (150ms +
  ease-in-out), so 0.7.2 changed no visible timing while making every bare transition tunable.
- The sliding tab indicator was moved off 200ms + a deceleration curve in the same change; the
  slow tail read as click lag.
- `--ease-out` is opt-in for mount/unmount entrances; `--ease-in-out` is the neutral baseline for
  state changes. Elastic / bounce curves are deliberately absent.
- Shipped as "motion defaults wired to tokens" in 0.7.2 (`967d145`).

## Bugs

- 2026-08-17 — Raw CSS in `checkbox.tsx` (10×) and `sonner.tsx` (1×) used Tailwind
  arbitrary-value syntax for the easing token — `var(--ease-[var(--ease-in-out)])` and
  `ease-[var(--ease-in-out)]`. Neither is a valid CSS `<easing-function>`, so each whole
  `transition` declaration failed to parse and was dropped. Verified in-browser: the shipped
  0.8.0 rule computed to `transition-property: all; duration: 0s; timing: ease` — i.e. no
  transition at all. `EnhancedCheckbox` hover/checked color changes and the checkmark scale-in
  snapped instead of easing; the `checkbox-pulse` keyframe still fired, which masked it. Fixed
  to `var(--ease-in-out)` in 0.8.1. The token contract itself was never wrong — only these
  consumption sites. Tailwind `ease-[var(--…)]` inside `className` / `cva` strings is correct
  and was left alone.

## Out of scope

- Per-component animation choreography (Radix accordion / toast keyframes live with their
  components).
- Reduced-motion behavior of third-party overlays.
