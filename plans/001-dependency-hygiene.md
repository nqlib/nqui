# Plan 001 — Dependency hygiene: fix broken clean install and remove showcase-only packages from `dependencies`

**Status:** TODO
**Written against commit:** `6e2f8cb`
**Effort:** S · **Risk:** low · **Depends on:** nothing · **Blocks:** nothing (but plan 005 supersedes parts of this later)

---

## Why this matters

This repo is a published npm library (`@nqlib/nqui`). Two verified problems in `package.json`:

1. **Clean installs are broken.** The built main entry `dist/nqui.es.js` contains a top-level
   `import ... from "react-resizable-panels"`, but `react-resizable-panels` is only an *optional*
   peer dependency (`peerDependenciesMeta["react-resizable-panels"].optional = true`) and is NOT in
   `dependencies`. Package managers do not auto-install optional peers. A consumer who follows the
   README Quick Start (`npm install @nqlib/nqui`, then `import { Button } from '@nqlib/nqui'`) gets
   a module-resolution failure for `react-resizable-panels` at build time.

2. **Consumers install the showcase app's dependencies.** Several packages in `dependencies` are
   used only by the demo/showcase app (`src/App.tsx`, `src/pages/`) or by the maintainer-side build,
   never by any file in `dist/`. Every consumer pays for them (tens of MB of node_modules).

This plan is the safe, non-breaking fix. The deeper architectural fix (making optional peers truly
optional) is plan 005 and is a breaking change — do NOT attempt it here.

## Repo facts you need

- Package manager: **pnpm** (pnpm-lock.yaml, CI uses pnpm 10, Node 22). Run commands with `pnpm`.
- Build: `pnpm run build:lib` (Vite library mode + `tsc -p tsconfig.lib.json` + style build + verify).
- Lint: `pnpm exec eslint src scripts --max-warnings 0`. Tests: `pnpm test` (vitest).
- The library externalizes some packages in `vite.config.ts` → `rollupOptions.external` (those stay
  as bare imports in `dist/`); everything else gets bundled into the dist chunks.
- `scripts/` is SHIPPED in the npm package (`"files": ["dist", "scripts", "docs", ...]`) and some
  scripts run inside consumer projects via `npx`. A shipped script's external imports must stay in
  `dependencies`. Verified survey of external imports in `scripts/*.js`:
  - `scripts/init-css.js` imports **`minimist`** → `minimist` MUST remain in `dependencies`.
  - `scripts/generate-docs.js`, `scripts/init-debug-css.js`, `scripts/skill-templates.js` import
    `@nqlib/nqui` itself (fine — resolves to the installed package).
  - No other shipped script imports an external npm package.

## Current state (excerpts from `package.json` @ 6e2f8cb)

```jsonc
// dependencies (abridged — the problem entries):
"@codesandbox/sandpack-react": "^2.20.0",   // showcase only
"@fontsource-variable/inter": "^5.2.8",     // showcase only
"@shikijs/transformers": "^3.21.0",         // showcase only
"@tailwindcss/vite": "^4.1.17",             // app build config only
"lodash.throttle": "^4.1.1",                // bundled into dist if used; no bare import in dist
"minimist": "^1.2.8",                       // KEEP — used by shipped scripts/init-css.js
"postcss": "^8.4.0",                        // build-time (scripts/build-styles.js) only
"postcss-discard-comments": "^7.0.0",       // build-time only
"postcss-import": "^16.0.0",                // build-time only
"react-router-dom": "^7.11.0",              // showcase only
"shiki": "^3.21.0",                         // showcase only
"tailwindcss": "^4.1.17",                   // build-time only (consumers bring their own)

// peerDependencies includes:
"react-resizable-panels": "^4.0.0",         // optional per peerDependenciesMeta — but dist/nqui.es.js hard-imports it

// devDependencies includes:
"react-resizable-panels": "^4.2.1",
```

Verified bare (unbundled) imports across all files in `dist/` at this commit:
`react`, `react-dom`, `react/jsx-runtime`, `@radix-ui/react-slot`, `class-variance-authority`,
`clsx`, `tailwind-merge`, `react-resizable-panels` (main entry), and per optional chunk:
`cmdk`, `@dnd-kit/*`, `embla-carousel-react`, `react-day-picker`, `date-fns`, `sonner`, `vaul`.
All of those are in `dependencies` — EXCEPT `react-resizable-panels`. That is the bug.

## Steps

### Step 1 — Add `react-resizable-panels` to `dependencies`

In `package.json`, add to `dependencies` (keep alphabetical-ish placement consistent with the file):

```json
"react-resizable-panels": "^4.2.1"
```

Keep the existing `peerDependencies` and `peerDependenciesMeta` entries for it unchanged (the other
optional peers like `cmdk`, `vaul` follow exactly this dual-listing pattern — match it). Remove the
now-redundant `react-resizable-panels` line from `devDependencies` (a hard dependency is always
installed for development too).

Run: `pnpm install` (updates pnpm-lock.yaml — that lockfile change is expected and must be committed).

Verify:
```sh
node -e "const p=require('./package.json'); if(!p.dependencies['react-resizable-panels']) process.exit(1)"
```
Expected: exit 0.

