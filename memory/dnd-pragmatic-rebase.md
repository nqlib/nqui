---
name: dnd-pragmatic-rebase
description: Why nqui's general-purpose drag-and-drop moved to Atlassian Pragmatic DnD behind a new ./dnd subpath, and what the old ./sortable is
type: decision
created: 2026-07-19
---

A 3-specialist audit (2026-07-19) found the dnd-kit `Sortable` (`src/components/ui/sortable.tsx`) was
a single-list reorder widget, not a DnD foundation. The general-purpose layer was rebuilt on
**Atlassian Pragmatic drag-and-drop** behind a new `@nqlib/nqui/dnd` subpath (`src/components/dnd/`);
the old `./sortable` (dnd-kit) keeps shipping untouched so 0.7.x consumers aren't broken.

**Why:** Pragmatic is framework-agnostic, ~5.5 KB gzip with atlaskit externalized as optional peers,
and models drop targets/monitors as primitives instead of one list widget.

**How to apply:** new drag work goes in `src/components/dnd/` behind `./dnd`; don't extend
`./sortable`. Retiring dnd-kit is a separate migration, not a side effect of a feature.

Scope, phases and open questions live in the epic —
`docs/product/epics/EP-004-drag-and-drop/` (ST-034 keyboard a11y, ST-035 Canvas, ST-036 the dnd-kit
retirement) — with the build record in `internal-notes/dnd-rebase-handoff.md`. See [[pnpm-only]].
