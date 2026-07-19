---
id: EP-004
title: Drag & drop
status: in-progress
owner: maintainer
---

# EP-004 — Drag & drop

## Goal

Give app authors a general-purpose drag-and-drop **foundation** — primitives plus ready-made
Kanban and dashboard-grid components — instead of a single-list reorder widget, at a bundle cost a
component library can justify.

## Success metrics

- A cross-column Kanban board in a consumer app in well under 50 lines, with the drop reconciler
  supplied by nqui.
- `./dnd` stays ≤ 25 KB gzip with the Pragmatic packages externalized as optional peers.
- Drag behavior is verifiable from state, not from eyeballing: the reorder/grid math is pure and
  unit-tested.

## Scope — In

- `@nqlib/nqui/dnd` subpath (`src/components/dnd/`, entry `src/entries/dnd.ts`) on Atlassian
  Pragmatic drag-and-drop.
- Primitives: `useDraggable`, `useDropTarget`, `useDragMonitor`, `DropIndicator`, `useAnnouncer`,
  reorder math.
- `KanbanBoard` / `KanbanColumn` / `KanbanCard` + `applyCardDrop`.
- `GridLayout` (drag, resize, vertical compaction) + pure `grid-geometry`.
- Keyboard-accessible movement (deferred, story open).
- Eventual migration of `./sortable` off dnd-kit.

## Scope — Out (explicit)

- Changing the shipped dnd-kit `./sortable` surface before ST-036 — 0.7.x consumers must not regress.
- A visual builder / Retool clone. ST-035 delivers Canvas positioning primitives, not an app.
- Touch-device certification — native drag on touch is a known risk area, unverified (see ST-034).

## Dependencies

- EP-005 (packaging) owns the optional-peer + bundle-budget mechanics this epic relies on.

## Public API surface

`src/entries/dnd.ts` → `./dnd`; `src/entries/sortable.ts` → `./sortable`;
`docs/components/nqui-dnd.md`; the atlaskit and dnd-kit peer declarations in `package.json`.

## Stories

| ID | Title | Status | Release |
|---|---|---|---|
| ST-030 | DnD primitives on Pragmatic | review | 0.8.0 |
| ST-031 | Kanban board with cross-column moves | review | 0.8.0 |
| ST-032 | GridLayout — snap grid with drag, resize and compaction | review | 0.8.0 |
| ST-033 | `./dnd` docs and showcase lab | review | 0.8.0 |
| ST-034 | Keyboard-accessible card and tile movement | backlog | unset |
| ST-035 | Canvas — free positioning and drag-to-create | backlog | unset |
| ST-036 | Sortable rebuilt on Pragmatic; drop dnd-kit peers | backlog | unset |

## Implementation references

- `internal-notes/dnd-rebase-handoff.md` — the phase-by-phase build record, live-browser
  verification table, and the deferred list ST-034/035/036 come from.
- `memory/dnd-pragmatic-rebase.md` — the decision and its rationale.
- Showcase lab: `nqui-showcase/src/components/showcase/pages/dnd-lab.tsx` (route `/dnd`).
