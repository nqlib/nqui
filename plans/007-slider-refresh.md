# Plan 007 — Slider refresh, shared control tokens, and the showcase slider lab

Status: IN REVIEW — Phases 1–6 built on `feat/st-068-control-tokens-slider-refresh` (ST-068…ST-071 in review); showcase lab at `/recipes/sliders`
Effort: L (6 phases) · Risk: medium (visible change for every consumer; Radix integration for log
scale and scrub) · Depends on: design decisions D1–D12 (Phase 0)
Stories: ST-068 (tokens + base refresh), ST-069 (value label), ST-070 (scale engine),
ST-071 (variants + origin)
Design study: https://claude.ai/artifact/2LfHqaS4QLxjFGUhKneLGm (v3: decisions, live demos,
SecoLab call-site map)

## Problem

`Slider` is the generic shadcn shape. That is a branding problem, but it is not the main one.
The main problem is that it sits outside nqui's own system:

| Finding | Where |
|---|---|
| Thumb shadow is a hardcoded rgba, repeated in 3 files and not a token | `slider.tsx:25`, `switch.tsx:33`, `color-slider.tsx:75` |
| Pressed shadow is a hardcoded inset rgba, repeated in 6 Button variants and Toggle | `button.tsx:101–147`, `toggle.tsx:11` |
| Focus ring is 4px; every other form control is 2px (Sortable is 1px) | `slider.tsx`, `sortable.tsx` |
| Hover adds a ring halo; MOTION.md says hover is a colour change only | `slider.tsx` |
| Five components draw a rail in five colours: `bg-muted`, `bg-primary/20`, `bg-input`, `bg-border/80`, `bg-border` | progress, enhanced-progress, switch, scroll-area, resizable |
| Track on `bg-muted` flips contrast between light and dark (muted is below card in light, above it in dark) | `slider.tsx` |
| Slider track is 8/10/12px; Progress is 4px | `slider.tsx`, `progress.tsx:39` |
| Slider thumb has no dark override; Switch uses `dark:bg-card` | `slider.tsx`, `switch.tsx` |
| ColorSlider thumb is a literal `"white"`; its fallback `oklch(var(--secondary))` is invalid CSS | `color-slider.tsx` |
| No hit area on a 10px track | `slider.tsx` |
| No value label, no bipolar fill, no log scale, no ticks | API gap |

The consumer evidence comes from SecoLab (`frontend/src`). It has 10 sliders: 7 nqui `Slider` and
3 native `<input type="range">`. They build value labels by hand in four different ways. Three
`data-slot` overrides work around the missing track customisation. Both zoom controls want a log
scale.

## Phase 0 — Decision gate (no code)

Get answers to D1–D12 from the design study. **Any question still unanswered when a phase starts
takes the lean shown in the study.** Record the answers in ST-068 → `## Technical notes`.

| Decision | Lean | Blocks |
|---|---|---|
| D1 thumb shape | pill (Switch parity) | Phase 1 |
| D2 dark-mode knob | light knob, Slider + Switch together | Phase 1 |
| D3 track weight | 4px, same as Progress | Phase 1 |
| D4 range colour | primary | Phase 1 |
| D12 `sm` size | thumb 16×12, row h-6, track stays 4px | Phase 1 |
| D7 where `showValue` puts the value | right end of the label row | Phase 2 |
| D5 Field at rest | test caret-only vs quarter marks | Phase 4 |
| D6 typeface for numbers | Satoshi `tabular-nums`, no mono | Phases 2, 4 |
| D8 ruler tick lift | keep, during drag/focus only | Phase 4 |
| D9 read-only / invalid / disabled | match Input | Phase 4 |
| D11 Segments vs ToggleGroup | ToggleGroup 2–4, Segments 5–12 | Phase 4, docs |
| D10 accent contrast floor | 3:1 range vs track, enforced in SecoLab token maths | out of scope (SecoLab) |

Also in Phase 0: run `git checkout dev && git pull`. Every phase gets its own branch from `dev`,
named after its story (see each phase).

## Phase 1 — Shared tokens + Slider base refresh (ST-068, no new props)

Branch: `feat/st-068-control-tokens-slider-refresh`

### 1a. Tokens

