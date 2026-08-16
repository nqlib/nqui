---
id: ST-027
epic: EP-003
title: Navigation surfaces
status: done
priority: should
release: pre-baseline
breaking: false
scope: [src/components/ui/breadcrumb.tsx, src/components/ui/navigation-menu.tsx, src/components/ui/menubar.tsx, src/components/ui/pagination.tsx, docs]
api: docs/components/nqui-navigation-menu.md
---

# ST-027 — Navigation surfaces

As an app author assembling page chrome,
I want breadcrumbs, a nav menu, a menubar and pagination that already agree on tokens and a11y,
so that the navigation layer of a screen needs no bespoke styling.

## Acceptance criteria

- [x] `Breadcrumb` renders a `<nav aria-label="breadcrumb">`; `BreadcrumbPage` is
      `role="link" aria-disabled="true" aria-current="page"`, and the separator and ellipsis are
      `role="presentation" aria-hidden="true"`.
- [x] `NavigationMenu` supports both layouts through the `viewport` prop: the shared
      `NavigationMenuViewport` (default) or per-item popovers when `viewport={false}`, selected via
      `data-viewport` / `group-data-[viewport=false]`.
- [x] The nav viewport sits at `z-[var(--z-popover)]` and its content animates with
      `duration-[var(--duration-standard)] ease-[var(--ease-out)]` — no raw z-index or ms values.
- [x] `Menubar` ships the full menu surface — `MenubarMenu`, `Trigger`, `Content`, `Item`,
      `CheckboxItem`, `RadioGroup`/`RadioItem`, `Sub*`, `Separator`, `Shortcut`, `Label` — and also
      uses `--z-*` and `--duration-standard` tokens.
- [x] Pagination is layout-aware, not just a row of links: `PaginationContent` **is** an
      `EnhancedScrollArea` (`orientation="horizontal"`, `hideScrollbar`) and
      `PaginationContentProps` is derived from `EnhancedScrollAreaProps`, so a long page strip
      scrolls instead of wrapping.
- [x] `PaginationAdaptive` takes `page` / `totalPages` / `onPageChange` / `maxVisible`, recomputes
      how many numbers fit via `ResizeObserver` (floor of width / 32, minimum 3) and scrolls the
      active page into view (`start` / `center` / `end` depending on position).
- [x] `PaginationScroller` reads `PaginationContext` so the prev/next arrows know whether they can
      move; the arrows sit outside the scroll viewport.
- [x] Each surface has a doc page — `nqui-breadcrumb.md`, `nqui-navigation-menu.md`,
      `nqui-menubar.md`, `nqui-pagination.md` — and a row in `docs/components/README.md`'s
      navigation table.
- [ ] `docs/components/nqui-pagination.md` documents every export shipped from the main entry.

## Technical notes

- `PaginationAdaptive` and `PaginationScroller` are exported from `src/components/index.ts` but
  appear nowhere in `docs/components/nqui-pagination.md`, which still describes only the manual
  `Pagination` + `PaginationContent` + `PaginationItem` composition. Per §6 a doc page that
  disagrees with the shipped surface is a bug; the docs sweep that closes it is ST-056 (EP-007).
- `getVisiblePages` owns the ellipsis math so `PaginationAdaptive` stays declarative; the widened
  arrow classes come from the shared `paginationArrowClasses`.
- `PaginationAdaptive` pans the active number inside `PaginationContent`'s viewport (`scrollLeft`).
  Do not use `Element.scrollIntoView` — it moves ancestor page scrollers.
- Breadcrumb is intentionally the only one of the four with no z-index or motion surface — it is
  plain flow content and needs no elevation token.

## Bugs

- 2026-08-16 — `MenubarSubContent` used Radix `sideOffset`/`alignOffset` of 0, so
  the Share flyout overlapped the first panel. It now matches `DropdownMenu`
  (`6` / `-4`). `ContextMenuSubContent` got the same defaults (ST-015).
- 2026-08-16 — `PaginationAdaptive` used `scrollIntoView` to keep the active
  page in the number strip; that also scrolled ancestor page containers (catalog
  opened mid-page). Strip now pans via the ScrollArea viewport `scrollLeft` only.
- 2026-08-16 — Pagination strip used `gap-0` and mixed Button `outline` /
  `ghost` boxes, so hover/active collapsed the number rhythm and the
  circled ellipsis sat off the chrome ladder. Cells are now equal `size-7`
  with `gap-1`; ellipsis uses `IconMoreHorizontal`; focus is inset.

## Out of scope

- Sidebar navigation — ST-023.
- In-page section links — ST-028.
- Command palette / spotlight navigation — EP-002.
