---
id: ST-029
epic: EP-003
title: Frosted glass surface
status: done
priority: should
release: pre-baseline
breaking: false
scope: [src/components/ui/frosted-glass.tsx, src/components/ui/card.tsx, docs]
api: docs/components/nqui-frosted-glass.md
---

# ST-029 — Frosted glass surface

As an app author building a sticky header,
I want an Apple-style blur layer that samples the content scrolling behind it,
so that page and card chrome reads as glass instead of as a flat translucent bar.

## Acceptance criteria

- [x] `FrostedGlass` renders an absolutely positioned, `pointer-events-none` backdrop layer with
      `backdropFilter` / `WebkitBackdropFilter` set inline (not via a Tailwind class), so Safari is
      covered and the value is not lost to class scanning.
- [x] The backdrop is `h-[200%]` so it samples nearby elements — the Comeau technique the component
      is modelled on — and carries a faint `bg-background/3` so the blur is visible on any surface.
- [x] `borderRadius > 0` switches to an SVG `mask` whose id is derived from `React.useId()` (colon-
      stripped), so several instances on a page cannot collide; `borderRadius = 0` uses the
      linear-gradient mask for a straight header edge.
- [x] The surface is props-only: `blur` (default 16), `borderRadius` (default 0), `className` —
      there is deliberately no `opacity` prop, because the tint belongs to the sibling bar.
- [x] `FrostedGlass` and `FrostedGlassProps` are exported from the main entry.
- [x] `Card stickyHeader` is the wired reference implementation: `FrostedGlass blur={16}
      borderRadius={8} className="z-[var(--z-background)]"` under a `z-[var(--z-content)]` content
      row, inside a header at `z-[var(--z-sticky-content)]`.
- [x] `docs/components/nqui-frosted-glass.md` documents the two-layer rule, the elevation table
      (`--z-background` < `--z-content`; `--z-sticky-content` 15 < `--z-sticky-page` 20), the
      scroll requirement, and a troubleshooting table for "solid bar, almost no blur".
- [ ] Every code reference on the doc page resolves in this repo.

## Technical notes

- The doc page's canonical page-header example is attributed to `AppLayout`
  (`packages/nqui/src/components/AppLayout.tsx`), which no longer exists here — the app shell was
  showcase-only and is not part of the library surface. The snippet itself is still correct; only
  the attribution is stale. Fixing it belongs to the docs sweep, ST-056 (EP-007).
- The component's JSDoc claims "feature queries for browser support"; there is no `@supports` block
  in `frosted-glass.tsx`. Browsers without `backdrop-filter` fall back to the `bg-background/3`
  layer, which is why the readable tint has to live on the sibling bar (`bg-background/40`) rather
  than on the glass.
- The blur only reads if content actually scrolls behind the sticky region — the same bounded-scroll
  chain as ST-022, which is why the two stories share the `internal-notes` design records.

## Out of scope

- The elevation/z-index token set itself — EP-001.
- App shell composition around the header — ST-023 for the sidebar, sibling nqui-showcase for the
  live page shell.
