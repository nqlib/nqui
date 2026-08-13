---
id: ST-010
epic: EP-002
title: Action and content primitives
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/components/ui, src/components/index.ts, docs, tests]
api: docs/components/nqui-button.md
---

# ST-010 — Action and content primitives

As an app author building any screen,
I want the small building blocks — actions, labels, placeholders and separators — available from
the main entry with no optional peer,
so that a first screen needs one import and no extra install.

## Acceptance criteria

- [x] Actions ship from `src/components/index.ts`: `Button` (+ `buttonVariants`, `CoreButton`),
      `ButtonGroup` / `ButtonGroupSeparator` / `ButtonGroupText` / `buttonGroupVariants`,
      `Toggle` + `toggleVariants`, `ToggleGroup` / `ToggleGroupItem` / `ToggleGroupSeparator`.
- [x] Status and affordance primitives ship: `Badge` (+ `badgeVariants`, `CoreBadge`),
      `Kbd` / `KbdGroup`, `Spinner`, `Skeleton`.
- [x] Structure and content primitives ship: `Separator` (+ `SeparatorProps`, `SeparatorVariant`),
      `AspectRatio`, `Avatar` / `AvatarImage` / `AvatarFallback`, `Card` (6 parts),
      `FrostedGlass` (+ `FrostedGlassProps`).
- [x] Composite content primitives ship: `Item` with `ItemMedia` / `ItemContent` / `ItemActions` /
      `ItemGroup` / `ItemSeparator` / `ItemTitle` / `ItemDescription` / `ItemHeader` / `ItemFooter`,
      and `Empty` with `EmptyHeader` / `EmptyTitle` / `EmptyDescription` / `EmptyContent` /
      `EmptyMedia`.
- [x] None of these pull an optional peer — each resolves to `radix-ui`,
      `class-variance-authority`, `clsx` or `tailwind-merge`, all listed under `dependencies`.
- [x] `Button` exposes one shared size scale (`buttonSizeVariants` in `src/components/ui/button.tsx`)
      used by both `CoreButton` and `EnhancedButton`, so sizing never diverges between the two.
- [x] Each has a doc page: `nqui-button.md`, `nqui-button-group.md`, `nqui-badge.md`,
      `nqui-toggle.md`, `nqui-toggle-group.md`, `nqui-kbd.md`, `nqui-spinner.md`,
      `nqui-skeleton.md`, `nqui-separator.md`, `nqui-aspect-ratio.md`, `nqui-avatar.md`,
      `nqui-card.md`, `nqui-frosted-glass.md`, `nqui-item.md`, `nqui-empty.md`.
- [x] Regression tests exist at `src/components/ui/button.test.tsx` and
      `src/components/ui/primitives.test.tsx`.

## Technical notes

- `Separator` is deliberately a single component with a `variant` prop rather than an
  `Enhanced`/`Core` pair — `SeparatorVariant` is the public union.
- `ToggleGroup` owns its own overflow on both axes; consumers must use its `spacing` prop and never
  `flex-wrap` / `gap-*` / `overflow-*` via `className`. See `docs/components/nqui-toggle-group.md`
  and the 0.7.3 CHANGELOG entry.
- `Item` and `Empty` are layout-shaped rather than styled-shaped: they exist so lists and empty
  states compose from the same slots instead of ad-hoc flex wrappers.
- `NquiLogo` (+ `NquiLogoProps`) also ships from the barrel but is branding, not a primitive.

## Bugs

- 2026-08-13 — Filled Button / CoreButton used `rounded-full` while outline / ghost / link used
  `rounded-md`. All variants now use `rounded-md` so they follow `--radius`.
- 2026-08-13 — ButtonGroup, ToggleGroup, and Badge shells use `rounded-md` (same as Button).

## Out of scope

- The `Enhanced*` / `Core*` mapping itself — ST-009.
- Form controls (Input, Label, Field, …) — ST-011.
- Layout and scroll shells (ScrollArea, Sidebar, Resizable) — EP-003.
