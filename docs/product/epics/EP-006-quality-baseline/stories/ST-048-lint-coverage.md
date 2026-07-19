---
id: ST-048
epic: EP-006
title: Lint coverage across src and scripts
status: in-progress
priority: must
release: unset
breaking: false
scope: [eslint.config.js, package.json, .github/workflows/ci.yml]
---

# ST-048 — Lint coverage across `src` and `scripts`

As a maintainer of `@nqlib/nqui`,
I want one lint invocation that covers the library source and the shipped CLI scripts at zero
warnings,
so that a mechanical defect never reaches a consumer through either the bundle or the CLI.

## Acceptance criteria

- [x] `package.json` exposes `"lint": "eslint src scripts --max-warnings 0"` as the single entry
      point; CI runs the same command verbatim (`.github/workflows/ci.yml`, step
      "Lint source and scripts").
- [x] `eslint.config.js` is flat config (`defineConfig` + `globalIgnores`) and applies
      `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks.configs.flat.recommended`
      and `reactRefresh.configs.vite` to `**/*.{ts,tsx}`.
- [x] `@typescript-eslint/no-unused-vars` is an **error** with `^_` ignore patterns, and
      `no-console` warns except `warn`/`error`/`info`/`debug` — so a stray `console.log` fails CI
      under `--max-warnings 0`.
- [x] The ignore list is minimal and intentional: `dist`, `src/main.tsx`, `src/App.tsx`,
      `src/components/debug/**`, `scripts/examples/**`.
- [x] `pnpm run lint` exits 0 on `main`.
- [ ] `eslint.config.js` has a `files: ['scripts/**/*.{js,mjs}']` block extending
      `js.configs.recommended` with `globals.node`, so `no-undef` / `no-unused-vars` actually apply
      to the shipped CLI (plan 003 Step 1).
- [ ] `pnpm exec eslint --print-config scripts/cli.js` reports a non-empty `rules` object.

## Technical notes

- No public API surface. The check protects the **library source and the shipped `scripts/` CLI** —
  the files that run inside a consumer's project (`init-css.js`, `init-cursor.js`, `post-install.js`,
  `resolve-target-dir.js`).
- **Known gap, verified:** `eslint src scripts --max-warnings 0` walks `scripts/` but no config block
  matches `scripts/**/*.js`, so those files are checked against **zero rules** —
  `pnpm exec eslint --print-config scripts/cli.js` returns an empty `rules` object today. The command
  passes vacuously. The last two criteria carry that remainder; plan 003 Step 1 specifies the fix and
  warns to expect first-run violations (escape hatch: narrow to `{'no-undef': 'error'}` if more than
  ~40 surface).
- `src/pages/**`, `src/components/design-system/**` and `component-example.tsx` were dropped from the
  ignore list when the showcase left this repo — the remaining ignores are the real ones.

## Out of scope

- The disabled `react-hooks` rules — ST-055.
- Typechecking (a separate CI step, and `tsconfig.app.json` coverage is ST-053).
