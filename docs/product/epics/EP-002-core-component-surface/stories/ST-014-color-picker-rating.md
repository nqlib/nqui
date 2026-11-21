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

## Bugs

- 2026-11-21 — The `ColorPicker` popover panel went outside a short window. The panel is about
  480px high. In a 1200 × 800 window with the trigger at mid height, the panel opened upward and
  its top rows (the OKLCH row) were cut off. The panel now has `collisionPadding={8}`,
  `max-h-(--radix-popover-content-available-height)` and `overflow-y-auto`, so it stays in the
  window and scrolls. Found in the secolab report designer (SECO-2237).
- 2026-11-17 — `ColorPicker` converted colours with wrong maths. `oklchToHex`, `rgbToOklch` and
  the inner `oklchToHsl` skipped steps of the OKLab formula (no cube or cube root, no second
  matrix, no sRGB gamma in `oklchToHex`). `#27272a` came back as `#a5a6a6`, and sRGB red
  (`oklch(0.628 0.258 29)`) showed as `#000000`. The HEX field also could not be typed into one
  character at a time. Fixed in 0.10.0 (ST-072). The OKLCH value contract of this story does not
  change. ST-072 adds `format="hex"` as an opt-in format.
- 2026-11-07 — `Rating` with `allowHalf` drew a dark anti-alias seam down the centre of each star
  (two half-star masks meeting), worse under opacity or disabled. Both halves now clip one full-star
  mask via `overflow: hidden`, and disabled dims once through the fieldset. Fixed in 0.9.1.
- 2026-10-19 — `ColorSlider` defaults were `oklch(var(--primary))` / `oklch(var(--secondary))`.
  The tokens already hold full `oklch()` values, so the declarations were invalid and dropped:
  a `sliderType="custom"` slider had a transparent rail and range, and the thumb outline fell back
  to `currentColor`. The fill default was a literal `"white"` that ignored dark mode. Also, a
  caller's `style` prop was spread after the colour variables and replaced them. Defaults are now
  `var(--track)` / `var(--primary)` / `var(--thumb)`, and `style` is merged first. Guarded by
  `slider.test.tsx` and a `css-sanity` tripwire against colour functions wrapped around `var()`.
  Fixed with ST-068.

- 2026-08-17 — `Rating` rendered a ~4.5 KB `<style>` element per instance (both return paths),
  duplicating the stylesheet per rating and folding its CSS text into the containing element's
  `textContent`. Rules moved verbatim to `src/styles/components.css` (the three star-mask
  `url('data:image/svg+xml,…')` constants are now inlined literals); class names unchanged.
  Guarded by `src/test/css-sanity.test.ts`. Fixed in 0.8.1.

## Out of scope

- Alpha / opacity editing in `ColorPicker` — the value contract is three-channel OKLCH.
- Palette generation or a token editor UI — EP-001 owns tokens; the showcase owns configurators.
- Read-only star *display* helpers — `Rating` is an input.
