---
id: ST-070
epic: EP-002
title: Slider scale engine (log scale, marks, adaptive ticks)
status: review
priority: should
release: unset
breaking: false
scope: [src/lib/slider-scale.ts, src/components/ui/slider.tsx, docs]
api: docs/components/nqui-slider.md
---

# ST-070 — Slider scale engine

As an app author with values that are not evenly spaced (zoom, money, playback speed),
I want a log scale and named marks on the Slider,
so that 100% zoom sits at the middle of the track instead of near the start, and so that tick
spacing adjusts to the space available.

Plan: [`plans/007-slider-refresh.md`](../../../../../plans/007-slider-refresh.md) Phase 3.

## Acceptance criteria

- [x] `src/lib/slider-scale.ts` provides pure `toPosition`, `fromPosition`, `snap`, `niceInterval`,
      `computeTicks`, `segmentsAllowed` and `nearestMark`. It is internal and not exported.
- [x] `scale?: "linear" | "log"` and `marks?: Array<number | { value; label? }>` exist on
      `SliderProps`.
- [x] With `scale="log"`, a range of 25–400 puts 100 at 50% of the track. The arrow keys step in
      value space. Controlled values make a full round trip with no float drift.
- [x] Log scale with `min <= 0` throws a clear error (in every build; see implementation notes).
- [x] Unit tests cover every function: log midpoints, negative ranges, decimal steps,
      `min === max`, and narrow widths.
- [x] Docs and CHANGELOG are updated.

## Technical notes

- Radix works only in linear values. Log mode runs Radix on internal positions `0..1000` and maps
  values in and out of that space. Keyboard input is handled on Thumb in value space. This is the
  main risk in plan 007.
- The default tick candidates are step × {1, 2, 5} × 10ⁿ. Callers can pass unit-aware candidates,
  for example time in hours.

## Implementation notes

- `src/lib/slider-scale.ts` also provides `toFraction` / `fromFraction`, which every variant uses
  for positions, and `stepPrecision` for snapping without float drift.
- `computeTicks` takes major intervals from unit candidates when one is a multiple of the minor
  interval (90° not 75°, 3h not 2.5h).
- The `min <= 0` error is thrown in every build, not only in development: a log scale with
  `min <= 0` has no valid position.
- Linear sliders still run Radix directly on real values. Only `scale="log"` uses the internal
  `0..1000` position space.

## Bugs
