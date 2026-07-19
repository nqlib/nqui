---
id: EP-003
title: Layout, scroll & app shell
status: in-progress
owner: maintainer
---

# EP-003 — Layout, scroll & app shell

## Goal

Make bounded-height, correctly-scrolling application layouts the default outcome rather than a
CSS puzzle: a card that scrolls inside its own box, a sidebar shell, tab and toggle surfaces that
don't shift when their content changes.

## Success metrics

- A dashboard card with a sticky header and a scrolling body works by composing Card + ScrollArea —
  no consumer-side `min-h-0` archaeology.
- Selection controls in a toolbar never resize their neighbours when the selection changes.
- The layout contract is documented well enough that an agent building a screen gets it right first
  try.

## Scope — In

- Card + ScrollArea flex-scroll chain and the `min-h-0` contract.
- `EnhancedScrollArea` (public `ScrollArea`) over `CoreScrollArea`.
- Sidebar shell.
- Tabs (`EnhancedTabs`) and `InlineTabs`.
- ToggleGroup layout contract — pinned cross axis (0.7.3).
- Resizable panels.
- Navigation surfaces: Breadcrumb, NavigationMenu, Menubar, Pagination.
- TableOfContents.
- FrostedGlass surface.

## Scope — Out (explicit)

- The individual controls inside a layout → EP-002.
- Page-level recipes and screen composition guidance → they are documentation, owned by EP-007
  (`docs/nqui-skills/COMPOSITION.md`, `RECIPES.md`).
- Any live layout demo — sibling **nqui-showcase** only.

## Dependencies

- EP-001 (elevation, z-index, radius tokens).
- EP-002 (the controls these shells contain).

## Public API surface

Card, ScrollArea, Sidebar, Tabs, InlineTabs, ToggleGroup, Resizable, Breadcrumb, NavigationMenu,
Menubar, Pagination, TableOfContents, FrostedGlass exports from the main entry;
`docs/components/nqui-*.md` for each; `docs/nqui-skills/nqui-design-system` layout rules.

## Stories

| ID | Title | Status | Release |
|---|---|---|---|
| ST-022 | Card + ScrollArea bounded-scroll contract | done | pre-baseline |
| ST-023 | Sidebar application shell | done | pre-baseline |
| ST-024 | Tabs and inline tabs | done | pre-baseline |
| ST-025 | ToggleGroup pinned cross axis and layout contract | in-progress | 0.7.3 |
| ST-026 | Resizable panels | in-progress | unset |
| ST-027 | Navigation surfaces | done | pre-baseline |
| ST-028 | Table of contents | done | pre-baseline |
| ST-029 | Frosted glass surface | done | pre-baseline |

## Implementation references

- Release 0.7.3 (`4d5f0ba`) — pin ToggleGroup cross axis, document the layout contract (ST-025).
- `internal-notes/DASHBOARD_LAYOUT_DESIGN.md`, `internal-notes/layoutdesign.md`,
  `internal-notes/FROSTED_GLASS_FIX.md` — design records behind ST-022/ST-029 (migration: ST-062).
