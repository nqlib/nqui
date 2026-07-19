---
id: ST-039
epic: EP-005
title: Per-entry gzip budgets
status: done
priority: should
release: 0.7.0
breaking: false
scope: [scripts/check-bundle-size.js, package.json, .github/workflows/ci.yml]
api: docs/architecture/overview.md
---

# ST-039 — Per-entry gzip budgets

As a maintainer shipping `@nqlib/nqui`,
I want every published entry measured against a gzip budget on every build,
so that a heavy dependency sneaking into an entry fails CI instead of shipping silently.

## Acceptance criteria

- [x] `scripts/check-bundle-size.js` gzips each built ESM entry in `dist/` and compares it to a
      per-file budget, with zero npm dependencies (`node:fs`, `node:zlib`, `node:path` only)
- [x] Budgets in gzipped KB: `nqui.es.js` 95, `dnd.es.js` 25, and 5 each for `command.es.js`,
      `sonner.es.js`, `drawer.es.js`, `carousel.es.js`, `calendar.es.js`, `sortable.es.js`,
      `debug.es.js`
- [x] A missing built entry is a failure, not a skip — it prints
      `✗ missing built entry: <file>` and exits non-zero
- [x] Exceeding a budget prints `OVER` in the status column and exits 1 with
      `Bundle-size check FAILED`
- [x] `npm run size` enforces; `npm run size:print` prints the raw/gzip/budget table without
      failing
- [x] `.github/workflows/ci.yml` runs `pnpm run size` as its final step, after `build:lib`

## Technical notes

Budgets were set with roughly 15% headroom over the sizes at 0.7.0, so normal churn passes and a
new bare import trips the check. When a budget is genuinely outgrown, raise it in the same PR that
causes the growth and say why in the PR body — a silently raised budget defeats the mechanism.

The budget map is keyed on ESM filenames only; the `.cjs.js` twins are unmeasured, and `styles.css`
/ `nqui.css` are outside the check entirely. `dnd.es.js` carries 25 KB against a real ~5.5 KB
(ST-030) because the Pragmatic layer was expected to grow.

Adding a subpath entry (ST-040, ST-042) means adding its budget row here in the same PR, otherwise
the new entry ships unmeasured.

## Out of scope

- CSS size budgets — `dist/styles.css` is verified for content (ST-045), not size.
- Enforcing budgets on the CJS outputs or on `dist/entries/*.d.ts`.
- CI job composition → EP-006.
