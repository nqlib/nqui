---
id: ST-036
epic: EP-004
title: Sortable rebuilt on Pragmatic; drop dnd-kit peers
status: backlog
priority: should
release: unset
breaking: true
scope: [src/components/ui/sortable.tsx, src/entries/sortable.ts, package.json, docs, skills, tests]
api: docs/components/nqui-sortable.md
---

# ST-036 — Sortable rebuilt on Pragmatic; drop dnd-kit peers

As an app author using `@nqlib/nqui/sortable`,
I want reordering built on the same Pragmatic layer as `./dnd`,
so that I install one drag engine instead of four dnd-kit peers for a single widget.

## Acceptance criteria

- [ ] `./sortable` still exports `Sortable`, `SortableContent`, `SortableItem`,
      `SortableItemHandle`, `SortableOverlay` and their `Root`/`Content`/`Item`/`ItemHandle`/
      `Overlay` aliases, reimplemented on `src/components/dnd/` primitives
- [ ] Any public prop that cannot be preserved is listed under Breaking changes below
- [ ] `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers` and `@dnd-kit/utilities` are gone
      from `peerDependencies`, `peerDependenciesMeta` and `devDependencies`
- [ ] `vite.config.ts` and `src/test/dist-guard.test.ts` drop their dnd-kit externals/assertions
- [ ] Keyboard reorder still works — dnd-kit provided it for free, Pragmatic does not
      (depends on ST-034)
- [ ] `docs/components/nqui-sortable.md` matches the shipped props; consumer skill regenerated
      (`sync:skills` + `skill:validate`)
- [ ] Tests cover drag, drop, keyboard reorder and the overlay
- [ ] `pnpm size` shows `sortable.es.js` gzip down, and `dnd.es.js` still under its 25 KB budget
- [ ] Showcase pass on the sortable page against the local build before release

## Technical notes

Deliberately last in the epic: it is the one change that can regress current consumers, so it wants
human review and a showcase pass rather than an unsupervised implementation.

Depends on **ST-034** — dnd-kit's `KeyboardSensor` gives today's `Sortable` keyboard reorder for
free. Rebuilding on native drag removes that unless the keyboard affordance exists first. Shipping
this before ST-034 would be an accessibility regression, not just an API change.

Reimplement `./sortable` as a thin wrapper over the `./dnd` primitives + `reorder` math, not as a
parallel implementation. See `internal-notes/dnd-rebase-handoff.md` § Deliberately deferred, item
3, and `memory/dnd-pragmatic-rebase.md` ("retiring dnd-kit is a separate migration").

## Breaking changes

- **Peers removed:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`,
  `@dnd-kit/utilities` → replaced by the optional `@atlaskit/pragmatic-drag-and-drop*` peers that
  `./dnd` already declares. Consumers of `./sortable` must install the atlaskit peers and may
  uninstall the dnd-kit ones.
- **Implementation swap:** any consumer reaching past the documented props into dnd-kit internals
  (sensors, modifiers, `DndContext` from a parent) will break.
- Exact prop-level removals to be filled in during implementation; each needs a line here.
- Migration line for `CHANGELOG.md`, and a minor bump while pre-1.0 (§9).

## Out of scope

- Changing `./sortable`'s visual design or adding cross-list reorder — use `./dnd` for that.
- Removing the `./sortable` entry entirely; the subpath stays.
