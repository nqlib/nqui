# Plan 005 — Make optional peers actually optional: remove optional-peer components from the main entry

**Status:** TODO (BLOCKED until plans 003 and 004 are DONE)
**Written against commit:** `6e2f8cb`
**Effort:** L · **Risk:** medium (breaking change for consumers) · **Depends on:** 003, 004 · **Supersedes parts of:** 001

---

## Why this matters

The library's headline packaging design — heavy integrations (`cmdk`, `@dnd-kit/*`,
`embla-carousel-react`, `react-day-picker`, `date-fns`, `sonner`, `vaul`,
`react-resizable-panels`) as *optional* peers, with slim subpath entries like
`@nqlib/nqui/carousel` — **does not work at 6e2f8cb**, verified from the built output:

- `dist/nqui.es.js` (the main entry) statically imports the chunks
  `carousel-*.js`, `command-palette-*.js`, `sortable-*.js`, `enhanced-calendar-*.js`,
  `drawer-*.js`, `sonner-*.js`, and bare-imports `react-resizable-panels` directly.
- Those chunks bare-import every optional peer (`cmdk`, `@dnd-kit/core`, `@dnd-kit/modifiers`,
  `@dnd-kit/sortable`, `@dnd-kit/utilities`, `embla-carousel-react`, `react-day-picker`,
  `date-fns`, `sonner`, `vaul`).
- Therefore `import { Button } from "@nqlib/nqui"` requires EVERY optional peer to be resolvable.
  That's why all of them also sit in hard `dependencies` — every consumer installs everything, and
  the subpath entries (each a few hundred bytes of re-export shim) provide no real benefit.

The fix: optional-peer components are exported ONLY from their subpath entries; the main entry has
zero optional-peer imports; optional peers leave `dependencies`. This is a **breaking change** for
consumers importing e.g. `Calendar`, `Toaster`, or `Sortable` from the main entry — hence the
gating on test (003) and CI (004) baselines, and a version bump that signals it.

## Current state (verified excerpts)

`src/index.ts` (24 lines) re-exports `./lib`, `./hooks`, and `export * from "./components"`.
The barrel `src/components/index.ts` (583 lines) contains these optional-peer export sections
(line numbers @ 6e2f8cb):

```
 28  export { EnhancedCalendar as Calendar } from "./custom/enhanced-calendar"   // react-day-picker, date-fns
 29  export type { EnhancedCalendarProps as CalendarProps } from "./custom/enhanced-calendar"
 31  export { Calendar as CoreCalendar, CalendarDayButton } from "./ui/calendar"
 40  export { CommandPalette } from "./custom/command-palette"                   // cmdk
 41  export type { CommandPaletteProps } from "./custom/command-palette"
189  export { Toaster, EnhancedSonner } from "./ui/sonner"                       // sonner (+ next-themes, bundled)
191  export { CoreToaster } from "./ui/sonner"
~270–287  export { Carousel, ... } from "./ui/carousel"                          // embla-carousel-react
~290–303  export { Command, ... } from "./ui/command"                            // cmdk
~340–350  export { Drawer, ... } from "./ui/drawer"                              // vaul
449–454   export { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./ui/resizable"  // react-resizable-panels
~500–515  export { Sortable, ... } from "./ui/sortable"                          // @dnd-kit/*
```

(Re-derive exact line numbers with `rg -n 'from "./ui/(carousel|command|drawer|sortable|sonner|calendar|resizable)"|from "./custom/(enhanced-calendar|command-palette)"' src/components/index.ts` — the file will have drifted.)

Existing subpath entries in `src/entries/`: `calendar.ts`, `carousel.ts`, `command.ts`, `debug.ts`,
`drawer.ts`, `sonner.ts`, `sortable.ts` — each a documented re-export shim, e.g. `src/entries/sortable.ts`:

```ts
/**
 * Subpath export for Sortable components.
 * Requires: @dnd-kit/core, @dnd-kit/modifiers, @dnd-kit/sortable, @dnd-kit/utilities
 */
export { Sortable, SortableContent, SortableItem, SortableItemHandle, SortableOverlay } from "../components/ui/sortable"
```

There is NO `resizable` entry. `@tanstack/react-table` is an optional peer + hard dependency but
**no dist file imports it** — the DataTable components (`src/components/table/`) are not exported
by the library at all; the dep exists only for the showcase/table code.

