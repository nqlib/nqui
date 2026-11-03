---
id: ST-071
epic: EP-002
title: Slider variants (field, segments, ruler), origin and track slot
status: review
priority: could
release: unset
breaking: false
scope: [src/components/ui/slider.tsx, docs]
api: docs/components/nqui-slider.md
---

# ST-071 — Slider variants, origin and track slot

As an app author choosing a slider for a specific kind of value,
I want variants that match how the data is shaped (form and property values, stepped choices,
values with units), plus a fill that grows from a centre point and a supported way to style the
track,
so that I don't hand-roll sliders or override `data-slot` to draw a gradient.

Plan: [`plans/007-slider-refresh.md`](../../../../../plans/007-slider-refresh.md) Phase 4.
Depends on ST-069 and ST-070.

## Acceptance criteria

- [x] `variant?: "default" | "field" | "segments" | "ruler"` is a prop, exposed as `data-variant` on the root (see implementation notes).
- [x] Field:
  - [x] It is flat and as tall as the control height, with `rounded-md`, a `bg-interactive` hover
        wash and a 2px caret.
  - [x] Double-click or Enter opens an inline input. Esc cancels, and Enter or blur commits
        through `snap`.
  - [x] It accepts `parseValue?: (text) => number`.
  - [x] `aria-invalid` gives it the same destructive border as Input.
- [x] Segments:
  - [x] The current segment is raised with `transform: scaleY`.
  - [x] The focus ring is drawn on the track.
  - [x] Outside 5–12 steps it falls back to `default` and logs a console warning once per message.
- [x] Ruler:
  - [x] Ticks come from `computeTicks`, recalculated on resize.
  - [x] Ticks lift only while dragging or with keyboard focus, and not with reduced motion.
- [x] `origin?: number` fills from the origin to the value in every variant.
- [x] `trackBackground?: string` and `showRange?: boolean` replace the `data-slot` gradient
      override.
- [x] `readOnly?: boolean` shows the value, ignores input and sets `aria-readonly`.
- [x] Arrow keys inside a Radix menu do not move menu focus.
- [x] Tests cover:
  - [x] Every variant.
  - [x] An origin fill in both directions.
  - [x] The Segments fallback.
  - [x] Tick count changing with width.
  - [x] Field editing.
  - [x] Read-only.
  - [x] Keyboard input inside a menu (a wrapping key handler in jsdom; a real `DropdownMenu` checked by hand in the showcase).
- [x] The docs page includes a "which variant for which data" table. RECIPES.md, COMPOSITION.md,
      the consumer skill, CHANGELOG and MIGRATION.md (moving off `data-slot` gradient overrides)
      are updated.

## Technical notes

- D5, D8, D9 and D11 come from the design study.
- Fader and Readout are out of scope. Field v1 uses Radix's jump-to-click behaviour. Relative
  scrubbing is a v2 decision.

## Implementation notes

- Variant chrome lives in `src/styles/components.css`, keyed on `[data-variant]`, not in the cva.
  Unlayered CSS overrides the base utility classes without needing a consumer Tailwind safelist.
  The `variant` prop and the `data-variant` attribute are the public surface;
  `sliderTrackVariants` / `sliderThumbVariants` keep their existing `size` keys.
- Added `tickIntervals` (ruler) for unit-aware ticks. It wasn't in the original criteria, but the
  ruler needs it to label hours and degrees sensibly.
- D9 read-only: the knob goes flat (`--track-hover`, no shadow), the range stays, the thumb keeps
  focus and sets `aria-readonly`. D5: Field ships caret-only; quarter marks wait on a usability
  test.
- `trackBackground` raises the rail to 8px, the same as ColorSlider, because a gradient is content.
- Menu safety is implemented as `stopPropagation` on nav keys at the slider root. It was checked in
  the showcase `DropdownMenu` (focus and menu stay put) and unit-tested with a wrapping handler.
- Field v1 uses Radix jump-to-click. A double-click therefore moves the value to the click point
  before the editor opens. Relative scrub is still a v2 decision.

## Bugs
