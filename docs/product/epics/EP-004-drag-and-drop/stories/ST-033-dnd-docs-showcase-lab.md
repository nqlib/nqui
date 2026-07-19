---
id: ST-033
epic: EP-004
title: ./dnd docs and showcase lab
status: review
priority: must
release: 0.8.0
breaking: false
scope: [docs, skills, nqui-showcase]
api: docs/components/nqui-dnd.md
---

# ST-033 — `./dnd` docs and showcase lab

As an app author or agent adopting `@nqlib/nqui/dnd`,
I want one doc page that matches the shipped exports and a live lab I can drive,
so that I can install the optional peers and copy a working board or dashboard without reading source.

## Acceptance criteria

- [x] `docs/components/nqui-dnd.md` exists with Install, Primitives, Kanban, GridLayout and
      Accessibility sections, and matches `src/components/dnd/index.ts`
- [x] Install section names all four optional peers
      (`@atlaskit/pragmatic-drag-and-drop`, `-hitbox`, `-auto-scroll`, `-live-region`)
- [x] The Accessibility section states plainly that keyboard drag is **not** wired and points at
      the `onCardDrop` reconciler as the interim keyboard path (ST-034)
- [x] Live lab in the **sibling** repo: `nqui-showcase/src/components/showcase/pages/dnd-lab.tsx`,
      routed at `/dnd` in `nqui-showcase/src/App.tsx` — this repo gains no catalog
      (see `CLAUDE.md` § Catalog boundary)
- [x] The lab runs against the local build (`pnpm nqui:local` / `link:../nqui`) with the four
      atlaskit packages added to the showcase's own `package.json`, as a real consumer must
- [x] Desktop Chrome pass driven end-to-end, asserting on the resulting model (ST-031 / ST-032)
- [ ] Touch verified on a real device — **not done**; native-drag on touch is the known risk area
- [ ] `docs/components/README.md` row added and consumer skill regenerated
      (`sync:skills` + `skill:validate`)
- [ ] Human review; nothing committed yet

## Technical notes

The showcase is a separate repo and a separate PR; only the doc page and the skill sync land here.
When toggled to local nqui, running `pnpm add <anything>` in the showcase re-resolves
`@nqlib/nqui` from the registry and silently breaks the `link:` — `./dnd` then 404s in Vite.
Restore with `USE_LOCAL_NQUI=true node scripts/toggle-nqui.js` and clear `node_modules/.vite`.
Switch back with `pnpm nqui:published` before any showcase deploy.

Full state-of-the-showcase notes: `internal-notes/dnd-rebase-handoff.md` § State the showcase was
left in.

## Out of scope

- Adding a catalog, recipes app or Vite showcase to this repo.
- Touch-device certification — tracked as an epic-level explicit exclusion; the affordance work is
  ST-034.
- Doc pages for Canvas (ST-035) or the rebuilt Sortable (ST-036).
