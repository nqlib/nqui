# Plan 006 — Hoist per-instance `<style>` injection into the shipped stylesheet

Status: DONE — landed in 0.8.1 (`fix/st-003-easing-tokens`)
Effort: M · Risk: medium (cascade order) · Depends on: commits `c9595a5` + `8ee276d` (0.8.1 easing + gap fixes on `fix/st-003-easing-tokens`)

## Problem (measured, not speculative)

Three shipping components render an inline `<style>` element **per component instance**:

| File | Sites | CSS size |
|---|---|---|
| `src/components/ui/checkbox.tsx` (`EnhancedCheckbox`, the public `Checkbox`) | lines ~280 and ~288 (both return paths) | ~4.9 KB |
| `src/components/custom/enhanced-progress.tsx` | 2 sites (~line 372, 387) | ~0.2 KB |
| `src/components/custom/rating.tsx` | 2 sites (~line 346, 361) | ~4.5 KB |

Measured consequences (verified in vitest/jsdom against the real components):

1. **Duplication** — 50 checkboxes → 50 identical `<style>` tags, 238.6 KB of duplicate CSS
   in the DOM, one parse + insert per row mount. nqgrid's row-selection column uses this
   `Checkbox` (`apps/playground/src/lib/select-cell-chrome.tsx`), virtualized but real.
2. **`textContent` pollution** — `container.textContent` starts with the stylesheet text.
   Breaks `getByText`, `toHaveTextContent`, snapshots, and consumer DOM-scraping.
   (`innerText` is unaffected; runtime UI is fine.)
3. **Unscoped globals** — `.checkbox-animated-*`, `.checkbox-round-*`, `.rating-wrapper`,
   `.progress-block*`, `@keyframes checkbox-pulse` enter global scope from a component.

**Explicitly verified NON-issue:** accessible names. `<style>` is `display:none`; AccName
skips it. Confirmed with Chromium a11y tree + `dom-accessibility-api` + testing-library
against the real component. Do not spend effort on accname.

**Also verified:** the inline `<style>` buys no self-sufficiency — its rules already
depend on tokens (`--muted`, `--card`, `--primary`, `--duration-quick`) and `hit-area-2`
from `@nqlib/nqui/styles`. A consumer without the styles import already has a broken
checkbox, so moving the CSS there loses nothing.

## Out of scope

- `src/components/debug/magnifier.tsx` — debug-only subpath, dynamic-ish CSS. Leave.
- `src/components/ui/sonner.tsx` — already uses the correct ID-guarded singleton
  injection (`injectToastStylesOnce`, line ~16). Leave. It is the reference pattern for
  any future component that truly needs runtime injection.
- No public API change: no new exports/props, class names stay byte-identical
  (consumers may target `.checkbox-animated-*` etc.).

## Design

Move the three CSS blocks into the token pipeline that already exists:
`src/index.css` imports `src/styles/*.css`; `pnpm run build:lib` emits `dist/styles.css`;
consumers load it via `@import "@nqlib/nqui/styles"` (`docs/components/README.md`).

1. Create `src/styles/components.css` (one file, three clearly commented sections;
   or three files under `src/styles/` if the repo owner prefers — match the existing
   one-concern-per-file comment style in `src/index.css` lines 24–28).
2. Paste the template-literal CSS **verbatim** (the easing tokens are already fixed to
   `var(--ease-in-out)` — do not re-edit values).
   - `rating.tsx` interpolates three same-file constants (`FULL_STAR_MASK`,
     `RIGHT_HALF_MASK`, `LEFT_HALF_MASK`, lines 9–14) into `mask:`/`-webkit-mask:`
     declarations. Inline the literal `url('data:image/svg+xml,…')` strings when pasting.
     They are static — this is mechanical.
