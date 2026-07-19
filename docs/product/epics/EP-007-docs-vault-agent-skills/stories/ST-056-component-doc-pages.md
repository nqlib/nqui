---
id: ST-056
epic: EP-007
title: Component doc pages and index
status: in-progress
priority: must
release: pre-baseline
breaking: false
scope: [docs/components, docs/nqui-skills/COMPONENTS_INDEX.md]
api: docs/components/README.md
---

# ST-056 — Component doc pages and index

As an agent (or app author) building with `@nqlib/nqui`,
I want one markdown page per exported component plus an index that routes to it,
so that I can look up the real props without reading `src/` or guessing.

## Acceptance criteria

- [x] `docs/components/` holds one `nqui-<kebab>.md` page per documented component (68 pages today).
- [x] `docs/components/README.md` is the index: prerequisites, "when to use" tables, shared
      conventions, and a linked row per page.
- [x] `docs/components/` ships in the npm tarball (`package.json` `files` includes `docs`).
- [x] Pages use one shape — title, one-line summary, `## Import`, usage, props/variants.
- [ ] Every component exported from `src/components/index.ts` has a page. **Missing:** `ThemeToggle`
      (`src/components/theme-toggle.tsx`), `ThemeAppearanceMenu`
      (`src/components/theme-appearance-menu.tsx`), `ErrorBoundary`
      (`src/components/error-boundary.tsx`), `InlineTabs` (`src/components/custom/inline-tabs.tsx`).
- [ ] Every component exported from a subpath entry has a page. **Missing:** the `./debug` suite
      (`DebugPanel`, `Magnifier`, `Crosshair`, `UITester` in `src/entries/debug.ts`) — documented
      only in `src/components/debug/README.md`, which is not part of the vault index.
- [ ] The icon set (`createIcon` + the `Icon*` family in `src/components/icons/`) is either
      documented or explicitly recorded as internal.
- [ ] Every page in `docs/components/` is linked from `docs/components/README.md`. **Unlinked:**
      `nqui-dnd.md`, `nqui-code-editor.md`, `nqui-sandbox.md`.
- [ ] `internal-notes/progress.md` — a 351-line `Progress` component doc — is reconciled into
      `docs/components/nqui-progress.md` (22 lines today) and removed from `internal-notes/`.

## Technical notes

- The gaps above are why this story is `in-progress` rather than `done`. They fall into three kinds:
  **exported but undocumented** (theme + error-boundary + inline-tabs + debug), **documented but
  unlinked** (dnd/code-editor/sandbox rows missing from the index), and **misfiled**
  (`internal-notes/progress.md`).
- `nqui-dnd.md` is new and owned by EP-004; this story only owes it an index row.
- `nqui-code-editor.md` / `nqui-sandbox.md` are unlinked because their sources are gone — deleting
  them is ST-061, not adding rows here. Do ST-061 first, then close the "every page is linked"
  criterion against what remains.
- Icons are **not** re-exported from `src/components/index.ts` nor from any `exports` subpath in
  `package.json`, so "undocumented" may be correct. Decide public vs internal first (guideline §8
  intake) — writing a page implies a public surface.
- `src/components/debug/README.md` predates the vault and reads as consumer prose; folding it into
  `docs/components/` is the cheapest fix, since `docs/` already ships and `src/` does not.

## Out of scope

- Deleting pages whose source is gone — ST-061.
- Live specimens and variant galleries — sibling **nqui-showcase** (ST-060).
- The design guidance bundle in `docs/nqui-skills/` — ST-057 owns its pipeline, EP-001/002/003 own
  its content.