- `src/styles/shadows.css`: add `--shadow-thumb` and `--shadow-pressed`, defining both in light
  and dark.
  - Light uses the existing warm hue `oklch(0.28 0.02 95 / a)`.
  - Dark uses a hairline plus a black drop, matching the file's other dark tokens.
  - Starting values: `--shadow-thumb: 0 1px 2px oklch(0.28 0.02 95 / 0.2), 0 0 0 0.5px
    oklch(0.28 0.02 95 / 0.18)`. Dark: `0 0 0 1px oklch(1 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.6)`.
  - Update the header glossary. It currently says shadows are "for OVERLAY surfaces only", so it
    needs a "control exception" line.
- Track tokens in `src/index.css` (light and dark blocks):
  - Light: `--track: color-mix(in oklch, var(--foreground) 12%, transparent)`, and 17% for
    `--track-hover`.
  - Dark: 16% and 22%.
  - Map both in `@theme inline` (`--color-track`, `--color-track-hover`) so `bg-track` exists.
  - Map `--shadow-thumb` and `--shadow-pressed` so `shadow-thumb` and `shadow-pressed` exist.
- Extend `src/test/css-sanity.test.ts` to check that every new token is defined in both themes.

### 1b. Slider (`src/components/ui/slider.tsx`)

- Track: `h-1` at every size (D3/D12), `bg-track`, `hover:bg-track-hover` on Root, `rounded-full`.
- Thumb:
  - Remove `border border-primary`.
  - Use `bg-background dark:bg-card`, or the light knob if D2 says so.
  - Use `shadow-thumb`.
  - Focus: `focus-visible:ring-[2px] ring-ring/30`.
  - Remove `hover:ring-4`.
  - Pressed: a slight darken, `data-[dragging]` or `active:`, under 100ms per STATES.md.
  - Add `hit-area-2`.
  - Transitions use the `--duration-micro` and `--ease-in-out` tokens.
- Root height equals control height: sm `h-6`, default `h-7`, lg `h-8`. Rows then line up with
  Select, Toggle and Button.
- Keep `data-slot="slider" | "slider-track" | "slider-range" | "slider-thumb"` byte-identical.
  ColorSlider and SecoLab both select on them.
- Keep the `sliderTrackVariants` and `sliderThumbVariants` exports, with the same names and the same
  `size` variant keys (ST-011).

### 1c. Siblings

- `switch.tsx`: use `shadow-thumb`, apply the D2 knob colour, and add `hit-area-2`.
- `color-slider.tsx`:
  - Remove the duplicated shadow selector.
  - The thumb default becomes `var(--background)`, not `"white"`.
  - The fallback becomes `var(--secondary)`.
  - Log a dated line under ST-014 `## Bugs`.
- `button.tsx` and `toggle.tsx`: replace the 7 inset rgba copies with `shadow-pressed`. Values must not change
  visually, so diff a screenshot.
- `progress.tsx`: `bg-track` with `rounded-full`.
- `enhanced-progress.tsx`: the `default` variant track becomes `bg-track`. Semantic variants
  (success, warning, error) keep their tinted tracks, because the tint carries meaning.
- `sortable.tsx`: `ring-1` becomes `ring-2`.
- `radio-group.tsx:39`: replace the hand-built `after:-inset-x-3 after:-inset-y-2` with
  `hit-area-*`. The hit area must stay the same size, so check it with `hit-area-debug`.
- Only if it looks right side by side: `scroll-area.tsx:50` and `resizable.tsx:48` use
  `bg-track` / `hover:bg-track-hover`. These are visible changes, so get the designer's OK and
  drop them if there's any doubt.

### 1d. Tests

These close the slider part of ST-054. Add `src/components/ui/slider.test.tsx` covering:
- Rendering with one thumb and with two.
- `data-slot` attributes present.
- Arrow keys, Home and End change the value.
- `aria-valuenow`.
- `size` maps to root height classes.
- Disabled blocks input.

Also add `onValueCommit` fires once per keyboard interaction. SecoLab works around it firing
mid-drag at `color-picker.tsx:253`. If jsdom can't drive Radix pointer capture, write the pointer
case as a Playwright item in the Phase 5 QA list instead, and say so in the story.

### 1e. Docs (same PR)

