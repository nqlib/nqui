---
name: pnpm-only
description: This repo is pnpm-only — npm install crashes on its pnpm-structured node_modules
type: convention
created: 2026-07-19
---

nqui uses **pnpm** (`pnpm-lock.yaml`). Running `npm install` / `npm add` against the
pnpm-structured `node_modules` fails inside npm's arborist with
`Cannot read properties of null (reading 'matches')` — an unhelpful error that reads like a repo
problem rather than a package-manager mismatch.

**Why:** worth a memory because the failure mode is opaque and has cost a session before; the
lockfile alone doesn't warn you.

**How to apply:** always `pnpm` for installs and scripts (`pnpm build:lib`, `pnpm test`,
`pnpm exec eslint …`). Docs that say `npm run <script>` are fine to read as `pnpm run <script>`.
