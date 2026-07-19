---
id: ST-015
epic: EP-002
title: Overlay set — dialog, sheet, popover, menus, tooltip
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/components/ui, src/components/custom/enhanced-dropdown-menu.tsx, src/lib/floating-surface.ts, docs]
api: docs/components/nqui-dialog.md
---

# ST-015 — Overlay set — dialog, sheet, popover, menus, tooltip

As an app author,
I want every floating layer — modals, panels, popovers and menus — from the main entry with one
shared surface treatment,
so that overlays in the same app don't disagree about elevation, blur or radius.

## Acceptance criteria

- [x] Modal overlays ship from `src/components/index.ts`: `Dialog` (10 parts incl. `DialogOverlay`,
      `DialogPortal`), `AlertDialog` (9 parts incl. `AlertDialogAction` / `AlertDialogCancel`), and
      `Sheet` (10 parts incl. `SheetOverlay`, `SheetPortal`).
- [x] Non-modal overlays ship: `Popover` / `PopoverAnchor` / `PopoverContent` / `PopoverTrigger`,
      `HoverCard` / `HoverCardTrigger` / `HoverCardContent`, and `Tooltip` / `TooltipTrigger` /
      `TooltipContent` / `TooltipProvider`.
- [x] Menus ship: `DropdownMenu` (15 parts) from `custom/enhanced-dropdown-menu` with a full
      `CoreDropdownMenu*` mirror from `ui/dropdown-menu`; `ContextMenu` (15 parts); `Menubar`
      (16 parts).
- [x] Floating panels share one surface definition — `src/lib/floating-surface.ts` is consumed by
      `popover.tsx`, `hover-card.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `menubar.tsx`,
      `select.tsx`, `navigation-menu.tsx`, `command.tsx` and `combobox.tsx`.
- [x] The whole set resolves to `radix-ui` / `@radix-ui/react-dialog` /
      `@radix-ui/react-dropdown-menu` / `@radix-ui/react-context-menu` /
      `@radix-ui/react-tooltip`, all direct `dependencies` — no optional peer.
- [x] `DropdownMenu` is the only overlay with an `Enhanced` version (button-like 3D trigger
      treatment); the rest are exported under their plain names per ST-009.
- [x] Doc pages exist: `nqui-dialog.md`, `nqui-alert-dialog.md`, `nqui-sheet.md`,
      `nqui-popover.md`, `nqui-hover-card.md`, `nqui-tooltip.md`, `nqui-dropdown-menu.md`,
      `nqui-context-menu.md`, `nqui-menubar.md`.

## Technical notes

- Modal overlays (`Dialog`, `AlertDialog`, `Sheet`) intentionally do **not** use
  `floating-surface`: they paint a full-bleed scrim + panel, not a small floating card, so their
  elevation comes from the ST-002 2+1 model directly.
- `Sheet` and the `./drawer` subpath (ST-016) overlap by design: `Sheet` is the Radix, peer-free
  edge panel; `Drawer` is the vaul gesture-driven one. Only `Sheet` is in the main bundle.
- Menu z-order and stacking rely on the ST-004 z-index scale — overlays must not set ad-hoc
  `z-*` classes.

## Out of scope

- `Drawer` — ST-016 (vaul, subpath).
- `Command` / `CommandDialog` / `CommandPalette` — ST-017 (cmdk, subpath).
- `Toaster` — ST-018 (sonner, subpath).
- `NavigationMenu`, `Sidebar` — navigation shells, EP-003.