- ELEVATION.md: control thumbs are an allowed shadow exception, alongside the sculpted Button.
- THEMING.md: document the four new tokens.
- STATES.md: add slider pressed and dragging states.
- MOTION.md: add a slider row.
- `nqui-slider.md`: update the Notes section.
- CHANGELOG: a `Changed` entry that says "visual" in so many words.

**Version:** treat this as a minor bump (0.9.0). Every consumer's sliders, switches and progress
bars look different afterwards, even though no API changes. ST-011's 0.8.1 patch-vs-minor
decision is the precedent to cite.

## Phase 2 — Value label (ST-069)

Branch: `feat/st-069-slider-value-label`

- Props:
  - `label?: React.ReactNode`
  - `showValue?: boolean`
  - `formatValue?: (value: number) => string`
- Layout (D7): a header row with the label on the left and the value on the right. The value uses
  `text-meta`-scale type with `tabular-nums` (D6). Its `min-width` in `ch` comes from the longer of
  `formatValue(min)` and `formatValue(max)`, so the label never jitters.
- For two thumbs the value reads `a – b` (en dash with spaces).
- `formatValue` also sets each thumb's `aria-valuetext`.
- `label` sets an `aria-labelledby` from Root to the label id. Inside a `Field` with a
  `FieldLabel`, document "use one or the other". Don't detect it automatically.
- Check `ColorSliderProps` (`Omit<SliderProps, "onChange">`) for name collisions with `label`.
  ColorSlider inherits the new props, so make sure they render correctly there.
- Tests: the label renders, `formatValue` reaches `aria-valuetext`, the width is stable across
  values, and the range format is `a – b`.

## Phase 3 — Scale engine (ST-070)

Branch: `feat/st-070-slider-scale-engine`

- New file `src/lib/slider-scale.ts`. It is pure, has no DOM, and is **not exported** in this
  phase.
  - `toPosition(value, { min, max, scale })` and `fromPosition(pos, …)`, for `linear` and `log`.
    Log requires `min > 0`, and throws a clear error otherwise.
  - `snap(value, { min, max, step })`, using the step's decimal precision. This avoids float drift
    such as `0.30000000000000004`.
  - `niceInterval({ span, widthPx, minPx, candidates? })`.
    - Default candidates are step × {1, 2, 5} × 10ⁿ.
    - Unit candidate sets are passed in, for example time (0.25, 0.5, 1, 3, 6 h).
    - It returns the smallest interval that keeps at least `minPx` per tick.
  - `computeTicks({ min, max, step, origin?, widthPx, minTickPx = 6, minLabelPx = 48,
    candidates?, scale })`. It returns `{ value, pos, major, label? }[]`. The origin is always
    labelled. Endpoints are labelled only when they fall on the major interval.
  - `segmentsAllowed({ min, max, step, widthPx })`: true when there are 5–12 steps and each is at
    least 14px wide (D11).
  - `nearestMark(value, marks, thresholdPos)` for magnetic snapping to marks.
- Props on Slider:
  - `scale?: "linear" | "log"`
  - `marks?: Array<number | { value: number; label?: string }>`
- Radix integration for log, the main risk in this plan:
  - Radix works only in linear values. When `scale="log"`, run Radix on internal positions
    `0..1000` with `step={1}`, and map `value`, `defaultValue` and `onValueChange` through
    `toPosition` / `fromPosition` + `snap`.
  - Keyboard steps must happen in value space, so handle `onKeyDown` on Thumb for arrows,
    PageUp/PageDown, Home and End, then call `preventDefault`.
  - Test that controlled and uncontrolled modes both round-trip without drift.
- Tests: table-driven unit tests for every function. Cover log midpoints (25–400% puts 100% at
  50%), negative ranges, decimal steps, the `min === max` guard and narrow widths. The Ruler and
  Segments variants depend on this phase.

## Phase 4 — Variants + origin + track slot (ST-071)

Branch: `feat/st-071-slider-variants`

- `variant?: "default" | "field" | "segments" | "ruler"`. Fader and Readout are **out of scope**,
  per the study.
- `origin?: number`. Hide the Radix Range and render our own fill element, positioned from
  `toPosition(origin)` to the value. It works in every variant.
- `trackBackground?: string` and `showRange?: boolean`. These are the supported replacement for the
  `[data-slot]` gradient hack, which SecoLab uses in 3 shade pickers.
