---
id: ST-022
epic: EP-003
title: Card + ScrollArea bounded-scroll contract
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/components/ui/card.tsx, src/components/ui/scroll-area.tsx, src/components/custom/enhanced-scroll-area.tsx, docs, skills]
api: docs/components/nqui-scroll-area.md
---

# ST-022 — Card + ScrollArea bounded-scroll contract

As an app author building a dashboard card,
I want a card whose header stays put while its body scrolls inside the card box,
so that I don't rediscover the `min-height: auto` flex rule every time content overflows.

## Acceptance criteria

- [x] The public `ScrollArea` / `ScrollBar` exported from the main entry is
      `EnhancedScrollArea` (`src/components/custom/enhanced-scroll-area.tsx`); the raw Radix wrapper
      in `src/components/ui/scroll-area.tsx` stays reachable as `CoreScrollArea` / `CoreScrollBar`.
- [x] `EnhancedScrollAreaProps` ships `fadeMask` (default `true`), `hideScrollbar`,
      `orientation: "vertical" | "horizontal" | "both"`, `onScroll`, `viewportRef` and
      `viewportStyle` — the last two so consumers can drive `scrollTop` and scroll padding.
- [x] The fade mask is scroll-aware, not decorative: `getMaskStyle` returns `maskImage: none` when
      content fits (`SCROLL_THRESHOLD = 2`) and otherwise fades only the overflowing edges by
      `FADE_SIZE = 16`px, recomputed on `scroll` and via a `ResizeObserver` on the viewport.
- [x] `orientation="horizontal" | "both"` installs a non-passive `wheel` handler that maps
      vertical/shift wheel deltas to horizontal scroll, honours `deltaMode`, and calls
      `preventDefault()` only when the viewport can actually scroll in that direction.
- [x] `Card stickyHeader` composes the whole chain itself: root gets `flex flex-col` and stays
      `overflow-visible`, `CardHeader` becomes `sticky top-0 z-[var(--z-sticky-content)]
      flex-shrink-0` with a `FrostedGlass` backdrop, and `CardContent` renders inside
      `<ScrollArea className="min-h-0 w-full min-w-0 flex-1">`.
- [x] `Card`, `CardHeader`, `CardContent` and `CardFooter` all carry `min-w-0` so nested flex/grid
      children can shrink instead of spilling horizontally.
- [x] `docs/components/nqui-scroll-area.md` carries the symptom → fix routing table (scroll stuck,
      footer covered, bleeds past the card radius) and the `viewportStyle` escape hatch.
- [x] `docs/components/nqui-card.md` states the bounded-height requirement (`max-h-*` alone is not
      enough) and `docs/nqui-skills/nqui-design-system/SKILL.md` "Card + ScrollArea (flex scroll
      contract)" documents the `min-h-0` height chain plus a pre-ship checklist.
- [x] A composed Card renders without throwing in `src/components/ui/primitives.test.tsx`.

## Technical notes

- `overflow-hidden` on the Card root is deliberately absent: Radix ScrollArea needs a non-clipping
  flex ancestor to resolve `flex-1` / `min-h-0`, so clipping there kills vertical scroll. Consumers
  who need the frosted header boxed in add an outer `overflow-hidden rounded-*` wrapper.
- The mask is applied to the viewport via inline `maskImage` / `WebkitMaskImage` and transitions
  with `--duration-standard`; `setMaskStyle` bails out when the computed value is unchanged so the
  scroll handler does not re-render on every frame.
- The fade-mask and wheel-shim behaviour has no automated coverage — verified manually in sibling
  nqui-showcase. Closing that gap belongs to ST-054 (EP-006).

## Out of scope

- Data-table shells built on this contract — `docs/nqui-skills/nqui-data-tables` (EP-007).
- The elevation and z-index tokens the sticky header consumes — EP-001.
