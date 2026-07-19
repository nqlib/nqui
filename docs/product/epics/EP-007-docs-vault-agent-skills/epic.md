---
id: EP-007
title: Docs vault & agent skills
status: in-progress
owner: maintainer
---

# EP-007 — Docs vault & agent skills

## Goal

nqui is consumed by agents as much as by people. This epic owns the two audiences' documentation and
the pipeline that keeps them true: component docs that match the source, a consumer skill that ships
with the package and is discoverable over HTTP, and a maintainer vault that says *why* and *where*.

## Success metrics

- An agent in a consumer app can find nqui's rules without the maintainer pasting anything.
- A doc page never describes props the source doesn't have.
- One source of truth per audience — consumer skill edited in one place, synced everywhere else.

## Scope — In

- `docs/components/` public API pages + the README index.
- Consumer skill SOT (`skills/consumer/nqui/`) and the sync pipeline into `.agents/skills/nqui/`,
  `public/.well-known/agent-skills/`, `docs/nqui-skills/`.
- HTTP agent discovery (`.well-known/agent-skills/index.json`).
- Maintainer skills `.agents/skills/nqui-dev/`, `.agents/skills/nqui-docs/`.
- The catalog boundary — no showcase in this repo; specimens live in sibling nqui-showcase.
- The internal vault (`docs/index.md`, `architecture/`, `meta/`, `product/`) and the migration of
  `internal-notes/` into it.
- This product-docs system itself.

## Scope — Out (explicit)

- The design guidance *content* in `docs/nqui-skills/` (ELEVATION, MOTION, COMPOSITION…) documents
  EP-001/002/003 — this epic owns the pipeline and structure that ships it, not the design calls.
- The showcase app's own code — different repo.
- Cursor rule distribution via `postinstall` — that's consent-gated consumer mutation, EP-005 ST-043.

## Dependencies

- Every other epic supplies the content this one publishes.

## Public API surface

`docs/components/*` and `docs/nqui-skills/*` (both ship in the npm tarball via `files`),
`skills/consumer/nqui/SKILL.md`, `public/.well-known/agent-skills/**`.

## Stories

| ID | Title | Status | Release |
|---|---|---|---|
| ST-056 | Component doc pages and index | in-progress | pre-baseline |
| ST-057 | Consumer skill SOT and sync pipeline | done | pre-baseline |
| ST-058 | HTTP agent-skill discovery | done | pre-baseline |
| ST-059 | Maintainer skills — nqui-dev and nqui-docs | done | pre-baseline |
| ST-060 | Catalog boundary — showcase moved to a sibling repo | done | 0.6.3 |
| ST-061 | Remove doc pages for removed components | ready | unset |
| ST-062 | Migrate `internal-notes/` into the vault | ready | unset |
| ST-063 | Product docs layer — epics, stories, memory | in-progress | unset |

## Implementation references

- `internal-notes/SKILLS-ARCHITECTURE.md` — why LLM-native skills instead of a docs site (ST-057).
- `scripts/sync-consumer-skills.mjs`, `scripts/validate-skills.mjs`.
- Release 0.6.3 (`9f93dab`) — Storybook removed, showcase sidebar extracted (ST-060).
- SecoLab's `docs/product/agentic-coding-guideline.md` — the model this layer was adapted from
  (ST-063).
