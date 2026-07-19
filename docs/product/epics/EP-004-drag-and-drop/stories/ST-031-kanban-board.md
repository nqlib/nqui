---
id: ST-031
epic: EP-004
title: Kanban board with cross-column moves
status: review
priority: must
release: 0.8.0
breaking: false
scope: [src/components/dnd, src/entries/dnd.ts, docs, tests]
api: docs/components/nqui-dnd.md
---

# ST-031 — Kanban board with cross-column moves

As an app author building a board UI,
I want ready-made Kanban components plus the drop reconciler,
so that a cross-column board is well under 50 lines and I never hand-write index math.

## Acceptance criteria

- [x] `KanbanBoard` / `KanbanColumn` / `KanbanCard` exported from `./dnd` with
      `KanbanBoardProps` / `KanbanColumnProps` / `KanbanCardProps`
- [x] One board-level `useDragMonitor` drives all moves — not one context per column
- [x] `onCardDrop(result: KanbanDropResult)` reports `cardId`, `fromColumnId`, `fromIndex`,
      `toColumnId`, `toIndex`, with `toIndex: -1` meaning append
- [x] `onColumnDrop` reorders columns; `applyColumnDrop` locates the column by id
- [x] `applyCardDrop(columns, result)` returns a new `KanbanColumns`
      (`Record<columnId, cardId[]>`), locating the card by id so a stale `fromIndex` cannot
      corrupt state, and clamping the destination
- [x] Dropping on an empty column body appends instead of no-op'ing
- [x] Per-column auto-scroll during drag via `pragmatic-drag-and-drop-auto-scroll`
- [x] Reconciler behavior unit-tested in `src/components/dnd/kanban-model.test.ts`;
      render smoke in `src/components/dnd/dnd-render.test.tsx`
- [x] Live browser pass on `nqui-showcase` `/dnd`: cross-column move updated the model and badge
      counts (3→2 / 2→3); a drop on a card's **top edge** inserted *before* it (index 2 → 0)
- [x] `docs/components/nqui-dnd.md` § Kanban matches the shipped props
- [ ] Human review; nothing committed yet

## Technical notes

State shape is placement-only on purpose: `Record<columnId, cardId[]>`, card content kept in a
separate lookup. Drag only ever mutates placement, so the reconciler stays pure and testable and
consumers keep their own card model.

Insert position comes from hitbox closest-edge detection on the target card, not from pointer
midpoint — `getReorderDestinationIndex` adjusts for the dragged card's own removal.

Verification table: `internal-notes/dnd-rebase-handoff.md` § Live browser verification.

## Out of scope

- Keyboard-driven card movement (ST-034).
- Swimlanes, multi-select drag, and virtualized columns.
- Persistence, optimistic rollback, or server reconciliation — consumers own `onCardDrop`.
