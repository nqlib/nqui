---
name: nqui-design-system
description: Design system conventions for nqui component library. Use when creating or modifying nqui UI components (sizing, spacing, Card + ScrollArea flex scroll / min-h-0, grouped controls, density). Pair with nqui-data-tables for dashboard table shells.
---

# nqui Design System

Guidelines for AI agents and developers implementing or modifying nqui components. Follow these rules to maintain visual consistency.

## Elevation — 2 inline surfaces + 1 elevated (mandatory)

nqui uses a **hybrid elevation model**: 2 alternating inline surface tokens + 1 elevated surface for overlays. Spacing and type weight carry hierarchy beyond 2 surfaces. Full philosophy + decision tree in `../ELEVATION.md`.

| Token | Tailwind | When |
|-------|----------|------|
| `surface-a` | `bg-background` | Page, alternates with B |
| `surface-b` | `bg-muted/40` | Card/panel/distinct topic region |
| `surface-elevated` | `bg-popover` + `.nqui-float` / `--shadow-float` (modals: `--shadow-modal`) | Modals, sheets, popovers (the only legitimate third surface) |

**Hard cap: 2 nested inline surfaces.** If you reach for a third shade, use spacing (`gap-6` between sections) + an uppercase label (`text-xs uppercase tracking-wider`) instead. A third nested surface is almost always a symptom of weak composition.

## Control Size Scale

All interactive controls (buttons, toggles, inputs, selects) use a unified scale:

| Size | Height | Min Width | Use Case |
|------|--------|-----------|----------|
| `sm` | h-6 (24px) | min-w-6 | Compact UIs, dense tables, toolbars |
| `default` | h-7 (28px) | min-w-7 | Standard forms, primary actions |
| `lg` | h-8 (32px) | min-w-8 | Emphasis, secondary actions |

### Semantic Rule

`size="sm"` on Button MUST produce the same height as `size="sm"` on ToggleGroupItem, SegmentedControlItem, SelectTrigger, etc. Never introduce component-specific scales.

## Layout Heights

| Element | Height | Use Case |
|---------|--------|----------|
| Header | h-12 (48px) | Page header, app bar, sticky nav |
| Sidebar header | h-12 (48px) | Sidebar section title bar |

Fits 4px/8px grid. Default button (h-7) in 48px header leaves 10px top/bottom; h-8 leaves 8px. Use px-4, gap-2 or gap-4 for horizontal spacing.

## Component Size Mapping

| Component | sm | default | lg |
|-----------|-----|---------|-----|
| Button | h-6 min-w-6 px-2 text-xs | h-7 min-w-7 px-3 | h-8 min-w-8 px-4 |
| Button (icon) | — | h-7 w-7 p-0 | — |
| Toggle | h-6 min-w-6 px-1.5 | h-7 min-w-7 px-2 | h-8 min-w-8 px-2 |
| ToggleGroupItem | (uses Toggle) | | |
| SelectTrigger | h-6 | h-7 | — |
| Input | — | h-7 px-3 py-1.5 text-sm | — |
| InputGroup | — | h-7 | — |

## Border Radius

One `--radius` (`0.75rem` Soft). Every `rounded-*` utility derives from it. Changing the base rounds the kit together — chrome, Card, and Dialog included.

They use **different rungs**, not different languages. A control sits on a panel; a panel sits inside an overlay. Matching the same pixel radius on nested shells makes the inner corner look sharper than the outer (non-concentric). The 2px / 4px steps are that inset, same idea as Tabs `inner = outer − 3px`.

| Role | Class | Token | Soft | Why this rung |
|------|-------|-------|------|----------------|
| Compact chips | `rounded-xs` | `--radius-xs` capped at 6px | 6px | Short side ≤ 20px; `md` would stadium |
| Dense controls | `rounded-sm` | `--radius − 4px` | 8px | Taller than a chip, tighter than chrome |
| **Chrome** | `rounded-md` | `--radius − 2px` | ~10px | Button, Input, ButtonGroup, Tabs — sits *on* a panel |
| **Panels** | `rounded-lg` | `var(--radius)` | 12px | Card, Alert, popover — the default surface |
| **Overlays** | `rounded-xl` | `--radius + 4px` | 16px | Dialog, Sheet, Drawer — wraps padded panel-scale content |

