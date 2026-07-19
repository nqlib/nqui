---
id: ST-037
epic: EP-005
title: Subpath entries for optional-peer components
status: done
priority: must
release: 0.7.0
breaking: true
scope: [src/entries, src/components/index.ts, vite.config.ts, package.json, docs]
api: docs/architecture/overview.md
---

# ST-037 — Subpath entries for optional-peer components

As an app author installing `@nqlib/nqui`,
I want every component that needs a heavy third-party package behind its own subpath,
so that `import { Button } from "@nqlib/nqui"` costs me nothing but the core dependencies.

## Acceptance criteria

- [x] `src/entries/` holds one re-export shim per optional-peer family: `carousel.ts`,
      `command.ts`, `sortable.ts`, `dnd.ts`, `calendar.ts`, `sonner.ts`, `drawer.ts`, `debug.ts`
- [x] `package.json` `exports` maps `./carousel ./command ./sortable ./dnd ./calendar ./sonner
      ./drawer ./styles ./debug ./debug.css`, each with `types` / `import` / `require`
- [x] `vite.config.ts` `build.lib.entry` registers every JS entry; `fileName` emits
      `nqui.{es,cjs}.js` for `index` and `<entry>.{es,cjs}.js` for the rest
- [x] `src/components/index.ts` no longer re-exports Calendar, Command/CommandPalette,
      Toaster/Sonner, Carousel, Drawer or Sortable — each site carries a comment naming the subpath
- [x] `tsc -p tsconfig.lib.json` emits `dist/entries/<name>.d.ts` for every mapped subpath
- [x] Entry export lists cover what the barrel used to export (e.g. `calendar.ts` keeps the
      `EnhancedCalendar as Calendar` alias plus `CoreCalendar` / `CalendarDayButton`)

## Technical notes

Designed in `plans/005-optional-peer-entry-restructure.md`; shipped in release 0.7.0 (`63c92ea`).
Each entry is a documented shim whose header comment names the peers it requires — that comment is
the human-readable half of the contract `peerDependenciesMeta` encodes (ST-038).

`./styles` and `./debug.css` are asset exports, not JS entries: `./styles` resolves to
`dist/styles.css` (ST-045) and `./debug.css` to `dist/nqui.css`, copied by the `copy:css` script.

Two known defects in `vite.config.ts` as shipped: the `dnd` entry key and the
`/^@atlaskit\/pragmatic-drag-and-drop/` external are each declared twice. Harmless (the object
literal collapses, the external list dedupes), but they should be cleaned up.

## Breaking changes

Main-entry exports moved to subpaths in 0.7.0:

| Old | New |
|---|---|
| `import { Calendar } from "@nqlib/nqui"` | `@nqlib/nqui/calendar` |
| `import { Command, CommandPalette } from "@nqlib/nqui"` | `@nqlib/nqui/command` |
| `import { Toaster } from "@nqlib/nqui"` | `@nqlib/nqui/sonner` |
| `import { Carousel } from "@nqlib/nqui"` | `@nqlib/nqui/carousel` |
| `import { Drawer } from "@nqlib/nqui"` | `@nqlib/nqui/drawer` |
| `import { Sortable } from "@nqlib/nqui"` | `@nqlib/nqui/sortable` |

## Out of scope

- `./resizable` — ST-040; `Resizable*` still ships from the main entry.
- `./table` — ST-042.
- The peer-metadata policy and its dist-level enforcement — ST-038.
