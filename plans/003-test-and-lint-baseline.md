# Plan 003 — Establish a test and lint baseline for shipped CLI scripts and core components

**Status:** TODO
**Written against commit:** `6e2f8cb`
**Effort:** M · **Risk:** low · **Depends on:** nothing · **Blocks:** plan 005 (do this first)

---

## Why this matters

The package has 146 source files plus 28 shipped Node CLI scripts, and exactly ONE test file
(`src/lib/utils.test.ts` — 4 assertions on the `cn()` class-merger). Worse, the CLI scripts are not
even linted: CI runs `eslint src scripts --max-warnings 0`, but `eslint.config.js` only defines
rules for `files: ['**/*.{ts,tsx}']`, so every `scripts/*.js` file matches no config block and is
checked against zero rules. The scripts that write files into CONSUMER projects (`init-css.js`,
`init-cursor.js`, `post-install.js`, `resolve-target-dir.js`) ship with no automated safety net at
all.

This plan creates the seam: lint coverage for `scripts/`, a CLI test harness using temp-dir
fixtures, a handful of high-value CLI tests, component smoke tests, and one consistency test that
locks in plan 001's packaging invariant. Plan 005 (a risky packaging restructure) must not start
until this lands.

## Repo facts you need

- Package manager: **pnpm**. Verification commands: `pnpm exec eslint src scripts --max-warnings 0`,
  `pnpm test` (vitest 3.x, jsdom environment, globals on), `pnpm run build:lib`.
- `vitest.config.ts` @ 6e2f8cb:

  ```ts
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'dist-app'],
  },
  ```

  `src/test/setup.ts` is one line: `import '@testing-library/jest-dom/vitest'`.
- `@testing-library/react` and `@testing-library/jest-dom` are already in devDependencies. JSX
  tests work (plugin-react is loaded in vitest config).
- The existing test exemplar to imitate (style, describe/it naming): `src/lib/utils.test.ts`.
- `eslint.config.js` @ 6e2f8cb (the structure to extend — flat config, `defineConfig`):

  ```js
  export default defineConfig([
    globalIgnores([ 'dist', 'src/pages/**', 'src/main.tsx', 'src/App.tsx',
      'src/components/debug/**', 'src/components/component-example.tsx',
      'src/components/design-system/**', 'scripts/examples/**' ]),
    {
      files: ['**/*.{ts,tsx}'],
      extends: [ js.configs.recommended, tseslint.configs.recommended,
        reactHooks.configs.flat.recommended, reactRefresh.configs.vite ],
      languageOptions: { ecmaVersion: 2020, globals: globals.browser },
      rules: { /* ... */ },
    },
    { files: ['**/*.{ts,tsx}'], rules: { /* react-hooks rules all off */ } },
  ])
  ```
- Shipped scripts are plain ESM JavaScript (`"type": "module"`), use `node:`-style and bare `fs`,
  `path` imports, `process`, `console`.
- `scripts/peer-deps.js` exports `REQUIRED_PEERS = []`, `OPTIONAL_PEERS = [12 packages]`,
  `FULL_PEER_LIST`.

## Steps

### Step 1 — Lint coverage for `scripts/`

Add a new block to `eslint.config.js` after the existing ts/tsx blocks:

```js
{
  files: ['scripts/**/*.{js,mjs}'],
  extends: [js.configs.recommended],
  languageOptions: {
    ecmaVersion: 2022,
    globals: globals.node,
  },
  rules: {
    'no-console': 'off', // CLI scripts talk to the user via stdout by design
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
},
```

Then run `pnpm exec eslint scripts --max-warnings 0`. **Expect violations to surface** — these
files have never been linted. Fix them mechanically (unused imports/vars, `no-undef`, unreachable
code). Behavior-preserving fixes only: if a violation can't be fixed without changing what a script
does (e.g. a genuinely used-before-defined variable indicating a real bug), add a line-level
`// eslint-disable-next-line <rule> -- TODO(bug): <one-line description>` and list it in the PR
description instead of changing behavior.

Verify rules actually apply now:
```sh
pnpm exec eslint --print-config scripts/cli.js | grep '"no-undef"'
```
Expected: a line showing `no-undef` configured (non-empty output).

### Step 2 — Let vitest see CLI tests

In `vitest.config.ts`, extend `include`:

```ts
include: [
  'src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}',
  'scripts/**/*.test.{js,mjs}',
],
```

Note: jsdom is a fine default environment even for the Node-only CLI tests; if anything in a CLI
test breaks under jsdom, prefix that test file with `// @vitest-environment node` rather than
restructuring the config.

### Step 3 — CLI tests with temp-dir fixtures

Create `scripts/__tests__` is NOT the convention here — co-locate tests next to the scripts, like
`src/lib/utils.test.ts` co-locates with `utils.ts`. Write these files:

**`scripts/peer-deps.test.js`** — consistency lock for plan 001's invariant:
- `OPTIONAL_PEERS` exactly equals the keys of `package.json` `peerDependencies` minus `react`,
  `react-dom` (read package.json with `readFileSync` + `JSON.parse`, not import-assertions).
- Every member of `OPTIONAL_PEERS` is flagged optional in `peerDependenciesMeta`.
- Every member of `OPTIONAL_PEERS` is present in `dependencies` (this is the 6e2f8cb-era contract;
  plan 005 will flip this assertion when it lands — leave a comment saying so).

**`scripts/resolve-target-dir.test.js`**:
- Build a fake monorepo in `fs.mkdtempSync(path.join(os.tmpdir(), 'nqui-'))`: root `package.json`
  with `workspaces`, a `packages/app/package.json` that depends on `@nqlib/nqui`, and a
  `node_modules` decoy directory. Assert `resolveTargetDir(<root>)` returns the workspace package
  dir that depends on nqui, and never a path inside `node_modules`. Read
  `scripts/resolve-target-dir.js` first to align fixtures with what it actually inspects — if its
  resolution contract differs from this description, test the ACTUAL contract and note the
  difference in the PR.
