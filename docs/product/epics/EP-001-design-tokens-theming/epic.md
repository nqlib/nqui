---
id: EP-001
title: Design tokens & theming
status: in-progress
owner: maintainer
---

# EP-001 — Design tokens & theming

## Goal

Give consumers one coherent visual system — color, elevation, motion, radius, spacing and stacking —
that an app author (or an agent) can adopt without inventing values, and rebrand without forking the
library.

## Success metrics

- A consumer changes brand color in exactly one file (`nqui/colors.css`) and every component follows.
- No component ships a hard-coded shadow, duration, or z-index — tokens only.
- Light and dark are defined together; adding a component never means re-deciding dark mode.

## Scope — In

- OKLCH `--primary-100…600` ladder and semantic color scales (`src/styles/colors.css`).
- Elevation: the 2+1 rule and `--shadow-elevated / --shadow-modal / --shadow-focus`
  (`src/styles/shadows.css`), plus `--surface-a/-b/-elevated`.
- Motion tokens and easings wired as Tailwind defaults (`src/styles/motion.css`).
- Z-index scale (`src/styles/z-index.css`) and hit-area utilities (`src/styles/hit-area.css`).
- Radius scale and component radius tokens (`src/index.css`).
- Dark mode (`@custom-variant dark`), `ThemeToggle`, `ThemeAppearanceMenu`.
- Consumer brand override path: `scripts/init-css.js` + `scripts/templates/colors.css`.
- The Tailwind v4 safelist (`@source inline(...)`) that keeps tokens alive in consumer builds.

## Scope — Out (explicit)

- Per-component styling decisions — they belong to the epic that owns the component.
- The narrative design guidance in `docs/nqui-skills/` (ELEVATION/MOTION/THEMING/STATES) — that is
  documentation of this epic, owned by EP-007.
- A theme *builder* UI (lived in the removed showcase; belongs to nqui-showcase if it returns).

## Dependencies

None — everything else builds on this.

## Public API surface

`src/index.css`, `src/styles/*.css`, `dist/styles.css` (`./styles` export), `nqui/colors.css` in the
consumer app, `ThemeToggle` / `ThemeAppearanceMenu` exports.

## Stories

| ID | Title | Status | Release |
|---|---|---|---|
| ST-001 | OKLCH primary ladder and semantic color scales | done | 0.7.2 |
| ST-002 | Elevation system — the 2+1 rule | done | pre-baseline |
| ST-003 | Motion tokens wired into Tailwind | done | 0.7.2 |
| ST-004 | Z-index scale | done | pre-baseline |
| ST-005 | Radius scale and component radius tokens | done | pre-baseline |
| ST-006 | Hit-area utilities | done | pre-baseline |
| ST-007 | Consumer brand override via `init-css` | done | 0.7.2 |
| ST-008 | Dark mode and theme switching surface | in-progress | pre-baseline |
| ST-065 | Ship Satoshi as the library default sans | review | 0.7.8 |

## Implementation references

- `docs/nqui-skills/{ELEVATION,MOTION,THEMING,STATES}.md` — the narrative form of these tokens.
- Release 0.7.2 (`967d145`) — neutral primary default, `init-css` colors, motion token wiring.
