# nqui – Installation & CLI reference

Developer guide: what runs on install, available commands, and the recommended setup sequence.

---

## What runs on `npm install`

When you add `@nqlib/nqui` to a project and run `npm install` (or pnpm/yarn/bun):

1. **Postinstall script** runs: `node scripts/post-install.js` (same as `npx @nqlib/nqui setup`).
2. **Behavior:**
  - If your project has a `package.json` and no `nqui:init` script, a `**nqui:init`** script is added to run the full setup in one command.
  - **Cursor rules** are written into your project’s `.cursor/` directory:
    - `.cursor/rules/nqui-components.mdc`
    - `.cursor/skills/nqui-install/`
    - `.cursor/skills/nqui-components/`
  - A **next-steps message** is printed (run `npx nqui-setup` anytime to see it again).
3. **Not done on install:** Peer packages are not installed, `.cursor/nqui-skills/` is not created, and CSS is not set up. Run the full setup (see below) for that.
4. **CI:** Postinstall is skipped when `CI=true` or `CI=1`.

---

## CLI commands

All commands are run from your **project root** (where `package.json` lives).


| Command                                         | Description                                                                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx @nqlib/nqui setup`                         | Re-run postinstall: print next steps and write Cursor rules (no peers/skills/CSS). Same as `npx nqui-setup`.                                       |
| `npx @nqlib/nqui install-peers`                 | Install `@nqlib/nqui` and all required + optional peer dependencies (icons, cmdk, dnd-kit, etc.).                                                  |
| `npx @nqlib/nqui init-cursor`                   | Write `.cursor/rules` and `.cursor/skills`, and **download nqui-skills** (copy `docs/nqui-skills` → `.cursor/nqui-skills`, create `AGENTS.md`).    |
| `npx @nqlib/nqui init-skills`                   | Only download skills: copy to `.cursor/nqui-skills`, (re)create `AGENTS.md`. Use `--force` to overwrite.                                           |
| `npx @nqlib/nqui init-css`                      | Detect framework, create `nqui/index.css` and `nqui/nqui-setup.css`, optionally copy example layouts. Options: `--sidebar`, `--force`, `--wizard`. |
| `npx @nqlib/nqui` *(no args)*                   | Runs **init-css** with default output `nqui/index.css`.                                                                                            |
| `npx @nqlib/nqui init-debug` / `init-debug-css` | Initialize debug CSS for `DebugPanel`.                                                                                                             |
| `npm run nqui:init`                             | One-shot full setup (only after install added the script): install-peers → init-cursor → init-skills → init-css --sidebar --force.                 |


**Monorepos:** Cursor rules and skills are written to the package that has `@nqlib/nqui` in `node_modules` or in its `package.json`. Open that package folder in Cursor for skills to resolve.

---

## Recommended sequence

### Option A: One command (after install)

If postinstall added the script:

```bash
npm run nqui:init
```

This runs: **install-peers** → **init-cursor** → **init-skills** → **init-css --sidebar --force**.

Then **manually** add the nqui CSS import to your main CSS file (see [Step 2: Setup CSS](#step-2-setup-css-required) below).

### Option B: Step by step

```bash
# 1. Install nqui (or use install-peers for optional feature deps)
npm install @nqlib/nqui
# or: npx @nqlib/nqui install-peers

# 2. Cursor rules + nqui-skills
npx @nqlib/nqui init-cursor

# 3. (Optional) Refresh skills only
npx @nqlib/nqui init-skills

