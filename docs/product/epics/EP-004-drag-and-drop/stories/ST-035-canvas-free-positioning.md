---
id: ST-035
epic: EP-004
title: Canvas — free positioning and drag-to-create
status: backlog
priority: could
release: unset
breaking: false
scope: [src/components/dnd, src/entries/dnd.ts, docs, skills, tests]
api: docs/components/nqui-dnd.md
---

# ST-035 — Canvas — free positioning and drag-to-create

As an app author building a Retool-style builder,
I want free `{x, y}` positioning and a palette I can drag new items out of,
so that I can compose a canvas surface without a grid and without leaving `@nqlib/nqui/dnd`.

## Acceptance criteria

- [ ] `Canvas` (+ `CanvasProps`) exported from `./dnd`, controlled via
      `items: {id, x, y, width, height}[]` and `onItemsChange`
- [ ] Items drag to arbitrary `{x, y}`; no snapping, no compaction, no collision push
- [ ] Optional snap-to-grid opt-in reusing `pxToCell` / `cellToPx` from `grid-geometry.ts`
      rather than a second geometry module
- [ ] Palette drag-to-create: dragging a palette entry onto the canvas emits a create event with
      the drop position, and does not mutate palette state
- [ ] Marquee / shift-click multi-select, with a group drag that moves the selection together
- [ ] Positioning and selection math is pure and unit-tested (`canvas-geometry.test.ts`)
- [ ] `docs/components/nqui-dnd.md` gains a Canvas section; consumer skill regenerated
- [ ] `pnpm size` shows `dnd.es.js` still under the 25 KB gzip budget
- [ ] Live lab coverage added to `nqui-showcase` `/dnd`

## Technical notes

Phase 3 of the rebase. The existing primitives already support it — `useDraggable` +
`useDropTarget` + `useDragMonitor` give absolute pointer positions, so this is a component and a
geometry module, not new primitive work.

Watch the budget: multi-select and marquee are the largest additions the `./dnd` entry would take,
and 25 KB gzip is the epic's committed ceiling (currently 5.5 KB).

Scope discipline — the epic explicitly excludes shipping a visual builder. This story delivers
positioning primitives that a builder can be written against, nothing more.

See `internal-notes/dnd-rebase-handoff.md` § Deliberately deferred, item 2.

## Out of scope

- A visual builder / Retool clone as a product surface.
- Z-order UI, grouping, alignment guides, snapping to other items' edges.
- Undo/redo — consumers own the item array.
- Keyboard positioning; it follows the pattern ST-034 settles.
