# Plan 004 — CI hardening: full typecheck, export validation, Node matrix, vitest CVE bump

**Status:** TODO
**Written against commit:** `6e2f8cb`
**Effort:** S · **Risk:** low · **Depends on:** nothing · **Blocks:** plan 005 (do this first)

---

## Why this matters

Four verified gaps let broken artifacts ship:

1. **CI never typechecks the whole repo.** `.github/workflows/ci.yml` runs lint, `pnpm test`, and
   `pnpm run build:lib`. The library build runs `tsc -p tsconfig.lib.json`, but `tsconfig.app.json`
   (showcase app + everything outside the lib entry graph) is never checked. There is currently
   exactly ONE error hiding there (verified by running `pnpm exec tsc --noEmit -p tsconfig.app.json`
   at 6e2f8cb) — see Step 1.
2. **`scripts/validate-exports.mjs` exists but nothing runs it.** Broken barrel exports would only
   be caught by consumers.
3. **CI tests Node 22 only**, while `package.json` declares `"engines": { "node": ">=20" }`. Node 20
   compatibility is claimed but never exercised.
4. **vitest has a known critical CVE.** `pnpm audit` at 6e2f8cb reports 1 critical advisory against
   vitest 3.1.4 ("When Vitest UI server is listening, arbitrary file can …"). Dev-only exposure
   (`pnpm audit --prod` is clean), still worth closing with a version bump.

## Repo facts you need

- Package manager: **pnpm** v10 in CI (`pnpm/action-setup@v4` with `version: 10`), lockfile-strict
  install (`pnpm install --frozen-lockfile`).
- Verification commands: `pnpm exec eslint src scripts --max-warnings 0`, `pnpm test`,
  `pnpm run build:lib`.
- tsconfig layout: root `tsconfig.json` is a solution file referencing `tsconfig.app.json` and
  `tsconfig.node.json`; `tsconfig.lib.json` is separate (used by the build for d.ts emit).
- Current CI (`.github/workflows/ci.yml` @ 6e2f8cb), abridged:

  ```yaml
  jobs:
    verify:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 10 }
        - uses: actions/setup-node@v4
          with: { node-version: 22, cache: pnpm }
        - run: pnpm install --frozen-lockfile
        - run: pnpm exec eslint src scripts --max-warnings 0   # "Lint source and scripts"
        - run: pnpm test                                        # "Test"
        - run: pnpm run build:lib                               # "Build library"
  ```

## Steps

### Step 1 — Fix the one existing app-typecheck error

`pnpm exec tsc --noEmit -p tsconfig.app.json` currently fails with exactly:

```
src/components/table/DataTable.tsx(42,13): error TS2428: All declarations of 'TableMeta' must have identical type parameters.
```

Cause — the module augmentation renames TanStack's type parameter (excerpt from
`src/components/table/DataTable.tsx:40-46`):

```ts
// Extend TableMeta for inline editing
declare module "@tanstack/react-table" {
  interface TableMeta<_TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void
  }
}
```

`@tanstack/react-table` declares `interface TableMeta<TData extends RowData>`; an augmentation must
use the identical parameter name. Fix: rename `_TData` → `TData`. If eslint then flags the unused
type parameter (`@typescript-eslint/no-unused-vars` is configured with `varsIgnorePattern: '^_'` —
which is why someone underscored it), suppress at the line:

```ts
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- augmentation must match upstream's parameter name
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void
  }
}
```

Verify: `pnpm exec tsc --noEmit -p tsconfig.app.json` exits 0. If it reports errors OTHER than the
one above (drift since this plan was written), fix only trivial ones (unused vars, obvious typos);
if any error requires a design decision, STOP and report back.

### Step 2 — Add a `typecheck` script

In `package.json` `scripts`:

```json
"typecheck": "tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.lib.json"
```

Caveat: if `tsconfig.app.json` or `tsconfig.node.json` has `"composite": true`, `tsc --noEmit -p`
errors with TS6310. In that case use `tsc -b --dry` — no; the correct composite-friendly form is
`tsc -b --noEmit`? Neither is reliable across TS versions. Deterministic rule: read both tsconfig
files first. If `composite` is true in a config, check whether `"noEmit": true` is already set
inside it (then plain `tsc -b` emits nothing extra beyond `.tsbuildinfo`) — prefer:

```json
"typecheck": "tsc -b"
```

and add `*.tsbuildinfo` to `.gitignore` if not already ignored. Pick whichever of the two forms
runs clean locally; both are acceptable. Verify: `pnpm run typecheck` exits 0 and `git status`
shows no new tracked artifacts.

### Step 3 — Wire `validate-exports.mjs` into the build verification

