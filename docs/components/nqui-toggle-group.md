# nqui ToggleGroup

> **Single or multiple selection** from 2–5 options. Inline. **Default for toolbar/inline UI** (view mode, format bar, size picker).

## When to Use

- **Selection:** Single (`type="single"`) or Multiple (`type="multiple"`)
- **Options:** 2–5
- **Layout:** Inline

**Design is inferred from type:**
- `type="single"` – Segmented style (primary fill on selected). E.g. view mode, scale type (Linear/Log).
- `type="multiple"` – Outline style (muted fill on selected). E.g. format toolbar (bold, italic, underline).

**Examples:**
- Single: view mode, scale type (Linear/Log), size (Small/Medium/Large)
- Multiple: format toolbar (bold, italic, underline)

**Use Select** when 5+ options or no space.

## Import

```tsx
import { ToggleGroup, ToggleGroupItem, ToggleGroupSeparator } from "@nqlib/nqui"
```

## Basic

```tsx
{/* Single (segmented, primary fill) */}
<ToggleGroup type="single" value={v} onValueChange={setV}>
  <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
  <ToggleGroupItem value="log">Log</ToggleGroupItem>
</ToggleGroup>

{/* Multiple (outline) */}
<ToggleGroup type="multiple" value={vals} onValueChange={setVals}>
  <ToggleGroupItem value="bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic"><ItalicIcon /></ToggleGroupItem>
</ToggleGroup>
```

## With manual separators

Dividers are shown via item borders by default (using `foreground/20` for theme-safe visibility). Use `ToggleGroupSeparator` (nqui Separator) when `separator={false}` or `spacing>0` for explicit separator placement:

```tsx
<ToggleGroup type="single" variant="outline" separator={false}>
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupSeparator />
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
  <ToggleGroupSeparator />
  <ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>
```

## Layout — let the group own it

**Never pass layout classes to `<ToggleGroup>`.** It already handles its own row, gaps and overflow; overriding them is the #1 source of broken toolbars.

| Don't | Why | Do instead |
|-------|-----|------------|
| `className="flex-wrap"` | It's deliberately **one row that scrolls horizontally** (hidden scrollbar) when the parent is too narrow. Wrapping makes the pill grow tall, push content down, and break its shape. | Nothing — narrow parents already scroll. |
| `className="gap-1"` (any `gap-*`) | `spacing={0}` is **segmented mode**: items are `rounded-none` because they must sit *flush* inside one pill shell. A gap re-exposes the shell between items, so a hover fill stops short of its neighbour and reads as a sliver. | `spacing={2}` — the prop also drops the shell. |
| `overflow-*` overrides | The cross axis is pinned `hidden` on purpose (see below). | Nothing. |

```tsx
// ✅ narrow parent → scrolls sideways, stays one row
<ToggleGroup type="single" value={v} onValueChange={setV}>…</ToggleGroup>

// ✅ want separated pills? use the prop, not a class
<ToggleGroup type="single" spacing={2} value={v} onValueChange={setV}>…</ToggleGroup>

// ❌ breaks the pill: wraps tall, and becomes draggable on the cross axis
<ToggleGroup className="flex flex-wrap gap-1">…</ToggleGroup>
```

**Why the cross axis is pinned `hidden`:** setting overflow on one axis makes CSS resolve the other from `visible` to `auto`. Items carry a `hit-area-*` `::before` that intentionally overhangs the row (a larger tap target), which would then count as scrollable content — so the group could be dragged sideways/up and the items would slide out of alignment. The group pins `overflow-y: hidden` (horizontal) / `overflow-x: hidden` (vertical) to prevent that. (`overflow: clip` is not an option: when the other axis is `auto`, CSS computes `clip` → `hidden`.)

## Context

Place in realistic app context (document toolbar, chart settings panel). Never show in isolation. Reference: `src/pages/ComponentShowcase.tsx` → Toggle & ToggleGroup section (document editor, chart settings).

## Notes

- `spacing={0}` (default) = shared border, no gap, dividers between items (border using `foreground/20`). `spacing={2}` = gap between items, no dividers.
- Selected: default/outline → `bg-secondary` + gradient + shadow; segmented → `bg-primary` + gradient + shadow. Ensures visibility on card, sidebar, varied backgrounds.
- Pass `variant="outline"` to override single’s default segmented style.
