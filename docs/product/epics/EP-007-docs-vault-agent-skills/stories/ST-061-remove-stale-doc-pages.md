---
id: ST-061
epic: EP-007
title: Remove doc pages for removed components
status: ready
priority: must
release: unset
breaking: false
scope: [docs/components, docs/nqui-skills/COMPONENTS_INDEX.md, src/components/ui/shadcn-io, src/components/blocks]
api: docs/components/README.md
---

# ST-061 — Remove doc pages for removed components

As an app author installing `@nqlib/nqui`,
I want the `docs/` folder in the tarball to describe only components the package actually exports,
so that I don't write code against `CodeBlock`, `CodeEditor`, `Sandbox` or `Snippet` and find they
don't exist.

## Acceptance criteria

- [ ] `docs/components/nqui-code-block.md`, `nqui-code-editor.md`, `nqui-sandbox.md` and
      `nqui-snippet.md` are removed — their sources under `src/components/ui/shadcn-io/{code-block,
      code-editor,sandbox,snippet}/` are empty directories and nothing is exported.
- [ ] The `CodeBlock` and `Snippet` rows in `docs/components/README.md` (currently lines 318–319,
      both labelled "From `@nqlib/nqcode`") are removed or rewritten as a single pointer to
      `@nqlib/nqcode`.
- [ ] The optional-peers line in `docs/components/README.md` no longer implies nqui ships code
      display: "**Code display** (CodeBlock, Snippet, etc.): use `@nqlib/nqcode` with `shiki`…".
- [ ] `docs/nqui-skills/COMPONENTS_INDEX.md` and any `docs/nqui-skills/**` reference to the four
      components is updated in the same PR.
- [ ] The four empty `src/components/ui/shadcn-io/*` directories are deleted.
- [ ] `src/components/blocks/` is deleted — it contains only a comment-only `index.ts` and two empty
      subdirectories (`tables/`, `chart-compositions/`); the real blocks live in `@nqlib/nqchart`
      and `nqdg`.
- [ ] `npm run sync:skills && npm run skill:validate` regenerates the synced copies with no stale
      references left in `.agents/skills/nqui/references/` or
      `public/.well-known/agent-skills/nqui/references/`.
- [ ] `npm run lint && npm run test && npm run build:lib` pass.

## Technical notes

- **Why this is `must`, not housekeeping:** `package.json` `files` is
  `["dist","scripts","docs","README.md","INSTALLATION.md"]`, so `docs/components/` is shipped inside
  the npm tarball. These four pages are not internal drift — every consumer downloads them, and an
  agent reading `node_modules/@nqlib/nqui/docs/` will happily generate imports that fail at build.
- `nqui-code-editor.md` and `nqui-sandbox.md` are already unlinked from
  `docs/components/README.md`, which is how the rot went unnoticed; `nqui-code-block.md` and
  `nqui-snippet.md` still have live rows. Do not "fix" the unlinked pages by adding rows — delete.
- The dist guard (`src/test/dist-guard.test.ts`) already forbids `shiki` and
  `@codesandbox/sandpack-react` from being inlined, so the *build* side of this removal is locked;
  only the docs and the empty source directories are left.
- Deleting `src/components/blocks/` removes no export — `blocks/index.ts` exports nothing. Confirm
  with `grep -r "components/blocks" src/` before deleting.
- Sequencing: land this before closing ST-056's "every page is linked from the index" criterion,
  otherwise that criterion is checked against pages that are about to disappear.

## Out of scope

- Documenting `@nqlib/nqcode` itself — different package.
- Adding the missing pages (theme, error-boundary, inline-tabs, debug, icons) — ST-056.
- Migrating `internal-notes/` — ST-062.
