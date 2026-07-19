---
id: ST-012
epic: EP-002
title: Combobox with single and multi select
status: done
priority: must
release: 0.7.1
breaking: false
scope: [src/components/ui/combobox.tsx, src/components/index.ts, docs]
api: docs/components/nqui-combobox.md
---

# ST-012 — Combobox with single and multi select

As an app author picking from a long list,
I want a searchable select that handles both one value and many, with chips for the multi case,
so that I don't hand-roll filtering on top of `Select`.

## Acceptance criteria

- [x] `Combobox` ships from the main entry with 18 parts plus the `useComboboxAnchor` hook:
      `ComboboxInput`, `ComboboxBadgeTrigger`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`,
      `ComboboxContent`, `ComboboxGroup`, `ComboboxLabel`, `ComboboxCollection`,
      `ComboboxSeparator`, `ComboboxChips`, `ComboboxChip`, `ComboboxChipsInput`,
      `ComboboxTrigger`, `ComboboxValue`, `ComboboxAnchor`, `ComboboxClear`.
- [x] A full `CoreCombobox*` mirror is exported per the ST-009 convention.
- [x] The root accepts `multiple?: boolean` (default `false`) and
      `onValueChange?: (value: string | string[]) => void`, so the callback type covers both modes.
- [x] Uncontrolled use works in both modes — `defaultValue ?? (multiple ? [] : undefined)`.
- [x] Multi-select renders chips: `ComboboxChips` / `ComboboxChip` / `ComboboxChipsInput`, and
      `ComboboxChip` removes its own value from the array through context.
- [x] `ComboboxClear` resets to `[]` in multi mode and `""` in single mode.
- [x] In multi mode the trigger shows the search field rather than a single selected label
      (`showSelectedLabel && !multiple`), and the popover stays open across selections.
- [x] `ComboboxItem` accepts `keywords` so items whose visible label is insufficient still match.
- [x] Clicking a list item with the mouse toggles selection exactly once — cmdk's delayed `onSelect`
      no longer double-fires against the `onMouseDown` toggle (fixed in 0.7.1, `ff351e6`).
- [x] `docs/components/nqui-combobox.md` documents `multiple`, keyword matching, and the
      Combobox-vs-Select choice.

## Technical notes

- Combobox is built on Radix Popover **plus cmdk** (`src/components/ui/combobox.tsx` imports
  `@/components/ui/command`). Because Combobox is exported from the main entry, `cmdk` is reachable
  from the package root — this is why `cmdk` is the one non-optional subpath peer. See ST-017 and
  ST-041.
- cmdk can invoke `onSelect` twice in one tick. The component guards with
  `skipSelectFromPointerRef`; the 0.7.1 fix clears that ref *inside the skipped `onSelect`* rather
  than on a `setTimeout(0)`, which was racing the delayed callback.
- `ComboboxCollection` + the `items` prop on the root give built-in filtering for large lists;
  hand-rendered `ComboboxItem` children are filtered by cmdk instead.

## Out of scope

- Async / remote option loading — the consumer owns fetching and passes `items`.
- Moving Combobox behind a subpath to drop the cmdk peer from the root — EP-005.

## Bugs

- 2026-07-10 — Multi-select list items required a double-click to toggle: `onMouseDown` applied the
  first toggle and cmdk's delayed `onSelect` immediately undid it, because the duplicate-selection
  guard was cleared on `setTimeout(0)` before `onSelect` ran — fixed in `ff351e6` (0.7.1).