### Step 2 — Move showcase/build-only packages to `devDependencies`

Move these EXACT packages (same version specifiers) from `dependencies` to `devDependencies`:

- `@codesandbox/sandpack-react`
- `@fontsource-variable/inter`
- `@shikijs/transformers`
- `@tailwindcss/vite`
- `lodash.throttle`
- `postcss`
- `postcss-discard-comments`
- `postcss-import`
- `react-router-dom`
- `shiki`
- `tailwindcss`

Do NOT move: `minimist` (shipped scripts need it), `next-themes` (imported by library source
`src/components/ui/sonner.tsx` and bundled; leave it where it is — plan 005 revisits it),
`tw-animate-css` (referenced by consumer CSS setup docs), any `@radix-ui/*` package, or anything
not on the list above.

Run: `pnpm install`.

Verify each moved package is genuinely absent from the built library's bare imports:
```sh
pnpm run build:lib
for pkg in @codesandbox/sandpack-react @fontsource-variable/inter @shikijs/transformers @tailwindcss/vite lodash.throttle postcss postcss-discard-comments postcss-import react-router-dom shiki tailwindcss; do
  if grep -rE "from\s*\"$pkg|require\(\"$pkg" dist/*.js >/dev/null 2>&1; then echo "FAIL: $pkg imported by dist"; fi
done; echo done
```
Expected output: just `done` (no FAIL lines). If any package prints FAIL, STOP — see escape hatches.

### Step 3 — Full verification gates

Run all of these; all must pass:

```sh
pnpm exec eslint src scripts --max-warnings 0
pnpm test
pnpm run build:lib
```

Expected: lint exits 0; vitest reports the existing suite passing (1 file, 4 tests at the time of
writing); build completes including its built-in `verify:build` step.

### Step 4 — Tarball smoke test (proves the original bug is fixed)

```sh
pnpm pack
mkdir -p /tmp/nqui-install-check && cd /tmp/nqui-install-check
npm init -y >/dev/null
npm install react react-dom <absolute-path-to-repo>/nqlib-nqui-0.6.3.tgz
node --input-type=module -e "
import('@nqlib/nqui').then(m => {
  if (!m.Button) throw new Error('Button missing');
  console.log('OK: main entry resolves with', Object.keys(m).length, 'exports');
})
"
```

Expected: prints `OK: main entry resolves with <N> exports`. At commit 6e2f8cb this exact check
fails with `Cannot find package 'react-resizable-panels'` — that failure disappearing is the point
of this plan. Clean up `/tmp/nqui-install-check` and the `.tgz` afterwards; do not commit the
tarball.

## Boundaries

- **In scope:** `package.json` (dependencies/devDependencies blocks only), `pnpm-lock.yaml` (via
  `pnpm install`).
- **Out of scope — do not touch:** `vite.config.ts` externals, `src/` (any file), `scripts/`,
  the `exports` map, `peerDependencies`/`peerDependenciesMeta` (except nothing changes there at
  all in this plan), version field, README (plan 005 handles doc updates for the bigger change).
- Do not "fix" the eager optional-peer imports in the barrel here — that is plan 005.

## Done criteria (machine-checkable)

1. `node -e "const p=require('./package.json'); const d=p.dependencies; ['react-router-dom','shiki','tailwindcss','postcss','@codesandbox/sandpack-react'].forEach(k=>{if(d[k])throw new Error(k)}); if(!d['react-resizable-panels']||!d['minimist'])throw new Error('missing')"` exits 0.
2. The Step 2 grep loop prints no FAIL lines after `pnpm run build:lib`.
3. `pnpm exec eslint src scripts --max-warnings 0 && pnpm test && pnpm run build:lib` all exit 0.
4. The Step 4 tarball smoke test prints the OK line.

## Test plan

No new automated tests required for this plan (plan 003 adds the test infrastructure; one of its
suggested tests — peer-list/package.json consistency — will lock in this plan's invariant). The
Step 4 smoke test is the manual regression check; record its output in the PR description.

## Maintenance note

Any future component that imports a new npm package must decide: bundled (add to `dependencies`),
externalized-required (add to `dependencies` + `rollupOptions.external`), or externalized-optional
(subpath entry only — see plan 005). The invariant to preserve: **every bare import specifier in
`dist/*.js` must be resolvable from a clean `npm install @nqlib/nqui`** (i.e., be in `dependencies`
or be `react`/`react-dom`). Plan 004 wires a CI check for export integrity; consider extending it
with the Step 2 grep loop.

## Escape hatches

- If Step 2's grep shows a moved package IS imported by `dist/` (e.g. `lodash.throttle` appears as
  a bare import because someone added it to `rollupOptions.external` since this plan was written),
  put that one package back into `dependencies`, note it in the PR, and continue with the rest.
- If the Step 4 smoke test fails for a package OTHER than the ones this plan touches, STOP and
  report back — that's a pre-existing packaging break this plan must not paper over.
- If `pnpm install` rewrites the lockfile with unrelated mass changes (lockfile format migration),
  STOP and report back rather than committing a noisy lockfile.
