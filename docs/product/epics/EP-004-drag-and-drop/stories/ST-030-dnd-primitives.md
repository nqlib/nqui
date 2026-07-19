---
id: ST-030
epic: EP-004
title: DnD primitives on Pragmatic
status: review
priority: must
release: 0.8.0
breaking: false
scope: [src/components/dnd, src/entries/dnd.ts, package.json, vite.config.ts, docs, tests]
api: docs/components/nqui-dnd.md
---

# ST-030 — DnD primitives on Pragmatic

As an app author building any drag interaction with `@nqlib/nqui`,
I want low-level draggable / drop-target / monitor primitives on a single global drag model,
so that I can build cross-container and 2-D interactions instead of only single-list reorder.

## Acceptance criteria

- [x] New `./dnd` subpath: `src/entries/dnd.ts` re-exports `src/components/dnd`, and
      `package.json` `exports["./dnd"]` maps to `dist/dnd.{es,cjs}.js` + `dist/entries/dnd.d.ts`
- [x] `useDraggable`, `useDropTarget` (typed `data`/`canDrop`, hitbox closest-edge detection) and
      `useDragMonitor` are exported from `./dnd` with their option/result types
- [x] `DropIndicator` renders from nqui tokens with no `@atlaskit/pragmatic-drag-and-drop-react-*`
      or ADS dependency
- [x] `useAnnouncer` / `announceLive` / `cleanupLiveRegion` wrap one shared ARIA live region
- [x] Pure reorder math exported: `reorder`, `getReorderDestinationIndex`, `getInsertionIndex`,
      unit-tested in `src/components/dnd/reorder.test.ts`
- [x] Shared types exported: `DragAxis`, `DragData`, `DragSource`, `DropTargetState`, `Edge`
- [x] The 4 `@atlaskit/pragmatic-drag-and-drop*` packages are **optional** peers
      (`peerDependenciesMeta`) and `vite.config.ts` externalizes them via
      `/^@atlaskit\/pragmatic-drag-and-drop/`
- [x] `scripts/check-bundle-size.js` carries a `dnd.es.js` budget of 25 KB gzip; actual 5.5 KB
- [x] `src/test/dist-guard.test.ts` asserts Pragmatic **source** can never be inlined into `dist`
- [x] `pnpm exec vitest run` green — 113 tests, 83 of them in the dnd layer
- [ ] Human review of the exported surface in `src/components/dnd/index.ts`; nothing committed yet

## Technical notes

Thin React wrapper over Pragmatic — no re-implementation of its event model. Every hook returns a
ref to attach plus live state, so consumers never touch `combine()`/`monitorForElements` directly.
`src/components/dnd/internal.ts` holds the non-exported glue; keep it out of `index.ts`.

The main entry must never import from `./dnd` — that would make an optional peer mandatory
(§6 seam rule). `dist-guard` is the enforcement, not convention.

Background and the phase-by-phase build record: `internal-notes/dnd-rebase-handoff.md`.
Decision record: `memory/dnd-pragmatic-rebase.md`.

## Out of scope

- Keyboard-operable dragging (ST-034) — the hooks and live region exist, the affordance does not.
- Any change to `./sortable` or its dnd-kit peers (ST-036).
- Canvas / free positioning primitives beyond what `useDraggable` already gives (ST-035).