3. Add `@import "./styles/components.css";` in `src/index.css` after the existing five
   style imports (keep it **unlayered**, same as today's `<style>` output).
4. Delete the `<style>{…}</style>` elements (6 sites) and the now-unused
   `checkboxStyles` / `progressStyles` / `ratingStyles` constants (and the mask consts
   if nothing else references them). Remove fragments (`<>…</>`) that existed only to
   hold the style sibling.

### Cascade-order analysis (the one real risk)

Today the rules live in unlayered `<style>` elements late in the document. After the
hoist they are unlayered rules in the imported stylesheet, i.e. **earlier** in document
order.

- vs **Tailwind utilities**: unaffected. Utilities live in `@layer utilities`; unlayered
  rules beat layered rules regardless of order.
- vs **consumer unlayered CSS**: specificity ties now resolve to the consumer (their CSS
  typically loads after `@nqlib/nqui/styles`). That direction is *better* for consumer
  overrides. The regression direction is any place nqui accidentally relied on beating
  consumer CSS in a tie — rare, but this is exactly what the showcase visual pass exists
  to catch. Do not "fix" surprises by adding `!important`; report them.

## Verification gates (all must pass)

Repo rules: **pnpm only** (`npm install` crashes this repo). Branch from wherever the
0.8.1 commits live (`fix/st-003-easing-tokens`) unless they have already merged; never
commit to `main`/`dev` directly. Commit when the work is done and gates pass.

```sh
pnpm test                 # includes src/test/css-sanity.test.ts tripwires
pnpm run build:lib
make prove-showcase       # packed tarball → showcase tsc -b
```

Scripted dist assertions (add to your workflow, not necessarily to the repo):

- `dist/styles.css` **contains** `.checkbox-animated-input`, `.checkbox-round-input`,
  `.rating-wrapper`, `.progress-block`, `@keyframes checkbox-pulse`, and the three
  `data:image/svg+xml` star masks.
- `dist/nqui.es.js` **no longer contains** `checkbox-animated-label {` (the CSS text) —
  bundle drops ~10 KB of source CSS.
- `grep -c "<style" src/components/ui/checkbox.tsx src/components/custom/enhanced-progress.tsx src/components/custom/rating.tsx` → 0 each.

Tests to extend (follow existing style in `src/components/ui/checkbox.test.tsx`):

- Checkbox/Rating/Progress render **zero** `<style>` elements.
- `container.textContent` for a labelled checkbox equals the label text (no CSS).
- Existing 235-test suite stays green.

Showcase visual QA (`cd ../nqui-showcase && pnpm nqui:local && pnpm dev`), light + dark:

- Checkbox: hover halo eases in, checked pulse fires once, checkmark scales in,
  disabled at 50%, `variant="round"`, focus-visible ring.
- Rating: hover fill, half-star mode (odd/even mask halves, no hairline gap),
  disabled, keyboard focus ring.
- Progress: bar + optional tooltip hover opacity.
- One nqgrid table with a select column (`/catalog` or playground): header + row
  checkboxes unchanged.

## Bookkeeping (docs-as-code, same PR)

- CHANGELOG: if 0.8.1 is still unpublished when this lands, fold into the existing
  `## [0.8.1]` block; otherwise bump patch to 0.8.2 and open a new block. Entry covers:
  per-instance `<style>` removal, textContent fix, the accname claim investigated and
  disproven.
- Story `## Bugs` dated lines: checkbox → `docs/product/epics/EP-002-core-component-surface/stories/ST-011-form-control-set.md`;
  rating → ST-014; progress → find its owning EP-002 story (grep `Progress` under
  `docs/product/epics/`). Internal refactor + bug fix ⇒ below the story line, no new story.
- `docs/components/nqui-checkbox.md` / rating / progress pages: only if they mention the
  injected style behavior (grep first); then `pnpm run sync:skills`.

## Outcome (2026-08-17)

Landed as specified. Notes for the record:

- **The style build needed a change the plan did not anticipate.** `scripts/build-styles.js`
  does not concatenate `src/styles/*` — it strips every `@import "./styles/*"` from
  `index.css` and re-injects named partials by *extracting* `:root` / `.dark` / `@layer`
  blocks. `components.css` is plain unlayered rules, so it matched none of those extractors
  and the first build shipped the rules **nowhere** (gone from JS, absent from
  `dist/styles.css`). Fixed by reading the partial verbatim and appending it, mirroring how
  `hit-area.css` is handled.
- CSS verified **byte-identical** to the pre-hoist source after whitespace/comment
  normalization (9180 chars both sides) — zero semantic change.
- `dist/nqui.es.js` no longer contains any of the CSS text or the star-mask data URIs.
- Visual QA done against the built `dist/styles.css` in both themes.
- Cascade risk did not materialize; no `!important` was added.
- **Semver: kept at patch (0.8.1), deliberately.** A pre-publish review flagged
  that removing self-injected styles changes the failure mode for an app that
  never imports `@nqlib/nqui/styles` — it goes from degraded-but-structured to
  fully unstyled — and that `agentic-coding-guideline.md` §"breaking" routes any
  breaking public-surface change to a minor bump while pre-1.0. Maintainer call:
  stay at patch. Nothing in the public surface moved (no export, prop, type or
  peer dependency), the styles import has always been documented as required
  setup, and the three components only appeared to work without it by accident.
  Recorded in the CHANGELOG's "Upgrade notes" so the reasoning travels with the
  release rather than living only in review history.

## Definition of done

All gates green, visual QA checklist done in both themes, zero `<style>` sites in the
three components, bookkeeping complete, single commit on the fix branch (message style:
`fix(forms): hoist per-instance <style> injection into shipped stylesheet (ST-011)` with
`Co-Authored-By` per repo convention).
