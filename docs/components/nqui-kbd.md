# nqui Kbd

> Keyboard key indicator for shortcuts.

## Import

```tsx
import { Kbd } from "@nqlib/nqui"
```

## Basic

```tsx
Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open
<Kbd>Esc</Kbd> to close
<Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd>
```

## KbdGroup

```tsx
import { Kbd } from "@nqlib/nqui"
// KbdGroup: import from @/components/ui/kbd if needed
<div><Kbd>Ctrl</Kbd>+<Kbd>K</Kbd></div>
```

## Notes

- **Shape:** `rounded-xs` (compact chip). Same stadium cap as Badge so Soft `--radius` cannot pill an `h-5` key.
