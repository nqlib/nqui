---
id: ST-053
epic: EP-006
title: Node matrix and app-project typecheck
status: backlog
priority: should
release: unset
breaking: false
scope: [.github/workflows/ci.yml, package.json, tsconfig.app.json, tsconfig.node.json]
---

# ST-053 — Node matrix and app-project typecheck

As a consumer on Node 20,
I want CI to exercise the version range `package.json` claims and to typecheck every project in the
repo,
so that `"engines": { "node": ">=20" }` is a tested promise and type errors cannot hide outside the
library entry graph.

## Acceptance criteria

- [ ] `.github/workflows/ci.yml` runs the `verify` job under
      `strategy.matrix.node-version: [20, 22]`, with `actions/setup-node@v4` consuming
      `${{ matrix.node-version }}`; both legs are green on the PR.
- [ ] `pnpm install --frozen-lockfile` succeeds on Node 20 — if it does not, the finding is reported
      and `engines` is corrected instead of the matrix leg being dropped.
- [ ] `package.json` gains a `typecheck` script covering `tsconfig.app.json`, `tsconfig.node.json`
      and `tsconfig.lib.json` (or the equivalent `tsc -b` form, whichever runs clean), and CI's
      "Typecheck library" step is replaced by `pnpm run typecheck`.
- [ ] The three errors currently reported by `pnpm exec tsc --noEmit -p tsconfig.app.json` are
      resolved or explicitly deferred with an owning story:
      `src/components/table/DataTable.tsx(42,13) TS2428` (TableMeta — belongs to **EP-002 ST-020**),
      `src/components/dnd/dnd-render.test.tsx(49,12) TS2578` (unused `@ts-expect-error`),
      `src/test/init-css.test.ts(6,38) TS7016` (untyped `scripts/setup-helper.js` import).
- [ ] `pnpm run typecheck` exits 0 locally and in CI, and `git status` shows no new tracked
      artifacts (`*.tsbuildinfo` ignored if `tsc -b` is chosen).
- [ ] A note records when `engines` moves to `>=22` the matrix must change in the same PR (Node 20
      leaves maintenance LTS April 2026).

## Technical notes

- No public API doc, but this check protects a **consumer-visible claim**: the `engines` range in
  `package.json`. It also protects `tsconfig.app.json`'s graph — tests, `scripts/` type surface, and
  everything outside the published entry graph.
- Current state, verified: CI pins `node-version: 22` with no matrix, and typechecks
  `tsconfig.lib.json` only. `tsconfig.app.json` has never been checked in CI.
- The `TableMeta` error is a one-line fix (`_TData` → `TData`, with an inline
  `@typescript-eslint/no-unused-vars` disable because the config's `varsIgnorePattern: '^_'` is what
  motivated the underscore). It is **pre-existing and owned by EP-002 ST-020** — do not fold the
  DataTable work into this story, only unblock the gate.
- Plan 004 Steps 1–2 and 4 specify this work; its Step 2 caveat about `composite` still applies —
  read the tsconfigs before choosing between `tsc --noEmit -p` and `tsc -b`.

## Out of scope

- The vitest CVE bump (plan 004 Step 5) — dependency hygiene, EP-005.
- Fixing DataTable's inline-editing types properly — EP-002 ST-020.
