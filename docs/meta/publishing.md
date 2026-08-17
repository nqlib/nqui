# Publishing

Summary — full guide: [`internal-notes/PUBLISHING.md`](../../internal-notes/PUBLISHING.md).

## Gate — prove packed types, then latest

Library tests and `pnpm nqui:local` typecheck **source**. Vercel typechecks the **packed `.d.ts`**.
Those diverged for TabsList in 0.7.8–0.7.9. Do not move `latest` until the packed consumer check
passes.

```bash
pnpm run verify:publish     # includes packed consumer tsc
make prove-showcase         # sibling nqui-showcase `pnpm typecheck` against the tarball
make publish                # prove-showcase (if sibling exists) then latest
```

`make publish-next` publishes with `--tag next`. That is still **public**. Semver ranges
(`^0.7.9`) install it. `--tag next` only changes a bare `npm install @nqlib/nqui`. It is a
canary for humans, not a hide. The private path is pack-and-prove locally, then `make publish`.

Promote a next-tag canary only after showcase `pnpm build` against that exact version:

```bash
make promote                # npm dist-tag add @nqlib/nqui@<version> latest
```

## Pre-publish

```bash
pnpm run sync:skills && pnpm run skill:validate
pnpm run verify:publish
make prove-showcase
```

## Registries

| Registry | Command |
|----------|---------|
| npmjs.com (latest) | `make publish` / `pnpm run publish:npm` |
| npmjs.com (next tag) | `make publish-next` |
| GitHub Packages | `pnpm run publish:github` |
| Both | `pnpm run publish:both` |

## What ships in npm

`files` in `package.json`: `dist`, `scripts`, `docs/nqui-skills`, `docs/components`, `README.md`, `INSTALLATION.md`

- `docs/components/` — component API markdown
- `docs/nqui-skills/` — full skill bundle (synced from consumer SOT)
- `scripts/` — CLI bins (`nqui`, `nqui-init-skills`, …)

`skills/consumer/` and `.agents/skills/` are **repo-only** — not in npm tarball.