- **Field:**
  - A bordered box at control height with `rounded-md`.
  - Flat, with a `bg-interactive` wash on hover (the ELEVATION.md field dialect).
  - The fill is `--fill` (foreground at 8%) with a 2px primary caret.
  - The label and value sit inside the box.
  - Uses the `ew-resize` cursor.
  - D5 decides whether quarter marks appear.
  - Interaction, v1: Radix's default jump-to-click. Relative scrub is a v2 decision, because it
    needs custom pointer handling over Radix. Get a maintainer call before building it.
  - Double-click or Enter opens an inline input to type an exact value. This needs
    `parseValue?: (text: string) => number`, the inverse of `formatValue`. Esc cancels, and Enter
    or blur commits through `snap`.
  - Invalid state: `aria-invalid` gives the same destructive border as Input (D9).
- **Segments:**
  - N segment children; the current one is raised with `transform: scaleY` (MOTION.md:50).
  - The thumb is visually hidden but focusable, and the focus ring goes on the track.
  - If `segmentsAllowed` is false, log a dev warning (`process.env.NODE_ENV !== "production"`) and
    render `default` instead.
- **Ruler:**
  - Ticks come from `computeTicks`, recomputed by a `ResizeObserver` on the track.
  - Ticks in range use foreground; ticks out of range use `--track`-family colours.
  - The thumb is a 2px needle with the value above it.
  - Tick lift (D8) runs only while dragging or with keyboard focus, uses `transform: scaleY`, and
    is off under `prefers-reduced-motion`.
- **Menus:** stop arrow-key propagation on Thumb `onKeyDown` when the slider is inside a Radix
  menu. SecoLab's `gantt-view.tsx:498` currently does this by hand. Add a test in a
  `DropdownMenu`.
- **States:** read-only (D9) adds `readOnly?: boolean`. It shows the range, hides or mutes the
  thumb, ignores input, and sets `aria-readonly`.
- Add the variant to the cva next to `size`. Existing exports stay.
- Tests: each variant renders; a non-zero origin fills both ways; segments fall back above 12
  steps; ruler tick count changes with width (mock ResizeObserver); Field type-to-edit commits and
  cancels; read-only ignores keys.

## Phase 5 — Showcase slider lab (sibling repo `../nqui-showcase`)

Branch in nqui-showcase: `feat/slider-lab`. Link the local build first with `pnpm nqui:local`.
Running `pnpm add` in the showcase silently breaks the local link; re-run the toggle if it does.

### 5a. Catalog updates

- `src/components/showcase/pages/component-showcase.tsx:1766`, the Slider specimen. Show sizes
  lined up next to Select, Toggle and Button at the same size, every variant, `showValue`,
  `origin`, read-only, disabled, vertical and RTL.
- Same file, around line 3302, the ColorSlider specimen: move it to `trackBackground` and check it
  in dark mode.
- `patterns.tsx:353`: replace the hand-built label with `showValue`.

### 5b. New page `/recipes/sliders` ("Slider lab")

Register it like `/recipes/elevation`:
- A lazy route in `src/App.tsx`.
- `showcase-nav.ts` and its title map.
- The `app-layout.tsx` breadcrumb.
- The `app-sidebar.tsx` icon.

Each example is a realistic screen fragment with real units and copy, not a bare control. Group
them by context:

