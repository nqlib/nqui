---
id: ST-017
epic: EP-002
title: Command palette behind ./command
status: done
priority: should
release: 0.7.0
breaking: true
scope: [src/entries/command.ts, src/components/ui/command.tsx, src/components/custom/command-palette.tsx, package.json, docs]
api: docs/components/nqui-command.md
---

# ST-017 — Command palette behind `./command`

As an app author who doesn't ship a ⌘K palette,
I want Command and CommandPalette on their own subpath,
so that `cmdk` stays out of my main-entry import graph.

## Acceptance criteria

- [x] `src/entries/command.ts` exports the cmdk primitives — `Command`, `CommandDialog`,
      `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`,
      `CommandShortcut`, `CommandSeparator` — plus `CommandPalette` and `CommandPaletteProps`.
- [x] `package.json` `exports["./command"]` maps types / import / require to
      `dist/entries/command.d.ts`, `dist/command.es.js`, `dist/command.cjs.js`.
- [x] `Command` and `CommandPalette` are **not** re-exported from `src/components/index.ts`; only
      pointer comments remain.
- [x] `CommandPaletteProps` extends `Omit<React.ComponentProps<typeof CommandDialog>, "title" |
      "description">` and adds sr-only `title` / `description` plus
      `shortcutEnabled?: boolean` (default `true`) for the ⌘/Ctrl+K listener.
- [x] `CommandDialog` content uses the shared `floating-surface` treatment (ST-015).
- [x] CHANGELOG 0.7.0 lists the root-import break with the before/after import line.
- [ ] `cmdk` is marked `"optional": true` in `peerDependenciesMeta`.
- [ ] No main-entry module imports `cmdk`.
- [ ] `docs/components/nqui-command.md` and `nqui-command-palette.md` show the subpath import.

## Technical notes

- **Open gap — `cmdk` is the only subpath peer not marked optional.** Every other subpath peer
  (`react-day-picker`, `date-fns`, `sonner`, `vaul`, `embla-carousel-react`, `@tanstack/react-table`,
  `react-resizable-panels`, the dnd-kit and Pragmatic packages) carries
  `"optional": true`; `cmdk` does not. Owned by **ST-041** (EP-005) — do not fix here.
- The declaration is currently *correct for the code*: `src/components/ui/combobox.tsx` imports
  `@/components/ui/command`, which imports `cmdk`, and `Combobox` **is** exported from the main
  entry (ST-012). So cmdk is reachable from the package root and marking it optional today would
  break root consumers. Making it genuinely optional requires decoupling Combobox from cmdk first —
  that is the real work behind ST-041, not a `package.json` edit.
- Both doc pages still show `from "@nqlib/nqui"` and never mention `@nqlib/nqui/command`. Stale
  pages, correct exports — same defect class as ST-013 and ST-016.

## Breaking changes

| Before | After |
|---|---|
| `import { Command, CommandPalette } from "@nqlib/nqui"` | `from "@nqlib/nqui/command"` |

CHANGELOG migration line: *Command and CommandPalette now import from `@nqlib/nqui/command`.*

## Out of scope

- Making `cmdk` optional and decoupling Combobox from it — ST-041 (EP-005).
- Default command sets, routing, or search backends — the consumer supplies the items.
