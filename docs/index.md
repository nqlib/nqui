# nqui internal vault

Maintainer-facing notes: **why** and **where** — not public API prose.

## Start here

| Topic | Location |
|-------|----------|
| What we're building (epics / stories) | [`docs/product/README.md`](./product/README.md) |
| How we work (agents + humans) | [`docs/product/agentic-coding-guideline.md`](./product/agentic-coding-guideline.md) |
| Git workflow (branches, releases) | [`docs/conventions.md`](./conventions.md) |
| Durable project context | [`memory/INDEX.md`](../memory/INDEX.md) — write-policy in [`memory/skills.md`](../memory/skills.md) |
| Public API (components) | [`docs/components/`](./components/README.md) — shipped in npm |
| Consumer agent skills (SOT) | [`skills/consumer/nqui/`](../skills/consumer/nqui/SKILL.md) |
| Detailed skill bundle (npm) | [`docs/nqui-skills/`](./nqui-skills/SKILL.md) — synced from consumer SOT |
| Agent routing | [`AGENTS.md`](../AGENTS.md) |
| Skills install paths | [`skills/README.md`](../skills/README.md) |

## Vault sections

| Section | Purpose |
|---------|---------|
| [`architecture/`](./architecture/overview.md) | Repo layers, build pipeline, package layout |
| [`product/`](./product/README.md) | Epics & stories, working guideline, roadmap, maintainer DoD (`ai-contract.md`) |
| [`meta/`](./meta/llm-usage.md) | LLM/agent usage, publishing |

## Maintainer skills

| Task | Skill |
|------|-------|
| Change library source, build, publish | [`.agents/skills/nqui-dev/`](../.agents/skills/nqui-dev/SKILL.md) |
| Change component docs, catalog specimens | [`.agents/skills/nqui-docs/`](../.agents/skills/nqui-docs/SKILL.md) + sibling **nqui-showcase** |
| Integrate nqui in an **external app** | [`skills/consumer/nqui/`](../skills/consumer/nqui/SKILL.md) — **not** maintainer skills |

## Related (not duplicated here)

- [`README.md`](../README.md) — consumer install
- [`INSTALLATION.md`](../INSTALLATION.md) — CSS and framework setup
- [`internal-notes/`](../internal-notes/) — legacy maintainer notes (migrate into vault over time)
- [`plans/`](../plans/README.md) — engineering improvement plans

## Verification

```bash
npm run sync:skills && npm run skill:validate
npm run lint && npm run test && npm run build
```
