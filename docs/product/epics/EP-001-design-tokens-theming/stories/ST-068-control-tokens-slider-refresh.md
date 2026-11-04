---
id: ST-068
epic: EP-001
title: Control tokens and Slider base refresh
status: review
priority: should
release: 0.8.3
breaking: false
scope: [src/styles, src/index.css, src/components/ui, src/components/custom, docs]
api: docs/components/nqui-slider.md
---

# ST-068 — Control tokens and Slider base refresh

As an app author using nqui's Slider, Switch and Progress next to each other,
I want their thumbs, rails, focus rings and pressed states to come from shared tokens,
so that these controls match each other and nqui's elevation rules on every surface and in both
themes.

Plan: [`plans/007-slider-refresh.md`](../../../../../plans/007-slider-refresh.md) Phase 1.

## Acceptance criteria

- [x] `--shadow-thumb` is defined in `src/styles/shadows.css` for both themes. Components use it
      as `shadow-[var(--shadow-thumb)]`: a named `shadow-thumb` utility would collide with the
      token in Tailwind v4's `--shadow-*` namespace.
- [x] Pressed filled Button / Toggle darken their fill solidly (`color-mix(…, black 10%)`) and go
      flat, with no inset shadow, translucent fill or mouse-focus tint. This replaced a short-lived
      `--shadow-pressed` token (design review 2026-11-02: the inset read as a band along the top).
- [x] `--track`, `--track-hover` and `--thumb` are defined in both themes and are available as
      `bg-track`, `bg-track-hover` and `bg-thumb` (mapped in `@theme inline`, safelisted with
      `@source inline()`).
- [x] No component under `src/components/ui` or `src/components/custom` contains a hardcoded
      `rgba(` box-shadow (debug components excepted).
- [x] The Slider thumb has no border, uses `shadow-thumb`, follows the D2 knob colour, has a 2px
      focus ring and no hover ring, and has `hit-area-2`.
- [x] The Slider track is 4px at every size and uses `bg-track`. The root height is h-6, h-7 or h-8
      for sm, default and lg.
- [x] Switch, ColorSlider, Progress and the default variant of EnhancedProgress use the shared
      tokens.
- [x] Sortable's focus ring is 2px. Radio uses the `hit-area-*` utility, and its hit area is the
      same size as before.
- [x] `data-slot` names and the `sliderTrackVariants` / `sliderThumbVariants` exports are
      unchanged.
- [x] `slider.test.tsx` covers rendering, keyboard input, `data-slot` and size, and that
      `onValueCommit` fires once per keyboard interaction. `css-sanity.test.ts` checks the new
      tokens in both themes, bans `rgba()` shadow utilities and colour functions wrapped around
      `var()`. The pointer-drag commit case is not reachable in jsdom; it is on the plan 007
      Phase 5c QA list.
- [x] ELEVATION.md, THEMING.md, STATES.md, MOTION.md, `nqui-slider.md` and CHANGELOG are updated in
      the same PR. CHANGELOG labels this as a visual change.

## Technical notes

- Design decisions (2026-10-19, maintainer chose the study's leans; designer review still open):
  - D1 thumb shape: pill, same sizes as the Switch thumb.
  - D2 dark knob: light knob in both themes for Slider and Switch (`--thumb: oklch(0.96 0 0)` in
    dark). Because nqui's dark `--primary` is also light (0.92), the dark `--shadow-thumb` uses a
    dark 1px hairline so the knob still separates from a filled range.
  - D3 track: 4px, same as Progress.
  - D4 range: `bg-primary`.
  - D12 sizes: thumb 16×12 / 20×16 / 24×20, row `h-6` / `h-7` / `h-8`, rail 4px at every size.
- The tripwire found a 7th hardcoded pressed shadow in `toggle.tsx`, beyond the 6 in `button.tsx`.
- `dist/styles.css` ships source CSS for the consumer's Tailwind, so new utilities must be listed
  in the `@source inline()` safelist in `src/index.css`. The old Slider/Switch rgba entries were
  replaced.
- This story adds no props, but every consumer sees a visual change. Target a minor version.
- Scroll-area and Resizable use the rail token only if the designer approves them side by side.
- SecoLab's shade pickers override `[data-slot='slider-track']`, so the slot names are a contract.

## Bugs
