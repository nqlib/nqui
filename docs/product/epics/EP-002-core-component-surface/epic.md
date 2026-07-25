---
id: EP-002
title: Core component surface
status: in-progress
owner: maintainer
---

# EP-002 — Core component surface

## Goal

The components an app author reaches for on any screen — actions, form controls, overlays, feedback
and data display — shipped from the main entry with one predictable convention: nqui's opinionated
version is the public name, the raw shadcn primitive stays available underneath.

## Success metrics

- `import { X } from '@nqlib/nqui'` gets the enhanced component; `CoreX` is there when a consumer
  needs the unopinionated one.
- Every exported component from the main entry has a `docs/components/nqui-<name>.md` page whose
  props match the source.
- Heavy or rarely-used components sit behind their own subpath, not in the main bundle (mechanics
  owned by EP-005).

## Scope — In

- Primitives & actions: Button, ButtonGroup, Badge, Toggle, Kbd, Spinner, Skeleton, Separator,
  Avatar, AspectRatio, Item, Empty.
- Form controls: Input, Textarea, InputGroup, InputOTP, Label, Field, Checkbox, RadioGroup, Switch,
  Slider, Select, NativeSelect, Combobox, ColorPicker, ColorSlider, Rating.
- Calendar (`./calendar` subpath).
- Overlays: Dialog, AlertDialog, Sheet, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu, and
  the `./drawer`, `./command`, `./sonner` subpaths.
- Data display & feedback: Table, DataTable, Accordion, Collapsible, Alert, Progress, Tracker, and
  Carousel behind the `./carousel` subpath (not the main entry).
- The icon set (`createIcon` + `Icon*`).
- The `Enhanced*` → public name / `Core*` aliasing convention itself.

## Scope — Out (explicit)

- Layout, scroll and navigation shells → EP-003.
- Drag and drop → EP-004.
- The empty `src/components/ui/shadcn-io/*` (code-block, code-editor, sandbox, snippet) and
  `src/components/blocks/*` — removed capability; only their stale doc pages remain (ST-061).
- Chart and data-grid blocks — they live in `@nqlib/nqchart` / `nqdg`, not here.

## Dependencies

- EP-001 (tokens) — every component styles from it.
- EP-005 (packaging) — owns which of these components get a subpath.

## Public API surface

`src/index.ts` → `src/components/index.ts`; the `./calendar`, `./command`, `./drawer`, `./sonner`
subpaths; `docs/components/nqui-*.md`.

## Stories

| ID | Title | Status | Release |
|---|---|---|---|
| ST-009 | Enhanced / Core aliasing convention | done | pre-baseline |
| ST-010 | Action and content primitives | done | pre-baseline |
| ST-011 | Form control set | done | pre-baseline |
| ST-012 | Combobox with single and multi select | done | 0.7.1 |
| ST-013 | Calendar behind `./calendar` | done | 0.7.0 |
| ST-014 | Color picker, color slider and rating | done | pre-baseline |
| ST-015 | Overlay set — dialog, sheet, popover, menus, tooltip | done | pre-baseline |
| ST-016 | Drawer behind `./drawer` | done | 0.7.0 |
| ST-017 | Command palette behind `./command` | done | 0.7.0 |
| ST-018 | Toaster behind `./sonner` | done | 0.7.0 |
| ST-019 | Data display and feedback set | done | pre-baseline |
| ST-020 | DataTable on TanStack Table | in-progress | unset |
| ST-021 | Bundled icon set | in-progress | pre-baseline |
| ST-064 | Command search-result density, list chrome, ScrollArea | done | 0.7.4 |

## Implementation references

- Release 0.7.1 (`ff351e6`) — Combobox multi-select double-click fix (ST-012).
- Release 0.6.3 (`9f93dab`) — bundled SVG icons replacing an icon dependency (ST-021).
