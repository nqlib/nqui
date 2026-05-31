# @nqlib/nqui

A React component library with enhanced UI components and developer tools. Built with TypeScript, Tailwind CSS, and Radix UI primitives.

## Requirements

- React 18 or 19
- Tailwind CSS v4
- TypeScript (optional but recommended)

## Installation

### Install the package

Install the published package from [npm](https://www.npmjs.com/package/@nqlib/nqui):

```bash
npm install @nqlib/nqui @hugeicons/react @hugeicons/core-free-icons
```

Hugeicons is required for icons in components (Button, Accordion, Select, etc.).

**All optional peers** (Sortable, Carousel, DataTable, Calendar, etc.):

```bash
npx @nqlib/nqui install-peers
```

**After `npm install`:** the post-install script may add a `nqui:init` script and write initial Cursor rules under `.cursor/`. It does **not** copy full **nqui-skills** or set up CSS — run the commands below. Run `npx nqui-setup` (same as `npx @nqlib/nqui setup`) anytime to see next steps again. Post-install is skipped when `CI=true` or `CI=1`.

### IDE skills (Cursor and compatible agents)

Copy the library’s **skills** into your app so your IDE can follow nqui patterns (components, design system, ToggleGroup rules, etc.):


| Command                       | What it does                                                                                                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx @nqlib/nqui init-cursor` | Writes `.cursor/rules` and `.cursor/skills`, copies `**docs/nqui-skills`** → `**.cursor/nqui-skills**`, and creates `**AGENTS.md**` at the project root pointing agents at `.cursor/nqui-skills/SKILL.md`.                         |
| `npx @nqlib/nqui init-skills` | **Skills only:** copies nqui-skills to `.cursor/nqui-skills/` and (re)creates `AGENTS.md`. Use `--force` to overwrite existing files.                                                                                              |
| `npm run nqui:init`           | **One-shot** (if post-install added this script): `install-peers` → `init-cursor` → `init-skills` → `init-css --sidebar --force`. You still add the CSS import to your main stylesheet (see [INSTALLATION.md](./INSTALLATION.md)). |


After copying skills, **restart the IDE** so rules and skills reload.

**Monorepos:** rules and skills are written to the workspace package that depends on `@nqlib/nqui`. Open that folder in your IDE so paths resolve.

---

### CLI commands

Run from your **app project root** (where `package.json` lives). Equivalent **global bins** (when the package is installed): `nqui`, `nqui-setup`, `nqui-install-peers`, `nqui-init-cursor`, `nqui-init-skills`, `nqui-init-css`, `nqui-init-debug`.


| Command                                          | Description                                                                                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npx @nqlib/nqui setup`                          | Re-run post-install: next steps + Cursor rules (not full skills/CSS). Same as `npx nqui-setup`.                                                                                            |
| `npx @nqlib/nqui install-peers`                  | Install `@nqlib/nqui` and required + optional peer dependencies.                                                                                                                           |
| `npx @nqlib/nqui init-cursor`                    | Cursor rules + **nqui-skills** → `.cursor/nqui-skills/` + `AGENTS.md`.                                                                                                                     |
| `npx @nqlib/nqui init-skills`                    | Copy nqui-skills only; `--force` to overwrite.                                                                                                                                             |
| `npx @nqlib/nqui init-css`                       | Detect framework; create `nqui/index.css` and `nqui/nqui-setup.css`. Flags: `--sidebar`, `--force`, `--wizard`. Optional output path, e.g. `npx @nqlib/nqui init-css app/styles/nqui.css`. |
| `npx @nqlib/nqui`                                | No args → same as **init-css** (default `nqui/index.css`).                                                                                                                                 |
| `npx @nqlib/nqui init-debug` or `init-debug-css` | Scaffold CSS for `DebugPanel`.                                                                                                                                                             |


---

### Recommended setup order

**Option A — one command** (if `nqui:init` exists in `package.json`):

```bash
npm run nqui:init
```

Then add `@import "@nqlib/nqui/styles";` (or your framework’s full CSS snippet) to your main CSS — see [INSTALLATION.md](./INSTALLATION.md) Step 2.

**Option B — step by step:**

```bash
npm install @nqlib/nqui @hugeicons/react @hugeicons/core-free-icons
# optional: npx @nqlib/nqui install-peers

npx @nqlib/nqui init-cursor
# optional refresh: npx @nqlib/nqui init-skills

npx @nqlib/nqui init-css --sidebar
# add CSS import to app/globals.css or src/index.css — see INSTALLATION.md
```

**Detailed CSS paths, Next.js `@source` lines, and troubleshooting:** [INSTALLATION.md](./INSTALLATION.md).

## Quick Start

### Option 1: Package import (recommended)

#### Next.js

1. **Import CSS** in `app/globals.css` (or equivalent):

```tsx
// app/globals.css
@import "tailwindcss";
@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

@import "@nqlib/nqui/styles";
```

1. **Use components:**

```tsx
"use client";

import { Button } from '@nqlib/nqui';

export default function Page() {
  return <Button>Click me</Button>;
}
```

Pages using nqui must use `"use client"` where required (hooks).

**Local linking:** with `npm link` or `file:`, you may need Webpack instead of Turbopack:

```json
{
  "scripts": {
    "dev": "next dev --webpack"
  }
}
```

See [Troubleshooting](#troubleshooting).

#### Vite

1. **CSS** in `src/index.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@nqlib/nqui/styles";

/* Add if styles from @nqlib/nqui look missing (see INSTALLATION.md §2c) */
@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";
```

Vite with `@tailwindcss/vite` often works without `@source`; add the block above when utilities from the package do not show up in CSS.

1. **Components:**

```tsx
import { Button } from '@nqlib/nqui';

function App() {
  return <Button>Click me</Button>;
}
```

### Option 2: `init-css` helper

```bash
npx @nqlib/nqui init-css
```

Detects Next.js, Vite, Remix, etc., and scaffolds CSS entry files; see [INSTALLATION.md](./INSTALLATION.md) for wiring the import into your main stylesheet.

## Setup requirements

### Tailwind CSS

nqui expects Tailwind CSS v4:

```bash
npm install tailwindcss@^4.1.0
```

**Vite** — add the plugin:

```bash
npm install @tailwindcss/vite
```

```ts
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

### Optional: debug tools

```bash
npx @nqlib/nqui init-debug-css
```

```tsx
import { DebugPanel } from '@nqlib/nqui';
import '@nqlib/nqui/debug.css';

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </>
  );
}
```

## Component instructions

Guides for each component live under `docs/components/` in the package (after install: `node_modules/@nqlib/nqui/docs/components/`). Use `**npx @nqlib/nqui init-skills**` (or `init-cursor`) so your IDE loads `.cursor/nqui-skills` and `AGENTS.md`.

### Examples

```tsx
import { Button, Checkbox, Input } from '@nqlib/nqui';

