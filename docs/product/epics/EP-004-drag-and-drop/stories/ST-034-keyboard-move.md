---
id: ST-034
epic: EP-004
title: Keyboard-accessible card and tile movement
status: backlog
priority: must
release: unset
breaking: false
scope: [src/components/dnd, src/entries/dnd.ts, docs, skills, tests]
api: docs/components/nqui-dnd.md
---

# ST-034 — Keyboard-accessible card and tile movement

As a keyboard or screen-reader user of a board or dashboard built with `@nqlib/nqui/dnd`,
I want to move a card or tile without a pointer,
so that the interaction is operable at all, not merely announced.

## Acceptance criteria

- [ ] Every `KanbanCard` exposes a focusable move affordance reachable by Tab
- [ ] The affordance can move a card to another column and up/down within its column
- [ ] `GridLayout` tiles can be moved (and ideally resized) by keyboard
- [ ] Keyboard moves call the **same** `onCardDrop` / `onLayoutChange` reconcilers as pointer
      drags — no second code path, no second state model
- [ ] Each move announces its outcome through `useAnnouncer` ("Card moved to In Progress,
      position 2 of 4")
- [ ] Focus stays on the moved item after the move
- [ ] Tests cover keyboard move in `src/components/dnd/dnd-render.test.tsx` (or a sibling)
- [ ] `docs/components/nqui-dnd.md` § Accessibility replaces the "not yet wired" warning with the
      shipped pattern; consumer skill regenerated
- [ ] `pnpm size` shows `dnd.es.js` still under the 25 KB gzip budget

## Technical notes

**Blocked on a UX decision — not startable.** Pragmatic drag-and-drop uses the browser's native
drag, which is not keyboard-operable at all; no amount of key handling on the draggable fixes it.
The accepted pattern is an explicit affordance (a per-card menu button) rather than a
"lift / arrow-keys / drop" pseudo-drag mode.

**Open question for the maintainer:** what is the affordance? A per-card menu button opening
"Move to column…" + "Move up / Move down"? Always visible, or on focus/hover? Does `GridLayout`
get the same menu, or arrow-key nudging on a focused tile? The reconcilers, hooks and live region
are already in place — only the UX shape is undecided, and guessing it would ship the wrong API.

This is the **P0** finding of the UX audit that produced the rebase; the gap is currently
documented in `docs/components/nqui-dnd.md`. See `internal-notes/dnd-rebase-handoff.md`
§ Deliberately deferred, item 1.

## Out of scope

- Touch-device certification (epic-level exclusion).
- Keyboard support for `./sortable` — dnd-kit already provides it there; it re-enters scope at
  ST-036.
- Full drag-and-drop ARIA authoring-practices instrumentation beyond the live region.
