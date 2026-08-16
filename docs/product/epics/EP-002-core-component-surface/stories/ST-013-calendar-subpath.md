---
id: ST-013
epic: EP-002
title: Calendar behind ./calendar
status: done
priority: should
release: 0.7.0
breaking: true
scope: [src/entries/calendar.ts, src/components/custom/enhanced-calendar.tsx, package.json, docs]
api: docs/components/nqui-calendar.md
---

# ST-013 — Calendar behind `./calendar`

As an app author who never renders a date picker,
I want Calendar to live on its own subpath,
so that `react-day-picker` and `date-fns` are not installed or bundled for my app.

## Acceptance criteria

- [x] `src/entries/calendar.ts` exports `EnhancedCalendar as Calendar`,
      `EnhancedCalendarProps as CalendarProps`, `Calendar as CoreCalendar`, and `CalendarDayButton`.
- [x] `package.json` `exports["./calendar"]` maps types / import / require to
      `dist/entries/calendar.d.ts`, `dist/calendar.es.js`, `dist/calendar.cjs.js`.
- [x] Calendar is **not** re-exported from `src/components/index.ts`; the barrel carries only a
      comment pointing at the subpath.
- [x] `react-day-picker` and `date-fns` are declared in `peerDependencies` and both are marked
      `"optional": true` in `peerDependenciesMeta`.
- [x] `EnhancedCalendarProps` is `React.ComponentProps<typeof DayPicker>` plus
      `touchDragEnabled?: boolean`, so every DayPicker prop stays available.
- [x] `touchDragEnabled` only applies when `mode="range"`; hover preview for range selection is
      enabled on non-touch pointers without opting in.
- [x] CHANGELOG 0.7.0 lists the root-import break with the before/after import line.
- [ ] `docs/components/nqui-calendar.md` shows the subpath import.

## Technical notes

- The doc page still opens with `import { Calendar } from "@nqlib/nqui"` and never mentions
  `@nqlib/nqui/calendar`. That contradicts the shipped surface and is a §6 violation — the page
  must be corrected, not the export. Same defect class as ST-015/ST-016/ST-017 doc pages.
- The subpath predates 0.7.0; 0.7.0 is the release that *removed* the root re-export, which is what
  makes this story breaking.
- `breaking: true` — migration is one line: `from "@nqlib/nqui"` → `from "@nqlib/nqui/calendar"`.

## Breaking changes

| Before | After |
|---|---|
| `import { Calendar } from "@nqlib/nqui"` | `import { Calendar } from "@nqlib/nqui/calendar"` |

CHANGELOG migration line: *Calendar now imports from `@nqlib/nqui/calendar`; install
`react-day-picker` and `date-fns` only if you use it.*

## Bugs

- 2026-08-13 — Day cells and range caps use `--cell-radius` (`rounded-md`) instead of a full circle.
- 2026-08-15 — Drag a completed range's start/end to resize; click-without-move still resets.

## Out of scope

- The build config that emits the entry and the publish verification of `exports` — EP-005.
- Date range pickers, presets, or a `DatePicker` wrapper — not shipped.
