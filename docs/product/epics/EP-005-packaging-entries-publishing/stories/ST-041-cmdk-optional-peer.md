---
id: ST-041
epic: EP-005
title: Mark cmdk optional in peerDependenciesMeta
status: ready
priority: should
release: unset
breaking: true
scope: [package.json, src/components/ui/combobox.tsx, src/components/index.ts, src/entries/command.ts, src/test/dist-guard.test.ts, docs]
api: docs/architecture/overview.md
---

# ST-041 — Mark `cmdk` optional in `peerDependenciesMeta`

As an app author who uses only core nqui components,
I want `cmdk` declared optional like every other subpath-only peer,
so that my package manager does not warn about — or expect me to install — a package the
components I import do not need.

## Acceptance criteria

- [ ] `package.json` `peerDependenciesMeta` gains `"cmdk": { "optional": true }`; `cmdk` stays in
      `peerDependencies` at `^1.0.0` and out of `dependencies`
- [ ] The main entry no longer reaches `cmdk`: `src/components/ui/combobox.tsx` stops importing
      `@/components/ui/command`, **or** Combobox moves behind `./command` (see Breaking changes)
- [ ] `src/test/dist-guard.test.ts` adds `cmdk` to `OPTIONAL_PEERS` and the "main entry only
      eager-pulls the cmdk required peer" test is renamed/retitled to drop the exception; the
      allow-list comment above it is rewritten
- [ ] `pnpm run build:lib && pnpm test` green with `cmdk` absent from the main-entry import graph
- [ ] Tarball check: `npm install` of the packed tarball with only `react`/`react-dom` present, then
      `import("@nqlib/nqui")` resolves; `import("@nqlib/nqui/command")` fails until `cmdk` is added
- [ ] `scripts/peer-deps.js` `FULL_PEER_LIST` and the `install-peers` output still list `cmdk`
- [ ] `docs/components/*` + consumer skill state that Combobox/Command require `cmdk`;
      `sync:skills` and `skill:validate` run in the same PR

## Technical notes

`cmdk` is currently the only subpath peer with no `optional` flag — every other one
(`vaul`, `sonner`, `date-fns`, `@dnd-kit/*`, …) has it. The flag is missing on purpose, not by
oversight: `src/components/ui/combobox.tsx:33` imports `@/components/ui/command`, Combobox *is*
exported from the main barrel, and `dist-guard.test.ts` therefore whitelists `cmdk` as a "required
peer, pulled by the core Combobox". Flipping the flag without breaking that import would ship a
broken clean install — the exact ST-040/plan-001 failure mode.

Two resolutions; pick one before starting:

- **A — decouple Combobox.** Rebuild its list/filter on Radix Popover + native filtering so no core
  component imports `cmdk`. Non-breaking for consumers; more work.
- **B — move Combobox to `./command`.** Mechanical and consistent with ST-037; breaking.

## Breaking changes

Only if resolution **B** is chosen: `import { Combobox } from "@nqlib/nqui"` →
`from "@nqlib/nqui/command"`, with a CHANGELOG Migration line. Resolution A is non-breaking and the
frontmatter should be corrected to `breaking: false` in that case.

## Out of scope

- Combobox's own props, multi-select behavior, or styling.
- `react-resizable-panels` (ST-040) and `@tanstack/react-table` (ST-042).
