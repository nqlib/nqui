---
id: ST-019
epic: EP-002
title: Data display and feedback set
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/components/ui, src/components/custom/tracker.tsx, src/components/index.ts, docs]
api: docs/components/nqui-table.md
---

# ST-019 — Data display and feedback set

As an app author showing state and structured content,
I want tables, disclosure, progress and status components from the main entry,
so that a dashboard or settings page composes without reaching outside nqui.

## Acceptance criteria

- [x] Tabular display ships from `src/components/index.ts`: `Table`, `TableHeader`, `TableBody`,
      `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`, each with a `Core*`
      alias pointing at the same `src/components/ui/table.tsx`.
- [x] Disclosure ships: `Accordion` / `AccordionItem` / `AccordionTrigger` / `AccordionContent`,
      and `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent`.
- [x] Feedback ships: `Alert` / `AlertTitle` / `AlertDescription` / `AlertAction`,
      `Progress` (`EnhancedProgress`, block-segmented) with `ProgressProps` and `CoreProgress`.
- [x] Status visualisation ships: `Tracker` with `TrackerProps` / `TrackerBlockProps`, taking
      `data: TrackerBlockProps[]` plus `defaultBackgroundColor` (`"bg-muted"`) and
      `hoverEffect` (`false`).
- [x] Paging controls ship: `Pagination` with `PaginationContent`, `PaginationEllipsis`,
      `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious`,
      `PaginationScroller`, `PaginationAdaptive`, and `PaginationContentProps`.
- [x] `Tabs` ships as `EnhancedTabs as Tabs` (sliding indicator) with `CoreTabs*` mirror, plus the
      `InlineTabsList` / `InlineTabsTrigger` variants and their class helpers.
- [x] Nothing in this set requires an optional peer.
- [x] Doc pages exist: `nqui-table.md`, `nqui-accordion.md`, `nqui-collapsible.md`,
      `nqui-alert.md`, `nqui-progress.md`, `nqui-tracker.md`, `nqui-pagination.md`,
      `nqui-tabs.md`, `nqui-carousel.md`.
- [ ] `Carousel` is available from this set.

## Technical notes

- **Carousel is not in this set.** The epic scope lists it under data display, but Carousel was
  moved to the `./carousel` subpath (`exports["./carousel"]`, `src/entries/carousel.ts`) to keep
  `embla-carousel-react` — an optional peer — out of the main entry. Treat the epic row as the
  stale side; the packaging decision is owned by EP-005.
- `Table` here is the shadcn *presentational* primitive (`src/components/ui/table.tsx`). The
  headless TanStack `DataTable` and its own `Table` shell live in `src/components/table/` and are a
  separate, unshipped surface — ST-020.
- `Progress` is the one member of this set with a real Enhanced/Core split: `EnhancedProgress`
  renders discrete blocks rather than a continuous bar, so `CoreProgress` remains for the plain
  Radix bar.
- `Tracker` blocks accept per-block colours; `defaultBackgroundColor` only fills blocks that omit
  one.

## Bugs

- 2026-08-13 — Pagination arrows, Carousel prev/next, and enhanced Progress tracks use `rounded-md`
  instead of `rounded-full`.

## Out of scope

- `DataTable` / TanStack Table — ST-020.
- `Carousel` — `./carousel` subpath, packaging owned by EP-005.
- Charts and data grids — `@nqlib/nqchart` / `nqdg`, not this package.
