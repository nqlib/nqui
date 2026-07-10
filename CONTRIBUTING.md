# Contributing to nqui

Thanks for contributing. This guide covers maintainer workflow — **not** how to use nqui in your app (see [README.md](./README.md) and [INSTALLATION.md](./INSTALLATION.md)).

## Before you start

1. Read [`docs/index.md`](docs/index.md) — internal vault index
2. Load the right agent skill from [`AGENTS.md`](AGENTS.md):
   - Library changes → `.agents/skills/nqui-dev/`
   - Docs / skills / showcase → `.agents/skills/nqui-docs/`
3. Check [`docs/product/ai-contract.md`](docs/product/ai-contract.md) for Definition of Done

## Development setup

```bash
npm install
npm run dev          # showcase app (port 3000)
npm run build:lib    # library build
```

## Agent skills

| Audience | Edit here | Do NOT edit |
|----------|-----------|-------------|
| Consumer (external apps) | `skills/consumer/nqui/` | `.agents/skills/nqui/` (synced) |
| Maintainer — library | `.agents/skills/nqui-dev/` | — |
| Maintainer — docs | `.agents/skills/nqui-docs/` | — |

After editing consumer skill:

```bash
npm run sync:skills && npm run skill:validate
```

## Component docs

1. Add `docs/components/nqui-<name>.md`
2. Add row to `docs/components/README.md`
3. Verify props match `src/` exports

## Pull request checklist

- [ ] `npm run sync:skills && npm run skill:validate`
- [ ] `npm run lint && npm run test && npm run build`
- [ ] Component docs updated (if applicable)
- [ ] CHANGELOG updated (if user-visible change)
- [ ] Consumer and maintainer skill scopes not mixed

## Publishing

See [`docs/meta/publishing.md`](docs/meta/publishing.md) and [`internal-notes/PUBLISHING.md`](internal-notes/PUBLISHING.md).

## Plans

Engineering improvement plans: [`plans/README.md`](plans/README.md)
