# DnD rebase → Pragmatic drag-and-drop — handoff

**Date:** 2026-07-19 · **Branch:** `main` (uncommitted) · **Status:** Phases 0–2 done, tested, building green.

## Why

Three-specialist audit (product / React / UX) of the old `src/components/ui/sortable.tsx`
concluded it's a **single-list reorder widget, not a DnD foundation** — one
`DndContext` per Sortable (no cross-container), list-shaped `T[]` state (no 2-D),
no exposed primitives. You chose to **rebase the general-purpose layer on
Atlassian Pragmatic drag-and-drop** (native DnD, framework-agnostic, powers
Trello/Jira; scales past dnd-kit's measure-all/re-render-all ceiling).

The existing dnd-kit `Sortable` (`./sortable`) is **untouched and still ships** —
no regression for current consumers. The new work lives behind a new `./dnd`
subpath.

## What shipped

New optional-peer subpath `@nqlib/nqui/dnd` (`src/components/dnd/`, entry
`src/entries/dnd.ts`). 17.1 KB raw / **5.5 KB gzip**, atlaskit externalized.

**Phase 0 — primitives:** `useDraggable`, `useDropTarget` (typed `data`/`canDrop`,
hitbox edge detection), `useDragMonitor`, `DropIndicator` (nqui-styled, no ADS
dep), `useAnnouncer` (live region), reorder math (`reorder`,
`getReorderDestinationIndex`, `getInsertionIndex`).

**Phase 1 — Kanban:** `KanbanBoard` / `KanbanColumn` / `KanbanCard`, cross-column
moves via a single board-level monitor, empty-column drop, per-column
auto-scroll, `applyCardDrop` reconciler on a `Record<colId, cardId[]>` model.

**Phase 2 — GridLayout:** snap-to-grid dashboard tiles with drag + resize
(E/S/SE handles) and vertical compaction. Pure geometry in `grid-geometry.ts`
(`moveItem`/`resizeItem`/`resolveLayout`/`cellToPx`/…), all unit-tested.

Docs: `docs/components/nqui-dnd.md`.

## Verification (all green)

- `pnpm exec vitest run` — **113 passed** (83 across the dnd layer: pure-math,
  reorder, kanban-model, grid-geometry + render smoke).
- `pnpm build:lib` — builds; `dist/dnd.{es,cjs}.js` + `dist/entries/dnd.d.ts`.
- `pnpm size` — dnd 5.5 KB gzip < 25 budget.
- `pnpm exec eslint src/components/dnd` — clean.
- `dist-guard.test.ts` — extended so Pragmatic **source** can never be inlined.

### Live browser verification (nqui-showcase `/dnd`)

Driven end-to-end in Chrome against the **local** nqui build. All four core
interactions confirmed by reading back the resulting model, not just by eye:

| Interaction | Result |
|---|---|
| Kanban cross-column drag | Card moved Backlog → In Progress; badge counts updated (3→2 / 2→3) |
| Kanban reorder onto a card's **top edge** | Inserted *before* the target (index 2 → 0) — hitbox edge detection correct |
| Grid tile drag | Sessions pinned at drop cell (6,0)→(0,0); Revenue pushed (0,0)→(0,2); Top pages cascaded (0,2)→(0,4); non-colliding tiles untouched |
| Grid resize (SE handle) | Sessions 3×2 → 5×3; Revenue (0,2)→(0,3), Top pages (0,4)→(0,5) cascade |

Geometry verified against the DOM: `colWidth=89` at 1200px/12 cols, tiles sum to
exactly 1200px with no drift; every item's inline `left/top/width/height` matched
`cellToPx` exactly.

### Bug found and fixed during live testing

`GridLayout` originally committed **the last `onDrag` preview** on drop. On a fast
(or synthetic) drag no intermediate `onDrag` fires, so the preview stayed `null`
and **the move was silently dropped** — reproduced in the browser: the tile
snapped back. Fixed by computing the final layout from the drop event's own
pointer position (`location.current.input`) via a shared `layoutFromPointer()`
helper used by both `onDrag` and `onDrop`. Re-verified green.
- Typecheck: dnd files clean. (Two *pre-existing* errors unrelated to this work:
  `src/components/table/DataTable.tsx` TableMeta, `src/test/init-css.test.ts`
  JS-import — not touched here.)

## Wiring changed

- `package.json`: `./dnd` export; 4 atlaskit packages as optional peers +
  `peerDependenciesMeta`; added to devDeps (pnpm).
- `vite.config.ts`: `dnd` lib entry; `^@atlaskit/pragmatic-drag-and-drop` regex external.
- `scripts/check-bundle-size.js`: `dnd.es.js` budget 25.
- **This repo uses pnpm** (`pnpm-lock.yaml`). `npm install` fails on the
  pnpm-structured `node_modules` — use `pnpm`.

## Round 2 — remaining phases + drop-animation fix (all done)

**Drop animation.** You reported the ghost springing back to origin. Root cause:
we were letting the browser draw the **native** drag image, and on any drop the
platform plays a "return to source" animation. Fixed three ways:
1. `setCustomNativeDragPreview` + a portalled React preview (`useDraggable({
   customPreview: true, previewOffset })`, exposing `previewContainer`). The
   washed-out native screenshot is gone; the source stays in place at 40% opacity.
2. `preventUnhandled.start()/stop()` — kills the platform fly-back for drops that
   land outside a drop target.
3. `useFlip()` — FLIP animation so items *settle* into their new positions
   (200ms, `cubic-bezier(0.2,0,0,1)`) instead of teleporting, plus
   `flashElement()` on the moved item. Both no-op under `prefers-reduced-motion`
   (`usePrefersReducedMotion`).

**Kanban column (group) dragging.** `KanbanColumn` now takes `index` and becomes
draggable by its **header** (a drag handle, so card drags inside don't conflict).
`KanbanBoard` gained `onColumnDrop`; `applyColumnDrop(order, result)` reconciles.
`useDropTarget`'s `edges` now accepts a *function of the drag source*, so one
column target takes cards (append, no edges) and columns (left/right edges).

**Keyboard a11y (the P0 gap) — now shipped.** Native DnD can't be keyboard-driven,
so cards support **Ctrl/Cmd + Arrow** moves: Up/Down reorders within the column,
Left/Right moves to the adjacent column. Focus follows the moved card, it flashes,
and the move is announced via the live region. Cards expose
`aria-roledescription` and `aria-keyshortcuts`. A modifier is required so plain
arrows still scroll. Columns self-register into a board context so cards can
resolve their neighbours without consumer wiring.

**Phase 3 — Canvas.** `Canvas` + `canvas-model.ts`: free `{x,y}` positioning,
snap-to-grid, multi-select (shift/meta-click), marquee selection, rigid group
move, locked nodes, bounds clamping, `bringToFront` on drop. 49 unit tests.

**Phase 4 — SortableList.** `SortableList`/`SortableListItem`/
`SortableListItemHandle` on Pragmatic, API-close to the dnd-kit `Sortable`.
**`src/components/ui/sortable.tsx` was deliberately NOT touched** — the `./sortable`
entry still ships dnd-kit, so nothing regresses. Swapping it is now a one-line
change you can make after review. Migration guide:
`docs/components/nqui-sortable-migration.md` (headline regression: no keyboard
arrow-drag, same reason as above).

### Bug caught in round 2

Registering columns into the board context caused an **infinite render loop**
("Maximum update depth exceeded"): the column effect depended on the whole
context object, whose identity changed on every order update. Fixed by (a)
bailing out of `setColumnOrder` when the order is content-equal, and (b)
depending on the *stable* `registerColumn` rather than the context object.
Caught only because the keyboard test failed in the browser — worth remembering
that context-registry patterns need both guards.

### Round 2 live verification (all read back from the model, not eyeballed)

| Interaction | Result |
|---|---|
| Column reorder by header | `[Backlog, In Progress, …]` → `[In Progress, Backlog, …]` |
| FLIP on card reorder | `card:c3` +54px / `card:c4` −54px keyframes observed via patched `Element.animate` |
| Custom preview | 2 containers created during drag, **0 leaked** after drop (body has only `#root`, a script, PostHog's div) |
| Keyboard Ctrl+→ | Card advanced two columns; `preventDefault` fired; focus followed |
| Canvas drag + snap | Input (40,40) → (272,296) — both multiples of 8; other nodes untouched |
| SortableList reorder | `[Elevation, Motion, Color, …]` → `[Motion, Color, Elevation, …]` |

Totals now: **176 tests**, lint clean, build clean, `dnd.es.js` **11.7 KB gzip**
(budget 25). Showcase `/dnd` exercises all four components.

## Round 3 — insertion gaps instead of an edge matrix

Your observation: with `[A, B]` and **B** in hand, edge detection offers four
hover zones (either side of A, either side of B) but only **"before A"** changes
anything. The other three all resolve back to B's current index — yet they still
rendered a drop indicator, promising a move that never happened.

The correct model is **insertion gaps, not element edges**. For *n* items there
are *n+1* gaps, and the two gaps touching the dragged item are always no-ops, so
there are *n−1* real destinations (with 2 items: exactly 1).

`meaningfulEdges({sourceIndex, targetIndex, axis, sameContainer})` in `reorder.ts`
resolves each candidate edge through `getReorderDestinationIndex` and keeps only
those landing somewhere other than the source index. Two consequences:
- **empty result ⇒ the target is inert** (rejected in `canDrop`), so no indicator;
- **single-edge result ⇒ the whole element resolves to that edge**, so there is
  no dead half. Hovering *anywhere* on A means "before A".

Cross-container drags pass `sameContainer: false` — the card isn't in that list
yet, so every gap is a genuine insertion and both edges stay live.

Two bugs this surfaced in round 2's code:
1. `KanbanColumn` did **not** exclude itself as a drop target, so dragging a
   column lit up its own left/right edges — the literal 4-zone matrix.
2. Indicators rendered off the raw `closestEdge` with no no-op check, in Kanban
   cards, columns, and `SortableList` alike.

Applied to `KanbanCard`, `KanbanColumn`, and `SortableList`. `SortableListContext`
lost its now-dead `edges` field (`axis` fully determines them).

**Verified in the browser:** grabbed item 1 and dropped on the *bottom half* of
item 0 — formerly a dead no-op zone. `[Elevation, Motion, …]` → `[Motion,
Elevation, …]`. 10 new unit tests assert the n−1 property and that no offered
edge ever resolves back to the source index. Totals: **186 tests**.

## Round 4 — the indicator belongs to the gap, not to one item

Follow-on from round 3: once a whole element became a single zone, the indicator
was still drawn hugging *that element's* edge, when what it represents is the
**gap between two objects**. Two defects:

1. **The offset pointed the wrong way.** `DropIndicator` applied a *positive*
   `marginTop`/`marginBottom`, pushing the line **into** the card, away from the
   gap. It is now *negative half the list gap*, which lands it on the gap's
   midpoint. The gap is measured from the parent list's computed
   `row-gap`/`column-gap` (overridable via the `gap` prop), so it adapts to
   whatever spacing the consumer uses.
2. **The inter-item gap fell through to the container.** The pixels between two
   cards belong to the column, not either card, so crossing a gap momentarily
   resolved to the column's "append to end" and flickered the indicator. Card
   and sortable-item drop targets now set `sticky: true`, which keeps the last
   item active while the pointer traverses the gap.

**Verified in the browser** by recording the indicator's rect the moment it
mounts (MutationObserver) and comparing with its neighbours' rects:

| Case | Neighbours | Line centre | True midpoint |
|---|---|---|---|
| Between two cards | bottom 326 / top 334 | **330.5** | 330 |
| Above the first card | list padding / top 280 | **276.5** | 276 |

(the 0.5 is rounding in the measurement). Pre-fix the first case would have been
at 338 — 8px inside the lower card.

## Round 5 — drag bleed between unrelated lists (reported bug)

Symptom you hit: *"I dragged one card and when it landed, another column also
dropped."* Three separate defects in `useFlip`, all mine, all found by probing
`Element.animate` during a real drag:

1. **Descendant selector.** `root.querySelectorAll("[data-flip-id]")` matches all
   descendants, so the board-level FLIP claimed every *card* as well as the
   columns. Each card was animated by two controllers. Now scoped to
   `:scope > [data-flip-id]` (direct children), overridable via `selector`.
   *Evidence: each element went from 2 animate() calls to 1.*
2. **Viewport-relative measurement.** Positions came from
   `getBoundingClientRect()`, so any scroll during the drag made every tracked
   element look like it moved and animated the whole board by the scroll delta —
   the "everything drops at once" effect. Now uses `offsetLeft`/`offsetTop`,
   which are layout-relative and scroll-immune.
   *Evidence: 11 animations across 4 columns → 3, all in the one column that changed.*
3. **Container shifts read as reorders.** On mount (before fonts/scrollbars
   settle) every column shifts by the same amount, which animated the entire
   board on each view switch. Now suppressed by `isReorder()`.

`isReorder(moves)` is a **pure exported function**, deliberately: it is the whole
correctness question of the hook and it cannot be tested through the DOM, because
jsdom reports every `offsetLeft` as 0. It regressed twice while I was fixing it —
first suppressing nothing, then suppressing everything (a lone surviving item is
*trivially* uniform, so single-element reorders stopped animating). 10 unit tests
in `use-flip.test.ts` now pin the rule.

Also hardened: `KanbanBoard` stamps a `boardId` (from `useId`) onto every card and
column payload, and both the monitor and the drop targets reject foreign ids — two
boards on one page can no longer see each other's drags.

**Verified in the browser, both at once:** view switch → **0** animations; a
cross-column drag → **exactly 1** (`card:i-6`, the single survivor in the source
column, translating 96px), with the model changing correctly.

## Round 5b — showcase rebuilt as a real product surface

`/dnd` is no longer a stack of demo cards. It is one workspace ("Payments
Platform", sprint 37) with a persistent chrome — project identity, sync status,
search with ⌘K, team avatars, primary action — and a ToggleGroup view switcher
where **each DnD primitive does a real job**:

| View | Primitive | Role |
|---|---|---|
| Board | Kanban | issues across triage → build → review → shipped, with WIP limits |
| Planner | GridLayout | resizable dashboard tiles (throughput, load, cycle time) |
| Automations | Canvas | trigger → condition → action workflow nodes |
| Backlog | SortableList | rank-ordered priority list |

Follows `.impeccable.md`: warm paper surfaces, 2+1 elevation (column `muted/40`,
cards `background` + border), accent reserved for actions/selection/indicator,
priority as a **dot** (side-stripes are banned), fixed rem type scale for app UI,
mono only for identifiers and numerals. No gradients, glass, or hero metrics.

Two layout fixes worth knowing: the board needs `items-stretch` (the base class is
`items-start`, which collapses columns to content height), and the showcase shell
is a scrolling document, so the view region needs a viewport-derived height —
`h-full` inside `flex-1` resolves to content height and columns never stretch.

## Deliberately deferred (needs your input — not done unsupervised)

1. **Flip the `./sortable` entry to `SortableList`** and drop the four
   `@dnd-kit/*` peers. Everything is built and tested; this is a deliberate
   one-line swap left for your review because it's the only change that can
   regress existing consumers. Read the migration guide first — the keyboard
   arrow-drag regression is real.
2. **A "move to…" menu on cards/columns.** Ctrl+Arrow covers keyboard operation
   now, but a visible menu button is more discoverable and is the pattern
   Atlassian ships. The reconcilers and live region are ready; it's purely a
   menu-UX decision.
3. **Palette drag-to-create on Canvas** (drag a new node in from a toolbox).
   The external/element adapter supports it; not wired.
4. **Touch on a real device.** Still the biggest untested risk — native-drag
   touch behaves differently from desktop and all verification so far has been
   desktop Chrome.
5. **Grid/Canvas keyboard moves.** Kanban has them; `GridLayout` and `Canvas`
   do not yet (arrow-nudge would be the natural equivalent).

## Suggested next steps

1. Review the API surface in `src/components/dnd/index.ts`.
2. ~~Visual QA in nqui-showcase~~ — **done.** A demo page now lives at
   `nqui-showcase/src/components/showcase/pages/dnd-lab.tsx`, routed at **`/dnd`**
   (registered in `nqui-showcase/src/App.tsx`). Run it with:
   ```bash
   cd ../nqui-showcase && pnpm dev     # already switched to LOCAL nqui
   ```
   Still worth doing: **touch on a real device** — native-drag touch is the known
   risk area and was not covered by the desktop browser pass.
3. Decide the keyboard-move menu UX → wire deferred item #1.
4. Commit (nothing is committed yet, in either repo).

## State the showcase was left in

- `nqui-showcase` is toggled to **LOCAL** nqui (`link:../nqui`). Run
  `pnpm nqui:published` there to switch back before any showcase deploy.
- The 4 atlaskit packages were added to `nqui-showcase/package.json` (a real
  consumer needs them, since they're optional peers of nqui).
- **pnpm gotcha:** running `pnpm add <anything>` in the showcase re-resolves
  `@nqlib/nqui` from the registry and **silently breaks the `link:`** — the
  `./dnd` export then 404s in Vite. Re-run
  `USE_LOCAL_NQUI=true node scripts/toggle-nqui.js` to restore it, and
  `rm -rf node_modules/.vite` before restarting the dev server.
