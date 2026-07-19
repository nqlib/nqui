---
id: ST-020
epic: EP-002
title: DataTable on TanStack Table
status: in-progress
priority: should
release: unset
breaking: false
scope: [src/components/table, src/entries, package.json, docs]
api: docs/components/nqui-data-table.md
---

# ST-020 — DataTable on TanStack Table

As an app author building a dense grid,
I want a DataTable with sorting, filtering, pagination, selection and inline editing that I can
import from the package,
so that I don't rebuild the same TanStack Table wiring in every app.

## Acceptance criteria

- [x] `src/components/table/DataTable.tsx` implements the component on `@tanstack/react-table`
      with `DataTableProps<TData, TValue>` taking `columns: ColumnDef<TData, TValue>[]` and
      `data: TData[]`.
- [x] Behaviour is opt-outable per feature: `enableSorting` (true), `enableFiltering` (true),
      `enablePagination` (true), `enableRowSelection` (false), `enableEditing` (false), plus an
      initial page size (10).
- [x] `src/components/table/Table.tsx` provides the presentational shell — `TableRoot`, `Table`,
      `TableHead`, `TableHeaderCell`, `TableBody`, `TableRow`, `TableCell`, `TableFoot`,
      `TableCaption` — distinct from the shadcn `ui/table.tsx` used by ST-019.
- [x] `src/components/table/data-table-helpers.tsx` exports `createSelectColumn`,
      `createEditableCell` and `createColumnHelper`.
- [x] `src/components/table/index.ts` re-exports the shell, `DataTable` and `DataTableProps`.
- [x] `@tanstack/react-table` is declared in `peerDependencies` and marked `"optional": true`.
- [ ] `DataTable` is reachable from a published entry point.
- [ ] The `TableMeta` augmentation type-checks cleanly.
- [ ] `docs/components/nqui-data-table.md` documents a real published import path.

## Technical notes

- **Not shipped.** `src/components/table/` is re-exported by neither `src/components/index.ts` nor
  any file in `src/entries/`, and `package.json` has no `./table` export. Today the only way to use
  it is to copy the source. The subpath is **ST-042** (EP-005).
- The doc page is honest about this — it says *"Not currently exported from main `@nqlib/nqui`
  entry"* and shows an app-relative `@/components/table` import — but that means there is no
  documented consumer path, which is why this story is `in-progress` rather than `done`.
- **Pre-existing type error.** `src/components/table/DataTable.tsx:42` declares
  `declare module "@tanstack/react-table" { interface TableMeta<_TData extends RowData> { … } }`
  and `tsc -p tsconfig.app.json --noEmit` reports
  `TS2428: All declarations of 'TableMeta' must have identical type parameters` — the augmentation
  renames the type parameter (`_TData` vs upstream `TData`). It does **not** surface in
  `tsc -p tsconfig.lib.json` because that config only includes `src/index.ts` and `src/entries/*.ts`,
  and `src/components/table/` is unreachable from both. Adding the subpath will therefore also make
  the build fail until the augmentation is fixed. Type-error budget is owned by **EP-006**.
- Sequencing: fix `TableMeta`, then land ST-042, then correct the doc page — in that order, or the
  subpath breaks `build:types`.

## Out of scope

- The `./table` subpath entry, `exports` map and bundle-size budget — ST-042 / EP-005.
- Virtualisation, column resizing and server-side pagination — not implemented.
- The full data grid — `nqdg`, a separate package.
