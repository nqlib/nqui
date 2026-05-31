---
name: nqui-components
description: Component implementation for nqui. Use when building UI with @nqlib/nqui, choosing components, or implementing a specific component. Always read from docs path before implementing.
---

# nqui Components

**When to load:** User asks about nqui components, which component to use, how to implement X, or builds UI with nqui.

**Action:** Read from the docs path before implementing. Do not guess – the docs have exact import, props, and examples.

## Prefer local copy (after `npx @nqlib/nqui init-skills`)

Token-efficient order:

1. `.cursor/nqui-skills/HUMAN_GUIDE.md` — task → docs (forms, toolbar, empty state, …)
2. `.cursor/nqui-skills/COMPONENTS_INDEX.md` — which single `nqui-*.md` to open
3. `.cursor/nqui-skills/components/nqui-<kebab>.md` — **one** component at a time
4. `.cursor/nqui-skills/components/README.md` — full index (large; use sections only)

## Fallback (npm only, or before init-skills)

```
node_modules/@nqlib/nqui/docs/components/
```

## File resolution

| User asks | File to read |
|-----------|--------------|
| Which doc file for component X | `.cursor/nqui-skills/COMPONENTS_INDEX.md` (after init-skills) or `node_modules/@nqlib/nqui/docs/components/` + `nqui-<kebab>.md` |
| Component index, use cases, which component for X | `README.md` in the paths above (skim sections) |
| How to use Button | `nqui-button.md` (same folder) |
| How to use ToggleGroup | `nqui-toggle-group.md` |
| Any component X | `nqui-<kebab-name>.md` (e.g. nqui-data-table.md) |

**Rule:** Open **one** per-component doc unless you need cross-component context. For any component question, read the doc first — import, variants, props, and examples.

## Quick rules (details in README.md)

- **Toolbar/inline selection** → ToggleGroup (never RadioGroup)
- **Form context** → RadioGroup, Checkbox
- **Actions** → Button, ButtonGroup
- **Context-first:** Place controls in realistic layout (toolbar, chart settings), not floating alone

## Import

```tsx
import { Button, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui"
```

CSS: `@import "@nqlib/nqui/styles"` in main CSS (run `npx @nqlib/nqui init-css` first).