Do not collapse Card or Dialog to `rounded-md` to “match ButtonGroup”. Do not promote a Button to `rounded-lg` to “match Card”.

### Must stay separate (geometry / control nature)

These are not chrome/panel/overlay. Do not put them on that ladder to unify corners.

| Kind | Class | Examples |
|------|-------|----------|
| **Circle** | `rounded-full` | Radio disc, Switch + thumb, Slider thumb, Avatar, scrollbar thumb, drawer handle, status dots |
| **Compact chip** | `rounded-xs` | Badge, kbd, Combobox chip, 20px sidebar icon buttons |
| **Thin track** | stadium OK | Progress bar, Slider track — height is a few px; pill is the shape |

**Stadium rule:** `radius ≥ half the short side` reads as a pill. Soft `--radius-md` (~10px) on `h-5` (20px) is exactly a stadium — that is why chips are capped at `xs`, not `md`.

Never `rounded-full` on Badge / Button / Tabs to “make it friendlier”. Never `rounded-md` on Switch / Avatar / a radio disc.

### Nested radius (same shell family)

When a chip or inner surface is inset inside a rounded shell: `R_inner = max(0px, R_outer − inset)`.

```
/* Inner card with p-3 (12px) inset inside a radius-lg card */
border-radius: calc(var(--radius-lg) - var(--spacing-3));
```

Tabs / sliding Radio: `--*-pill-inner-radius: max(0px, var(--*-pill-radius) - 3px)`.

Do not hardcode `border-radius: 12px` (or any px) on product UI.

## Typography

| Size | Class | Use Case |
|------|-------|----------|
| sm | `text-xs` or `text-[0.625rem]` | Compact controls, labels |
| default | `text-sm` | Body, inputs, buttons |
| base | `text-base` | Section titles, headings |

Font: `--font-sans` (Inter Variable). Leading: `leading-normal` or `text-xs/relaxed`.

## When Adding a New Component

1. **Use the scale** – If the component has a `size` prop, map `sm`→h-6, `default`→h-7, `lg`→h-8.
2. **Match padding** – Text controls: px-2–3, py-1.5. Icon-only: p-0 with explicit size.
3. **Text size** – sm: `text-xs` or `text-[0.625rem]`, default: `text-sm`, lg: `text-sm`.
4. **Border radius** – Pick the **role**, then the rung: chrome `rounded-md`, panel `rounded-lg`, overlay `rounded-xl`. Segmented shells (ButtonGroup, ToggleGroup, Tabs, sliding Radio) are chrome. Compact chips (`h-5` / `w-5`) are `rounded-xs`. Circles stay `rounded-full`. Nested chip-in-shell: `calc(outer - inset)`. Never hardcode px.

## Grouped Controls (ButtonGroup, ToggleGroup)

- **Shared border** – Container: `rounded-md border border-input overflow-hidden`
- **Child borders** – Items: `border-0` (container provides the border)
- **Dividers** – ToggleGroup: item borders (`border-foreground/20`) between items. Or `ToggleGroupSeparator` when `separator={false}`.
- **Corners** – First item: rounded-l (or rounded-t vertical), last: rounded-r (or rounded-b)
- **Several groups on one horizontal row** – `ButtonGroup`’s container is `inline-flex`, so multiple sibling groups behave like inline boxes and align to **baseline**. Mixed content (labels vs icons vs `ButtonGroupText`) then looks vertically inconsistent. Prefer **`flex flex-wrap items-center gap-*`** or **grid** so you control cross-axis alignment (`items-center`, `items-end`) instead of baseline alignment.

## Toggle & ToggleGroup Visual Treatment (Visibility on Any Background)

Toggles and ToggleGroup items must remain visible on card, sidebar, and varied backgrounds:

