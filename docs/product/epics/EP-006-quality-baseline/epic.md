---
id: EP-006
title: Quality baseline
status: in-progress
owner: maintainer
---

# EP-006 — Quality baseline

## Goal

Make "green" mean something: one CI pipeline that would actually catch the regressions this library
can ship — a broken export, an inlined optional peer, a bundle blowout, a component that stopped
rendering.

## Success metrics

- Every invariant the repo claims (barrel matches source, no peer source inlined, budgets held,
  skills in sync) is machine-checked, not checklist-checked.
- A contributor cannot merge a change that breaks the published surface without CI saying so.
- Test coverage exists for the parts consumers actually break on — form controls and overlays, not
  only the best-tested corner.

## Scope — In

- ESLint over `src` and `scripts` at zero warnings.
- Vitest baseline: unit, component smoke, CLI (`init-css`), and `dist-guard`.
- The CI `verify` job: lint → typecheck → build → test → size.
- Wiring the orphaned `scripts/validate-exports.mjs`.
- Skills validation and drift detection in CI.
- Node version matrix and app-project typecheck.
- Closing the test-coverage gap on form controls, overlays and hooks.
- The `react-hooks` lint debt (rules currently disabled).

## Scope — Out (explicit)

- What the checks enforce is defined by the owning epic (bundle budgets: EP-005; docs sync: EP-007).
  This epic owns that they *run*.
- Visual QA — that is a manual pass in sibling nqui-showcase.

## Dependencies

- EP-005 (the invariants), EP-007 (the skills sync being validated).

## Public API surface

None directly — but this epic is what keeps every other epic's surface honest.

## Stories

| ID | Title | Status | Release |
|---|---|---|---|
| ST-048 | Lint coverage across `src` and `scripts` | in-progress | unset |
| ST-049 | Test baseline — unit, component smoke, CLI, dist guard | done | 0.7.0 |
| ST-050 | CI verify pipeline | done | 0.7.0 |
| ST-051 | Wire `validate-exports` into scripts and CI | ready | unset |
| ST-052 | Validate and drift-check agent skills in CI | ready | unset |
| ST-053 | Node matrix and app-project typecheck | backlog | unset |
| ST-054 | Test coverage for form controls, overlays and hooks | backlog | unset |
| ST-055 | Re-enable the `react-hooks` lint rules | backlog | unset |

## Implementation references

- `plans/003-test-and-lint-baseline.md`, `plans/004-ci-hardening.md` — the audit plans; their
  `plans/README.md` status table is a release behind reality (ST-062 covers reconciling it).
- `.github/workflows/ci.yml` — the single `verify` job.
