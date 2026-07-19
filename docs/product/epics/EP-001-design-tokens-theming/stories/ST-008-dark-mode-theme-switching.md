---
id: ST-008
epic: EP-001
title: Dark mode and theme switching surface
status: in-progress
priority: must
release: pre-baseline
breaking: false
scope: [src/index.css, src/components/theme-toggle.tsx, src/components/theme-appearance-menu.tsx, docs]
api: src/components/theme-appearance-menu.tsx
---

# ST-008 — Dark mode and theme switching surface

As an app author shipping light and dark,
I want a class-based dark variant plus ready-made switching controls,
so that adding a component never means re-deciding dark mode and I don't hand-roll a toggle.

## Acceptance criteria

- [x] `src/index.css` declares `@custom-variant dark (&:where(.dark, .dark *))`, so `dark:`
      utilities match on the `.dark` class or any ancestor.
- [x] A matching `@custom-variant light (&:where(.light, .light *))` exists for the warm-paper
      non-dark theme.
- [x] Every token file defines its dark counterpart in the same file as the light one —
      `colors.css`, `shadows.css`, and the `:root` / `.dark` surface blocks in `index.css`.
- [x] `ThemeToggle` (light ↔ dark) and `ThemeAppearanceMenu` (light / dark / system) are exported
      from the package root via `src/components/index.ts`, along with
      `ThemeAppearanceMenuProps`.
- [x] Both components guard against hydration mismatch with a `mounted` flag and render a stable
      fallback before mount.
- [x] `ThemeToggle`'s icon crossfade uses `duration-[var(--duration-standard)]` — a motion token,
      not a hard-coded duration (ST-003).
- [x] `next-themes` is a dependency of the package, so consumers get the provider contract these
      components rely on.
- [ ] `docs/components/nqui-theme-toggle.md` and `docs/components/nqui-theme-appearance-menu.md`
      exist and are linked from `docs/components/README.md`.
- [ ] The dark-mode setup path (wrapping the app in `ThemeProvider`, `enableSystem`, adding the
      `.dark` class) is documented on a component page rather than only in the narrative skills.

## Technical notes

- **Why this story is still `in-progress`:** both components are exported public API but neither
  has a page under `docs/components/`. Per §6 the doc page *is* the seam, so the surface is
  currently undocumented at the contract layer; `docs/nqui-skills/THEMING.md` covers token
  overrides but not the switching components' props or provider requirements.
- `ThemeAppearanceMenu` requires the consumer's `ThemeProvider` to have `enableSystem`, otherwise
  the "System" radio item selects a theme that never resolves. That precondition currently lives
  only in a source comment.
- `ThemeToggle` is deliberately two-state (light ↔ dark) and imports `Button` from `@/index`,
  while `ThemeAppearanceMenu` imports `EnhancedButton` from `./ui/button` — inconsistent import
  depth, harmless at runtime.
- A third `mid` theme existed historically and was removed before the 0.7.x record; only `light`
  and `dark` ship today.

## Out of scope

- Persisting or SSR-syncing theme choice — that is `next-themes`' job in the consumer app.
- A theme-builder UI (belongs to nqui-showcase if it returns).
