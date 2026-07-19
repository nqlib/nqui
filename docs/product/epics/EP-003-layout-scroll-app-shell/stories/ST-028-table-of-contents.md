---
id: ST-028
epic: EP-003
title: Table of contents
status: done
priority: should
release: pre-baseline
breaking: false
scope: [src/components/custom/table-of-contents.tsx, src/hooks/use-scroll-spy.ts, docs]
api: docs/components/nqui-table-of-contents.md
---

# ST-028 — Table of contents

As an app author building a docs or guide page,
I want an "on this page" rail that finds the headings itself and follows the reader,
so that in-page navigation is a component, not an IntersectionObserver project.

## Acceptance criteria

- [x] `TableOfContents` accepts either a manual `items: TOCItem[]` tree (`id`, `label`, `level`,
      `children`) or `autoDetect` with a `headingSelector` (default `"h1, h2, h3, h4, h5, h6"`);
      manual items win when both are present.
- [x] Both `container` (heading-detection scope) and `scrollContainer` (the element actually
      scrolled) accept an element, a ref or a selector string, and `scrollContainer` falls back to
      `container` — so a TOC works for a page scroller and for a bounded panel.
- [x] Scroll spy is opt-out (`enableScrollSpy`, default true) and runs on `useScrollSpy`
      (`IntersectionObserver`, `rootMargin: "-100px 0px -66%"`), exposing both `activeId` and
      `visibleIds` so multiple in-view sections can be highlighted.
- [x] The component can be driven instead of observed: passing `activeId` takes over from the scroll
      spy, and `onActiveChange` reports transitions.
- [x] Clicking an item scrolls the resolved container (or the window) accounting for
      `scrollOffset`, with `behavior` following `smoothScroll` (default true).
- [x] Three `variant`s ship — `normal` (left border + animated thumb), `circuit`, `clerk` — each
      with a thumb/indicator measured from the live item positions rather than a fixed step.
- [x] `title` defaults to `"On this page"` and the root spreads `React.HTMLAttributes<HTMLDivElement>`,
      so the rail can be positioned by the consumer.
- [x] `TableOfContents`, `TOCItem` and `TableOfContentsProps` are exported from the main entry, and
      `docs/components/nqui-table-of-contents.md` covers auto-detect, manual items and the
      variants, plus the "headings need an `id`" requirement.
- [ ] The doc page documents `scrollContainer`, `scrollOffset`, `smoothScroll`, `activeId` and
      `onActiveChange`.

## Technical notes

- The doc page currently documents `items`, `autoDetect`, `headingSelector`, `container`,
  `enableScrollSpy`, `title` and `variant` only. The remaining props above are shipped and typed but
  undocumented — the docs sweep is ST-056 (EP-007).
- Splitting `container` from `scrollContainer` is deliberate: in a bounded app shell the headings
  often live in an inner wrapper while the scrollport is an ancestor ScrollArea viewport, and the
  scroll spy must observe the latter to compute positions correctly.
- The file is large (~1.4k lines) because each variant draws its own connector geometry; there is no
  unit coverage for the spy or the thumb math — see ST-054 (EP-006).

## Out of scope

- Documenting `useScrollSpy` itself (exported from `src/hooks/index.ts`) — hooks surface, EP-002.
- Docs-site page layout that hosts the rail — sibling nqui-showcase.
