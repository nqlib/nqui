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

## Radius (do not flatten)

One `--radius` base. Chrome / panels / overlays use **different rungs of that ladder**, not different corner languages. Full rule: `docs/nqui-skills/nqui-design-system/SKILL.md` § Border Radius.

| Role | Class | Why |
|------|-------|-----|
| Chrome | `rounded-md` | Controls sit on a panel; 2px tighter so corners stay concentric |
| Panels | `rounded-lg` | Card **is** `--radius` |
| Overlays | `rounded-xl` | Dialog/Sheet wrap padded content; outer must be larger than inner |

**Stay off the ladder** (geometry / control nature — never “make it match ButtonGroup”):

- **Circles:** radio disc, Switch + thumb, Slider thumb, Avatar, scrollbar thumb, drawer handle, status dots → `rounded-full`
- **Compact chips** (short side ≤ 20px): Badge, kbd, Combobox chip, 20px icon buttons → `rounded-xs` (capped). `rounded-md` on `h-5` is a stadium at Soft.
- **Thin tracks:** Progress / Slider bar — stadium is correct (height is a few px)

Do not hardcode `border-radius: Npx`. Nested chip-in-shell (Tabs, sliding Radio): `inner = outer − inset`.

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
pnpm run sync:skills && pnpm run skill:validate
pnpm run lint && pnpm run test && pnpm run build:lib
pnpm run verify:publish   # build + packed consumer tsc + lint + test + tarball
pnpm run prove:showcase   # required before latest: sibling nqui-showcase tsc against the tarball
```

Do not treat `pnpm nqui:local` in the showcase as a publish gate. That path typechecks
**source** / linked dist. Vercel typechecks the **packed `.d.ts`**. `verify:consumer-types`
and `prove:showcase` are the consumer-shaped checks.

## Key paths

| Path | Purpose |
|------|---------|
| `src/index.ts` | Main export barrel |
| `src/entries/` | Optional subpath exports |
| `scripts/build-styles.js` | CSS build |
| `scripts/verify-build.js` | Post-build checks |
| `scripts/verify-publish.mjs` | Pre-publish gate |
| `vite.config.ts` | Library + app modes |
