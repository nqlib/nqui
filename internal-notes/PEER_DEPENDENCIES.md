# nqui Optional Peer Dependencies

Heavy or feature-specific dependencies are externalized from the nqui bundle. Consumers using these components must install the corresponding packages.

## Component-to-Peer Mapping

| Component(s) | Peer Dependency |
|--------------|-----------------|
| Icons (HugeiconsIcon, most components with icons) | `@hugeicons/react`, `@hugeicons/core-free-icons` |
| Sortable | `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Command, CommandPalette, Combobox | `cmdk` |
| Carousel | `embla-carousel-react` |
| DataTable | `@tanstack/react-table` |
| Calendar, EnhancedCalendar | `react-day-picker`, `date-fns` |
| Toaster, Sonner | `sonner` |
| Drawer | `vaul` |
| ResizablePanelGroup, ResizablePanel, ResizableHandle | `react-resizable-panels` |
## Code Display Components (@nqlib/nqcode)

CodeBlock, CodeEditor, Snippet, and Sandbox are in a separate package. Install: `pnpm add @nqlib/nqcode shiki @shikijs/transformers`

| Package | Components | Peer Dependencies |
|---------|------------|-------------------|
| `@nqlib/nqcode` | CodeBlock, CodeEditor, Snippet, Sandbox | @nqlib/nqui, shiki, @shikijs/transformers |
| `@nqlib/nqcode/server` | CodeBlockContentServer (RSC) | shiki, @shikijs/transformers |

## Subpath Exports (Smaller Bundles)

Use subpath imports when you only need specific component groups. This keeps consumer bundles smaller by avoiding the full nqui bundle.

| Subpath | Components | Peer Dependencies |
|---------|------------|--------------------|
| `@nqlib/nqui/carousel` | Carousel | embla-carousel-react |
| `@nqlib/nqui/command` | Command, CommandPalette | cmdk |
| `@nqlib/nqui/sortable` | Sortable | @dnd-kit/* |
| `@nqlib/nqui/calendar` | Calendar | react-day-picker, date-fns |
| `@nqlib/nqui/sonner` | Toaster, Sonner | sonner |
| `@nqlib/nqui/drawer` | Drawer | vaul |

Example:

```ts
// Full import (larger bundle)
import { Carousel } from "@nqlib/nqui";

// Subpath imports (smaller - only loads what you need)
import { Carousel } from "@nqlib/nqui/carousel";

// Code display (separate package)
import { CodeBlock, Snippet } from "@nqlib/nqcode";
```

## Installation

For a minimal setup (Button, Card, etc.), install nqui and the icon library:

```bash
pnpm add @nqlib/nqui @hugeicons/react @hugeicons/core-free-icons
```

For full library support (all components: Sortable, Carousel, DataTable, Calendar, etc.):

```bash
npx @nqlib/nqui install-peers
```

This installs nqui + all required and optional peer dependencies.

To use Sortable:

```bash
pnpm add @nqlib/nqui @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities
```

To use Command/CommandPalette:

```bash
pnpm add @nqlib/nqui cmdk
```

To use Resizable panels:

```bash
pnpm add @nqlib/nqui react-resizable-panels
```

To use CodeBlock, CodeEditor, Snippet, or Sandbox:

```bash
pnpm add @nqlib/nqui @nqlib/nqcode shiki @shikijs/transformers
```

And so on for each component group above.

## Rationale

Externalizing these dependencies keeps the core nqui bundle smaller. Users who only need basic components (Button, Input, Card) do not pay for Sortable, Carousel, or CodeBlock dependencies.
