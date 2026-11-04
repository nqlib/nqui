---
id: ST-069
epic: EP-002
title: Slider value label
status: review
priority: should
release: 0.8.3
breaking: false
scope: [src/components/ui/slider.tsx, src/components/custom/color-slider.tsx, docs]
api: docs/components/nqui-slider.md
---

# ST-069 — Slider value label

As an app author showing a slider's current value,
I want the Slider to render its own label and formatted value,
so that I stop building a label row by hand for each slider. SecoLab currently does this in four
different ways.

Plan: [`plans/007-slider-refresh.md`](../../../../../plans/007-slider-refresh.md) Phase 2.

## Acceptance criteria

- [x] `label?: ReactNode`, `showValue?: boolean` and `formatValue?: (value: number) => string`
      exist on `SliderProps`.
- [x] With `showValue`, a header row shows the label on the left and the value on the right. The
      value uses `tabular-nums` and a minimum width based on the longer of `formatValue(min)` and
      `formatValue(max)`.
- [x] Two thumbs render as `a – b`.
- [x] `formatValue` sets each thumb's `aria-valuetext`. `label` labels each thumb with
      `aria-labelledby` (thumbs carry `role="slider"`, so that is where the name belongs).
- [x] `ColorSliderProps` has no name collisions, and ColorSlider renders the new props correctly.
- [x] Tests cover the label, `aria-valuetext`, the width staying the same across values, and the
      range format.
- [x] `nqui-slider.md`, the components README row, the consumer skill (`sync:skills`) and
      CHANGELOG are updated.

## Technical notes

- D6 (typeface for numbers) and D7 (where the value goes) come from the design study.
- Inside `Field` + `FieldLabel`, document that you should use one label or the other. Don't detect
  it automatically.

## Implementation notes

- Built 2026-10-19 with the D6/D7 leans: the value uses Satoshi `tabular-nums` (no mono face)
  and sits at the right end of the label row. The readout is `aria-hidden`; screen readers get the
  same text from each thumb's `aria-valuetext`.
- With `label` or `showValue`, the slider is wrapped in `data-slot="slider-control"`, and
  `className` / `style` move to that wrapper.

## Bugs
