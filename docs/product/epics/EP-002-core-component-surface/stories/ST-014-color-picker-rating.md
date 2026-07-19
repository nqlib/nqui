---
id: ST-014
epic: EP-002
title: Color picker, color slider and rating
status: done
priority: could
release: pre-baseline
breaking: false
scope: [src/components/custom, src/components/index.ts, docs]
api: docs/components/nqui-color-picker.md
---

# ST-014 — Color picker, color slider and rating

As an app author building settings or feedback UI,
I want an OKLCH colour picker and a star rating input that follow nqui's tokens,
so that these two specialised inputs don't come from a third-party design system.

## Acceptance criteria

- [x] `ColorPicker` + `ColorPickerProps` export from the main entry
      (`src/components/custom/color-picker.tsx`).
- [x] `ColorPicker` works in OKLCH strings end-to-end: `value?: string` defaults to
      `"oklch(0.5 0.15 240)"` and `onChange?: (color: string) => void` emits the same format —
      matching the ST-001 token space rather than hex.
- [x] `ColorPicker` supports `variant?: 'popover' | 'inline'` (default `'popover'`) and
      `disabled?: boolean`.
- [x] Hex is a display concern only — conversion lives inside `color-picker.tsx`, it is not part of
      the value contract.
- [x] `ColorSlider` + `ColorSliderProps` export from the main entry
      (`src/components/custom/color-slider.tsx`).
- [x] `ColorSliderProps` extends `Omit<SliderProps, "onChange">` so it inherits the ST-011 `Slider`
      surface, and adds `sliderType?: "hue" | "saturation" | "lightness" | "custom"` plus the paint
      overrides `trackColor`, `rangeColor`, `thumbColor`, `thumbFillColor`, `thumbOutlineColor`,
      `gradientBackground`, and the `currentHue` / `currentChroma` context values.
- [x] `Rating` + `RatingProps` export from the main entry (`src/components/custom/rating.tsx`).
- [x] `Rating` is form-shaped: `RatingProps` extends
      `Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'>` and exposes
      `value` / `defaultValue` (0) / `onValueChange(value: number)` / `maxRating` (5) plus half-star
      support.
- [x] All three build on existing nqui primitives and add no peer dependency.
- [x] Doc pages exist: `nqui-color-picker.md`, `nqui-color-slider.md`, `nqui-rating.md`.

## Technical notes

- `ColorSlider` is a supporting component of `ColorPicker` but is exported separately on purpose —
  it is the reusable piece for building a custom picker layout.
- `Rating` renders a `<fieldset>` rather than a row of buttons so it participates in native form
  semantics and grouping; that is why `onChange` is omitted and replaced with `onValueChange`.
- `Rating` is derived from the meccs-ui slider rating variant, per the comment in
  `src/components/index.ts`.

## Out of scope

- Alpha / opacity editing in `ColorPicker` — the value contract is three-channel OKLCH.
- Palette generation or a token editor UI — EP-001 owns tokens; the showcase owns configurators.
- Read-only star *display* helpers — `Rating` is an input.
