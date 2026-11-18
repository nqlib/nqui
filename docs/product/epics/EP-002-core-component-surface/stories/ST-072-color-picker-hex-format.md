---
id: ST-072
epic: EP-002
title: ColorPicker hex format option and correct colour maths
status: review
priority: should
release: 0.10.0
breaking: false
scope: [src/components/custom/color-picker.tsx, src/lib/oklch.ts, src/lib/index.ts, src/components/debug/ui-tester.tsx, docs]
api: docs/components/nqui-color-picker.md
---

# ST-072 — ColorPicker hex format option and correct colour maths

As an app author whose store keeps colours as `#rrggbb`,
I want `ColorPicker` to take and emit hex when I ask for it, and to convert colours correctly,
so that a hex colour I pass in comes back unchanged and the picker shows the colour I chose.

## Why

The conversion maths in `color-picker.tsx` skipped steps of the OKLab formula. The forward
direction had no cube root and no second matrix. The inverse had no cube, no second matrix and no
sRGB gamma. Measured round trips before the fix:

| Input | Output |
|---|---|
| `#27272a` | `#a5a6a6` |
| `#091f65` | `#98a2bf` |
| `#808080` | `#cccccc` |
| `oklch(0.628 0.258 29)` (sRGB red) | `#000000` |

The HEX field was also controlled by the computed hex. It called `onChange` only on a valid
6-digit value, so a user could not type a new value one character at a time.

All nqui and shadcn tokens are OKLCH, so OKLCH stays the default value contract. Some callers
store hex. They get an opt-in `format="hex"`.

## Acceptance criteria

- [x] The conversions use Björn Ottosson's OKLab maths in one module, `src/lib/oklch.ts`.
- [x] The forward path is: sRGB gamma decode, LMS matrix, cube root, OKLab matrix, OKLCH.
- [x] The inverse path is: OKLCH, OKLab, LMS', cube, linear sRGB matrix, sRGB gamma encode,
      clamp to 0..1, 8-bit.
- [x] The hex, OKLCH and HSL displays use the module. `ColorPicker` and the debug UI tester
      have no copy of the maths.
- [x] `format?: "oklch" | "hex"` is a prop. The default is `"oklch"`.
- [x] In the default `"oklch"` format, `value` and `onChange` use `oklch(L C H)` strings. The
      default `value` is `"oklch(0.5 0.15 240)"`, as before.
- [x] In `"hex"` format, `value` is `#rrggbb`. `#rgb` and uppercase are accepted.
- [x] In `"hex"` format, every `onChange` emits lowercase `#rrggbb`. This applies to the
      sliders, the presets and the HEX field. With no `value`, the picker starts at `#006aaf`,
      the hex of `oklch(0.5 0.15 240)`.
- [x] In `"hex"` format, a hex value that the caller passes in shows and is emitted again
      unchanged. The picker keeps the incoming hex. It does not regenerate it through the float
      maths.
- [x] Each format also reads a value of the other format. `onChange` emits the active format.
- [x] The HEX field keeps a local draft. It commits a valid 6-digit value on change. It also
      commits `#rgb` on blur or Enter. It reverts an invalid draft on blur. Escape reverts the
      draft.
- [x] The quick-colour presets emit in the active format.
- [x] The main entry exports the type `ColorPickerFormat` and the helpers `colorToHex` and
      `colorToOklch`. Each helper reads hex or `oklch()` and returns null on invalid input.
- [x] Tests cover:
  - [x] An exact hex → OKLCH → hex round trip for `#000000`, `#ffffff`, `#808080`, `#27272a`,
        `#ff0000`, `#00ff00`, `#0000ff`, `#091f65` and 200 random colours.
  - [x] Reference values: `#ff0000` ≈ `oklch(0.628 0.258 29.2)` and `#ffffff` ≈ L 1, C 0.
  - [x] The default format emits `oklch(...)`. `format="hex"` emits `#rrggbb`.
  - [x] A passed hex shows unchanged in the HEX field.
  - [x] Typing a hex in the HEX field calls `onChange` once with the lowercase value.
  - [x] `colorToHex` and `colorToOklch`.
- [x] The component doc, the components README rows, the consumer skill and the CHANGELOG are
      updated.

## Technical notes

- OKLCH stays the value contract of ST-014. Hex is an opt-in format. This story does not change
  an ST-014 criterion.
- The value that the caller echoes back as `value` does not reset the sliders. The picker
  remembers the last value it emitted. This stops the sliders from snapping to the 8-bit or
  gamut-clamped colour.
- An achromatic colour (grey, black, white) has no hue. The picker keeps the previous hue, so the
  hue slider does not jump.
- `oklch()` strings from the HEX field and from `colorToOklch` carry 5 decimals for L and C and 3
  for H. This is enough for an exact 8-bit round trip.
- The other helpers in `src/lib/oklch.ts` stay internal.

## Bugs

- 2026-11-18 — The picker ignored a caller `value` equal to its last emitted value after the
  caller had set a different value (e.g. undo back to a picked colour). Fixed: an external value
  clears the remembered emitted value. Regression test in `color-picker.test.tsx`.

## Out of scope

- Alpha / opacity editing.
- Other colour formats (`rgb()`, `hsl()`, named colours) as `value` or helper input.
