# Layout Design Architecture Guide

This document provides architectural guidance for implementing consistent layouts, pages, and cards in the nqui component library.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Z-Index Elevation System](#z-index-elevation-system)
3. [App Layout Structure](#app-layout-structure)
4. [Sticky Header with Frosted Glass](#sticky-header-with-frosted-glass)
5. [Scroll Architecture](#scroll-architecture)
6. [Page Implementation](#page-implementation)
7. [Card Design Patterns](#card-design-patterns)
8. [Common Pitfalls](#common-pitfalls)

---

## Core Principles

1. **Viewport Lock** — `html`, `body`, `#root` are all `height: 100%; overflow: hidden`. The browser never scrolls.
2. **Single Scroll Owner** — Each scroll direction has exactly one container that owns it. The page scroll container owns vertical; cards or `ScrollArea` own local scroll.
3. **Semantic Z-Index** — Use CSS variables from `elevation.css`, never arbitrary numbers.
4. **Flex Shrink Prevention** — Sticky elements use `flex-shrink-0` to prevent compression.
5. **Two-Layer Pattern** — Frosted glass effects use separate background and content z-layers.

---

## Z-Index Elevation System

All z-index values are defined in `packages/nqui/src/styles/elevation.css`. Always use these variables:

```css
:root {
  --z-base: 0;              /* Default layer */
  --z-background: 0;        /* Frosted glass background layer */
  --z-content: 10;          /* Standard content */
  --z-sticky-content: 15;   /* Card headers, table headers */
  --z-sticky-page: 20;      /* Page-level sticky header */
  --z-floating: 30;         /* Sidebars, floating panels */
  --z-modal-backdrop: 40;   /* Modal overlay */
  --z-modal: 50;            /* Modal content */
  --z-popover: 60;          /* Dropdowns, popovers */
  --z-tooltip: 70;          /* Tooltips */
  --z-debug: 9999;          /* Debug tools only */
}
```

### Usage in Tailwind

```tsx
// Page header - stays above card headers
<header className="z-[var(--z-sticky-page)]">

// Card sticky header - below page header
<div className="z-[var(--z-sticky-content)]">

// Tooltip
<div className="z-[var(--z-tooltip)]">
```

### Hierarchy Rules

| Element | Z-Index Variable | Value | Stays Above |
|---------|------------------|-------|-------------|
| Page Header | `--z-sticky-page` | 20 | Card headers, content |
| Card Header | `--z-sticky-content` | 15 | Card content only |
| Sidebar | `--z-floating` | 30 | Page content |
| Modal | `--z-modal` | 50 | Everything except tooltips |
| Popover | `--z-popover` | 60 | Modals |
| Tooltip | `--z-tooltip` | 70 | Everything |

---

## App Layout Structure

The main layout lives in `packages/nqui/src/components/AppLayout.tsx`.

### Container Hierarchy

```
SidebarProvider
└── AppSidebar (z-floating: 30)
└── SidebarInset (h-screen overflow-hidden)
    └── Scroll Container (flex-1 min-h-0 overflow-y-auto overflow-x-hidden)
        ├── Sticky Header (sticky top-0, z-sticky-page: 20)
        │   ├── FrostedGlass (z-background: 0)
        │   └── Content Layer (z-content: 10)
        └── PageContentWrapper
            └── <Outlet /> (your page)
```

### Key Implementation

```tsx
<SidebarInset className="flex flex-col h-screen overflow-hidden">
  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
    {/* Sticky header */}
    <header className="sticky top-0 z-[var(--z-sticky-page)] flex-shrink-0 relative">
      <FrostedGlass blur={16} borderRadius={0} className="z-[var(--z-background)]" />
      <div className="relative z-[var(--z-content)] border-b bg-background/40 flex h-16 items-center gap-2 px-4">
        {/* Header content */}
      </div>
    </header>

    {/* Page content */}
    <PageContentWrapper>
      <Outlet />
    </PageContentWrapper>
  </div>
</SidebarInset>
```

### Critical Classes Explained

| Class | Purpose |
|-------|---------|
| `h-screen overflow-hidden` | Confines app to viewport, prevents body scroll |
| `flex-1 min-h-0` | Allows flex child to shrink and enable internal scroll |
| `overflow-y-auto overflow-x-hidden` | Vertical scroll only in this container |
| `sticky top-0` | Header sticks to scroll container top |
| `flex-shrink-0` | Header never compresses under pressure |
| `relative` | Creates stacking context for z-index layers |

---

## Sticky Header with Frosted Glass

The frosted glass header uses a two-layer approach for the blur effect.

### Structure

```tsx
<header className="sticky top-0 z-[var(--z-sticky-page)] flex-shrink-0 relative">
  {/* Layer 1: Frosted glass effect (behind content) */}
  <FrostedGlass
    blur={16}
    borderRadius={0}
    className="z-[var(--z-background)]"
  />

  {/* Layer 2: Actual header content (above glass) */}
  <div className="relative z-[var(--z-content)] border-b transition-colors bg-background/40 flex h-16 items-center gap-2 px-4">
    <SidebarTrigger />
    <Separator orientation="vertical" className="h-4" />
    <Breadcrumb>...</Breadcrumb>
  </div>
</header>
```

### How FrostedGlass Works

The `FrostedGlass` component (`packages/nqui/src/components/ui/frosted-glass.tsx`):

1. **Extended backdrop** — Uses `h-[200%]` to capture content above and below
2. **Blur filter** — `backdrop-filter: blur(Xpx)` with webkit prefix
3. **Gradient mask** — Fades bottom edge to prevent harsh cutoff
4. **Pointer events** — `pointer-events-none` allows click-through

```tsx
// Simplified FrostedGlass internals
<div className="absolute inset-0 pointer-events-none h-[200%] bg-background/3"
  style={{
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    maskImage: "linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)",
  }}
/>
```

---

## Scroll Architecture

The app uses a **three-tier scroll model**. Each tier is independent — scrolling in one tier never interferes with another.

### The Three Tiers

```
┌──────────────────────────────────────────────────────┐
│  Tier 0: Viewport (html/body/#root)                  │
│  height: 100%, overflow: hidden                      │
│  NEVER scrolls — acts as fixed frame                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Tier 1: Page Scroll Container               │    │
│  │  flex-1 min-h-0 overflow-y-auto              │    │
│  │  overflow-x-hidden                           │    │
│  │  ↕ VERTICAL ONLY                             │    │
│  │                                              │    │
│  │  ┌─ sticky header ──────────────────────┐    │    │
│  │  │  sticky top-0  z-sticky-page (20)    │    │    │
│  │  └──────────────────────────────────────┘    │    │
│  │                                              │    │
│  │  ┌─ page content ──────────────────────┐    │    │
│  │  │                                      │    │    │
│  │  │  ┌─ Tier 2: Local Card Scroll ──┐   │    │    │
│  │  │  │  ScrollArea or overflow-auto  │   │    │    │
│  │  │  │  ↔ HORIZONTAL and/or          │   │    │    │
│  │  │  │  ↕ VERTICAL (independent)     │   │    │    │
│  │  │  └──────────────────────────────┘   │    │    │
│  │  │                                      │    │    │
│  │  └──────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Tier 0 — Viewport Lock

Defined in `packages/nqui/src/index.css`:

```css
@layer base {
  html, body, #root {
    height: 100%;
    overflow: hidden;
  }
}
```

Additionally, `AppLayout.tsx` programmatically enforces this:

```tsx
document.body.style.overflow = 'hidden'
document.documentElement.style.overflow = 'hidden'
```

**Result:** The browser's native scroll is completely disabled. No scroll event ever reaches the viewport.

### Tier 1 — Page Scroll Container (Vertical)

The single vertical scroll owner. Defined in `AppLayout.tsx`:

```tsx
<div
  ref={scrollContainerRef}
  className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden"
>
  <header className="sticky top-0 z-[var(--z-sticky-page)] flex-shrink-0">
    {/* page header — sticks to top of THIS container */}
  </header>
  <PageContentWrapper>
    <Outlet />  {/* all page content scrolls here */}
  </PageContentWrapper>
</div>
```

Why this works:
- `overflow-y-auto` makes this the scroll owner for the entire page
- `overflow-x-hidden` guarantees no horizontal scroll at the page level
- `sticky top-0` on the header pins it relative to this container, not the viewport
- `min-h-0` on the flex child allows it to shrink below its content height, which is what triggers the scrollbar

**The sticky header never moves.** The user scrolls through page content while the header stays pinned.

### Tier 2 — Local Card/Widget Scroll

Cards and widgets manage their own scroll independently using `ScrollArea` or native overflow. This scroll is **completely isolated** from Tier 1 — scrolling inside a card does not scroll the page.

There are two approaches:

#### Approach A: `ScrollArea` component (preferred)

Uses Radix ScrollArea primitive with styled scrollbar and optional fade-mask edges. Supports `orientation="vertical"`, `"horizontal"`, or `"both"`.

**Horizontal scroll example** — wide form fields inside a card:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Event Registration</CardTitle>
  </CardHeader>
  <CardContent>
    <ScrollArea orientation="horizontal" className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        <div className="min-w-[200px]">
          <Label>Full Name</Label>
          <Input placeholder="Jane Doe" />
        </div>
        <div className="min-w-[220px]">
          <Label>Email</Label>
          <Input type="email" placeholder="jane@example.com" />
        </div>
        {/* more fields... */}
      </div>
    </ScrollArea>
  </CardContent>
</Card>
```

Key details:
- `ScrollArea orientation="horizontal"` renders a horizontal Radix scrollbar and applies a left/right fade mask
- `min-w-max` on the inner `div` forces it to its natural width — this guarantees overflow on narrow viewports
- `pb-4` reserves space for the scrollbar below the content
- The styled scrollbar is visible and draggable (not hidden like native overflow)

**See live:** ComponentShowcase → "Horizontal Scroll" section

**Vertical scroll with frosted glass header** — card with `stickyHeader` prop:

```tsx
<Card stickyHeader className="h-[500px]">
  <CardHeader>
    <CardTitle>Frosted Glass Header with Scroll</CardTitle>
    <CardDescription>Scroll to see the frosted blur effect</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Long content — scrolls vertically inside the card */}
  </CardContent>
</Card>
```

When `stickyHeader` is set:
- `Card` adds `flex flex-col` and `overflow-hidden` to itself
- `CardHeader` becomes `sticky top-0 z-[var(--z-sticky-content)]` with a `FrostedGlass` background layer
- `CardContent` automatically wraps children in `<ScrollArea className="flex-1 min-h-0">` so the body scrolls vertically while the header stays pinned

This is the same two-layer frosted glass pattern as the page header, scoped to the card.

**See live:** ComponentShowcase → Layout Components → "Frosted Glass Header with Scroll"

#### Approach B: Native `overflow-auto` (for tables)

`TableRoot` uses native CSS overflow for horizontal scrolling. Simpler but no styled scrollbar or fade mask.

```tsx
<TableRoot>
  {/* w-full overflow-auto whitespace-nowrap */}
  <Table>
    <TableHead>...</TableHead>
    <TableBody>...</TableBody>
  </Table>
</TableRoot>
```

`DataTable` wraps in `TableRoot` automatically, so no extra work needed.

### How the Tiers Stay Independent

| Interaction | What happens |
|-------------|-------------|
| User scrolls the page | Tier 1 scrolls vertically. Sticky header stays. Cards move with content. |
| User scrolls inside a `ScrollArea` card | Only that card's content moves. Page does not scroll. |
| User horizontally scrolls a wide form/table | Only that card/table scrolls horizontally. Page has `overflow-x-hidden` so it never shifts. |
| User scrolls to bottom of card, keeps scrolling | Scroll stops at the card boundary. It does **not** propagate up to the page. (Radix ScrollArea isolates scroll.) |
| Browser is narrowed | Horizontal overflow inside `ScrollArea`/`TableRoot` activates. Page layout remains stable. |

### ScrollArea Component Reference

**File:** `packages/nqui/src/components/custom/enhanced-scroll-area.tsx`

```tsx
<ScrollArea
  orientation="vertical"     // "vertical" | "horizontal" | "both"
  fadeMask={true}            // fade edges (default: true)
  className="h-[300px]"     // constrain height for vertical scroll
>
  {children}
</ScrollArea>
```

| Prop | Default | Effect |
|------|---------|--------|
| `orientation` | `"vertical"` | Which scrollbar(s) to render and which axis to fade-mask |
| `fadeMask` | `true` | Applies CSS `mask-image` gradient to fade content at scroll edges |

Radix ScrollArea captures scroll events within its viewport, so scroll never leaks to parent containers.

---

## Page Implementation

All pages render inside `PageContentWrapper` via React Router's `<Outlet />`.

### Standard Page Template

```tsx
export default function MyPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0 overflow-x-hidden">
      {/* Page header (optional) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page Title</h1>
        <Button>Action</Button>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>...</Card>
        <Card>...</Card>
        <Card>...</Card>
      </div>
    </div>
  )
}
```

### Page Spacing Guidelines

| Element | Class |
|---------|-------|
| Page padding | `p-6` |
| Gap between sections | `gap-6` |
| Card grid gap | `gap-6` |
| Responsive columns | `md:grid-cols-2 lg:grid-cols-3` |
| Prevent flex overflow | `min-w-0 overflow-x-hidden` |

---

## Card Design Patterns

### Basic Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content */}
  </CardContent>
</Card>
```

### Card with Sticky Frosted Header (vertical scroll)

Use the `stickyHeader` prop — no manual wiring needed:

```tsx
<Card stickyHeader className="h-[500px]">
  <CardHeader>
    <CardTitle>Scrollable Content</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Long content — automatically wrapped in ScrollArea */}
  </CardContent>
</Card>
```

What `stickyHeader` does internally:
- `Card` → adds `flex flex-col`
- `CardHeader` → adds `sticky top-0 z-[var(--z-sticky-content)] flex-shrink-0` + `FrostedGlass` layer
- `CardContent` → wraps children in `<ScrollArea className="flex-1 min-h-0">`

### Card with Horizontal Scroll (wide content)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Wide Content</CardTitle>
  </CardHeader>
  <CardContent>
    <ScrollArea orientation="horizontal" className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {/* Wide row of elements */}
      </div>
    </ScrollArea>
  </CardContent>
</Card>
```

### Card with Table (horizontal scroll)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Data Table</CardTitle>
  </CardHeader>
  <CardContent>
    {/* TableRoot handles horizontal scroll automatically */}
    <DataTable columns={columns} data={data} />
  </CardContent>
</Card>
```

---

## Common Pitfalls

### 1. Using arbitrary z-index values

```tsx
// BAD - arbitrary number
<div className="z-50">

// GOOD - semantic variable
<div className="z-[var(--z-modal)]">
```

### 2. Missing flex-shrink-0 on sticky headers

```tsx
// BAD - header can be compressed
<header className="sticky top-0">

// GOOD - header maintains height
<header className="sticky top-0 flex-shrink-0">
```

### 3. Forgetting min-h-0 on flex scroll containers

```tsx
// BAD - scroll may not work
<div className="flex-1 overflow-y-auto">

// GOOD - allows flex child to shrink for scroll
<div className="flex-1 min-h-0 overflow-y-auto">
```

### 4. Using viewport scroll instead of container scroll

```tsx
// BAD - scrolls entire page
<body className="overflow-auto">

// GOOD - isolated scroll container
<div className="h-screen overflow-hidden">
  <div className="flex-1 min-h-0 overflow-y-auto">
```

### 5. Card header not sticky when content scrolls

```tsx
// BAD - manual wiring, easy to miss a class
<Card className="flex flex-col max-h-[500px]">
  <CardHeader className="sticky top-0 ...">
  <CardContent className="flex-1 overflow-y-auto">

// GOOD - one prop handles everything
<Card stickyHeader className="h-[500px]">
  <CardHeader>  {/* automatically sticky + frosted glass */}
  <CardContent>  {/* automatically wrapped in ScrollArea */}
```

### 6. Horizontal overflow breaking page layout

```tsx
// BAD - content overflows the page
<div className="w-full">
  <WideContent />
</div>

// GOOD - contained with ScrollArea
<ScrollArea orientation="horizontal" className="w-full">
  <div className="min-w-max">
    <WideContent />
  </div>
</ScrollArea>

// ALSO GOOD - for tables (uses native overflow)
<TableRoot>
  <Table>...</Table>
</TableRoot>
```

### 7. Forgetting pb padding for horizontal scrollbar

```tsx
// BAD - scrollbar overlaps content
<ScrollArea orientation="horizontal">
  <div className="flex gap-4 min-w-max">

// GOOD - padding reserves space for scrollbar
<ScrollArea orientation="horizontal">
  <div className="flex gap-4 pb-4 min-w-max">
```

---

## Quick Reference

### New Page Checklist

- [ ] Use `flex flex-1 flex-col` as root container
- [ ] Apply `p-6 gap-6` for consistent spacing
- [ ] Add `min-w-0 overflow-x-hidden` to prevent horizontal blowout
- [ ] Use responsive grid for cards: `grid gap-6 md:grid-cols-2`

### New Card Checklist

- [ ] Use `Card`, `CardHeader`, `CardContent` components
- [ ] For vertically scrollable cards: use `stickyHeader` prop + set a height
- [ ] For horizontally scrollable content: wrap in `<ScrollArea orientation="horizontal">`
- [ ] For tables: `DataTable` handles scroll automatically via `TableRoot`

### Sticky Element Checklist

- [ ] Add `sticky top-0`
- [ ] Add `flex-shrink-0`
- [ ] Use appropriate z-index variable (`--z-sticky-page` or `--z-sticky-content`)
- [ ] Ensure parent has `overflow-y-auto` (or is a `ScrollArea`)
- [ ] Ensure flex parent has `min-h-0`

---

## File References

| File | Purpose |
|------|---------|
| `packages/nqui/src/index.css` | Viewport lock (`html/body/root overflow: hidden`) |
| `packages/nqui/src/styles/elevation.css` | Z-index CSS variables |
| `packages/nqui/src/components/AppLayout.tsx` | Main layout with page scroll container + sticky header |
| `packages/nqui/src/components/ui/frosted-glass.tsx` | Frosted glass effect |
| `packages/nqui/src/components/ui/card.tsx` | Card with `stickyHeader` prop (auto sticky + ScrollArea) |
| `packages/nqui/src/components/custom/enhanced-scroll-area.tsx` | ScrollArea with orientation + fade mask |
| `packages/nqui/src/components/table/Table.tsx` | TableRoot with native horizontal scroll |

## Live Examples

| Example | Location in showcase | What it demonstrates |
|---------|---------------------|----------------------|
| Horizontal Scroll | ComponentShowcase → "Horizontal Scroll" | `ScrollArea orientation="horizontal"` with wide form fields |
| Frosted Glass Header with Scroll | ComponentShowcase → Layout Components → "Frosted Glass Header with Scroll" | `Card stickyHeader` with vertical scroll + frosted blur |
| Table horizontal scroll | ChartShowcase → "Table - Basic" | `TableRoot` / `DataTable` native overflow on narrow viewport |
