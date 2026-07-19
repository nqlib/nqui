---
id: ST-002
epic: EP-001
title: Elevation system — the 2+1 rule
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/styles/shadows.css, src/styles/z-index.css, src/index.css, docs]
api: src/styles/shadows.css
---

# ST-002 — Elevation system — the 2+1 rule

As an app author (or an agent) laying out nested panels,
I want exactly two inline surfaces plus one elevated surface, with shadows reserved for the
elevated one,
so that depth is expressed consistently and nobody invents a third shade of gray.

## Acceptance criteria

- [x] `src/index.css` defines the surface aliases in both `:root` and `.dark`:
      `--surface-a: var(--background)`, `--surface-b: var(--muted)`,
      `--surface-elevated: var(--popover)`.
- [x] `--card` and `--popover` are the same value by aliasing (`--popover: var(--card)`), so lift
      comes from shadow, not from color.
- [x] `src/styles/shadows.css` defines `--shadow-elevated`, `--shadow-modal` and `--shadow-focus`,
      each with a distinct `.dark` override.
- [x] `--shadow-elevated` is a two-layer lift (1px hairline + soft drop); `--shadow-modal` is
      stronger; `--shadow-focus` derives from `--ring` via `color-mix`.
- [x] `.nqui-card` (in `src/styles/z-index.css`) carries a border only — **no** default shadow.
- [x] `.nqui-elevated` is the single opt-in class that applies `background: var(--popover)`, a
      border, and `box-shadow: var(--shadow-elevated)`.
- [x] Dark mode softens both card and elevated borders to
      `color-mix(in oklch, var(--border) 50%, transparent)`.
- [x] The rule is documented in `docs/nqui-skills/ELEVATION.md` with the surface table and the
      "maximum 2 inline surfaces" depth rule.

## Technical notes

- `.nqui-card` / `.nqui-elevated` live in `z-index.css` under `@layer components`, not in
  `shadows.css` — historical placement, kept because the file also owns the stacking story that
  overlays depend on. The two concerns are documented as distinct: stacking order (ST-004) is not
  surface depth.
- Both light and dark `--shadow-elevated` / `--shadow-modal` use a tinted (light) or true-black
  (dark) drop; the dark hairline becomes a border-color highlight rather than a shadow line.
- `--overlay` (the modal scrim) is tokenized separately in `src/index.css`
  (`oklch(0 0 0 / 0.8)` light, `/ 0.7` dark) so consumers can retarget it.

## Out of scope

- Which component uses which surface — that belongs to each component's own epic.
- The z-index stacking scale — ST-004.
