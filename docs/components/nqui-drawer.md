# nqui Drawer

> **Vaul** drawer. **DrawerContent** uses the same hybrid tray and overlay scrim as Dialog/Sheet (`bg-overlay` + `backdrop-blur-xs`). Default direction is bottom; `direction="right"` is the side-panel cousin of Sheet.

## Import

```tsx
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader,
  DrawerTitle, DrawerDescription, DrawerFooter
} from "@nqlib/nqui"
```

## Basic

```tsx
<Drawer>
  <DrawerTrigger asChild><Button>Open</Button></DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
      <DrawerDescription>Desc</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter><Button>Save</Button></DrawerFooter>
  </DrawerContent>
</Drawer>
```
