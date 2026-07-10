# Improvement plans — @nqlib/nqui

Written against commit `6e2f8cb` (2026-06-10) after a full standard-depth audit (recon + 4
parallel category audits + manual vetting of every tabled finding). Each plan is self-contained:
an executor needs no context beyond the plan file itself.

## Execution order and status

| # | Plan | Findings | Effort | Risk | Depends on | Status |
|---|------|----------|--------|------|------------|--------|
| 001 | [Dependency hygiene](001-dependency-hygiene.md) — fix broken clean install (`react-resizable-panels`), move showcase-only deps to devDependencies | #1, #3 | S | low | — | TODO |
| 002 | [Postinstall consent](002-postinstall-consent.md) — stop silent mutation of consumer package.json / `.cursor/` | #4 | S | low | — | TODO |
| 003 | [Test + lint baseline](003-test-and-lint-baseline.md) — lint `scripts/`, CLI temp-dir tests, component smoke tests | #5, #9 (partial) | M | low | — | TODO |
| 004 | [CI hardening](004-ci-hardening.md) — full typecheck (fixes the DataTable `TableMeta` error), validate-exports in CI, Node 20+22 matrix, vitest CVE bump | #6, #7 | S | low | — | TODO |
| 005 | [Optional-peer entry restructure](005-optional-peer-entry-restructure.md) — main entry stops importing optional peers; optional peers leave `dependencies`; v0.7.0 breaking | #2 | L | medium | 003, 004 | TODO (BLOCKED) |

Recommended sequence: **001 → 002 → 003 → 004 → 005**. 001/002/004 are independent and can land in
any order; 003 and 004 are hard prerequisites for 005. Plan 005 deliberately undoes part of plan
001 (`react-resizable-panels` returns to optional-peer-only) — 001 is the safe stopgap so 0.6.x
consumers aren't broken while the breaking 0.7.0 work proceeds.

Status values executors should use: `TODO` → `IN PROGRESS` → `DONE` / `BLOCKED: <reason>`.

## Verification gates (all plans)

```sh
pnpm exec eslint src scripts --max-warnings 0
pnpm test
pnpm run build:lib
# after plan 004 lands, also:
pnpm run typecheck
pnpm run verify:exports
```

## Findings not planned (deliberately)

- **#8 Docs drift** (README links nonexistent `./instructions.md`; theming undocumented) — small,
  uncontentious; fold into any nearby PR or do ad hoc.
- **#9 react-hooks rule erosion** (all hooks rules incl. `exhaustive-deps` disabled) — plan 003
  only measures the violation count; re-enabling is a separate decision for the maintainer.
- **Deferred discovery from plan 005:** `next-themes` is bundled into the sonner chunk, so
  Toaster's theme auto-detection likely cannot see a consumer's own next-themes provider
  (different module instance). Needs investigation → candidate plan 006.

## Direction options surfaced (maintainer's call, not ranked against bugs)

1. Deploy the showcase app as a live demo (biggest adoption lever; no public URL today).
2. Release automation via changesets (manual versioning + dual-registry publish is error-prone).
3. A consumer-facing theming guide for the OKLCH ladder in `src/styles/colors.css`.
4. Decide on `react-grab` (lazy-loaded in `src/main.tsx`, otherwise undocumented): document or drop.

## Considered and rejected (do not re-audit)

- AppLayout `scrollIntoView` prototype wrapper is dead code — showcase-only, not exported; cosmetic.
- "Style-injection TOCTOU race" in combobox/sonner — not real; synchronous DOM mutation on a single thread.
- Sidebar cookie lacking `SameSite` — non-sensitive UI state; browsers default to Lax.
- `install-peers` shell-injection — package list is hardcoded; theoretical only.
- `init-css` "path traversal" — the user passing their own output path is intended CLI behavior.
- `publish-npmjs.js` non-atomic package.json/.npmrc swap — maintainer-only exposure, low value.
- Sidebar `useCallback` missing `_setOpen` dep — harmless (stable setter); hooks lint is off anyway.
- `resolve-target-dir` substring match on `node_modules` — real but cosmetic edge case; covered
  indirectly by plan 003's tests.
