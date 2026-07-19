---
id: ST-057
epic: EP-007
title: Consumer skill SOT and sync pipeline
status: done
priority: must
release: pre-baseline
breaking: false
scope: [skills/consumer/nqui, scripts/sync-consumer-skills.mjs, scripts/validate-skills.mjs, .agents/skills/nqui, public/.well-known/agent-skills, docs/nqui-skills]
api: skills/consumer/nqui/SKILL.md
---

# ST-057 — Consumer skill SOT and sync pipeline

As a maintainer of `@nqlib/nqui`,
I want the consumer agent skill written in exactly one place and copied everywhere else by a script,
so that the npm bundle, the local agent dir and the HTTP route can never disagree with each other.

## Acceptance criteria

- [x] The SOT is `skills/consumer/nqui/` — a single `SKILL.md`, and nothing else is hand-edited.
- [x] `npm run sync:skills` (`scripts/sync-consumer-skills.mjs`) copies the SOT `SKILL.md` to
      `.agents/skills/nqui/SKILL.md` and `public/.well-known/agent-skills/nqui/SKILL.md`.
- [x] The same script copies all of `docs/nqui-skills/` (excluding its own `SKILL.md`) into both
      destinations' `references/` directories.
- [x] The script rewrites `docs/nqui-skills/SKILL.md`'s frontmatter from the SOT while preserving
      the extended hub body below it.
- [x] The script generates `public/.well-known/agent-skills/index.json` from the SOT frontmatter and
      **hard-fails** (`process.exit(1)`) if `name` or `description` is missing.
- [x] `npm run skill:validate` (`scripts/validate-skills.mjs`) checks `name` + `description`
      frontmatter across `skills/consumer/nqui/`, `.agents/skills/nqui-dev/`,
      `.agents/skills/nqui-docs/` and exits non-zero on a miss.
- [x] `sync:skills` runs as the first step of `npm run build`, so a publish cannot ship stale copies.
- [x] `CONTRIBUTING.md` and `skills/README.md` name the SOT and forbid editing the synced copies.
- [ ] CI fails when a synced copy is committed out of date (a drift check, not just a validator).

## Technical notes

- **The sync is one-way and destructive.** `cpSync(..., { force: true })` overwrites the
  destinations; an edit made directly in `.agents/skills/nqui/` or
  `public/.well-known/agent-skills/nqui/` is silently lost on the next build. That is the intended
  contract, but it means a drift check is the only thing that surfaces the mistake.
- **`.cursor/` is not touched by this pipeline.** Cursor rules are written by
  `scripts/init-cursor.js` (and `scripts/cursor-rule-nqui-components.mdc`), a separate path.
  `AGENTS.md` still describes `.cursor/nqui-skills/` as the hub, which is a consumer-side install
  path, not a sync target in this repo.
- The final criterion is open: `skill:validate` proves frontmatter is *well-formed*, not that the
  copies are *current*. Adding the drift check to CI is **EP-006 ST-052** ("Validate and drift-check
  agent skills in CI"); this story stays `done` on the pipeline itself.
- `parseFrontmatter` in the sync script is a YAML-lite reader that handles the `description: >-`
  folded block used by the SOT. Do not switch the SOT to another YAML style without updating both
  scripts.

## Out of scope

- The *content* of `docs/nqui-skills/` design guidance — EP-001/002/003 own it.
- CI wiring for the drift check — EP-006 ST-052.
- Installing rules into a consumer's `.cursor/` from `postinstall` — EP-005 ST-043.