- Always `fs.rmSync(tmp, { recursive: true, force: true })` in `afterEach`.

**`scripts/init-css.test.js`** — run the CLI as a child process against a temp project:
```js
import { execFileSync } from 'node:child_process'
// in a mkdtemp dir containing a minimal package.json + src/:
execFileSync('node', [pathToInitCss], { cwd: tmp })
```
Assert: the default output files exist (`nqui/index.css`, `nqui/nqui-setup.css` per README —
verify actual filenames by reading `scripts/init-css.js` before writing assertions); running a
second time WITHOUT `--force` does not clobber a user-modified file; with `--force` it does.

**`scripts/post-install.test.js`** — postinstall must not corrupt consumer package.json. If plan
002 has landed, assert the no-write postinstall behavior (see that plan's verification section).
If 002 has NOT landed, assert only what's true at 6e2f8cb: running the script in a temp dir adds a
`nqui:init` script and is idempotent (second run returns unchanged file).

### Step 4 — Component smoke tests

Create `src/components/ui/button.test.tsx`, `src/components/ui/card.test.tsx`,
`src/components/ui/tabs.test.tsx`, `src/components/ui/input.test.tsx`, and
`src/components/custom/rating.test.tsx` (five files, ~4-8 assertions each). Pattern to follow —
testing-library with the jest-dom matchers already wired by `src/test/setup.ts`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders children and maps variant to classes', () => {
    render(<Button variant="success">Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn).toBeInTheDocument()
  })
})
```

What to assert per component: renders without throwing, accessible role/name present, a variant or
size prop changes rendered output, disabled state propagates, `onClick`/`onChange` fires (use
`@testing-library/user-event` ONLY if it's already a dependency — it is not at 6e2f8cb, so use
`fireEvent` from `@testing-library/react` instead; do not add new packages).

Pick the actual exported names from each file (e.g. `src/components/ui/button.tsx` exports
`Button`; read each component file before writing its test). Do NOT test components that import
optional peers (sortable, carousel, command, drawer, calendar, resizable, sonner) — those tests
would entangle this plan with plan 005's restructure.

### Step 5 — Wire a `test` invariant into the existing flow

No CI changes in this plan (plan 004 owns CI). Just confirm locally:

```sh
pnpm exec eslint src scripts --max-warnings 0
pnpm test
pnpm run build:lib
```

Expected: eslint exits 0 (scripts now actually checked); vitest reports ≥ 10 test files passing;
build unaffected.

### Step 6 (informational, no code change) — measure the react-hooks rule debt

The repo disables ALL react-hooks correctness rules including `exhaustive-deps`
(`eslint.config.js`, second block). Re-enabling them is explicitly OUT of scope (it would surface
violations across the component tree and CI uses `--max-warnings 0`). Produce the number for the
maintainer: temporarily run

```sh
pnpm exec eslint src --no-eslintrc 2>/dev/null || \
pnpm exec eslint src --rule '{"react-hooks/exhaustive-deps":"warn"}' 2>&1 | tail -3
```

If the one-off `--rule` invocation doesn't compose with the flat config in this eslint version,
skip it and just note "not measured" — do NOT commit any change to the disabled rules. Record the
count (or "not measured") in the PR description and in plans/README.md under finding #9.

## Boundaries

- **In scope:** `eslint.config.js`, `vitest.config.ts`, new `*.test.{js,tsx}` files listed above,
  mechanical lint fixes inside `scripts/*.js`.
- **Out of scope — do not touch:** component source files in `src/` (tests only — if a smoke test
  reveals a real component bug, report it, don't fix it here), `package.json` dependencies (no new
  test libraries), CI workflow (plan 004), the disabled react-hooks rules, `scripts/examples/**`
  (stays ignored).

## Done criteria (machine-checkable)

1. `pnpm exec eslint --print-config scripts/cli.js | grep -c no-undef` outputs ≥ 1.
2. `pnpm exec eslint src scripts --max-warnings 0` exits 0.
3. `pnpm test` exits 0 with ≥ 4 new CLI test files and ≥ 5 new component test files reported.
4. `pnpm run build:lib` exits 0 (test files must not leak into the build — `tsconfig.lib.json`
   and the Vite entry graph don't include `*.test.*`, but verify the build log).
5. `git status` shows no changes outside the in-scope file list.

## Test plan

This plan IS the test plan. The marginal-value ranking, if time-boxed: peer-deps consistency test >
init-css fixture test > resolve-target-dir test > component smoke tests > post-install test.

## Maintenance note

New CLI scripts must ship with a co-located `.test.js` using the mkdtemp fixture pattern; new
components get a smoke test in the same directory. When plan 005 lands, update
`scripts/peer-deps.test.js`'s third assertion (optional peers will LEAVE `dependencies`) — the test
contains a comment marking this.

## Escape hatches

- If Step 1 surfaces more than ~40 lint errors in `scripts/`, don't fix them inline; narrow the new
  block's rules to `{ 'no-undef': 'error' }` only, fix those, and file the rest as a note in
  plans/README.md. The goal is coverage, not a style crusade.
- If `resolveTargetDir`'s actual behavior contradicts the README's monorepo claims, STOP writing
  that test and report the discrepancy — it may be finding material for a future plan.
- If vitest's jsdom environment breaks `execFileSync`-based CLI tests in an unfixable way, switch
  those files to `// @vitest-environment node`; if THAT fails, report back rather than installing
  new tooling.