`vite.config.ts` library mode already externalizes all optional peers in `rollupOptions.external`
and defines the entry map (`index`, `carousel`, `command`, `sortable`, `calendar`, `sonner`,
`drawer`, `debug`). `package.json` `exports` already maps all existing subpaths.

Other repo facts: pnpm; verification gates `pnpm exec eslint src scripts --max-warnings 0`,
`pnpm run typecheck` (added by plan 004), `pnpm test`, `pnpm run build:lib`,
`pnpm run verify:exports` (added by plan 004). The showcase app (`src/pages/`, `src/App.tsx`)
imports components via the `@/` alias paths, not the package entry — verify with
`rg -n 'from "@nqlib/nqui"' src/` (expect no hits in src; if hits exist, fix those imports as part
of Step 4). `src/EXPORT_STRUCTURE.md` documents the export layout and must be updated.

## Target state

- Main entry exports: everything EXCEPT the optional-peer component sections listed above.
- Subpath entries (existing 7 + new `./resizable`) are the ONLY way to get optional-peer components.
- `package.json`: optional peers removed from `dependencies` (they remain optional
  `peerDependencies`); `react-resizable-panels` (added to deps by plan 001) leaves again;
  `@tanstack/react-table` leaves `dependencies` too (moves to devDependencies — showcase needs it).
- Verified invariant: bare imports of `dist/nqui.es.js` and its eagerly-imported chunks ⊆
  { react, react-dom, react/jsx-runtime, @radix-ui/react-slot, class-variance-authority, clsx,
  tailwind-merge } — all in hard `dependencies`.
- Version bumped to **0.7.0** with a CHANGELOG "Breaking" section and a migration table.

## Steps

### Step 0 — Preconditions

Confirm plans 003 and 004 are DONE (check plans/README.md status table). Confirm a clean
`pnpm run build:lib && pnpm test && pnpm run typecheck` baseline before touching anything.

### Step 1 — Add the missing `resizable` entry

Create `src/entries/resizable.ts` following the exact doc-comment style of `src/entries/sortable.ts`:

```ts
/**
 * Subpath export for Resizable components.
 * Use for smaller bundles when you only need resizable panels.
 * Requires: react-resizable-panels
 */
export { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable"
```

Wire it everywhere the other entries are wired (grep for `sortable` to find all registration
points — there are at least three):
1. `vite.config.ts` → `build.lib.entry`: add `resizable: path.resolve(__dirname, "src/entries/resizable.ts")`.
2. `package.json` → `exports`: add `"./resizable"` block matching the shape of `"./sortable"`
   (types `./dist/entries/resizable.d.ts`, import `./dist/resizable.es.js`, require `./dist/resizable.cjs.js`).
3. `tsconfig.lib.json` — read it; if entries are listed explicitly in `include`, add the new file.

### Step 2 — Remove optional-peer exports from the barrel

In `src/components/index.ts`, delete the export sections listed in "Current state" (calendar,
command-palette, sonner/toaster, carousel, command, drawer, resizable, sortable — value AND type
exports). Make sure each deleted export is available from a subpath entry; extend the entry files
where the barrel exported more names than the entry currently does:

- `src/entries/calendar.ts` must export `EnhancedCalendar` (and alias `Calendar`),
  `EnhancedCalendarProps`/`CalendarProps`, plus `CoreCalendar`/`CalendarDayButton` — mirror the
  aliasing the barrel used so subpath consumers get identical names.
- `src/entries/command.ts` must export the `Command*` family AND `CommandPalette` +
  `CommandPaletteProps`.
- `src/entries/sonner.ts` must export `Toaster`, `EnhancedSonner`, `CoreToaster`.
- `src/entries/carousel.ts`, `drawer.ts`, `sortable.ts` — diff their current export lists against
  the deleted barrel sections; add anything missing (including type exports).

Do NOT remove non-optional components, hooks, or utilities from the barrel. Do not delete the
component source files themselves.

### Step 3 — Repackage `package.json`

- Remove from `dependencies`: `cmdk`, `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`,
  `@dnd-kit/utilities`, `embla-carousel-react`, `@tanstack/react-table`, `react-day-picker`,
  `date-fns`, `sonner`, `vaul`, `react-resizable-panels`.
