---
id: ST-064
epic: EP-002
title: Command search-result density, list chrome, ScrollArea
status: done
priority: should
release: 0.7.4
breaking: false
scope: [src/components/ui/command.tsx, src/components/ui/select.tsx, src/components/ui/combobox.tsx, src/entries/command.ts, docs/components/nqui-command.md, docs/components/nqui-command-palette.md, docs/components/nqui-select.md, docs/components/nqui-combobox.md]
api: docs/components/nqui-command.md
---

# ST-064 — Command search-result density, list chrome, ScrollArea

As an app author building a ⌘K **search** palette (not only a flat command menu),
I want multi-line CommandItem slots, list padding that works without groups, a
styled ScrollArea thumb, and a raisable max height,
so that search results hug their highlight and match other nqui scrolling surfaces.

## Acceptance criteria

- [x] `CommandItemContent`, `CommandItemTitle`, `CommandItemMeta`, and
      `CommandItemDescription` are exported from `./command` (and the story’s
      `api` page documents them).
- [x] Default `CommandItem` (plain text / icon / shortcut children) keeps the
      existing single-line command-menu density (`min-h-7`, `items-center`,
      `px-2.5 py-1.5`).
- [x] When `CommandItemContent` is present, the row switches to start-aligned
      stacked layout; **vertical padding stays `py-1.5`** while the text block
      grows (2-line title+description and 3-line title+meta+description).
- [x] `CommandList` includes `p-1` so a bare list (no `CommandGroup`) does not
      sit flush under `CommandInput`; `CommandGroup` outer `p-1` is removed so
      grouped lists do not double-pad.
- [x] `CommandList` composes nqui `ScrollArea` + `ScrollBar`; the **scroll
      container remains the element that receives overflow** so cmdk
      `scrollIntoView` still works; `scroll-py-1` lives on that scroll container.
- [x] Max height defaults to `18rem` via `--command-list-max-height` (was hard
      `max-h-72`); consumers can raise it with the CSS variable or a
      `maxHeight` prop without `!` overrides.
- [x] `docs/components/nqui-command.md` covers search-result composition,
      bare-list padding, ScrollArea/thumb, and max-height escape.
- [x] CHANGELOG `[Unreleased]` lists the additions (non-breaking).

## Technical notes

- Slots mirror `Item` / `ItemTitle` / `ItemDescription` density tricks
  (`has-[[data-slot=…]]`), but stay command-scoped — do not reuse `Item*`
  inside cmdk rows (different scale and selection CSS).
- ScrollArea’s default export already mounts `<ScrollBar />`. Compose primitives
  if the Viewport must carry `scroll-py-1` / max-height; do **not** nest a
  second `overflow-y-auto` on `CommandPrimitive.List` (that breaks thumb sync
  and double-scrolls).
- `no-scrollbar` on the old native list goes away once the styled thumb is the
  intentional affordance.

## Out of scope

- Search backends, ranking, or default command sets.
- Making `cmdk` an optional peer (ST-041).
- Changing `CommandPalette` shortcut / dialog chrome beyond inheriting list fixes.
