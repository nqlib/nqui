---
id: ST-021
epic: EP-002
title: Bundled icon set
status: in-progress
priority: should
release: pre-baseline
breaking: false
scope: [src/components/icons, src/components/index.ts, docs]
api: docs/components/README.md
---

# ST-021 — Bundled icon set

As an app author installing `@nqlib/nqui`,
I want the icons the components need to ship inside the package,
so that adding a button or a select doesn't drag in an icon library as a dependency.

## Acceptance criteria

- [x] `src/components/icons/icon.tsx` exports `createIcon(displayName, children, options?)` and the
      `IconProps` type (`React.SVGProps<SVGSVGElement>` plus `size?: number | string` and
      `strokeWidth?: number | string`).
- [x] Icons render a consistent SVG: `viewBox="0 0 24 24"`, `fill="none"`,
      `stroke="currentColor"`, round caps and joins, `strokeWidth` default `2`, size default `16`,
      `className` merged through `cn("shrink-0", …)`.
- [x] Icons are decorative by default — `aria-hidden` is set on the `<svg>`, overridable via props.
- [x] `src/components/icons/icons.tsx` defines 31 icons and `icons/index.ts` re-exports all of
      them: `IconAlert`, `IconCheck`, `IconCheckCircle`, `IconChevronDown`, `IconChevronLeft`,
      `IconChevronRight`, `IconChevronUp`, `IconChevronsLeft`, `IconChevronsRight`,
      `IconChevronsUpDown`, `IconCircle`, `IconCode`, `IconCopy`, `IconEye`, `IconFile`,
      `IconInfo`, `IconKeyboard`, `IconLayout`, `IconLoader`, `IconMinus`, `IconMoon`,
      `IconMoreHorizontal`, `IconMoreHorizontalCircle`, `IconPalette`, `IconPanelLeft`,
      `IconPlus`, `IconSearch`, `IconSettings`, `IconSun`, `IconX`, `IconXCircle`.
- [x] No icon package appears in `dependencies` or `peerDependencies`; `@hugeicons/*` remains only
      as a `devDependency`.
- [ ] The icon set is exported from `src/components/index.ts` (and therefore from `src/index.ts`).
- [ ] `docs/components/nqui-icons.md` exists and is listed in `docs/components/README.md`.

## Technical notes

- **Internal-only today.** `src/components/icons/index.ts` is not re-exported from
  `src/components/index.ts`, so `createIcon` and every `Icon*` are private to the library — the
  components consume them, consumers cannot. That is the reason this story is `in-progress`.
- There is also no `docs/components/nqui-*.md` page for icons and no row in
  `docs/components/README.md` (the only icon mentions there are incidental, e.g. the Button and
  InputGroup rows). Per §6 the doc page has to land in the same PR as the export.
- Closing this story is a deliberate surface decision, not a mechanical one: exporting 31 icons
  fixes the public name of every glyph and makes each rename breaking. Confirm the list before
  exporting, and confirm whether `createIcon` should be public at all — a public `createIcon` makes
  the SVG conventions above part of the contract.
- Shipped as the "bundled SVG icons replacing an icon dependency" change in 0.6.3 (`9f93dab`);
  the epic table's `pre-baseline` marker refers to that internal landing, not to a public export.

## Out of scope

- Growing the set beyond what nqui's own components need — apps bring their own icon library for
  product iconography.
- Icon sprites, dynamic loading or a tree-shaking strategy beyond per-component ES exports.
