---
id: ST-040
epic: EP-005
title: ./resizable subpath entry
status: backlog
priority: must
release: unset
breaking: true
scope: [src/entries/resizable.ts, src/components/index.ts, vite.config.ts, package.json, scripts/check-bundle-size.js, src/test/dist-guard.test.ts, docs]
api: docs/architecture/overview.md
---

# ST-040 — `./resizable` subpath entry

As an app author who installs `@nqlib/nqui` without `react-resizable-panels`,
I want the resizable panels behind their own subpath like every other optional-peer component,
so that importing anything from the main entry does not fail to resolve a package I never asked
for.

## Acceptance criteria

- [ ] `src/entries/resizable.ts` exports `ResizablePanelGroup`, `ResizablePanel`,
      `ResizableHandle` (plus their prop types) from `src/components/ui/resizable`, with the same
      `Requires: react-resizable-panels` header comment style as `src/entries/sortable.ts`
- [ ] `vite.config.ts` `build.lib.entry` gains `resizable`; `package.json` `exports` gains
      `"./resizable"` mapping to `dist/entries/resizable.d.ts` / `dist/resizable.es.js` /
      `dist/resizable.cjs.js`
- [ ] `src/components/index.ts` no longer re-exports from `./ui/resizable` (currently line ~426);
      a comment names the subpath, matching the other moved families
- [ ] `src/test/dist-guard.test.ts` adds `react-resizable-panels` to `OPTIONAL_PEERS` and the main
      entry stays clean
- [ ] `scripts/check-bundle-size.js` gains a `resizable.es.js` budget (5 KB gzip)
- [ ] A tarball smoke test proves `import("@nqlib/nqui")` resolves with no
      `react-resizable-panels` installed, and `@nqlib/nqui/resizable` works once it is
- [ ] `docs/components/*` and the consumer skill use the subpath import; `sync:skills` +
      `skill:validate` run in the same PR

## Technical notes

This was **Step 1 of `plans/005-optional-peer-entry-restructure.md` and never landed**. 0.7.0 moved
calendar / command / sonner / carousel / drawer / sortable out of the barrel but left resizable in
it, so `react-resizable-panels` is flagged `peerDependenciesMeta.optional` while the main entry
still hard-imports it — exactly the broken-clean-install shape `plans/001-dependency-hygiene.md`
described. `dist-guard.test.ts` does not currently list it, which is why the guard stays green.

Same treatment as ST-037; the only open question is whether to keep a deprecated main-entry
re-export for a release, which the epic's version-bump decision should settle.

## Breaking changes

`import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@nqlib/nqui"` →
`from "@nqlib/nqui/resizable"`. Needs a CHANGELOG Migration line.

## Out of scope

- Any change to the resizable component's own props or behavior.
- `./table` (ST-042) and the `cmdk` metadata fix (ST-041), even though they share this shape.
