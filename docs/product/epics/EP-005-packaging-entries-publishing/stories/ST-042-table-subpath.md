---
id: ST-042
epic: EP-005
title: ./table subpath for the TanStack DataTable
status: backlog
priority: could
release: unset
breaking: false
scope: [src/entries/table.ts, src/components/table, vite.config.ts, package.json, scripts/check-bundle-size.js, src/test/dist-guard.test.ts, docs]
api: docs/components/README.md
---

# ST-042 — `./table` subpath for the TanStack DataTable

As an app author building a dense data grid,
I want the DataTable published from `@nqlib/nqui/table` with `@tanstack/react-table` as its
optional peer,
so that I can use it from the package instead of copying `src/components/table/` into my app.

## Acceptance criteria

- [ ] `src/entries/table.ts` exports the public surface of `src/components/table/DataTable.tsx`
      and `Table.tsx` (components + prop types + the `data-table-helpers` helpers that are meant to
      be public), with a `Requires: @tanstack/react-table` header comment
- [ ] `vite.config.ts` `build.lib.entry` gains `table`; `package.json` `exports` gains `"./table"`
      → `dist/entries/table.d.ts` / `dist/table.es.js` / `dist/table.cjs.js`
- [ ] `src/components/index.ts` does **not** re-export the DataTable — `./table` is the only path
- [ ] `@tanstack/react-table` stays an optional peer and is added to
      `src/test/dist-guard.test.ts`'s main-entry check (it is already listed there)
- [ ] `scripts/check-bundle-size.js` gains a `table.es.js` budget
- [ ] `tsc -p tsconfig.lib.json` passes — the DataTable's `TableMeta` typing issue noted in
      `plans/README.md` (finding #6) must be fixed, not suppressed
- [ ] `docs/components/nqui-data-table.md` documents the shipped props and the subpath import;
      `docs/components/README.md` gains its row; `sync:skills` + `skill:validate` run in the same PR

## Technical notes

Today `src/components/table/{Table,DataTable}.tsx` and `data-table-helpers.tsx` exist but are not
reachable from any entry: they are absent from `src/components/index.ts` (the only `./ui/table`
exports there are the primitive table elements) and have no `src/entries/*` shim.
`@tanstack/react-table` is already declared as an optional peer and externalized in
`vite.config.ts`, so the packaging half is half-built — this story finishes it.

Publishing a DataTable is a component-surface decision, not just a packaging one: **EP-002 ST-020**
owns whether and in what shape the DataTable becomes public API. This story should not start until
ST-020 settles that; it then delivers the entry, peer wiring, budget and docs.

`plans/005-optional-peer-entry-restructure.md`'s maintenance note already prescribes this exact
pattern for the DataTable ("`./table` entry, `@tanstack/react-table` optional peer").

## Out of scope

- The DataTable's feature set, column API or sorting/filtering behavior — EP-002 ST-020.
- The primitive `./ui/table` elements, which stay in the main entry (no peer, no cost).
