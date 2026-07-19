---
id: ST-049
epic: EP-006
title: Test baseline — unit, component smoke, CLI, dist guard
status: done
priority: must
release: 0.7.0
breaking: false
scope: [vitest.config.ts, src/test, src/components, src/lib, package.json]
---

# ST-049 — Test baseline — unit, component smoke, CLI, dist guard

As a maintainer of `@nqlib/nqui`,
I want a Vitest suite that covers unit logic, component rendering, the CLI, and the built artifact,
so that "the build is green" means something stronger than "it compiled".

## Acceptance criteria

- [x] `pnpm test` runs `vitest run` against `vitest.config.ts`: jsdom environment, `globals: true`,
      `setupFiles: ['./src/test/setup.ts']` (which wires `@testing-library/jest-dom/vitest`).
- [x] Eleven test files exist and pass: `src/lib/utils.test.ts`, `src/components/ui/button.test.tsx`,
      `src/components/ui/primitives.test.tsx`, `src/components/custom/enhanced-tabs.test.tsx`,
      five under `src/components/dnd/` (`dnd.test.ts`, `dnd-render.test.tsx`, `grid-geometry.test.ts`,
      `kanban-model.test.ts`, `reorder.test.ts`), `src/test/dist-guard.test.ts`,
      `src/test/init-css.test.ts`.
- [x] Component smoke tests assert behavior, not snapshots: `Button` covers variant
      `data-variant`, `onClick`, and the disabled no-fire path; `primitives.test.tsx` covers Badge,
      Card, Input, Checkbox, Switch, Label, Separator.
- [x] CLI coverage: `src/test/init-css.test.ts` runs `scripts/init-css.js` via `spawnSync` in an
      `mkdtempSync` fixture and asserts `nqui/index.css` + `nqui/colors.css` are written, cleaning up
      in `afterEach`.
- [x] `src/test/dist-guard.test.ts` asserts against the **built** `dist/`, forbidding inlined
      module-body signatures of `react-router`, `shiki` and `@codesandbox/sandpack-react`, and
      self-skips when `dist/` is absent so a fresh checkout stays green.
- [x] No new test dependency was added — `fireEvent` from `@testing-library/react`, not
      `user-event`.

## Technical notes

- No public API surface. The suite protects **rendering behavior of the shipped components** and the
  **dist artifact's dependency isolation** (the EP-005 invariant, enforced here rather than by hand).
- `vitest.config.ts` `include` is `src/**/*.{test,spec}.{ts,tsx}` only — plan 003 Step 2 proposed
  adding `scripts/**/*.test.{js,mjs}`; instead the CLI test lives under `src/test/` and shells out,
  so the config stayed unchanged.
- The dist-guard's self-skip is why CI must build before it tests — see ST-050.
- Radix Tabs needs a pointerDown → mouseDown → click sequence to activate; `enhanced-tabs.test.tsx`
  has a `selectTab` helper for it. Copy that helper for any future Radix-based test.

## Out of scope

- Form controls beyond the primitives file, overlays, hooks and per-entry smoke tests — ST-054.
- Bundle-size budgets (`pnpm size`) — the budget itself is EP-005; running it in CI is ST-050.
