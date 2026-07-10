# Publishing

Summary — full guide: [`internal-notes/PUBLISHING.md`](../../internal-notes/PUBLISHING.md).

## Pre-publish

```bash
npm run sync:skills && npm run skill:validate
npm run lint && npm run test && npm run build:lib
npm run verify:publish
```

## Registries

| Registry | Command |
|----------|---------|
| npmjs.com | `npm run publish:npm` |
| GitHub Packages | `npm run publish:github` |
| Both | `npm run publish:both` |

## What ships in npm

`files` in `package.json`: `dist`, `scripts`, `docs`, `README.md`, `INSTALLATION.md`

- `docs/components/` — component API markdown
- `docs/nqui-skills/` — full skill bundle (synced from consumer SOT)
- `scripts/` — CLI bins (`nqui`, `nqui-init-skills`, …)

`skills/consumer/` and `.agents/skills/` are **repo-only** — not in npm tarball.
