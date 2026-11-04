# nqui Slider

> Numeric value or range. One component, four variants. Pick the variant by the shape of the data.

## Import

```tsx
import { Slider } from "@nqlib/nqui"
```

## Basic

```tsx
<Slider value={[50]} onValueChange={([v]) => setVal(v)} aria-label="Volume" />
<Slider value={[20, 80]} onValueChange={setRange} aria-label="Price" />
```

## Label and value

```tsx
<Slider label="Opacity" showValue formatValue={(v) => `${v}%`} defaultValue={[72]} />
<Slider label="Price" showValue formatValue={(v) => `$${v}`} defaultValue={[250, 1200]} max={2000} />
```

`label` renders above the slider and labels every thumb. `showValue` puts the formatted value at
the right end of that row with a fixed width, so the label never shifts. A range reads `a – b`.
`formatValue` also sets each thumb's `aria-valuetext`. When `label` or `showValue` is set,
`className` and `style` go on the outer wrapper (`data-slot="slider-control"`).

Inside a `Field` with its own `FieldLabel`, use one label or the other, not both.

## Which variant

| Data | Variant | Example |
|---|---|---|
| Any number, most of the time | `default` | Volume, brightness |
| A value in a form or property panel; exact entry matters | `field` | Opacity, budget, task progress |
| 5–12 discrete steps | `segments` | Text size, map depth, risk level |
| A value with real units and a scale | `ruler` | Exposure, rotation, working hours |
| 2–4 options | **ToggleGroup**, not a slider | Day / Week |

### `field`

```tsx
<Slider variant="field" label="Radius" formatValue={(v) => `${v} px`} max={32} defaultValue={[12]} />
<Slider variant="field" label="Price" min={0} max={2000} step={10} defaultValue={[250, 1200]}
  formatValue={usd} parseValue={parseMoney} />
```

The field is a flat box at control height (`sm` / `default` / `lg` = h-6 / h-7 / h-8), so it lines
up with Input and Select. The label and value sit inside it, and a 2px caret marks the value.
Double-click, or press **Enter** on the focused field, to type an exact value. **Enter** or blur
commits and **Escape** cancels. Typed values are snapped to `step` and clamped. `parseValue` reads
units back (default: digits, `.` and `-`). `aria-invalid` gives the same destructive border as
Input.

### `segments`

```tsx
<Slider variant="segments" label="Text size" showValue min={1} max={7} defaultValue={[4]} />
```

One block per step, and the current step stands taller. Only valid for 5–12 steps. Outside that
range it renders `default` and warns once in the console.

### `ruler`

```tsx
<Slider variant="ruler" label="Exposure" min={-2} max={2} step={0.1} origin={0}
  formatValue={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)} EV`} defaultValue={[0.7]} />
<Slider variant="ruler" label="Working hours" min={0} max={24} step={0.5}
  tickIntervals={[0.5, 1, 3, 6]} formatValue={clock} defaultValue={[9, 17.5]} />
```

Ticks fill as the value grows and rise around the needle while you drag or focus it (not on
hover). Tick spacing adapts to the track width: minor ticks keep at least 6px apart and labels at
least 48px. Pass `tickIntervals` for unit-aware spacing (hours, degrees). The major labels are
taken from the same list, so they land on 90° or 3h rather than 75° or 2.5h. On `scale="log"` the
ruler spaces ticks by ratio (×2, ×10, …), so the gaps stay even on the track. `tickIntervals` then
must be ratios greater than 1; value-unit steps are ignored. The value shows above the needle.

## Scale, marks and origin

```tsx
// Ratio values: 100% sits in the middle of 25–400%.
<Slider label="Zoom" showValue scale="log" min={25} max={400} step={5}
  marks={[{ value: 100, label: "100%" }]} defaultValue={[100]} />

// Bipolar: the fill grows from 0 toward the thumb in either direction.
<Slider label="Balance" showValue min={-50} max={50} origin={0} defaultValue={[-18]} />
```

- **`scale="log"`** spaces values by ratio. It needs `min > 0`. Arrow and Page keys still step by
  `step` in value units, and they follow `inverted` and `dir` the same way a linear slider does.
- **`marks`** draws reference ticks with optional labels. Pointer drags snap to a mark when within
  2% of the track.
- **`origin`** anchors the fill. It works in every variant and adds a detent mark in `default`.

## Track styling

```tsx
<Slider aria-label="Temperature" min={2000} max={10000} defaultValue={[5600]}
  trackBackground="linear-gradient(to right, oklch(0.62 0.15 250), oklch(0.75 0.15 70))"
  showRange={false} />
```

`trackBackground` paints the track, which grows to 8px so the colours read. `showRange={false}`
hides the fill. Use these instead of overriding `[data-slot='slider-track']`.

## States

- **`disabled`**: dimmed, no input.
- **`readOnly`**: the value stays visible, a click focuses the thumb, the knob goes flat, and
  input is ignored (`aria-readonly`).
- **Invalid** (`field`): `aria-invalid` sets the destructive border and the same 2px ring as Input.
- **Menus**: arrow keys, Home and End stay inside the slider, so it works in a DropdownMenu without
  moving menu focus.

## Sizes

```tsx
<Slider size="sm" defaultValue={[40]} />
<Slider size="default" defaultValue={[40]} />
<Slider size="lg" defaultValue={[40]} />
```

## Notes

- **Thumb:** the **Switch** thumb — same sizes, `bg-thumb` fill (light in both themes), `--shadow-thumb` lift, no border. Focus is the 2px ring every form control uses; there is no hover ring.
- **Rail:** 4px at every size on `bg-track` (foreground-relative, so it reads on page, panel and popover surfaces in both themes). Hover darkens the rail to `bg-track-hover`.
- **`size`:** `sm` | `default` | `lg` scales the thumb (16×12 / 20×16 / 24×20) and the row height (`h-6` / `h-7` / `h-8`) so a slider row lines up with Select, Toggle and Button of the same size. The rail stays 4px.
- **Hit area:** the thumb carries `hit-area-2`, so the target is larger than the visible knob.
- **Styling hooks:** `data-slot="slider" | "slider-track" | "slider-range" | "slider-thumb"` are stable. The root also carries `data-variant`, and `data-active` while dragging or keyboard-focused.
- **Orientation:** `field`, `segments` and `ruler` are horizontal-only and fall back to `default` when vertical.
- **Live examples:** nqui-showcase `/recipes/sliders` (Slider lab).
