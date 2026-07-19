---
id: ST-060
epic: EP-007
title: Catalog boundary — showcase moved to a sibling repo
status: done
priority: must
release: 0.6.3
breaking: false
scope: [src/App.tsx, scripts/dev-catalog-pointer.js, package.json, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, .cursor/rules, src/test/dist-guard.test.ts]
api: docs/components/README.md
---

# ST-060 — Catalog boundary: showcase moved to a sibling repo

As a maintainer (and as any agent working here),
I want the live catalog, recipes and design-system pages to live only in the sibling
**nqui-showcase** app,
so that showcase-only dependencies never reach the published library or a consumer's bundle.

## Acceptance criteria

- [x] No catalog surfaces remain in the package: `src/pages/` is gone and `src/App.tsx` is a stub
      returning `null` with a comment pointing at `AGENTS.md`.
- [x] `npm run dev` maps to `scripts/dev-catalog-pointer.js`, which prints the sibling-repo
      instructions and exits 0 — it never starts a Vite catalog. `build:app` points at the same
      script.
- [x] The boundary is stated where agents actually read it: `CLAUDE.md` ("Catalog boundary"),
      `AGENTS.md` ("do not violate"), `CONTRIBUTING.md`, `.agents/skills/nqui-docs/SKILL.md`, and
      `.cursor/rules/no-showcase-catalog.mdc`.
- [x] Pre-publish visual QA is documented as `cd ../nqui-showcase && pnpm nqui:local && pnpm dev`.
- [x] Showcase-only packages cannot be reinlined unnoticed: `src/test/dist-guard.test.ts` asserts
      that `react-router`/`react-router-dom`, `shiki` and `@codesandbox/sandpack-react` module
      bodies never appear in `dist/`.
- [x] Released — 0.6.3 (`9f93dab`, "remove Storybook, bundled SVG icons, showcase sidebar").

## Technical notes

- The guard test checks for module-body *signatures* (`createBrowserRouter`, `useRoutesImpl`,
  `createHighlighterCore`, `SandpackProvider`…) rather than package names, so an externalized
  `import "shiki"` specifier does not trip it. It skips itself when `dist/` is absent, so a fresh
  checkout stays green; CI must build before running tests for the guard to mean anything.
- The rule is duplicated in five places on purpose — each is the first file a different tool loads
  (Claude Code, generic agents, humans, the docs skill, Cursor). When the wording changes, change
  all five; `CLAUDE.md` is the canonical copy.
- Removing the showcase is what left `src/components/blocks/` a comment-only `index.ts` and the four
  empty `src/components/ui/shadcn-io/` directories; cleaning up the doc pages they orphaned is
  ST-061.

## Out of scope

- The showcase app's own code, routes and deployment — sibling repo.
- Deleting the doc pages orphaned by the move — ST-061.
- Removing the now-dead `src/components/blocks/` and `shadcn-io/` directories from source — a
  library-source cleanup, not a docs story.
