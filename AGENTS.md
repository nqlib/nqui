# AGENTS.md

This file points to nqui skills for AI assistants. For *what to build and how we work*, start at
[`CLAUDE.md`](./CLAUDE.md) → [`docs/product/README.md`](docs/product/README.md) (epics & stories) and
[`docs/product/agentic-coding-guideline.md`](docs/product/agentic-coding-guideline.md). Durable
project context: [`memory/INDEX.md`](memory/INDEX.md).

## Catalog boundary (do not violate)

**Do not add or maintain a component catalog / showcase / recipes app in this repo.**

| Surface | Where |
|---------|--------|
| Live catalog (`/catalog`), recipes, patterns, design-system | Sibling **`nqui-showcase`** → `src/components/showcase/` |
| Pre-publish visual QA | `cd ../nqui-showcase && pnpm nqui:local && pnpm dev` |
| Pre-publish **types** QA | `make prove-showcase` (packed tarball → showcase `tsc -b`). `nqui:local` is not this gate. |
| Library source | `src/components/`, `src/entries/`, `npm run build:lib` |

`npm run dev` in this repo only prints that pointer — it does not start a Vite catalog.

## nqui Skills (SSOT: packages/nqui/docs/nqui-skills/)

All skills are stored in the nqui package at:

```
.cursor/nqui-skills/SKILL.md   ← hub / index
```

Skills available under `.cursor/nqui-skills/`:

| Skill | Purpose |
|-------|---------|
| **nqui-components** | Component selection, props, examples |
| **nqui-design-system** | Design tokens, spacing, Card + ScrollArea |
| **nqui-shadcn** | shadcn composition, forms, icons |
| **nqui-install** | Setup, install peers, CSS init |
| **nqui-bundle-size-best-practices** | Bundle size when adding deps |
| **nqui-local-published-toggle** | Switch local ↔ published nqui |
| **impeccable** | Design quality, AI-slop avoidance |
| **/audit**, **/polish**, **/layout**, etc. | Impeccable design commands |

## How to Use

When working with nqui components, AI assistants should:

1. Load `.cursor/nqui-skills/SKILL.md` — the hub index
2. Follow **`.cursor/rules/`** — especially **no-box-glow-ask-first** (no decorative glow; **ask** when unclear) and **nqui-radius** (chrome / panels / overlays are rungs of one `--radius`; circles and compact chips stay off that ladder)
3. Open sub-skills by task (e.g. `nqui-components/SKILL.md`)
4. For component docs: `.cursor/nqui-skills/COMPONENTS_INDEX.md` → one `components/nqui-<name>.md`
5. For live variants / recipes: open **nqui-showcase** `/catalog` (not this repo)

## Impeccable Design Skills

Run `/impeccable teach` first to establish design context, then use commands like:

- `/audit input-group` — audit a specific component
- `/polish` — cleanup UI inconsistencies
- `/layout` — fix spacing / alignment
