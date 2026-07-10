# Plan 002 — Stop `postinstall` from silently mutating consumer projects

**Status:** TODO
**Written against commit:** `6e2f8cb`
**Effort:** S · **Risk:** low · **Depends on:** nothing · **Blocks:** nothing

---

## Why this matters

`@nqlib/nqui` declares `"postinstall": "node scripts/post-install.js"` in `package.json`. That
script runs automatically inside EVERY consumer project on `npm install` (unless `CI=true`), and at
commit 6e2f8cb it does two silent write operations to the consumer's repository:

1. **Rewrites the consumer's `package.json`** — adds a `nqui:init` script and re-serializes the
   whole file with `JSON.stringify(pkg, null, 2)`, which normalizes the consumer's indentation
   (tabs/4-space → 2-space) and trailing-newline conventions, producing surprise diffs.
2. **Writes `.cursor/rules/nqui-components.mdc`** into the consumer project (creating `.cursor/`
   if absent) — IDE configuration the user never asked for.

Errors are swallowed (`catch (e) { return false; }`), so partial failures are invisible. Silent
install-time mutation of user repos erodes trust, breaks `npm ci`-adjacent reproducibility
expectations, and gets packages flagged by security tooling. The setup behavior itself is useful —
it just must be **opt-in**, via the already-existing explicit commands (`npx nqui-setup`,
`npx @nqlib/nqui init-cursor`).

## Current state (excerpts from `scripts/post-install.js` @ 6e2f8c8b)

```js
// Skip in CI to reduce noise
if (process.env.CI === 'true' || process.env.CI === '1') process.exit(0);

function addNquiInitScript() {
  const cwd = process.cwd();
  const packageJsonPath = resolve(cwd, 'package.json');
  if (!existsSync(packageJsonPath)) return false;
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    if (pkg.scripts?.['nqui:init']) return false; // Already exists
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['nqui:init'] = 'npx @nqlib/nqui install-peers && npx @nqlib/nqui init-cursor && npx @nqlib/nqui init-skills && npx @nqlib/nqui init-css --sidebar --force';
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    return true;
  } catch (e) {
    return false;
  }
}
// ...
const scriptAdded = addNquiInitScript();
// ... prints a banner, then:
// Auto-inject Cursor rules (writes to package that has nqui in monorepos)
const targetDir = resolveTargetDir(process.cwd());
writeCursorRule(targetDir);
console.log(`   Skills written to: ${targetDir}/.cursor/\n`);
```

`writeCursorRule(targetCwd)` lives in `scripts/init-cursor.js` (exported, also used by the explicit
`init-cursor` command — do not change that file). `resolveTargetDir` is from
`scripts/resolve-target-dir.js`.

The same script doubles as the explicit `npx nqui-setup` command (`"nqui-setup":
"scripts/post-install.js"` in the `bin` map, and `setup` subcommand in `scripts/cli.js`). That
explicit invocation is user-initiated, so mutation there is acceptable — the distinction the fix
must draw is **postinstall context vs. explicit invocation**.

## Design

Detect whether the script is running as an npm lifecycle hook and, if so, print guidance only:

- npm/pnpm/yarn/bun all set `npm_lifecycle_event=postinstall` (npm/pnpm also set
  `npm_lifecycle_script`) when running the hook. Use
  `process.env.npm_lifecycle_event === 'postinstall'` as the signal.
- In postinstall mode: **no writes at all**. Print the existing "next steps" banner, adjusted so it
  doesn't claim anything was added (tell the user to run `npx nqui-setup` to apply setup).
- In explicit mode (`npx nqui-setup`, `npx @nqlib/nqui setup`, direct `node scripts/post-install.js`):
  keep current behavior (add script + write cursor rule), since the user asked for it.
- Optional escape valve for teams that liked the old behavior:
  `NQUI_POSTINSTALL_SETUP=1 npm install` re-enables writes in postinstall mode. Document it.

## Steps

### Step 1 — Gate the writes in `scripts/post-install.js`

Restructure the bottom of the file (after the function definitions) along these lines, matching the
file's existing plain-ESM, no-framework style:

```js
const isLifecyclePostinstall = process.env.npm_lifecycle_event === 'postinstall'
  && process.env.NQUI_POSTINSTALL_SETUP !== '1';

let scriptAdded = false;
let skillsWritten = false;
let targetDir = null;

if (!isLifecyclePostinstall) {
  scriptAdded = addNquiInitScript();
  targetDir = resolveTargetDir(process.cwd());
  writeCursorRule(targetDir);
  skillsWritten = true;
}
```

Then adjust the printed banner:
- When `scriptAdded` → keep the `✅ Added "nqui:init" script to package.json` line.
- When `skillsWritten` → keep the `Skills written to: ...` line.
- When in postinstall mode (nothing written) → add one line such as:
  `Run "npx nqui-setup" to add the nqui:init script and IDE skills (no files were modified).`

