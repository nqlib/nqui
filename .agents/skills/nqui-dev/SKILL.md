---
name: nqui-dev
description: >-
  Maintain the @nqlib/nqui library — source, build pipeline, peers, exports, publish.
  NOT for integrating nqui in external apps. Use skills/consumer/nqui for that.
license: MIT
compatibility: Node 20+, React 19 (dev), Vite 7, TypeScript 5.9
metadata:
  author: nqlib
  version: "1.0.0"
---

# nqui-dev (maintainer)

**NOT for external app integration.** Consumer skill: [`skills/consumer/nqui/SKILL.md`](../../skills/consumer/nqui/SKILL.md)

## Scope

| In scope | Out of scope |
|----------|--------------|
| `src/` components and entries | How to use nqui in a consumer app |
| `build:lib`, exports, peers | Component doc prose (see nqui-docs) |
| CLI scripts in `scripts/` | Showcase UI design |
| Publish pipeline | |

## Cross-links

- Docs maintainer: [`.agents/skills/nqui-docs/SKILL.md`](../nqui-docs/SKILL.md)
- Consumer SOT: [`skills/consumer/nqui/`](../../skills/consumer/nqui/SKILL.md)
- Internal vault: [`docs/index.md`](../../docs/index.md)
- DoD: [`docs/product/ai-contract.md`](../../docs/product/ai-contract.md)

## Dependency rules

- Optional peers live in subpath entries (`src/entries/`), not main entry (plan 005)
- Showcase-only deps → `devDependencies`
- New runtime dep → check bundle size skill + peer meta

## Workflow

1. Read existing component patterns in `src/components/`
2. Implement + export from `src/index.ts` or `src/entries/<name>.ts`
3. Add/update `docs/components/nqui-<name>.md` (coordinate with nqui-docs)
4. Run verification (below)
5. Update CHANGELOG for user-visible changes

## DoD checklist

Same as [`docs/product/ai-contract.md`](../../docs/product/ai-contract.md) — Library changes section.

## Verification

```bash
npm run sync:skills && npm run skill:validate
npm run lint && npm run test && npm run build:lib
npm run verify:publish   # before release
```

## Key paths

| Path | Purpose |
|------|---------|
| `src/index.ts` | Main export barrel |
| `src/entries/` | Optional subpath exports |
| `scripts/build-styles.js` | CSS build |
| `scripts/verify-build.js` | Post-build checks |
| `scripts/verify-publish.mjs` | Pre-publish gate |
| `vite.config.ts` | Library + app modes |
