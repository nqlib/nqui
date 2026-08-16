# nqui Sheet

> Side panel (Radix **Dialog** pattern). **SheetContent** uses hybrid tray chrome: muted rim (`p-1`) → background stage + hairline. Lift comes from the shared overlay scrim (`bg-overlay` + `backdrop-blur-xs`), not `--shadow-modal`. Close control matches Dialog (ghost icon `Button`). Default `side="right"`. Mobile **Sidebar** sets `stage={false}` so it can own its own surface.

## Import

```tsx
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader,
  SheetTitle, SheetDescription, SheetFooter
} from "@nqlib/nqui"
```

## Basic

```tsx
<Sheet>
  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Desc</SheetDescription>
    </SheetHeader>
    ...
  </SheetContent>
</Sheet>
```

## Internal dividers — **always inset, never full-width**

`SheetContent`'s rounded **stage** sits inside a muted rim. Any **full-width `border-b` / `border-t`** on a child of a `p-0` / `stage={false}` shell can still draw past the visual rounded edge.

**❌ Don't**

```tsx
<SheetContent side="right" className="!p-0">
  <div className="border-b px-4 py-3">Header</div>   {/* line leaks past the rounded corner */}
  <div className="p-4">Body</div>
</SheetContent>
```

**✅ Do — inset the divider so it physically can't reach the corner**

```tsx
<SheetContent side="right" className="!p-0">
  {/* Inset divider via ::after — same look, can't leak */}
  <div className="relative px-4 py-3
                  after:pointer-events-none after:absolute
                  after:inset-x-4 after:bottom-0
                  after:h-px after:bg-border/60">
    Header
  </div>
  <div className="p-4">Body</div>
</SheetContent>
```

Alternative: render a separate inset divider element — `<div className="mx-4 h-px bg-border/60" />`. Both work; pick whichever fits the layout.

**Why not just `rounded-xl overflow-hidden` on a wrapper?** It clips the border *most* of the time, but the SheetContent's own 1px box edge and the inner clip mask can disagree by a subpixel — so the line still peeks at the corner. Insetting removes the failure mode entirely.

**Applies to:** any sheet header, footer, sub-section divider, or filter row. Same rule for `nqui-drawer` (same `::before`-inset-panel shape).

## Custom positioning (floating-panel layout)

When overriding default side positioning (e.g. floating dock with gap from edges), use CSS variables for the inset — the muted rim + stage already supply the rounded tray.

```tsx
<SheetContent
  side="right"
  showCloseButton={false}
  className="!p-0 !right-[var(--inset)] !top-[var(--top)] !bottom-[var(--bottom)]
             !h-auto !w-[var(--w)]"
  style={{
    "--inset": "8px",
    "--top": "calc(var(--titlebar-h) + 6px)",
    "--bottom": "12px",
    "--w": "320px",
  } as React.CSSProperties}
>
  ...
</SheetContent>
```
