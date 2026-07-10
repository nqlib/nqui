# Architecture overview

## Package layout

Single npm package `@nqlib/nqui` at repo root (not a monorepo).

| Path | Role |
|------|------|
| `src/` | Library source + Vite showcase app |
| `src/entries/` | Optional subpath exports (carousel, command, sortable, …) |
| `dist/` | Library build output (`build:lib`) |
| `dist-app/` | Showcase app build (`build:app`) |
| `docs/components/` | Per-component API markdown — **public**, shipped in npm |
| `docs/nqui-skills/` | Full skill bundle — **public**, shipped in npm |
| `skills/consumer/nqui/` | Consumer skill SOT — edit here, sync everywhere |
| `scripts/` | CLI, build, publish, skill sync |
| `internal-notes/` | Legacy maintainer notes |

## Build pipeline

```
npm run build:lib   → dist/ (Vite library mode + types + styles)
npm run build:app   → dist-app/ (showcase catalog + recipes)
npm run sync:skills → .agents/skills/, public/.well-known/agent-skills/
```

## Consumer install surfaces

1. **npm package** — `docs/` ships in tarball; agents read `node_modules/@nqlib/nqui/docs/`
2. **CLI** — `npx @nqlib/nqui init-skills` copies to `.cursor/nqui-skills/`
3. **HTTP** (when showcase deployed) — `/.well-known/agent-skills/`, `/llms.txt`

## Design philosophy

- **LLM-native docs** — no separate MDX doc site; agents read markdown from the package
- **Showcase app** — live component catalog at `npm run dev` (port 3000)
- **Skills split** — consumer skills ≠ maintainer skills (see `AGENTS.md`)

See also: [`internal-notes/SKILLS-ARCHITECTURE.md`](../../internal-notes/SKILLS-ARCHITECTURE.md)