function MyForm() {
  return (
    <form>
      <Input placeholder="Enter text" />
      <Checkbox label="Accept terms" />
      <Button variant="default">Submit</Button>
    </form>
  );
```

```tsx
import { Button, Separator } from '@nqlib/nqui';

function MyComponent() {
  return (
    <>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
      <Separator variant="shadow-outset" />
    </>
  );
}
```

```tsx
import { ColorPicker, Rating, TableOfContents } from '@nqlib/nqui';

function MyApp() {
  return (
    <>
      <ColorPicker value="oklch(0.75 0.15 240)" onChange={handleChange} />
      <Rating value={4} onChange={setRating} />
      <TableOfContents items={tocItems} />
    </>
  );
}
```

## Framework support

- **Next.js** (App Router)
- **Vite**
- **Remix**
- **Create React App**

Components are framework-agnostic for any React setup.

## Troubleshooting

### `@source`: Next.js vs Vite

- **Next.js** needs `@source` lines so Tailwind sees app and `node_modules/@nqlib/nqui` — see the Quick Start block above.
- **Vite** often works without extra `@source` lines; if components look unstyled, use the same three `@source` paths after `@import "@nqlib/nqui/styles";` ([INSTALLATION.md](./INSTALLATION.md) §2c).

### Module resolution (Next.js 16+, local packages)

If `@nqlib/nqui` fails to resolve with `npm link` / `file:`:

```json
{
  "scripts": {
    "dev": "next dev --webpack"
  }
}
```

Production builds use Webpack; this mainly affects local dev with symlinks.

More tips: [instructions.md](./instructions.md).

## Features

- **UI components** — Buttons, forms, layout, data display, overlays, with consistent variants
- **Custom components** — e.g. ColorPicker, Rating, TableOfContents
- **Debug tools** — optional `DebugPanel` in development
- **TypeScript** — exported types
- **Accessible** — Radix UI primitives
- **Theming** — CSS variables
- **Tree-shakeable** — import only what you use

## Documentation

- [INSTALLATION.md](./INSTALLATION.md) — CSS setup, CLI details, monorepos
- [Debug tools](./src/components/debug/README.md) — debug panel
- [CHANGELOG.md](./CHANGELOG.md) — release history

## Publishing (maintainers)

```bash
npm version patch|minor|major
npm run publish:npm
```

GitHub Packages: `npm run publish:github`. Both: `npm run publish:both`.

Details: [internal-notes/PUBLISHING.md](./internal-notes/PUBLISHING.md).

## License

MIT