- Add the same list to `devDependencies` (the repo itself — showcase, tests, d.ts emit — still
  needs them installed locally; keep the version specifiers currently in `dependencies`).
- `peerDependencies` + `peerDependenciesMeta` stay EXACTLY as they are (already correct: all
  optional).
- Bump `"version"` to `0.7.0`.
- `pnpm install` to refresh the lockfile.
- Update `scripts/peer-deps.test.js` (from plan 003): flip the assertion that optional peers are in
  `dependencies` to assert they are NOT (the test contains a comment pointing here).

### Step 4 — Sweep internal consumers and docs

- `rg -n 'from "@nqlib/nqui"' src/ scripts/` — any internal import of a now-subpath-only component
  must switch to the subpath (e.g. `@nqlib/nqui/sonner`). Note `scripts/generate-docs.js`,
  `scripts/init-debug-css.js`, `scripts/skill-templates.js` import `@nqlib/nqui` — check whether
  they touch moved names.
- `src/EXPORT_STRUCTURE.md` — update to the new layout.
- `README.md` — Quick Start stays valid (Button is core); add a "Optional components" section with
  an import table: component family → subpath → required peer(s). State plainly: main entry no
  longer exports Calendar/Toaster/Carousel/Command/Drawer/Sortable/Resizable.
- `INSTALLATION.md` — same table; clarify `install-peers` is only needed for optional subpaths.
- `docs/components/*.md` and `docs/nqui-skills/**` — grep for `import { Calendar`,
  `import { Toaster`, `import { Carousel`, `import { Command`, `import { Drawer`,
  `import { Sortable`, `import { Resizable` and update import paths. These docs ship in the
  package and feed IDE agents; stale imports here will propagate bad code into consumer apps.
- `CHANGELOG.md` — `## 0.7.0` with a **Breaking** section and a migration table (old import → new
  import).

### Step 5 — Build and verify the invariant

```sh
pnpm run build:lib
# Invariant check — main entry graph must not reach optional peers:
node - <<'EOF'
import { readFileSync, readdirSync } from 'fs';
const allowed = new Set(['react','react-dom','react/jsx-runtime','@radix-ui/react-slot','class-variance-authority','clsx','tailwind-merge']);
const optional = ['cmdk','@dnd-kit','embla-carousel-react','@tanstack/react-table','react-day-picker','date-fns','sonner','vaul','react-resizable-panels'];
const seen = new Set(); const queue = ['nqui.es.js'];
while (queue.length) {
  const f = queue.pop(); if (seen.has(f)) continue; seen.add(f);
  const src = readFileSync(`dist/${f}`, 'utf8');
  for (const m of src.matchAll(/from\s*"([^"]+)"/g)) {
    const s = m[1];
    if (s.startsWith('./')) { queue.push(s.slice(2)); continue; }
    if (optional.some(o => s === o || s.startsWith(o + '/'))) { console.error(`FAIL: ${f} -> ${s}`); process.exitCode = 1; }
    else if (!allowed.has(s)) console.warn(`WARN: unexpected bare import ${s} in ${f}`);
  }
}
console.log(process.exitCode ? 'INVARIANT BROKEN' : 'MAIN ENTRY CLEAN');
EOF
```

Expected: `MAIN ENTRY CLEAN`. Investigate any WARN line (a bare import not in `dependencies` =
plan-001-class bug).

### Step 6 — Tarball end-to-end test (both directions)

```sh
pnpm pack
mkdir -p /tmp/nqui-070-check && cd /tmp/nqui-070-check && npm init -y >/dev/null
npm install react react-dom <repo>/nqlib-nqui-0.7.0.tgz

# (a) Main entry works WITHOUT any optional peer:
node --input-type=module -e "import('@nqlib/nqui').then(m=>{if(!m.Button)throw 0;if(m.Sortable)throw new Error('Sortable leaked into main entry');console.log('MAIN OK')})"

# (b) Subpath fails cleanly without its peer, then works with it:
node --input-type=module -e "import('@nqlib/nqui/sortable').catch(()=>console.log('SORTABLE BLOCKED WITHOUT PEER (expected)'))"
npm install @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities
node --input-type=module -e "import('@nqlib/nqui/sortable').then(m=>{if(!m.Sortable)throw 0;console.log('SORTABLE OK')})"

# (c) New resizable entry:
npm install react-resizable-panels
node --input-type=module -e "import('@nqlib/nqui/resizable').then(m=>{if(!m.ResizablePanel)throw 0;console.log('RESIZABLE OK')})"
```

