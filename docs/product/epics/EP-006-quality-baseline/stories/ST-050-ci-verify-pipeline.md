---
id: ST-050
epic: EP-006
title: CI verify pipeline
status: done
priority: must
release: 0.7.0
breaking: false
scope: [.github/workflows/ci.yml, package.json]
---

# ST-050 — CI verify pipeline

As a contributor to `@nqlib/nqui`,
I want one CI job that lints, typechecks, builds, tests and weighs the bundle on every push and PR,
so that I cannot merge a change that breaks the published package without CI saying so.

## Acceptance criteria

- [x] `.github/workflows/ci.yml` is the only workflow and defines a single job, `verify`, on
      `ubuntu-latest`, triggered by `push` to `main`/`master` and by `pull_request`.
- [x] Setup is `actions/checkout@v4` → `pnpm/action-setup@v4` (`version: 10`) →
      `actions/setup-node@v4` (`node-version: 22`, `cache: pnpm`) → `pnpm install --frozen-lockfile`.
- [x] The gates run in this order, each as its own named step:
      `pnpm exec eslint src scripts --max-warnings 0` (Lint source and scripts) →
      `pnpm exec tsc -p tsconfig.lib.json --noEmit` (Typecheck library) →
      `pnpm run build:lib` (Build library) → `pnpm test` (Test) → `pnpm run size` (Bundle-size
      budget).
- [x] **Build precedes test** and the workflow carries a comment saying why: the dist-artifact
      guards in `src/test/dist-guard.test.ts` self-skip when `dist/` is missing, so testing first
      would silently disable them.
- [x] The install is lockfile-strict (`--frozen-lockfile`), so a `package.json` edit without a
      matching `pnpm-lock.yaml` fails CI rather than resolving fresh.
- [x] Every gate is also runnable locally through a `package.json` script (`lint`, `build:lib`,
      `test`, `size`).

## Technical notes

- No public API surface. The pipeline is what makes every other epic's invariant *enforced* rather
  than *documented*: EP-005's dependency isolation via the dist guard, EP-005's budgets via
  `scripts/check-bundle-size.js`.
- `pnpm run build:lib` is itself a chain — `vite build --mode library` → `build:types`
  (`tsc -p tsconfig.lib.json`) → `build:styles` → `verify:build` → `copy:css` — so
  `scripts/verify-build.js` runs inside the Build step, not as a separate gate.
- The Typecheck step deliberately uses `tsconfig.lib.json` (the published entry graph) rather than
  the root solution file; the untypechecked remainder is ST-053.
- Deviations from plan 004 Step 4, all deliberate at 0.7.0: no Node matrix (ST-053), no
  `verify:exports` step (ST-051), no `typecheck` npm script — the `tsc` invocation is inline in the
  workflow.

## Out of scope

- Node 20 in the matrix and `tsconfig.app.json` coverage — ST-053.
- `validate-exports` and `skill:validate` as CI steps — ST-051 and ST-052.
- Release/publish automation — that is EP-005's `verify:publish` chain, not this job.
