# CLAUDE.md — nqui

Read this first when working in **nqui** (`@nqlib/nqui`).

## Catalog boundary

**Do not add or maintain a component catalog, recipes app, or Vite showcase in this repo.**

| Task | Where |
|------|--------|
| Live `/catalog`, `/patterns`, `/recipes/*`, `/design-system` | Sibling **nqui-showcase** (`../nqui-showcase/src/components/showcase/`) |
| Pre-publish visual QA | `cd ../nqui-showcase && pnpm nqui:local && pnpm dev` |
| Pre-publish **types** QA | `make prove-showcase` (packed tarball → showcase `tsc -b`). `nqui:local` is not this gate. |
| Library API / components | `src/components/`, `src/entries/` |
| Consumer skills | `skills/consumer/nqui/` then `npm run sync:skills` |

`npm run dev` only prints the catalog pointer. Library work: `npm run build:lib`, `npm run test`.

## Task routing — load 1–3 files, do not bulk-read

| Task | Load |
|------|------|
| Library source | `.agents/skills/nqui-dev/SKILL.md` |
| Docs / skills sync | `.agents/skills/nqui-docs/SKILL.md` |
| Consumer integration | `skills/consumer/nqui/SKILL.md` |
| Product work (epics / stories) | `docs/product/README.md` + `docs/product/agentic-coding-guideline.md` |
| Technical plans (multi-phase) | `plans/README.md` |
| Recall or save durable project context | `memory/INDEX.md` → write-policy `memory/skills.md` |
| Definition of Done | `docs/product/ai-contract.md` |

## Shared rules

- **Git:** branch from `dev`, PR into `dev`, **squash-merge**; release via `dev` → `main` + tag
  `vX.Y.Z`. Never commit directly to `main` or `dev`. Branch names carry the story
  (`feat/st-031-kanban-board`), commits carry the ref (`feat(dnd): … (ST-031)`). Hotfix: from
  `main`, back into `main`, then merge `main` into `dev`. Full workflow: `docs/conventions.md`.
  Commit only when asked.
- **pnpm only.** `npm install` crashes on this repo's `node_modules` (see `memory/pnpm-only.md`).
  Docs that say `npm run <script>` read as `pnpm run <script>`.
- **Stories:** if the task implements a story (`docs/product/epics/**/stories/ST-*.md`), read the
  story and its `api:` doc page first and implement only what the acceptance criteria require. Tick
  the criteria as you go; set `status: review` — **never `done`** (a human closes stories) — and keep
  the epic's story table in sync.
- **Intake (work with no story yet):** anything that changes the **public API surface** (a new
  export, a prop added/renamed/removed, a peer dependency change, an observable build/publish
  change) needs a story before it lands — find the covering story, or ask the maintainer whether it
  belongs to an existing epic. Bug fixes log a dated line under the owning story's `## Bugs`. Docs
  typos, internal refactors, lint fixes and added tests are below the story line. Full flow:
  `docs/product/agentic-coding-guideline.md` §8.
- **Docs-as-code:** a PR that changes behavior updates its docs in the same PR — `docs/components/`
  page, `docs/components/README.md` row, consumer skill (`sync:skills`), CHANGELOG.
- **Memory:** durable, non-derivable facts live in `memory/` (one file each, `INDEX.md` lists them).
  Never track work status there — that's a story. The bar is high; most turns write nothing.

See [AGENTS.md](./AGENTS.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).