Expected: `MAIN OK`, the blocked line, `SORTABLE OK`, `RESIZABLE OK`. Clean up the temp dir and tarball.

### Step 7 — Full gates

`pnpm exec eslint src scripts --max-warnings 0 && pnpm run typecheck && pnpm test && pnpm run build:lib && pnpm run verify:exports` — all exit 0.

## Boundaries

- **In scope:** `src/components/index.ts` (deletions only), `src/entries/*` (extend + new
  resizable), `vite.config.ts` (entry map + nothing else), `package.json` (exports map, deps moves,
  version), `pnpm-lock.yaml`, `scripts/peer-deps.test.js`, `src/EXPORT_STRUCTURE.md`, `README.md`,
  `INSTALLATION.md`, `CHANGELOG.md`, `docs/**` import examples, internal imports surfaced by the
  Step 4 grep.
- **Out of scope — do not touch:** component implementation files (`src/components/ui/*.tsx`,
  `src/components/custom/*.tsx`) except import-path fixes Step 4 demands; `rollupOptions.external`
  (already correct); the debug entry; CSS pipeline; publish scripts; the `next-themes` bundling
  question (see below); CI workflow (already hardened by 004).
- **Explicitly deferred:** `src/components/ui/sonner.tsx` imports `next-themes`, which gets BUNDLED
  into the sonner chunk. A bundled copy of next-themes cannot see the consumer's own
  `ThemeProvider` context (different module instance), so theme auto-detection in Toaster likely
  fails in consumer apps that use next-themes. Investigate and report; fixing it (externalize
  next-themes as a peer of the sonner subpath) is a follow-up plan, not this one.

## Done criteria (machine-checkable)

1. Step 5 script prints `MAIN ENTRY CLEAN` after a fresh `pnpm run build:lib`.
2. Step 6 prints `MAIN OK`, `SORTABLE OK`, `RESIZABLE OK`.
3. `node -e "const d=require('./package.json').dependencies; ['cmdk','vaul','sonner','date-fns','react-resizable-panels','@tanstack/react-table'].forEach(k=>{if(d[k])throw new Error(k+' still in deps')})"` exits 0.
4. `package.json` version is `0.7.0` and CHANGELOG has a `0.7.0` Breaking section.
5. All Step 7 gates exit 0.
6. `rg -n "import \{ (Sortable|Carousel|Toaster|CommandPalette|ResizablePanel)" docs/ README.md INSTALLATION.md` shows only subpath-style imports.

## Test plan

- Update/extend `scripts/peer-deps.test.js` as in Step 3.
- Add `src/entries/entries.test.ts` (plan 003 harness): for each entry file, assert its export list
  is non-empty and contains the expected primary names (Sortable, Carousel, Command +
  CommandPalette, Calendar, Toaster, Drawer, ResizablePanel...). This catches "deleted from barrel
  but forgot to add to entry" — the most likely regression in this plan.
- The Step 6 tarball script is the release-candidate check; record output in the PR.

## Maintenance note

From now on, any component importing an externalized optional peer must live behind a subpath
entry and never be exported from `src/components/index.ts`. The Step 5 invariant script is worth
promoting into `verify:build` so the rule is enforced mechanically. When/if DataTable ships,
it follows this pattern (`./table` entry, `@tanstack/react-table` optional peer).

## Escape hatches

- If you discover the main barrel exports an optional-peer component NOT in the list above (drift
  since 6e2f8cb), apply the same treatment (move to a subpath entry) and note it in the PR.
- If a known external consumer (the barrel comments mention "nqwm" using DataGrid hooks) depends on
  main-entry exports of moved components, STOP and report — the maintainer may want a deprecation
  release (0.6.x re-exporting with console warnings) before 0.7.0.
- If `tsc -p tsconfig.lib.json` (d.ts emit) fails because entry files re-export types in a way the
  config can't see, adjust `tsconfig.lib.json` `include` minimally; if it requires restructuring
  type exports, report back first.
- If the Step 6(b) "fails cleanly" check actually CRASHES npm/node in a confusing way rather than a
  module-not-found error, document the actual failure mode in INSTALLATION.md troubleshooting
  instead of trying to engineer a nicer error.
