---
id: ST-032
epic: EP-004
title: GridLayout — snap grid with drag, resize and compaction
status: review
priority: must
release: 0.8.0
breaking: false
scope: [src/components/dnd, src/entries/dnd.ts, docs, tests]
api: docs/components/nqui-dnd.md
---

# ST-032 — GridLayout — snap grid with drag, resize and compaction

As an app author building a dashboard,
I want draggable, resizable tiles on a snap grid with collision handling,
so that I get react-grid-layout-class behavior without another dependency.

## Acceptance criteria

- [x] `GridLayout` exported from `./dnd` with `GridLayoutProps`
      (`layout`, `onLayoutChange`, `cols`, `rowHeight`, `gap`, render-prop `children`)
- [x] Fully controlled: the component never holds committed layout state, only drag preview
- [x] Tiles drag to a snapped cell and resize via E / S / SE handles
- [x] Colliding tiles are pushed down and the layout vertically compacted by `resolveLayout`
- [x] Geometry is pure and exported: `cellToPx`, `clampItem`, `collides`, `columnWidth`,
      `layoutRowCount`, `moveItem`, `pxToCell`, `pxToSpan`, `resizeItem`, `resolveLayout`
      (+ `GridConfig`, `GridItem`, `PxRect`)
- [x] `src/components/dnd/grid-geometry.test.ts` covers move, resize, clamp, collision and
      compaction; render smoke in `dnd-render.test.tsx`
- [x] Live browser pass on `/dnd`: tile dragged to (0,0) pinned there, Revenue pushed (0,0)→(0,2),
      Top pages cascaded (0,2)→(0,4), non-colliding tiles untouched; SE resize 3×2 → 5×3 cascaded
      correctly
- [x] Geometry checked against the DOM: `colWidth=89` at 1200px / 12 cols, tiles sum to exactly
      1200px, every inline `left/top/width/height` matched `cellToPx`
- [x] `docs/components/nqui-dnd.md` § GridLayout matches the shipped props
- [ ] Human review; nothing committed yet

## Technical notes

All math lives in `grid-geometry.ts` with no React and no DOM, which is what makes the behavior
verifiable from state rather than by eye (epic success metric 3). `grid-layout.tsx` only converts
pointer positions to cells and renders.

Drop must derive its final layout from the drop event's own pointer position, never from retained
preview state — see the bug below.

## Bugs

- 2026-07-19 — `GridLayout` committed the last `onDrag` preview on drop, so a fast (or synthetic)
  drag that fired no intermediate `onDrag` left the preview `null` and silently dropped the move —
  the tile snapped back. Fixed by computing the final layout from the drop event's pointer
  (`location.current.input`) through a shared `layoutFromPointer()` helper used by both `onDrag`
  and `onDrop`. Uncommitted; see `internal-notes/dnd-rebase-handoff.md`.

## Out of scope

- Keyboard tile movement and resize (ST-034).
- Free `{x,y}` positioning without a grid (ST-035).
- Horizontal compaction, responsive breakpoint layouts, and static/locked tiles.
