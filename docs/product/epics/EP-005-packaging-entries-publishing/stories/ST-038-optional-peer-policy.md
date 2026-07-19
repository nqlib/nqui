---
id: ST-038
epic: EP-005
title: Optional-peer policy and the dist-guard invariant
status: done
priority: must
release: 0.7.0
breaking: false
scope: [package.json, vite.config.ts, src/test/dist-guard.test.ts, .github/workflows/ci.yml]
api: docs/architecture/overview.md
---

# ST-038 — Optional-peer policy and the dist-guard invariant

As an app author who installs `@nqlib/nqui` and imports only core components,
I want the main entry proven — not merely intended — to be free of optional peers,
so that a clean install never fails on a package I chose not to use.

## Acceptance criteria

- [x] Optional peers are declared in `peerDependencies` **and** flagged
      `peerDependenciesMeta.<pkg>.optional = true`: the 4 `@atlaskit/pragmatic-drag-and-drop*`
      packages, `@dnd-kit/{core,modifiers,sortable,utilities}`, `embla-carousel-react`,
      `@tanstack/react-table`, `react-day-picker`, `date-fns`, `sonner`, `vaul`,
      `react-resizable-panels`, `shiki`, `@shikijs/transformers`, `@codesandbox/sandpack-react`
- [x] No optional peer appears in `dependencies` — `dependencies` holds only bundled runtime
      packages (Radix, `clsx`, `tailwind-merge`, `class-variance-authority`, `minimist`, …)
- [x] `vite.config.ts` `rollupOptions.external` lists every optional peer so it stays a bare
      import instead of being inlined
- [x] `src/test/dist-guard.test.ts` walks the static import graph from `dist/nqui.es.js` and fails
      if any of `sonner`, `vaul`, `@dnd-kit/*`, `embla-carousel-react`, `date-fns`,
      `react-day-picker`, `@tanstack/react-table` is reachable
- [x] The same test asserts `react-router`, `shiki`, `@codesandbox/sandpack-react` and Pragmatic
      DnD are never **inlined** (module-body signatures, not import specifiers)
- [x] CI builds before it tests (`.github/workflows/ci.yml`), so the guard runs against real
      `dist/` output instead of `describe.skipIf`-ing itself away

## Technical notes

The policy from `plans/005-optional-peer-entry-restructure.md`: a component that imports an
externalized optional peer lives behind a subpath entry (ST-037) and is never re-exported from
`src/components/index.ts`. `dist-guard.test.ts` is the mechanical enforcement — §6 of the guideline
treats the peer list as part of the seam, so any change here is story-level.

`cmdk` is the documented exception: the guard's allow-list comment calls it a *required* peer
because the core Combobox eager-imports `src/components/ui/command.tsx`. ST-041 reconciles that.

`next-themes` is a hard `dependency` and gets bundled rather than externalized — see ST-047.

## Out of scope

- Marking `cmdk` optional — ST-041.
- Per-entry size budgets — ST-039.
- CI job composition itself → EP-006.
