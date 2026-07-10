# nqui Tabs

> Tabbed content. Sliding indicator. Enhanced.

## Import

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@nqlib/nqui"
```

For **pill tabs inside a scrollable page** (project cards, portfolio detail, guide pages):

```tsx
import {
  Tabs,
  TabsContent,
  InlineTabsList,
  InlineTabsTrigger,
  inlineTabsPanelsClass,
} from "@nqlib/nqui"
```

## Basic

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

## Controlled

```tsx
<Tabs value={value} onValueChange={setValue}>
  ...
</Tabs>
```

## Inline tabs in scrollable pages

> **Agent playbook:** `docs/nqui-skills/nqui-inline-tabs/SKILL.md` — when to use, structure, anti-patterns, verify checklist.

When tabs live inside a **page-level** scroller (`h-full overflow-y-auto`, expanded cards, guide pages), use **InlineTabs** — not raw `TabsList` / `TabsTrigger`. Radix focus-on-click scrolls the page; short panels shrink layout and clamp scroll.

| Piece | Purpose |
|-------|---------|
| `InlineTabsList` | Pill bar in horizontal **ScrollArea** (`hideScrollbar`); scroll with trackpad/drag |
| `InlineTabsTrigger` | Preserves page scroll + tab-bar viewport anchor |
| `inlineTabsPanelsClass` | `min-h-[28rem]` around all `TabsContent` when heights differ |

```tsx
<Tabs defaultValue="fields" className="w-full">
  <InlineTabsList className="m-3 mb-0">
    <InlineTabsTrigger value="fields">Fields</InlineTabsTrigger>
    <InlineTabsTrigger value="history">History</InlineTabsTrigger>
  </InlineTabsList>
  <div className={inlineTabsPanelsClass}>
    <TabsContent value="fields" className="m-0 p-4">…</TabsContent>
    <TabsContent value="history" className="m-0 p-4">…</TabsContent>
  </div>
</Tabs>
```

**Use InlineTabs when:** an ancestor has page-level `overflow-y-auto`.  
**Use plain Tabs when:** only the tab body scrolls (e.g. `flex-1 overflow-y-auto` under a fixed tab bar).

Do not reimplement scroll preservation in app code — use these exports from `@nqlib/nqui`.

## Customizing the tab UI

Override in increasing order of effort:

1. **Built-in variant** — `<TabsList variant="line">` swaps the pill capsule for
   underline tabs (no code).

2. **`className` on any part** — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
   all accept `className`, merged last via `tailwind-merge`, so your class wins.

3. **Reshape the pill** — the sliding pill's corner radius is driven by the
   `--tabs-pill-radius` CSS var (default: full pill). Override it on `TabsList`
   and the shell, triggers, and pill all reshape together:

   ```tsx
   {/* softer, rounded tabs instead of full pill */}
   <TabsList className="[--tabs-pill-radius:var(--radius-lg)]">…</TabsList>
   ```

   Or target the pill directly anywhere via `[data-slot="tabs-pill"]`
   (`[data-slot="tabs-list"]`, `[data-slot="tabs-trigger"]`, and
   `[data-slot="tabs-content"]` are also exposed for app-wide theming).

4. **Own it** — nqui is MIT; copy `tabs.tsx` into your project. `tabsListVariants`
   is exported so you can extend the variant set.

> The sliding `RadioGroup` (`variant="sliding"`) mirrors this: override
> `--radio-pill-radius` on the group, or target `[data-slot="radio-group-pill"]`.

## Notes

- **Sliding indicator:** Handled on `TabsList` (position relative).
- **Responsive:** `InlineTabsList` scrolls horizontally via nqui **ScrollArea** (hidden thumb); swipe or trackpad when labels overflow.
- **Resize:** Indicator recalculates on window resize (built-in).
