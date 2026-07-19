---
id: ST-059
epic: EP-007
title: Maintainer skills — nqui-dev and nqui-docs
status: done
priority: must
release: pre-baseline
breaking: false
scope: [.agents/skills/nqui-dev, .agents/skills/nqui-docs, scripts/validate-skills.mjs, AGENTS.md, CONTRIBUTING.md, CLAUDE.md]
api: skills/README.md
---

# ST-059 — Maintainer skills: nqui-dev and nqui-docs

As an agent asked to change this repository (not to use the library),
I want two narrow maintainer skills split by what they may touch,
so that I load one small file for the task instead of the consumer skill or the whole vault.

## Acceptance criteria

- [x] `.agents/skills/nqui-dev/SKILL.md` covers library source: `src/`, entries, peers, exports,
      `build:lib`, `scripts/` CLIs, the publish pipeline.
- [x] `.agents/skills/nqui-docs/SKILL.md` covers documentation: `docs/components/`,
      `docs/nqui-skills/`, the consumer SOT, `public/.well-known/`, `public/llms.txt`,
      `scripts/generate-docs.js`.
- [x] Each skill states an explicit **out of scope** column, and each disclaims consumer
      integration, pointing at `skills/consumer/nqui/SKILL.md`.
- [x] The two skills cross-link each other and the vault index (`docs/index.md`).
- [x] `nqui-docs` restates the catalog boundary — no `src/pages/` catalog or showcase app in this
      repo (ST-060).
- [x] Both carry `name` + `description` frontmatter and are covered by `npm run skill:validate`
      (`SKILL_DIRS` in `scripts/validate-skills.mjs` names both directories).
- [x] Routing points at them from `CLAUDE.md` ("Task routing"), `AGENTS.md`, `CONTRIBUTING.md`
      ("Before you start") and `skills/README.md`'s audience table.
- [x] Maintainer skills are excluded from the consumer sync and the HTTP bundle — `sync:skills`
      only writes `.agents/skills/nqui/`, never `nqui-dev`/`nqui-docs`.

## Technical notes

- The split is by **surface**, not by seniority: a change to `src/` that also changes a prop needs
  both skills, and the guideline's vertical-slice rule means it is still one story.
- `.agents/skills/nqui/` sits beside these two but is machine-generated from the consumer SOT
  (ST-057). Only `nqui-dev/` and `nqui-docs/` are hand-authored in `.agents/skills/`; a contributor
  who edits the wrong one loses the work on the next `sync:skills`.
- `validate-skills.mjs` walks each directory recursively for `SKILL.md`, so sub-skills added under
  either maintainer skill are validated automatically without touching the script.
- `nqui-docs` references `scripts/generate-docs.js`, which exists; keep that pointer accurate if the
  docs tooling is ever replaced.

## Out of scope

- The consumer skill and its sync — ST-057.
- Showcase-side skills or specimens — sibling **nqui-showcase**.
- A third "product" maintainer skill; product routing lives in `CLAUDE.md` plus
  `docs/product/README.md` (ST-063) rather than in `.agents/skills/`.
