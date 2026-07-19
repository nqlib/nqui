---
id: ST-023
epic: EP-003
title: Sidebar application shell
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/components/ui/sidebar.tsx, src/lib/keyboard.ts, docs, skills]
api: docs/components/nqui-sidebar.md
---

# ST-023 — Sidebar application shell

As an app author building an application shell,
I want a sidebar that collapses, remembers its state and swaps to a sheet on mobile,
so that I compose a navigation layout from exports instead of hand-rolling fixed positioning.

## Acceptance criteria

- [x] `SidebarProvider` owns the state: controlled (`open` / `onOpenChange`) or uncontrolled, and
      exposes `state`, `open`, `setOpen`, `isMobile`, `openMobile`, `setOpenMobile`,
      `toggleSidebar` through `useSidebar()`, which throws outside a provider.
- [x] Open/closed state persists across reloads through the `sidebar_state` cookie
      (`SIDEBAR_COOKIE_MAX_AGE` = 7 days).
- [x] Mod+B toggles the sidebar, wired through `SHORTCUT_KEYS.sidebarToggle` (`"b"`) and `isMod`
      from `src/lib/keyboard.ts` rather than a hard-coded key check.
- [x] `Sidebar` accepts `side: "left" | "right"`, `variant: "sidebar" | "floating" | "inset"` and
      `collapsible: "offcanvas" | "icon" | "none"`, and reflects them as `data-side`,
      `data-variant`, `data-collapsible`, `data-state` for descendant styling.
- [x] Widths are tokens on the provider, not literals in the tree: `--sidebar-width` (`22rem`),
      `--sidebar-width-icon` (`3rem`), and `18rem` for the mobile sheet.
- [x] Below the mobile breakpoint (`useIsMobile`) the sidebar renders as a `Sheet` with an
      `sr-only` `SheetHeader` / `SheetTitle` / `SheetDescription` so the dialog stays labelled.
- [x] The desktop sidebar sits at `z-[var(--z-floating)]` and animates width/offset with
      `duration-[var(--duration-standard)] ease-[var(--ease-linear)]` — no raw z-index or ms value.
- [x] The shell parts ship together from the main entry: `SidebarInset`, `SidebarTrigger`,
      `SidebarRail`, `SidebarHeader` / `Footer` / `Content` / `Separator` / `Input`, the
      `SidebarGroup*` family and the `SidebarMenu*` family including `SidebarMenuSkeleton`.
- [x] `docs/components/nqui-sidebar.md` shows the full `SidebarProvider` → `Sidebar` →
      `SidebarInset` layout and states the critical rule: the provider wraps the whole layout, not
      just the sidebar.

## Technical notes

- `SidebarInset` is a `<main>` that reacts to the peer sidebar's `data-variant=inset` /
  `data-state=collapsed` — which is why the provider has to wrap both columns; wrapping only the
  sidebar silently disables the inset margins and the rail.
- `collapsible="none"` skips the fixed/gap machinery entirely and renders a plain flex column, so a
  sidebar embedded in an already-bounded panel does not fight the page shell.
- The Card/ScrollArea `min-h-0` contract (ST-022) applies to sidebar columns too; the shared rule is
  documented in `docs/nqui-skills/nqui-design-system/SKILL.md`.

## Out of scope

- The `Sheet` overlay primitive itself — EP-002.
- Consumer-side nav data, active-route matching and user menus — app concerns, demonstrated in
  sibling nqui-showcase only.
