---
id: ST-001
epic: EP-001
title: OKLCH primary ladder and semantic color scales
status: done
priority: must
release: 0.7.2
breaking: false
scope: [src/styles/colors.css, src/index.css, docs, skills]
api: src/styles/colors.css
---

# ST-001 — OKLCH primary ladder and semantic color scales

As an app author adopting `@nqlib/nqui/styles`,
I want one OKLCH primary ladder plus success / warning / danger / info scales defined for both
light and dark,
so that I never pick a hex value myself and every component agrees on what "primary" means.

## Acceptance criteria

- [x] `src/styles/colors.css` defines a 6-stop ladder `--primary-100 … --primary-600` in both
      `:root` and `.dark`.
- [x] Light-mode primary is warm ink, not blue: hue 95 / chroma 0.004, with
      `--primary-500: oklch(0.35 0.004 95)` chosen so white text on a primary fill meets WCAG AA.
- [x] Dark-mode primary scale is achromatic (chroma 0) and semantic `--primary` is **inverted** to
      `oklch(0.92 0 0)` with `--primary-foreground: oklch(0.20 0 0)`.
- [x] Four semantic scales ship at 6 stops each in both modes: success (hue 135), warning (hue 80),
      danger (hue 25), info (hue 200).
- [x] Semantic mappings resolve through the ladder — `--primary: var(--primary-500)`,
      `--success: var(--success-500)`, `--destructive: var(--danger-500)`, and likewise for
      warning / info — so a scale override propagates without touching the mapping.
- [x] `--ring` is neutral (`oklch(0.5576 0.0222 57.81)` light, `oklch(0.708 0 0)` dark), not brand
      primary, so focus does not read as a selection state.
- [x] `--chart-1 … --chart-5` are a categorical palette at matched lightness, defined per mode in
      `src/index.css`.
- [x] Every scale token is exposed to Tailwind through the `@theme inline` `--color-*` mappings in
      `src/index.css`.

## Technical notes

- The dark inversion is deliberate and load-bearing: many controls (Button, Badge, Checkbox,
  Switch, Radio, Slider, Progress, Calendar-selected) paint with `bg-primary` plus an opacity
  modifier, so they all follow the inverted value.
- `--destructive` maps from the `--danger-*` scale — the scale and the semantic token are
  intentionally named differently; renaming either is a breaking change.
- `.light` does not restate the primary/surface values; it is identical to `:root` by design
  (see the closing comment in `colors.css`).
- Shipped as the "default primary is neutral, not blue" change in 0.7.2 (`967d145`).

## Out of scope

- The consumer brand override path — ST-007.
- Surface colors and the 2+1 elevation model — ST-002.