`scripts/validate-exports.mjs` parses `src/index.ts` export statements and cross-checks them
against `src/components/ui/*` files (it's a static consistency check; read its tail to confirm it
`process.exit(1)`s on errors — if it only logs, add the exit code as part of this step).

Add to `package.json` scripts:

```json
"verify:exports": "node scripts/validate-exports.mjs"
```

Run it once locally: `pnpm run verify:exports`. If it reports false positives (its regex only
matches `export {...} from "./components/ui/<x>"` patterns in `src/index.ts`, but most exports
actually live in `src/components/index.ts` — so it may match nothing and trivially pass), that's
acceptable for this plan: wiring it in is the goal, improving its coverage is noted in the
maintenance section. If it HARD-FAILS on a legitimate current export, fix the script's parsing
(it's a dev tool, low risk), not the exports.

### Step 4 — Update CI workflow

Replace the single job's hardcoded Node with a matrix, and add the new gates:

```yaml
jobs:
  verify:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: pnpm
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Lint source and scripts
        run: pnpm exec eslint src scripts --max-warnings 0
      - name: Typecheck
        run: pnpm run typecheck
      - name: Test
        run: pnpm test
      - name: Build library
        run: pnpm run build:lib
      - name: Validate exports
        run: pnpm run verify:exports
```

Keep the existing `on:` triggers (push to main/master, pull_request) unchanged.

### Step 5 — Bump vitest past the advisory

In `devDependencies`: `"vitest": "^3.1.4"` → the latest 3.x (the advisory is fixed in ≥ 3.2.6; use
`pnpm view vitest versions --json | tail` to pick the current latest 3.x). Run `pnpm install`, then:

```sh
pnpm audit
```

Expected: `No known vulnerabilities found` (or at minimum, zero critical). Then `pnpm test` to
confirm the suite still passes — vitest minor bumps occasionally change config handling; if
`vitest.config.ts` needs a mechanical tweak, make it; if tests themselves break, STOP and report.

### Step 6 — Full local gate

```sh
pnpm exec eslint src scripts --max-warnings 0 && pnpm run typecheck && pnpm test && pnpm run build:lib && pnpm run verify:exports
```

All must exit 0.

## Boundaries

- **In scope:** `.github/workflows/ci.yml`, `package.json` (`scripts` block + vitest version),
  `pnpm-lock.yaml` (via install), `src/components/table/DataTable.tsx` (the one-line rename only),
  `scripts/validate-exports.mjs` (only if it needs an exit code or a parsing fix), `.gitignore`
  (only if tsbuildinfo needs ignoring).
- **Out of scope — do not touch:** any other component file, dependency versions other than vitest,
  the publish scripts, release automation (a direction item, not this plan), eslint config
  (plan 003).

## Done criteria (machine-checkable)

1. `pnpm run typecheck` exists and exits 0.
2. `pnpm run verify:exports` exists and exits 0.
3. `pnpm audit 2>&1 | grep -ci critical` outputs 0 (no critical advisories).
4. `.github/workflows/ci.yml` contains `matrix` with both `20` and `22`, and steps invoking
   `typecheck` and `verify:exports` (grep-checkable).
5. The Step 6 chained command exits 0.
6. On the PR, both matrix legs are green.

## Test plan

CI itself is the test artifact. Additionally, after merging, intentionally verify the gate catches
regressions at least once: in a scratch branch, reintroduce `_TData` in DataTable.tsx and confirm
the Typecheck step fails. Don't merge the scratch branch.

## Maintenance note

`validate-exports.mjs` currently only inspects `src/index.ts` for `./components/ui/*` re-exports,
while the real barrel is `src/components/index.ts` (583 lines) — its coverage is shallow. When
plan 005 restructures the entries, extend this script (or replace it with a test in the plan 003
harness) to assert: every `exports` map entry in package.json has a matching dist file after build,
and every bare import in `dist/*.js` is in `dependencies` (the plan 001 invariant). Node 20 leaves
maintenance LTS April 2026 — when `engines` moves to `>=22`, update the matrix in the same PR.

## Escape hatches

- If Node 20 CI fails for a real compatibility reason (not flakiness), do NOT silently drop the
  matrix leg: either fix the incompatibility if trivial, or report back recommending an `engines`
  bump to `>=22` (which is a consumer-visible change the maintainer must approve).
- If the vitest bump requires a major (4.x) to clear the advisory, STOP at the highest safe 3.x,
  report the residual advisory status, and note the 4.x migration as follow-up.
- If `pnpm install --frozen-lockfile` fails on Node 20 due to lockfile/engine constraints, report
  back — that itself proves the engines claim is wrong, which is finding material.
