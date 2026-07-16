---
name: nqui
description: >-
  Integrate @nqlib/nqui in external React apps — install, CSS, component selection,
  design system, composition patterns. NOT for contributing to the nqui repository.
license: MIT
compatibility: React 18+, Tailwind CSS v4, Node 20+
metadata:
  author: nqlib
  version: "1.0.0"
---

# nqui

React component library with Tailwind v4, Radix primitives, and LLM-native docs. **For external app integration only.**

## Read order

| Step | File | When |
|------|------|------|
| 1 | `nqui-install/SKILL.md` | Install, peers, CSS, init-skills |
| 2 | `HUMAN_GUIDE.md` | Task → which component doc |
| 3 | `COMPONENTS_INDEX.md` | Pick one `nqui-<name>.md` |
| 4 | `components/nqui-<name>.md` | Props, imports, examples |
| 5 | `nqui-design-system/SKILL.md` | Tokens, spacing, scroll contracts |
| 6 | `COMPOSITION.md` | Layout patterns before new views |

After `npx @nqlib/nqui init-skills`, paths resolve under `.cursor/nqui-skills/`.
Before init, use `node_modules/@nqlib/nqui/docs/components/`.

## Success gates

| Gate | Check |
|------|-------|
| Installed | `@nqlib/nqui` in package.json; peers if using optional features |
| CSS | `@import "@nqlib/nqui/styles"` in main CSS (`init-css` ran) |
| Skills | `.cursor/nqui-skills/SKILL.md` exists (or read from node_modules) |
| API | Read component doc before implementing — no guessing props |
| Renders | Component visible in target environment (Next/Vite/etc.) |

## Workflow

```
Install nqui → init-css → init-skills → pick component doc → implement → verify states
```

**Building a new view?** Follow Agent Build Protocol in the full hub (`docs/nqui-skills/SKILL.md`):

1. Design context (`.impeccable.md` or `/impeccable teach`)
2. One job, one primary action
3. Pick layout pattern (`COMPOSITION.md`)
4. Look up recipes (`RECIPES.md`)
5. Select components (`HUMAN_GUIDE.md` → one `nqui-*.md`)
6. Cover all states (`STATES.md`)
7. Write proper copy (`WRITING.md`)

## Non-negotiables

- **Toolbar selection** → `ToggleGroup`, never `RadioGroup`
- **Form context** → `RadioGroup`, `Checkbox`
- **Don't restyle a component's own layout** — reach for its props, not `className`. Components already own their row/gap/overflow; overriding fights them (see anti-patterns)
- **Read before code** — open the component doc; don't infer props
- **One doc at a time** — don't bulk-read the skills folder
- **CSS required** — styles won't load without `@import "@nqlib/nqui/styles"`

## Minimal sample

```tsx
import { Button, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui"
```

```css
/* main CSS — after npx @nqlib/nqui init-css */
@import "@nqlib/nqui/styles";
```

## Sub-skills

| Skill | Purpose |
|-------|---------|
| `nqui-install` | CLI commands — execute in consumer project root |
| `nqui-components` | Component selection and implementation |
| `nqui-design-system` | Tokens, Card + ScrollArea contracts |
| `nqui-shadcn` | shadcn composition, forms, icons |
| `nqui-composition` | Screen-level craft and layout patterns |
| `nqui-data-tables` | TanStack tables + bounded scroll |
| `nqui-bundle-size-best-practices` | Deps and bundle size |
| `impeccable` + `/audit`, `/polish`, … | Design quality commands |

## Anti-patterns

- Using maintainer skills (`nqui-dev`, `nqui-docs`) in consumer apps
- `RadioGroup` for toolbar/view-mode toggles
- `flex-wrap` or `gap-*` on `<ToggleGroup>` — it's one row that scrolls horizontally, and `spacing={0}` needs items flush. Wrapping breaks the pill and makes it draggable out of alignment; a gap leaves a sliver beside the active item. Use the `spacing` prop → `components/nqui-toggle-group.md`
- Multiple competing primary buttons on one surface
- Skipping empty/loading/error states
- Generic copy: "Submit", "An error occurred", "Are you sure?"
- Bulk-reading all skill files instead of routing via `HUMAN_GUIDE.md`

## References

Full skill bundle (sub-skills, composition guides, impeccable): `docs/nqui-skills/` in npm package or `.cursor/nqui-skills/` after init.

Component API: `docs/components/` or `.cursor/nqui-skills/components/`.
