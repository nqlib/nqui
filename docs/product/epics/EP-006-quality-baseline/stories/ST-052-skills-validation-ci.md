---
id: ST-052
epic: EP-006
title: Validate and drift-check agent skills in CI
status: ready
priority: should
release: unset
breaking: false
scope: [scripts/validate-skills.mjs, scripts/sync-consumer-skills.mjs, package.json, .github/workflows/ci.yml]
---

# ST-052 — Validate and drift-check agent skills in CI

As an agent consuming `@nqlib/nqui` through its skill,
I want the published skill copies to be validated and provably in sync with their source of truth,
so that I never load a stale or malformed `SKILL.md` that disagrees with the shipped library.

## Acceptance criteria

- [ ] `.github/workflows/ci.yml` runs `pnpm run skill:validate` as a named step in the `verify` job.
- [ ] `scripts/validate-skills.mjs` also validates the **generated** copies —
      `.agents/skills/nqui/` and `public/.well-known/agent-skills/nqui/` — not only the three
      hand-authored dirs (`skills/consumer/nqui`, `.agents/skills/nqui-dev`,
      `.agents/skills/nqui-docs`).
- [ ] Its `⚠️ No SKILL.md in <dir>` branch becomes a failure, not a warning: a missing skill
      directory must exit 1 rather than pass silently.
- [ ] `public/.well-known/agent-skills/index.json` is validated — it exists, parses, and its
      `skills[].name` / `description` match the SOT frontmatter.
- [ ] A drift gate exists: CI runs `pnpm run sync:skills` and fails if
      `git diff --exit-code -- .agents/skills/nqui public/.well-known/agent-skills docs/nqui-skills`
      reports changes, so an edit to the SOT that was not synced cannot merge.
- [ ] Editing `skills/consumer/nqui/SKILL.md` without running `sync:skills` fails CI; running it
      makes CI pass. Record this negative test in the PR.
- [ ] Whether `skill:validate` belongs in the `build` script as well as CI is decided and recorded
      here (today `build` is `sync:skills && build:lib` — validation runs in neither).

## Technical notes

- No public API doc. The check protects the **agent-facing surface**: the consumer skill SOT at
  `skills/consumer/nqui/` and the three destinations `sync-consumer-skills.mjs` writes —
  `.agents/skills/nqui/`, `public/.well-known/agent-skills/nqui/` (plus `index.json`), and the
  `docs/nqui-skills/SKILL.md` hub frontmatter.
- Current state, verified: `skill:validate` runs in neither `build` nor CI, and it only checks that
  each `SKILL.md` under three directories has frontmatter `name` **and** `description`. It asserts
  nothing about content, nothing about the generated copies, and nothing about drift. `sync:skills`
  does run inside `build`, so a release regenerates the copies — but a PR that only touches docs
  never does.
- The sync is one-way and destructive (`cpSync … { force: true }`); the only protection against
  someone editing a generated copy is the drift gate this story adds.
- **Depends on EP-007 ST-057** (consumer skill SOT and sync pipeline, `done`), which defines the SOT
  and the sync contract this story mechanically enforces. Content rules for the skills belong to
  EP-007; this story owns only that they are checked.

## Out of scope

- Validating skill *content* against the shipped component props (docs-vs-source drift is EP-007).
- The maintainer skills' own structure (`.agents/skills/nqui-dev`, `nqui-docs`) beyond the existing
  frontmatter check.
