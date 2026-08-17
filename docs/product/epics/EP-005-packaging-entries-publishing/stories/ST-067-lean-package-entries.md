---
id: ST-067
epic: EP-005
title: Lean package — debug and TOC off the main entry, slim tarball
status: review
priority: should
release: unset
breaking: true
scope: [src/entries/toc.ts, src/components/index.ts, vite.config.ts, package.json, scripts/check-bundle-size.js, src/test/dist-guard.test.ts, scripts/verify-publish.mjs, docs]
api: docs/architecture/overview.md
---

# ST-067 — Lean package — debug and TOC off the main entry, slim tarball

As an app author who only imports `Button` from `@nqlib/nqui`,
I want debug tools and the table of contents behind subpaths, and I want the npm tarball
to ship skills not product epics,
so that the main entry and the published package stay small.

## Acceptance criteria

- [x] `src/entries/toc.ts` exports `TableOfContents`, `TOCItem`, and `TableOfContentsProps`
- [x] `vite.config.ts` `build.lib.entry` gains `toc`; `package.json` `exports` gains `"./toc"`
- [x] `src/components/index.ts` no longer re-exports TableOfContents or DebugPanel / Magnifier /
      Crosshair / UITester; comments name `@nqlib/nqui/toc` and `@nqlib/nqui/debug`
- [x] Library Vite build sets `publicDir: false` so `public/.well-known` is not copied into `dist/`
- [x] `package.json` `files` ships `docs/nqui-skills` and `docs/components` only — not
      `docs/product`, `docs/package-lock.json`, or sibling-library notes
- [x] `scripts/check-bundle-size.js` gains a `toc.es.js` gzip budget; `nqui.es.js` no longer
      statically imports the debug-panel chunk
- [x] `src/test/dist-guard.test.ts` asserts the main entry does not pull `debug-panel` or TOC
      copy, and `dist/.well-known` is absent
- [x] `scripts/verify-publish.mjs` fails if the tarball contains `docs/product` or
      `dist/.well-known`
- [x] Component docs, README, examples, and the consumer skill use the subpath imports;
      `sync:skills` + `skill:validate` run in the same PR

## Technical notes

0.7.0 already moved calendar / command / sonner / carousel / drawer / sortable off the barrel
(ST-037) and added `@nqlib/nqui/debug` as a 160-byte shim. The main entry still statically
imported the shared `debug-panel-*.js` chunk (~270 KB) because `components/index.ts` re-exported
DebugPanel. TableOfContents (~1.4k lines, three variants) was never given a subpath.

Showcase `/docs` uses a custom rail, not nqui `TableOfContents`. Catalog still demos the
component via `@nqlib/nqui/toc`.

## Breaking changes

| Before | After |
|---|---|
| `import { TableOfContents } from "@nqlib/nqui"` | `from "@nqlib/nqui/toc"` |
| `import { DebugPanel } from "@nqlib/nqui"` | `from "@nqlib/nqui/debug"` |

CHANGELOG migration lines required.

## Out of scope

- `./resizable` (ST-040), `cmdk` optional metadata (ST-041), ESM-only (no CJS).
- Deleting circuit/clerk TOC variants.
- Splitting `radix-ui` vs `@radix-ui/*` install duplication.