| State | Default/Outline | Segmented (single select) |
|-------|-----------------|---------------------------|
| **Off** | `border border-input/60` (or `border-input`), `shadow-sm`, `bg-background/50` (or transparent) | Transparent |
| **On** | `bg-secondary` + `nqui-button-gradient` + `nqui-button-shadow` | `bg-primary` + gradient + shadow |
| **Active (pressed)** | `active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)]` | Same |

Never use flat `bg-muted` only for selected state; always add gradient + shadow for depth and visibility.

**Active label weight:** Toggle / ToggleGroup use `font-medium` when off and **`font-bold` when on** (`data-[state=on]`). TabsTrigger uses **`font-bold` when active** (`data-[state=active]`). **ButtonGroup** forces direct **`button` / `a` / select-trigger children to `font-normal`** (overrides Button’s `font-medium`); use **`font-bold` only** on the selected control via `aria-current="true"`, `aria-pressed="true"`, or `data-active`.

## Toolbar & In-Context Design

**Rule:** Show controls in realistic app context, not isolated. Reference: nqui-showcase `/catalog` (Toggle & ToggleGroup section).

| Context | Layout | Example |
|---------|--------|---------|
| Document editor | Toolbar above content, `bg-muted/30`, `Separator` between groups | Bold / Italic / Underline; align left / center / right |
| Chart/settings panel | Label + inline controls, `rounded-lg border bg-muted/30 p-3` | Y-axis Linear/Log; size S/M/L |
| Standalone | Inline with related UI | Pin, Mute, single Toggle |

## Bounded content (default UX)

- **Rule:** Interactive surfaces should not **visually bleed** outside their box: prefer **ellipsis** (`truncate`), **line-clamp**, **controlled scroll**, or **wrapping** instead of letting text or icons paint past padding in narrow layouts.
- **Not universal:** Portals (dropdowns, popovers), **tooltips**, and **drag overlays** intentionally escape bounds. **Data tables** may use horizontal scroll.
- **Flex gotcha:** `inline-flex` + icon + `whitespace-nowrap` + raw string children keeps implicit **min-width: min-content**; parents need **`min-w-0`** (and often **`max-w-full`**) on the control and a truncating inner wrapper for long labels.
- **Built-in helpers in nqui:** Shared `wrapInlineLabelTextNodes` + `min-w-0 max-w-full` on **Button**, **Toggle**, **TabsTrigger**, **Badge**, **ComboboxChip**; **SelectTrigger** uses `min-w-0 max-w-full` and `min-w-0` on the value slot with `line-clamp-1`. **Carousel** prev/next sit **inside** the carousel box so they don’t spill out of **Card** (override via `className` if you want outside arrows).
- **Card:** **Card** uses **`min-w-0`** on shell + header/content/footer for flex/grid safety but keeps **`overflow-visible`** so overlays aren’t clipped; don’t rely on **`overflow-hidden`** on Card as a global catch-all unless you accept clipping dropdowns/focus.

## Card + ScrollArea (flex scroll contract)

**Symptom:** Content inside **Card** + **ScrollArea** overflows the card, ignores rounded corners, or **does not scroll** until someone adds `min-h-0` up the tree.

**Cause:** Flex items default to **`min-height: auto`**: they won’t shrink below content height, so the scroll region never gets a bounded height → **no scrollport**. Normal CSS, not a ScrollArea bug.

**Rules (every time you nest scrollable content in flex):**

1. **Height chain:** From the page shell down to **ScrollArea**, every flex child that must shrink needs **`min-h-0`** (often with **`flex-1`** or **`flex-shrink`**).
2. **Card root:** Keeps **`overflow-visible`** on purpose (dropdowns, popovers, focus rings). Do **not** use **`overflow-hidden`** on the outer **Card** alone as your only scroll fix — establish a **nested** scroll box.
3. **Scrollable body:** Prefer **`CardContent`** (or a wrapper) with **`min-h-0 flex-1 overflow-hidden`**, then **ScrollArea** with **`className="min-h-0 h-full"`** or **`min-h-0 flex-1`** inside a **`flex flex-col min-h-0`** card.
4. **Parent must constrain height:** e.g. `h-full`, `min-h-0`, or explicit `max-h-*` / `h-[...]`; otherwise “100%” has no reference.