# 4. CSS setup
npx @nqlib/nqui init-css --sidebar
# Then add the import to your main CSS (see Step 2 below)
```

---

## Requirements

- **React 18 or 19** (peer: `^18.0.0 || ^19.0.0`)
- **Tailwind CSS v4**
- **Node.js** per your framework

---

## Step 1: Install nqui + peers

**Minimal:**

```bash
npm install @nqlib/nqui
```

Icons are bundled as inline SVG in nqui components.

**Full (all optional peers for Sortable, Carousel, DataTable, Calendar, etc.):**

```bash
npx @nqlib/nqui install-peers
```

---

## Step 2: Setup CSS (required)

### 2a. Run init-css

```bash
npx @nqlib/nqui init-css
```

Creates:

- `nqui/index.css` — imports `@nqlib/nqui/styles`
- `nqui/nqui-setup.css` — framework-specific Tailwind + nqui snippet

### 2b. Add import to main CSS (manual)

Add the nqui import to your **main CSS file**:


| Framework | Main CSS file     |
| --------- | ----------------- |
| Next.js   | `app/globals.css` |
| Vite      | `src/index.css`   |
| Remix     | `app/root.css`    |


**Option A (recommended):** After `@import "tailwindcss"`:

```css
@import "@nqlib/nqui/styles";
```

**Option B:** Copy the **entire contents** of `nqui/nqui-setup.css` to the **very top** of your main CSS file.

### 2c. Vite + Tailwind v4

With `@tailwindcss/vite`, Tailwind usually scans your app files automatically. If **components look unstyled**, **spacing or button classes from `@nqlib/nqui` are missing**, or utilities used only inside the installed package do not appear in CSS, add these `**@source` lines after** `@import "@nqlib/nqui/styles";` in your main stylesheet (paths are relative to that CSS file — adjust if your entry is not `src/index.css`):

```css
@import "@nqlib/nqui/styles";

@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";
```

Example layout: `src/index.css` → `../components` is `src/components`, `../node_modules` is the project root `node_modules`.

### 2d. Next.js + Tailwind v4

Include these in your main CSS:

```css
@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";
```

### 2e. Custom path

```bash
npx @nqlib/nqui init-css app/styles/nqui.css
```

---

## Step 3: Use components

```tsx
import { Button, Input, Card } from "@nqlib/nqui";
```

Next.js App Router pages that use nqui need `"use client"`.

---

## Step 4: Debug tools (optional)

```bash
npx @nqlib/nqui init-debug-css
```

Then in your app:

```tsx
import { DebugPanel } from "@nqlib/nqui";
import "./nqui-debug.css"; // or path from init-debug-css

// In your root/layout: render when NODE_ENV === 'development'
<DebugPanel />
```

---

## Step 5: Cursor / IDE rules

On install, basic rules are written to `.cursor/rules/nqui-components.mdc`. For the full **nqui-skills** set (`.cursor/nqui-skills/` and `AGENTS.md`), run:

```bash
npx @nqlib/nqui init-cursor
```

Component docs index: `node_modules/@nqlib/nqui/docs/components/README.md`.

---

## Optional: Local vs published nqui

To switch between a **local** (linked) build and the **published** npm package during development, you can add a `scripts/toggle-nqui.js` script to your app and wire it to your `dev` script. This is optional and not created by nqui. See the nqui skill **nqui-local-published-toggle** for the script and usage (e.g. `USE_LOCAL_NQUI=true node scripts/toggle-nqui.js && next dev`).

---

## Troubleshooting

**"Module not found: '@nqlib/nqui/styles'" or CSS not loading**

1. Run `npx @nqlib/nqui init-css`.
2. Add `@import "@nqlib/nqui/styles";` near the **top** of your main CSS file.
3. Ensure it appears **before** other app styles.

**Components render without styles**

Your main CSS is missing the nqui import. Add `@import "@nqlib/nqui/styles";` or paste the contents of `nqui/nqui-setup.css` at the top of your main CSS.

**Vite: broken layout, missing spacing, or button styles**

1. Confirm `@import "@nqlib/nqui/styles";` is present and `@tailwindcss/vite` is in `vite.config.ts`.
2. Add the `**@source` directives** from [§2c Vite + Tailwind v4](#2c-vite--tailwind-v4) so Tailwind scans your app and `node_modules/@nqlib/nqui/dist`.

**Debug Panel not showing**

- Ensure `NODE_ENV !== 'production'`.
- Import the debug CSS and render `<DebugPanel />` in your app tree.

**Package name**

Use `@nqlib/nqui` (the published package name).