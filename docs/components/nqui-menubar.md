# nqui Menubar

> Horizontal menu bar. MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem.

## Import

```tsx
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@nqlib/nqui"
```

## Basic

```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## Submenu

Same placement as `DropdownMenu` — the flyout sits to the right of the trigger
row with a 6px gap (`sideOffset={6}`, `alignOffset={-4}`):

```tsx
<MenubarSub>
  <MenubarSubTrigger>Share</MenubarSubTrigger>
  <MenubarSubContent>
    <MenubarItem>Copy link</MenubarItem>
  </MenubarSubContent>
</MenubarSub>
```
