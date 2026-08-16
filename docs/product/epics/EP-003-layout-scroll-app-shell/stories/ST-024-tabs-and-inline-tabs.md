---
id: ST-024
epic: EP-003
title: Tabs and inline tabs
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/components/ui/tabs.tsx, src/components/custom/enhanced-tabs.tsx, src/components/custom/inline-tabs.tsx, docs, skills, tests]
api: docs/components/nqui-tabs.md
---

# ST-024 — Tabs and inline tabs

As an app author placing tabs in a card or in a long scrolling page,
I want one tab root with a sliding indicator plus a list/trigger pair that survives page scroll,
so that switching a tab never jumps the reader's position or reflows the panel.

## Acceptance criteria

- [x] The main entry exports `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` from
      `custom/enhanced-tabs.tsx`, with the shadcn base still reachable as `CoreTabs`,
      `CoreTabsList`, `CoreTabsTrigger`, `CoreTabsContent`.
- [x] `EnhancedTabs` works controlled and uncontrolled (internal state when `value` is undefined),
      and publishes `value` / `onValueChange` / `orientation` through context; using
      `EnhancedTabsTrigger` outside it throws a named error.
- [x] The `default` list variant renders a real sliding pill: a `data-slot="tabs-pill"` layer
      measured by `useSlidingTabPill` via `ResizeObserver` + `MutationObserver` on
      `data-state`, animated with `motion-safe:duration-[var(--duration-standard)]` and
      `motion-reduce:transition-none`.
- [x] The list strip is `h-7`, matching the default Button / Input / Toggle control size;
      `variant="line"` swaps the capsule for underline tabs, `--tabs-pill-radius` on `TabsList`
      reshapes shell/triggers/pill together, and `tabsListVariants` is exported for extension.
- [x] `orientation="vertical"` is supported end to end — `EnhancedTabsList` adds `flex-col`, and the
      core trigger/pill styles key off `group-data-[orientation=vertical]/tabs`.
- [x] `InlineTabsList` wraps the list in a horizontal `ScrollArea` (`hideScrollbar`,
      `fadeMask={false}`, `w-max` list) so a too-wide tab row scrolls instead of wrapping.
- [x] `InlineTabsTrigger` records the vertical scroll parent and tab-bar anchor on `mouseDown` and
      restores both on `focus`, so Radix's focus-on-click cannot move the page; it also scrolls the
      active trigger into view honouring `prefers-reduced-motion`.
- [x] `docs/components/nqui-tabs.md` documents the inline pieces, the "where does vertical
      scrolling happen?" decision, and the customization ladder; the playbook lives at
      `docs/nqui-skills/nqui-inline-tabs/SKILL.md`.
- [x] `src/components/custom/enhanced-tabs.test.tsx` covers default content, uncontrolled switching,
      controlled value + change reporting, and the out-of-context error.
- [ ] `custom/inline-tabs.tsx` has its own `docs/components/nqui-*.md` page covering every export.

## Technical notes

- There is no `docs/components/nqui-inline-tabs.md`. Inline tabs are documented inside
  `docs/components/nqui-tabs.md`, which covers `InlineTabsList`, `InlineTabsTrigger` and
  `inlineTabsPanelsClass` — but the other exported class constants (`inlineTabsListClass`,
  `inlineTabsTriggerClass`, `inlineTabsPanelsDemoClass`) are shipped from the main entry and appear
  on no doc page. That gap is tracked by ST-056 (EP-007), not here.
- `inlineTabsPanelsClass` (`min-h-[28rem]`) exists because a short panel shrinks the page and clamps
  the restored scroll position; the demo variant drops it to `11rem` for small viewports.
- `findVerticalScrollParent` deliberately skips ScrollArea viewports that contain a `[role=tablist]`
  so the tab bar's own horizontal scroller is never mistaken for the page scroller.

## Bugs

- 2026-08-16 — `variant="line"` measured the trigger border-box, so the 2px bar
  sat below a `border-b` on `TabsList`. It now pins to the list padding-box edge
  and overlaps the hairline.
- 2026-08-16 — Triggers sized with `flex-1 min-w-0` plus `wrapInlineLabelTextNodes`
  (`truncate`), so inactive labels ellipsized (`Ta…`) while the active tab looked
  full. Default is now `shrink-0` and the raw label — no ellipsis.
- 2026-08-16 — `variant="line"` used a per-trigger `::after` opacity fade, so the
  underline did not slide. It now shares `useSlidingTabIndicator` with the default
  pill (`data-slot="tabs-line"`).
- 2026-08-13 — Default `--tabs-pill-radius` is `var(--radius-md)` (matches Button) instead of
  a full capsule (`9999px`). Override with `[--tabs-pill-radius:9999px]` to restore the pill.
- 2026-08-13 — Inner sliding chip / triggers use `--tabs-pill-inner-radius` =
  `max(0px, outer − 3px inset)` so the pad is concentric (`R_inner = R_outer − padding`).

## Out of scope

- ToggleGroup as the inline *selection* control — ST-025.
- Page composition guidance on when a screen deserves tabs at all — EP-007.
