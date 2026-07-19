---
id: ST-026
epic: EP-003
title: Resizable panels
status: in-progress
priority: should
release: unset
breaking: false
scope: [src/components/ui/resizable.tsx, src/components/index.ts, docs]
api: docs/components/nqui-resizable.md
---

# ST-026 — Resizable panels

As an app author building a split layout,
I want styled resizable panels and a grab handle that match the rest of nqui,
so that a two-pane view is a composition, not a drag-math exercise.

## Acceptance criteria

- [x] `ResizablePanelGroup`, `ResizablePanel` and `ResizableHandle` wrap `Group` / `Panel` /
      `Separator` from `react-resizable-panels` and are exported from the main entry.
- [x] The group is `flex h-full w-full` and flips to a column on
      `data-[orientation=vertical]`, so `direction` alone drives the axis.
- [x] Each part carries a `data-slot` (`resizable-panel-group`, `resizable-panel`,
      `resizable-handle`) for app-wide theming.
- [x] The handle is a 1px `bg-border` line with a widened `after:` hit target, mirrors itself for
      vertical groups, and takes a visible grip via `withHandle`.
- [x] Focus is visible on the handle (`focus-visible:ring-ring` + ring offset), so keyboard resize
      is not invisible.
- [x] `docs/components/nqui-resizable.md` shows the group/panel/handle composition and names the
      `react-resizable-panels` peer.
- [ ] Importing `Resizable*` cannot break a consumer who did not install the optional peer.
- [ ] The doc page states that the peer is **optional** and must be installed before use.

## Technical notes

- This is why the story is still `in-progress`. `react-resizable-panels` is declared optional in
  `peerDependenciesMeta`, but `src/components/ui/resizable.tsx` is re-exported from
  `src/components/index.ts` — i.e. from the **main** entry — so it violates the §6 seam rule that an
  optional peer must never be imported from the main entry. A consumer who imports anything from
  `@nqlib/nqui` without having installed the package can hit a module-resolution failure at build or
  runtime.
- `src/test/dist-guard.test.ts` would catch exactly this, but `react-resizable-panels` is absent
  from its `OPTIONAL_PEERS` list, so the guard is currently silent about it.
- The fix is a `./resizable` subpath entry (plus the guard entry) and is owned by **ST-040** in
  EP-005 — deliberately not designed here, because moving an export is a packaging decision that
  has to land with the entry map, the export validation and the CHANGELOG migration line.
- `docs/components/README.md` already lists `react-resizable-panels` under "Optional peers (per
  component)"; the component's own page does not repeat it.

## Out of scope

- The subpath entry, `package.json` `exports` map and the migration note — ST-040 (EP-005).
- Persisting panel sizes (the peer's `autoSaveId`) — consumer concern, not re-exported.
