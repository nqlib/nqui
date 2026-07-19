---
id: ST-006
epic: EP-001
title: Hit-area utilities
status: done
priority: should
release: pre-baseline
breaking: false
scope: [src/styles/hit-area.css, src/index.css, src/components, docs]
api: src/styles/hit-area.css
---

# ST-006 — Hit-area utilities

As an app author placing small controls (checkbox, switch, toggle item) in dense UI,
I want a utility that expands the pointer target without changing layout,
so that touch targets are comfortable while the visual size stays compact.

## Acceptance criteria

- [x] `src/styles/hit-area.css` defines `@utility hit-area` — a `::before` pseudo-element that
      inherits `pointer-events` and is inset by `--hit-area-t/-r/-b/-l` (default `0px`).
- [x] Directional and axis variants exist: `hit-area-*`, `hit-area-t-*`, `hit-area-r-*`,
      `hit-area-b-*`, `hit-area-l-*`, `hit-area-x-*`, `hit-area-y-*`.
- [x] Each variant accepts both a spacing-scale number and an arbitrary value, negating it so the
      pseudo-element overhangs the element rather than insetting it
      (`--spacing(--value(number) * -1)` with a `calc(--value([*]) * -1)` fallback).
- [x] `hit-area-debug` renders the expanded region visibly (dashed blue outline, green on hover)
      for development.
- [x] The commonly used classes are safelisted for consumer builds in `src/index.css`:
      `hit-area-2 hit-area-4 hit-area-6 hit-area-debug`.
- [x] The utility is documented where consumers read it — `docs/components/nqui-checkbox.md`,
      `docs/components/nqui-switch.md`, `docs/components/nqui-toggle-group.md`, and
      `docs/nqui-skills/nqui-components/SKILL.md`.

## Technical notes

- Source: the Bazza hit-area technique (credited in the file header).
- The overhang is real geometry, not just pointer capture — it counts as scrollable content
  inside a container with an `auto` overflow axis. That interaction caused a real defect in
  ToggleGroup, fixed in 0.7.3 by pinning both axes explicitly; the fix is recorded under the
  ToggleGroup story, not here, because the utility behaved as specified.
- Only `hit-area-{2,4,6}` and the debug class are safelisted. A consumer using an unlisted step
  in a file Tailwind does not scan will not get the utility generated.

## Out of scope

- Deciding which components opt into an expanded hit area.
- Any minimum-target-size audit or enforcement.
