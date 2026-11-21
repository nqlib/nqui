# nqui ColorPicker

> Color picker with OKLCH sliders. Popover or inline. Value is an OKLCH string by default, or `#rrggbb` with `format="hex"`.

## Import

```tsx
import { ColorPicker, type ColorPickerFormat } from "@nqlib/nqui"
```

## Basic

```tsx
const [color, setColor] = useState("oklch(0.5 0.15 240)")

<ColorPicker value={color} onChange={setColor} variant="popover" />
```

## Inline

```tsx
<ColorPicker value={color} onChange={setColor} variant="inline" />
```

## Hex format

Use `format="hex"` when your store needs `#rrggbb`.

```tsx
const [color, setColor] = useState("#27272a")

<ColorPicker format="hex" value={color} onChange={setColor} />
```

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | `string` | `"oklch(0.5 0.15 240)"` (oklch) / `"#006aaf"` (hex) | The colour, in the active `format`. |
| `onChange` | `(color: string) => void` | — | Called with the colour in the active `format`. |
| `format` | `"oklch" \| "hex"` | `"oklch"` | Value format of `value` and `onChange`. |
| `variant` | `"popover" \| "inline"` | `"popover"` | Popover trigger or inline panel. |
| `disabled` | `boolean` | — | Disables the popover trigger. |
| `className` | `string` | — | On the trigger (popover) or the wrapper (inline). |

## Value Format

**`format="oklch"` (default).** `value` and `onChange` use `oklch(L C H)` strings, for example
`"oklch(0.75 0.15 240)"`. L is 0..1, C is chroma and H is hue in degrees. This matches the nqui
tokens.

**`format="hex"`.** `value` is `#rrggbb`. The picker also accepts `#rgb` and uppercase.
`onChange` always emits lowercase `#rrggbb`. This applies to the sliders, the presets and the HEX
field. A hex value that you pass in shows and comes back unchanged. The picker does not
regenerate it through the OKLCH maths. Only a move of a slider, a preset or a new HEX entry
changes it.

Each format also reads a value of the other format. `onChange` always emits the active format.

## Convert at your boundary

```tsx
import { colorToHex, colorToOklch } from "@nqlib/nqui"

colorToHex("oklch(0.62796 0.25768 29.234)") // "#ff0000"
colorToOklch("#ff0000")                      // "oklch(0.62796 0.25768 29.234)"
colorToHex("not a colour")                   // null
```

Each helper reads `#rgb`, `#rrggbb` or `oklch(L C H)`. Hex → OKLCH → hex is exact.

## HEX field

- Type a hex one character at a time. The field commits a valid 6-digit value as you type.
- Blur or Enter also commits `#rgb`.
- Blur reverts an invalid value. Escape reverts the draft.

## Notes

- The sliders work in OKLCH. A colour outside sRGB is clamped per channel when it becomes hex.
- The panel shows OKLCH, HEX and HSL, each with a copy button.
- The popover panel is about 480px high. When the window has less space on the side of the
  trigger, the panel takes the available height and scrolls. It keeps 8px from the window edge.
- Alpha is not supported.
