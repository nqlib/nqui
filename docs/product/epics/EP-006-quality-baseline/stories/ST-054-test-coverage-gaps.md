---
id: ST-054
epic: EP-006
title: Test coverage for form controls, overlays and hooks
status: backlog
priority: should
release: unset
breaking: false
scope: [src/components/ui, src/components/table, src/hooks, src/test, vitest.config.ts]
---

# ST-054 — Test coverage for form controls, overlays and hooks

As an app author,
I want the components consumers actually break on to have behavioral tests,
so that a refactor of a Select or a Dialog cannot ship silently broken because only the
best-tested corner of the library was covered.

## Acceptance criteria

- [ ] Form controls gain smoke tests: `select`, `native-select`, `radio-group`, `textarea`, `slider`,
      `combobox`, `input-otp`, `field`, `toggle`, `toggle-group` — each asserting render, accessible
      role/name, the controlled `onChange`/`onValueChange` path, and the disabled no-fire path.
- [ ] Overlays gain open/close + focus tests: `dialog`, `alert-dialog`, `sheet`, `popover`,
      `tooltip`, `dropdown-menu`, `hover-card`, `context-menu`, `menubar` — trigger opens, content is
      in the accessible tree, Escape closes.
- [ ] Layout and data components gain tests: `scroll-area`, `sidebar`, `table` and
      `src/components/table/DataTable.tsx`, `error-boundary.tsx`, `theme-toggle.tsx` /
      `theme-appearance-menu.tsx`.
- [ ] `src/hooks/*` gets unit tests via `renderHook`, covering at minimum `use-badge-overflow`,
      `use-debounced-callback`, `use-intersection-observer`, `use-scroll-spy`, `use-detect-touch`,
      `use-resolved-theme`, `use-mobile`.
- [ ] A per-entry subpath smoke test asserts every `src/entries/*.ts` (calendar, carousel, command,
      debug, dnd, drawer, sonner, sortable) imports and renders its headline component without
      pulling an optional peer into the main entry.
- [ ] No new test dependency is added — `fireEvent` and `renderHook` from
      `@testing-library/react`, matching the ST-049 house style.
- [ ] `pnpm test` stays green and its runtime stays under a stated budget recorded in the PR.

## Technical notes

- No public API doc. The tests protect **the rendered behavior of the public component surface** —
  the props documented in `docs/components/*.md`.
- Current state, verified: eleven test files exist and the covered set is narrow. `primitives.test.tsx`
  gives render/interaction smoke coverage to Badge, Card, Input, Checkbox, Switch, Label and
  Separator only; `button.test.tsx` and `enhanced-tabs.test.tsx` cover one component each; five files
  cover DnD. Everything listed in the criteria above has **zero** tests today, and there is no
  per-entry subpath smoke test.
- Overlays are Radix-based: activation needs the pointerDown → mouseDown → click sequence, and
  portalled content is outside the render container. Reuse the `selectTab` helper pattern from
  `src/components/custom/enhanced-tabs.test.tsx` and query via `screen`, not the container.
- `DataTable.tsx` carries a pre-existing `TS2428` typecheck error (TableMeta augmentation). Mention
  it when writing the DataTable test but **do not fix it here** — it is owned by **EP-002 ST-020**,
  and ST-053 needs it resolved to turn the app typecheck on.
- Optional-peer components (sortable, carousel, command, drawer, calendar, sonner) must be tested
  through their subpath entry, never through the main barrel.

## Out of scope

- Coverage thresholds or a coverage reporter in CI — decide that after the gap is closed.
- Visual QA, which stays a manual pass in the sibling nqui-showcase.
