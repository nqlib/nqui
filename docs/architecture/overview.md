# Architecture overview

## Package layout

Single npm package `@nqlib/nqui` at repo root (not a monorepo).

| Path | Role |
|------|------|
| `src/` | Library source only |
| `src/entries/` | Optional subpath exports (carousel, command, sortable, …) |
| `dist/` | Library build output (`build:lib`) |
| `docs/components/` | Per-component API markdown — **public**, shipped in npm |
| `docs/nqui-skills/` | Full skill bundle — **public**, shipped in npm |
| `docs/product/` | Epics and stories — **not** shipped in npm |
| `skills/consumer/nqui/` | Consumer skill SOT — edit here, sync everywhere |
| `scripts/` | CLI, build, publish, skill sync |
| `internal-notes/` | Legacy maintainer notes |

**Live catalog / recipes** live in sibling **nqui-showcase** (`../nqui-showcase/src/components/showcase/`). Do not recreate a Vite showcase app in this package.

## Build pipeline

```
npm run build:lib   → dist/ (Vite library mode + types + styles)
npm run sync:skills → .agents/skills/, public/.well-known/agent-skills/
npm run dev         → prints pointer to nqui-showcase catalog (no app server)
```

## Consumer install surfaces

1. **npm package** — `docs/nqui-skills` and `docs/components` ship in the tarball; agents read `node_modules/@nqlib/nqui/docs/`
2. **CLI** — `npx @nqlib/nqui init-skills` copies to `.cursor/nqui-skills/`
3. **Live catalog** — sibling nqui-showcase (`/catalog`, `/recipes/*`, …)

## Design philosophy

- **LLM-native docs** — no separate MDX doc site; agents read markdown from the package
- **Consumer showcase** — visual catalog in nqui-showcase; pre-publish QA via `pnpm nqui:local`
- **Skills split** — consumer skills ≠ maintainer skills (see `AGENTS.md`)

See also: [`internal-notes/SKILLS-ARCHITECTURE.md`](../../internal-notes/SKILLS-ARCHITECTURE.md)
