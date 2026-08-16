# nqui Dialog

> Modal dialog. Core Radix primitive. Chrome is a hybrid tray: muted rim → background stage + hairline. Overlay family (Dialog / AlertDialog / Sheet / Drawer) shares one scrim (`bg-overlay` + `backdrop-blur-xs`) and one close control (ghost `Button` `size="icon"`). `CommandDialog` sets `stage={false}` to keep the command surface.

## Import

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@nqlib/nqui"
```

## Basic

```tsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <p>Body</p>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Controlled

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  ...
</Dialog>
```