**Applies beyond Card:** **Sheet** / **Drawer** body, **sidebar** columns, **dashboard** panes, and **resizable** splits use the **same** contract — one **`flex flex-col min-h-0 overflow-hidden`** shell that owns the clip, **chrome** (`header`, tabs, toolbars) as **`shrink-0`**, scroll body in **`flex-1 min-h-0`**. Symptom → fix routing: **`docs/components/nqui-scroll-area.md` §0**.

**Data tables / wide grids (same failure modes, stricter recipe):**

- **`orientation="both"`** — default **`vertical`** uses **`overflow-x-hidden`** on the viewport; a **`min-w-*`** `<table>` then **cannot** scroll horizontally. See **`docs/components/nqui-scroll-area.md` §6**.
- **ScrollArea root in a capped flex column:** **`h-0 max-h-full min-h-0 min-w-0 flex-1 overflow-hidden w-full`** so flex assigns a **finite** slot (not content-height blow-through).
- **`viewportStyle`:** **`position: "absolute"`, `inset: 0`, `minHeight: 0`, `minWidth: 0`** — **`height: 100%`** on the Radix viewport often **does not bind** in deep flex layouts; the viewport then grows with content and overlaps a footer below. See **`docs/components/nqui-scroll-area.md` §6** and **`docs/nqui-skills/nqui-data-tables/SKILL.md`**.

**Reference implementations:** `Card` + **`stickyHeader`** in `src/components/ui/card.tsx`; nqui-showcase `/catalog` where ScrollArea sits in a bounded layout.

**Checklist before merging a scrollable card:**

- [ ] Flex column from page → card includes **`min-h-0`** where the tree shrinks.
- [ ] Card column is **`flex flex-col min-h-0`** (and **`h-full`** if filling a panel).
- [ ] Scroll wrapper: **`flex-1 min-h-0 overflow-hidden`**.
- [ ] **ScrollArea** has **`min-h-0`** and fills the wrapper (**`h-full`** / **`flex-1`**).
- [ ] **Wide table in ScrollArea:** **`orientation="both"`** + **`viewportStyle`** absolute fill if `%` height failed (see component doc §6).

## Density & visual hierarchy (product feel)

- **Density:** `size="sm"` and compact patterns (tables, sidebars) read as **dense**; default/lg and generous spacing read as **comfortable**. Don’t mix ad-hoc heights — use the **size scale** so density stays intentional.
- **Task priority:** One **primary** action per surface (full-color / high contrast). Secondary actions use **outline** / **secondary**; **tertiary** use **ghost** / muted text. Avoid multiple competing primaries.
- **Muted vs foreground:** Use **`text-muted-foreground`** for supporting labels, **`text-foreground`** for primary reading. Don’t gray out text that must be understood to complete a task.

## Customization

- End users override via `className` or `size` when supported.
- Do NOT hardcode heights in consumer code when the component supports `size`.
- Prefer semantic sizes over pixel values in component defaults.

## Hit area utilities

**Hit area** expands the pointer target; it does **not** replace the **size** scale. Use **opt-in** on **Checkbox** / **Switch** in padded rows—not globally. See `docs/nqui-skills/nqui-components/SKILL.md` and `docs/components/nqui-checkbox.md` / `nqui-switch.md`.

## Files to Check for Consistency

- `src/components/ui/button.tsx`
- `src/components/ui/toggle.tsx`
- `src/components/ui/toggle-group.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/combobox.tsx`

## Anti-Patterns

- **Different heights for same size** – Button h-10 while Toggle h-7 = inconsistent.
- **Component-specific scales** – Do not add `xs` or `xl` without updating the design system doc.
- **Overriding in showcase** – If showcase needs `className="h-9"` to look right, the component default is wrong.