Keep the rest of the banner (install commands, step-by-step list) unchanged. Do not remove the
`CI` early-exit at the top.

### Step 2 — Surface errors instead of swallowing them in explicit mode

In `addNquiInitScript`, replace the bare `return false` in the catch with:

```js
} catch (e) {
  console.warn(`⚠️  Could not update package.json: ${e.message}`);
  return false;
}
```

(`console.warn` is allowed by the repo's eslint `no-console` rule, which permits warn/error/info/debug.)

### Step 3 — Update the docs that describe postinstall behavior

- `README.md` (~line 29): currently says "the post-install script may add a `nqui:init` script and
  write initial Cursor rules under `.cursor/`". Rewrite to state that postinstall only PRINTS next
  steps, and that `npx nqui-setup` performs the setup (adds `nqui:init`, writes `.cursor/` rules).
  Mention `NQUI_POSTINSTALL_SETUP=1` for opting into the old auto-setup.
- `INSTALLATION.md` (~line 13 area): same correction wherever post-install auto-write is described.
- `CHANGELOG.md`: add an entry under a new "Unreleased" heading (match the file's existing heading
  style) noting the behavior change — this is user-visible.

### Step 4 — Verification

```sh
# 1. Lint must stay clean (note: at 6e2f8cb eslint doesn't actually cover scripts/*.js —
#    plan 003 fixes that — but run it anyway in case 003 landed first):
pnpm exec eslint src scripts --max-warnings 0

# 2. Simulated postinstall in a temp consumer project — must NOT write anything:
mkdir -p /tmp/nqui-pi-test && cd /tmp/nqui-pi-test
printf '{\n\t"name": "consumer",\n\t"version": "1.0.0"\n}\n' > package.json
cp package.json package.json.orig
npm_lifecycle_event=postinstall node <repo>/scripts/post-install.js
diff package.json package.json.orig && [ ! -d .cursor ] && echo "POSTINSTALL-CLEAN-OK"

# 3. Explicit mode in the same temp dir — MUST write:
node <repo>/scripts/post-install.js
node -e "const p=require('/tmp/nqui-pi-test/package.json'); if(!p.scripts['nqui:init']) process.exit(1)" \
  && [ -d /tmp/nqui-pi-test/.cursor/rules ] && echo "EXPLICIT-MODE-OK"
```

Expected: `POSTINSTALL-CLEAN-OK` and `EXPLICIT-MODE-OK` both print. The `diff` in check 2 also
proves the tab-indented consumer package.json wasn't reformatted. Clean up `/tmp/nqui-pi-test`.

## Boundaries

- **In scope:** `scripts/post-install.js`, `README.md`, `INSTALLATION.md`, `CHANGELOG.md`.
- **Out of scope — do not touch:** `scripts/init-cursor.js` (its explicit command must keep working
  exactly as-is), `scripts/cli.js`, `scripts/resolve-target-dir.js`, `package.json` (the
  `postinstall` hook entry STAYS — it still prints guidance), any `src/` file.
- Do not convert the banner to a new logging framework or add dependencies.

## Done criteria (machine-checkable)

1. Verification check 2 prints `POSTINSTALL-CLEAN-OK` (no package.json diff, no `.cursor/` created).
2. Verification check 3 prints `EXPLICIT-MODE-OK`.
3. `NQUI_POSTINSTALL_SETUP=1 npm_lifecycle_event=postinstall node scripts/post-install.js` in a
   fresh temp dir DOES create `.cursor/` (opt-in works).
4. `pnpm exec eslint src scripts --max-warnings 0 && pnpm test && pnpm run build:lib` all exit 0.
5. `rg -n "may add a" README.md` no longer matches the old postinstall claim.

## Test plan

If plan 003 (test baseline) has landed, add `scripts/post-install.test.js` (or `.mjs` matching
003's chosen pattern) automating verification checks 2 and 3 with `fs.mkdtempSync(os.tmpdir())`
fixtures and `child_process.execFileSync('node', [script], { env: {...} })`. If 003 has not landed,
record the manual check output in the PR and note the follow-up in plans/README.md.

## Maintenance note

Anything added to `post-install.js` in the future must respect the
`isLifecyclePostinstall` gate — install hooks may print, never write. Reviewers should reject any
new `writeFileSync`/`mkdirSync` outside that gate. The `bin` entry `nqui-setup` and the `setup`
subcommand are the sanctioned write paths.

## Escape hatches

- If `npm_lifecycle_event` turns out not to be set by one of the four supported package managers
  (verify bun specifically — run `bun add` against a tarball if bun is available), fall back to the
  inverse heuristic: treat as explicit only when `process.argv[1]` basename is `nqui-setup`/`cli.js`
  or `--apply` is passed; report which heuristic you used.
- If the maintainer's intent was that auto-setup is a core feature (check internal-notes/ or recent
  commits for contrary signals), STOP and report back before changing behavior — this plan assumes
  consent-first is desired.
