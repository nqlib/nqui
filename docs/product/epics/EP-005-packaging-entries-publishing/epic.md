---
id: EP-005
title: Packaging, entries & publishing
status: in-progress
owner: maintainer
---

# EP-005 — Packaging, entries & publishing

## Goal

Installing nqui should cost a consumer only what they actually import, install cleanly on a first
try, and never mutate their project behind their back. Publishing should be a repeatable, verified
operation rather than a remembered ritual.

## Success metrics

- A consumer who never imports the calendar never installs `react-day-picker`.
- `dist/nqui.es.js` stays inside its gzip budget; a heavy dependency sneaking into the main entry
  fails CI.
- `npm pack` output is asserted, not inspected by eye, before every publish.
- Nothing is written into a consumer's repo without their consent.

## Scope — In

- Subpath exports (`./carousel ./command ./sortable ./dnd ./calendar ./sonner ./drawer ./styles
  ./debug ./debug.css`) and the entries that back them.
- `peerDependencies` / `peerDependenciesMeta.optional` policy; the main entry never importing an
  optional peer; `dist-guard.test.ts` as the invariant.
- Per-entry gzip budgets (`scripts/check-bundle-size.js`).
- Style build and dist verification (`build-styles.js`, `verify-build.js`).
- Consumer CLI surface — the `postinstall` gate and what `nqui:init` is allowed to do (ST-043).
  What the individual sub-commands *produce* belongs elsewhere: `init-css` colors → EP-001 ST-007,
  `init-cursor` / `init-skills` → EP-007.
- Dual-registry publishing (`publish-npmjs.js`, GitHub Packages, `Makefile`) and
  `verify:publish` / `prepublishOnly`.
- Release automation (not yet started).

## Scope — Out (explicit)

- What a component *does* — EP-002/003/004 own that; this epic owns how it is delivered.
- CI job composition and test coverage → EP-006.
- Consumer-facing install prose (`INSTALLATION.md`, install skill) → EP-007.

## Dependencies

- EP-006 owns the CI that enforces several invariants here.

## Public API surface

`package.json` (`exports`, `files`, `peerDependencies`, `peerDependenciesMeta`, `publishConfig`),
`src/entries/*`, `dist/*`, the `scripts/*` CLI that ships in the tarball.

## Stories

| ID | Title | Status | Release |
|---|---|---|---|
| ST-037 | Subpath entries for optional-peer components | done | 0.7.0 |
| ST-038 | Optional-peer policy and the dist-guard invariant | done | 0.7.0 |
| ST-039 | Per-entry gzip budgets | done | 0.7.0 |
| ST-040 | `./resizable` subpath entry | backlog | unset |
| ST-041 | Mark `cmdk` optional in `peerDependenciesMeta` | ready | unset |
| ST-042 | `./table` subpath for the TanStack DataTable | backlog | unset |
| ST-043 | Postinstall consent — stop silent consumer mutation | ready | unset |
| ST-044 | Dual-registry publish with pre-publish verification | done | 0.7.0 |
| ST-045 | Style build and dist CSS verification | done | pre-baseline |
| ST-046 | Release automation | backlog | unset |
| ST-047 | Split `next-themes` out of the sonner chunk | backlog | unset |

## Implementation references

- `plans/001-dependency-hygiene.md`, `plans/002-postinstall-consent.md`,
  `plans/005-optional-peer-entry-restructure.md` — the audit plans behind ST-037/038/043.
- Release 0.7.0 (`63c92ea`) — dependency hygiene, subpath entries, publish hardening.
- `internal-notes/PUBLISHING.md` — the dual-registry runbook (ST-044).
- `internal-notes/PEER_DEPENDENCIES.md` — component → optional-peer mapping (needs re-verification).