| Section | Examples (variant · scale) |
|---|---|
| Surfaces | The same 3 sliders on Surface A, Surface B (`bg-muted/50`) and a Popover with `--shadow-float`. This is the elevation check. |
| Settings | Notification volume (default + `showValue`); text size 1–7 (segments); contrast 1–5 (segments); reduce motion paired with a Switch, to compare thumbs |
| Forms | Task progress % (field, step 5) inside `Field` with description and error; budget allocation across 3 linked fields that sum to 100% |
| Inspector | Opacity, blur, radius and letter spacing −10…+10 (field sm with origin), stacked like a design-tool panel |
| Filters | Price range (field range, typeable `$`); date range over a month histogram (ruler); age range (field range); minimum rating 1–5 as a **counter-example** that uses ToggleGroup (D11) |
| Media | Volume; stereo balance (origin 0); playback speed 0.5×–2× (log, mark at 1×); time scrubber over a waveform (`trackBackground`) |
| Maps | Density; open to depth (segments); rotation −180…180° (ruler, origin); zoom 25–400% (log, mark at 100%) |
| Scheduling | Working hours 0–24h (ruler range, 30-minute ticks); schedule offset ±14 days (origin); zoom inside a DropdownMenu (menu keyboard) |
| Finance | Loan amount $1k–$1M (field, log, typeable); risk tolerance 1–7 (segments); term in months (default + marks at 12/36/60) |
| Photo | Exposure ±2 EV (ruler, origin); temperature (gradient `trackBackground` + origin); hue / alpha (ColorSlider) |
| Colour | Shade picker (gradient track, the SecoLab pattern, without the `data-slot` hack) |
| States | Disabled, read-only and invalid side by side; vertical (volume mixer with 4 channels); RTL; sm/default/lg next to Select/Input/ToggleGroup with baseline guides |
| Stress | 120px-wide ruler (ticks thin out); long labels; negative ranges; decimal step 0.05; `min === max`; 2 thumbs at the same value |

Every section must work in both themes and with the showcase brand/appearance controls. Showcase
appearance needs a SecoLab-like indigo preset, so the brand-accent path gets exercised.

### 5c. QA checklist (for the maintainer's local run)

- Keyboard-only pass through every example: Tab, arrows, Shift+arrows, Home/End, Enter to type in
  Field, Esc.
- Pointer: drag, click on the track, and the hit area at track edges. Check the time `onValueCommit`
  fires: once per drag.
- `prefers-reduced-motion`: ticks and segments don't animate.
- Dark mode on all three surfaces: the track is visible and the thumb is easy to find.
- Zoom the browser to 200%: no clipping, and the ruler thins its ticks.

## Phase 6 — Docs, skills, release prep

- `docs/components/nqui-slider.md`: props table, a variant gallery, and a "which variant for which
  data" table (from the study):
  - Field for property and form values.
  - Segments for 5–12 steps.
  - Ruler for values with units.
  - Default for everything else.
  - ToggleGroup below 5 options.
- `docs/components/README.md`: update the Slider row.
- `docs/nqui-skills/RECIPES.md` and `COMPOSITION.md`: a "slider row" recipe, the variant table,
  and D11.
- Consumer skill `skills/consumer/nqui/`: same guidance. Then run `pnpm run sync:skills`.
- `CHANGELOG.md`: one section naming ST-068…ST-071. ST-068 says "visual change".
- `MIGRATION.md`:
  - The thumb lost its border.
  - The track is now 4px.
  - Consumers who override `[data-slot='slider-track']` for gradients should move to
    `trackBackground`.
  - The `bg-muted` track became `bg-track`.
- Set each story to `status: review` once its criteria are ticked, never `done`. Keep the epic
  story tables in sync.

## Verification gates (every phase, in nqui)

```sh
pnpm exec eslint src scripts --max-warnings 0
pnpm test
pnpm run build:lib
pnpm run typecheck
pnpm run verify:exports
make prove-showcase        # after Phases 2–4 (new props): packed tarball → showcase tsc -b
```

Then the maintainer runs the local build and visual QA (Phase 5c) before publishing:

```sh
cd ../nqui-showcase && pnpm nqui:local && pnpm dev
```

## Out of scope

- Fader and Readout variants. They are recorded in the study and not built.
- Relative-scrub Field interaction (v2, needs a maintainer call).
- Exporting `slider-scale.ts`. Keep it internal until a consumer needs ticks elsewhere.
- SecoLab migration of its 10 call sites. That follow-up starts after the release and uses the
  study's call-site map.
- The D10 contrast floor, which is SecoLab token maths.

## Risks

| Risk | Mitigation |
|---|---|
| A visible change for every consumer with no API change | Minor bump, CHANGELOG "visual" callout, MIGRATION notes, showcase surfaces strip |
| Log scale fights Radix's linear model | Internal position space + value-space keyboard; drift tests on controlled round-trips |
| `onValueCommit` timing can't be tested in jsdom | Playwright item in 5c; document it in ST-068 |
| Button `shadow-pressed` swap shifts pixels | Values copied exactly; screenshot diff of all 7 variants in the showcase |
| ColorSlider inherits new props unexpectedly | Phase 2 collision check plus a ColorSlider specimen in 5a |
