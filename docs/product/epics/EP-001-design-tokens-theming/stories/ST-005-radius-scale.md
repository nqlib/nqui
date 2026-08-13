---
id: ST-005
epic: EP-001
title: Radius scale and component radius tokens
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/index.css, src/components, docs, skills]
api: src/index.css
---

# ST-005 — Radius scale and component radius tokens

As an app author who wants nqui to match a brand's corner language,
I want every `rounded-*` utility derived from a single `--radius` base,
so that changing one value rounds the whole kit consistently.

## Acceptance criteria

- [x] `--radius: 0.75rem` is declared once, on `:root` in `src/index.css`
      (Soft default; was `0.45rem` at first ship).
- [x] The Tailwind radius scale is derived from it inside `@theme inline`:
      `--radius-xs: min(0.375rem, max(2px, calc(var(--radius) - 6px)))` (compact chips;
      capped so `h-5` never stadiums), `--radius-sm: calc(var(--radius) - 4px)`,
      `--radius-md: calc(var(--radius) - 2px)`, `--radius-lg: var(--radius)`,
      `--radius-xl: calc(var(--radius) + 4px)`, and `2xl` / `3xl` / `4xl` at
      `+8px` / `+12px` / `+16px`.
- [x] The scale lives in `@theme` rather than a separate `styles/*.css` file, because Tailwind v4
      only generates `rounded-*` utilities from `--radius-*` tokens declared there — the reason is
      recorded as an in-source comment.
- [x] The usage convention is documented in the same comment block: `xs` for compact chips
      (Badge, kbd, 20px icon buttons), `sm` for denser-than-chip controls, `md` for inputs
      and buttons, `lg` for Cards and panels, `xl` for modals and sheets, `2xl+` for
      marketing only.
- [x] Component-level radius tokens are consumable as arbitrary values and are safelisted in
      `src/index.css`: `rounded-(--tabs-pill-radius)` and `rounded-(--radio-pill-radius)`.
- [x] `.separator-tab-down` uses `var(--radius)` directly rather than a literal, so decorative
      shapes track the base.
- [x] `docs/nqui-skills/THEMING.md` lists `--radius` as a safe consumer override that affects all
      radius tokens.

## Technical notes

- `--radius-sm` at `calc(0.75rem - 4px)` stays positive (≈0.5rem); a consumer who lowers
  `--radius` below ~4px will clamp small corners to square, which is acceptable but should be a
  deliberate choice.
- `--radius` is declared in the `:root` block of `index.css` and is **not** overridden in `.dark`
  — corner language is mode-independent by design.

## Bugs

- 2026-08-13 — Default `--radius` raised from `0.45rem` to `0.75rem` (showcase Soft preset).
  The ladder still derives from the single base; `0.45rem` remains a valid consumer override.
- 2026-08-13 — Added `--radius-xs` (`min(0.375rem, max(2px, calc(var(--radius) - 6px)))`) for
  compact chips. Soft `--radius-md` on `h-5` Badge was exactly half-height and read as a pill.
- 2026-08-13 — Documented why chrome (`md`) / panels (`lg`) / overlays (`xl`) are different
  rungs of one `--radius` (concentric nesting), and which geometries stay off the ladder
  (circles, compact chips, thin tracks). nqui-dev + design-system + `.cursor/rules/nqui-radius.mdc`.

## Out of scope

- Per-component radius choices (which component picks `md` vs `lg`).
- A theme-builder UI for previewing radius changes.
