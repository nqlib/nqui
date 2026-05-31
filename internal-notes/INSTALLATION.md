# nqui Installation Guide

## Requirements

- **React 18 or 19**: nqui supports both via flexible peer dependencies (`^18.0.0 || ^19.0.0`).
- **Tailwind CSS v4**: Required for component styling.
- **Node.js**: See your framework requirements.

---

## Installation Sequence (Quick Reference)

Run these commands in order:

```bash
# 1. Install nqui + peers (choose one)
pnpm add @nqlib/nqui @hugeicons/react @hugeicons/core-free-icons   # Minimal (icons only)
npx @nqlib/nqui install-peers                                      # Full (all optional peers)

# 2. Setup CSS
npx @nqlib/nqui init-css

# 3. Add the nqui import to your main CSS file (see Step 2 details)
#    Copy contents of nqui/nqui-setup.css to the TOP of app/globals.css (Next.js) or src/index.css (Vite)

# 4. Optional: Debug tools
npx @nqlib/nqui init-debug-css

# 5. Optional: Refresh Cursor rules (auto-injected on install)
npx @nqlib/nqui init-cursor
```

**Run `npx nqui-setup` anytime** to see this checklist again (with nqui installed).

**Monorepo:** Skills are written to the package that has `@nqlib/nqui` (e.g. `apps/frontend/`). Open that folder in Cursor as your workspace.

---

## Step 1: Install nqui + Peers

### Minimal (icons only)

Required for Button, Accordion, Select, and most components with icons:

```bash
npm install @nqlib/nqui @hugeicons/react @hugeicons/core-free-icons
# or
pnpm add @nqlib/nqui @hugeicons/react @hugeicons/core-free-icons
```

### Full (all optional peers)

For Sortable, Carousel, DataTable, Calendar, Command, Drawer, etc.:

```bash
npx @nqlib/nqui install-peers
```

This installs nqui + all optional peer dependencies. See [PEER_DEPENDENCIES.md](./PEER_DEPENDENCIES.md) for the component-to-peer mapping.

---

## Step 2: Setup CSS (Required)

### 2a. Run init-css

```bash
npx @nqlib/nqui init-css
```

This creates:

- `nqui/index.css` — imports from `@nqlib/nqui/styles`
- `nqui/nqui-setup.css` — full Tailwind + nqui setup (framework-specific)

### 2b. Add import to main CSS (manual step)

**You must manually add the nqui import to your main CSS file.** Main files by framework:


| Framework | Main CSS file     |
| --------- | ----------------- |
| Next.js   | `app/globals.css` |
| Vite      | `src/index.css`   |
| Remix     | `app/root.css`    |


**Option A (recommended):** Add at the top (after `@import "tailwindcss"`):

```css
@import "@nqlib/nqui/styles";
```

**Option B:** Copy the **entire contents** of `nqui/nqui-setup.css` and paste at the **very top** of your main CSS file.

### 2c. Next.js + Tailwind v4 — @source directives

If using Next.js, ensure these are in your main CSS:

```css
@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";
```

### 2d. Custom path

```bash
npx @nqlib/nqui init-css app/styles/nqui.css
```

The generated CSS includes: design tokens, color scales, light/dark support. **It does not include Tailwind** — configure Tailwind separately.

---

## Step 3: Import Components

```tsx
import { Button, Input, Card } from "@nqlib/nqui";
```

**Note:** Next.js App Router pages using nqui need `"use client"`.

---

## Step 4: Debug Tools (Optional)

### 4a. Run init-debug-css

```bash
npx @nqlib/nqui init-debug-css
```

Custom path: `npx @nqlib/nqui init-debug-css app/styles/debug.css`

### 4b. Use DebugPanel

```tsx
'use client'; // Required for Next.js App Router

import { DebugPanel } from "@nqlib/nqui";
import "./nqui-debug.css"; // Path from init-debug-css

export function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </>
  );
}
```

**Alternatives:** Import `@nqlib/nqui/debug.css` if your bundler supports it, or manually copy `node_modules/@nqlib/nqui/dist/nqui.css` into your project.

---

## Step 5: Cursor/IDE Rules (Auto-injected)

On install, component guidelines are written to `.cursor/rules/nqui-components.mdc`. To refresh:

```bash
npx @nqlib/nqui init-cursor
```

Full per-component docs: `node_modules/@nqlib/nqui/docs/components/README.md`

---

## Step 6: Optional Peer Dependencies

Install only when you use these components:


| Component(s)      | Install                                                                          |
| ----------------- | -------------------------------------------------------------------------------- |
| Sortable          | `pnpm add @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities` |
| CommandPalette    | `pnpm add cmdk`                                                                  |
| Carousel          | `pnpm add embla-carousel-react`                                                  |
| DataTable         | `pnpm add @tanstack/react-table`                                                 |
| Calendar          | `pnpm add react-day-picker date-fns`                                             |
| Toaster / Sonner  | `pnpm add sonner`                                                                |
| Drawer            | `pnpm add vaul`                                                                  |
| ResizablePanel    | `pnpm add react-resizable-panels`                                                |
| Combobox          | `pnpm add cmdk` (same as Command; Popover from `radix-ui` is bundled in nqui)    |
| CodeBlock/Snippet | `pnpm add @nqlib/nqcode shiki @shikijs/transformers`                             |


See [PEER_DEPENDENCIES.md](./PEER_DEPENDENCIES.md) for the full mapping.

---

## Framework-Specific Setup

### Next.js App Router

```tsx
// app/layout.tsx
'use client';

import { DebugPanel } from "@nqlib/nqui";
import "../../node_modules/@nqlib/nqui/dist/nqui.css"; // Direct path if package import fails

export function DebugPanelClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (process.env.NODE_ENV !== 'development' || !mounted) return null;
  return <DebugPanel />;
}
```

### Vite / Create React App

```tsx
// src/main.tsx
import { DebugPanel } from "@nqlib/nqui";
import "./nqui-debug.css";

function App() {
  return (
    <>
      <YourApp />
      {import.meta.env.DEV && <DebugPanel />}
    </>
  );
}
```

### Remix

```tsx
// app/root.tsx
import { DebugPanel } from "@nqlib/nqui";
import "./nqui-debug.css";

export default function Root() {
  return (
    <html>
      <body>
        <Outlet />
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </body>
    </html>
  );
}
```

---

## Troubleshooting

### "Module not found: Can't resolve '@nqlib/nqui/styles'" or CSS not loading

1. Run `npx @nqlib/nqui init-css`
2. Add `@import "@nqlib/nqui/styles";` to the **top** of your main CSS file (app/globals.css or src/index.css)
3. Ensure the import is **before** your other styles

### nqui components render without styles

The main CSS file is missing the nqui import. Add `@import "@nqlib/nqui/styles";` near the top. Or copy contents of `nqui/nqui-setup.css` into your main CSS.

### Debug Panel not appearing

1. Ensure `NODE_ENV !== 'production'`
2. Import the debug CSS
3. Verify `DebugPanel` is rendered in your app tree

### Package import (nqui vs @nqlib/nqui)

Use `@nqlib/nqui` — the package name. Old docs may reference `nqui`.

---

## Advanced: Custom CSS Location

1. Run `npx @nqlib/nqui init-css your/path/nqui.css`
2. Add the import from that path to your main CSS
3. Or copy `nqui/nqui-setup.css` contents into your existing setup

