---
id: ST-016
epic: EP-002
title: Drawer behind ./drawer
status: done
priority: should
release: 0.7.0
breaking: true
scope: [src/entries/drawer.ts, src/components/ui/drawer.tsx, package.json, docs]
api: docs/components/nqui-drawer.md
---

# ST-016 — Drawer behind `./drawer`

As an app author who uses `Sheet` for edge panels,
I want the vaul-based Drawer on its own subpath,
so that `vaul` is neither installed nor bundled unless I want the gesture-driven variant.

## Acceptance criteria

- [x] `src/entries/drawer.ts` exports the 10 parts: `Drawer`, `DrawerPortal`, `DrawerOverlay`,
      `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`,
      `DrawerTitle`, `DrawerDescription`.
- [x] `package.json` `exports["./drawer"]` maps types / import / require to
      `dist/entries/drawer.d.ts`, `dist/drawer.es.js`, `dist/drawer.cjs.js`.
- [x] Drawer is **not** re-exported from `src/components/index.ts`; only a pointer comment remains.
- [x] `vaul` is declared in `peerDependencies` and marked `"optional": true` in
      `peerDependenciesMeta`.
- [x] `DrawerContent` renders an inset rounded card (`before:bg-card`, `before:inset-2`,
      `before:rounded-xl`) so the panel reads as a card on the scrim, not a full-bleed slab, and
      follows `--card` tokens in both themes.
- [x] CHANGELOG 0.7.0 lists the root-import break with the before/after import line.
- [ ] `docs/components/nqui-drawer.md` shows the subpath import.

## Technical notes

- The doc page's Import block still reads `from "@nqlib/nqui"` and the page never mentions
  `@nqlib/nqui/drawer`. Stale page, correct export — fix the page (§6).
- Drawer and `Sheet` (ST-015) are not an `Enhanced`/`Core` pair and must not be aliased into one:
  Sheet is peer-free and Radix-based; Drawer is vaul-based with drag-to-dismiss. The choice is a
  consumer decision, documented in the doc pages.
- The subpath file itself predates 0.7.0; 0.7.0 removed the root re-export, which is the breaking
  part.

## Breaking changes

| Before | After |
|---|---|
| `import { Drawer } from "@nqlib/nqui"` | `import { Drawer } from "@nqlib/nqui/drawer"` |

CHANGELOG migration line: *Drawer now imports from `@nqlib/nqui/drawer`; install `vaul` only if
you use it.*

## Out of scope

- Emitting the entry, verifying `exports`, and the peer-optionality mechanics — EP-005.
- Replacing Drawer with a Pragmatic-DnD gesture implementation — not planned; EP-004 owns DnD.
