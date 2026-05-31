# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **InlineTabsList** — Horizontal overflow uses nqui **ScrollArea** with `hideScrollbar` instead of native `overflow-x-auto`.
- **ScrollArea** — Scrollbar track width increased from 6px to 8px; thumb gets a minimum grab size for easier dragging.

## [0.6.3] - 2026-05-20

### Added

- **Inline tabs** — `InlineTabsList`, `InlineTabsTrigger`, `inlineTabsListClass`, `inlineTabsTriggerClass`, `inlineTabsPanelsClass` for pill tabs inside page-level scrollers. Preserves scroll position and tab-bar viewport anchor when switching tabs (Radix focus scroll + short panel collapse). See `docs/components/nqui-tabs.md`.

## [0.6.2] - 2026-05-18

### Fixed

- **`dist/styles.css` publish regression (0.6.1)** — `build-styles.js` now inlines all `src/styles/*.css` partials (`colors`, `motion`, `shadows`, `z-index`, `hit-area`). Packaged CSS no longer contains `@import "./styles/..."` paths that are absent from the npm tarball. `verify:build` runs after `build:styles` and fails if any unbundled style imports remain.

## [0.6.1] - 2026-05-18

### Fixed

- **Command palette / cmdk rows (React 19)** — `floatingListItemInteractive` now uses `aria-selected:bg-accent` instead of `data-selected:bg-accent`. Unselected cmdk items render `data-selected="false"` in React 19; the old `[data-selected]` selector highlighted every row. `CommandShortcut` uses `group-aria-selected/command-item` for the same reason.

## [0.6.0] - 2026-05-17

### Added

- **Composition skills** — `COMPOSITION.md`, `nqui-composition` skill (Apple-inspired craft: clarity, deference, depth), expanded agent docs (`HUMAN_GUIDE`, `READ_BUDGET`, `ELEVATION`, `COMPONENTS_INDEX`).
- **Showcase recipes** — Recipes hub (`/`), commerce patterns (`/patterns`), settings recipe (`/recipes/settings`); `showcase-nav.ts` SSOT for sidebar and command palette.
- **CLI** — `npx @nqlib/nqui init-claude-skills` copies skills to `~/.claude/skills/` for Claude Code / Desktop.

### Changed

- **Showcase app** — Task-based navigation (Recipes / Catalog / Tokens); removed fake mail routes; catalog is API reference only.
- **Light theme cards** — Warmer `--card` surface and `.nqui-card` elevation tuned for light mode.

### Fixed

- **Dev app** — Removed broken `@nqlib/nqcode` / `@nqlib/nqappbuilder` imports from showcase; Vite dev builds without unpublished sibling packages.
- **Primary / token balance** — Refined OKLch primary ladder and theme tokens (see `styles/colors.css`).

## [0.5.6] - 2026-04-30

### Changed

- **Primary scale** (`styles/colors.css`) — Light mode blues slightly subdued (lower **L** / slightly lower chroma on saturated stops). Dark mode ladder lowered further (**500**/**600** especially) with trimmed chroma so `--primary` reads less neon on dark surfaces; documented OKLch ladder semantics in the file header.
- **`scripts/build-styles.js`** — Packaged `dist/styles.css` merges `:root` / `.dark` from `colors.css` and `index.css` only (removed optional primary-preset merge path).
- **Light theme** — Warmer paper-style neutrals (including Claude-adjacent `#FAF9F5`-style background), stronger sidebar rail / hover separation, and aligned surface tokens.
- **Theming** — `mid` theme removed; showcase / Storybook / app entry use **light** and **dark** only.
- **Card** — Single `nqui-card` surface API; elevation CSS uses `.nqui-card` for packaged styles.

### Fixed

- **`scripts/publish-npmjs.js`** — Preflight check via `npm view` fails fast when the package version is already published (avoids misleading retries on `E403`).
- **Sidebar** — `outline` menu variant uses `bg-transparent` and `var(--sidebar-border)` / `var(--sidebar-accent)` rings (OKLCH-safe; avoids matching page `background`).

## [0.5.4] - 2026-04-23

### Changed

- **Publish script** — `scripts/publish-npmjs.js` retries `npm publish` a few times with backoff (configurable via `NPM_PUBLISH_RETRIES`, default 3) and prints TLS/network troubleshooting for errors like `ERR_SSL_SSL/TLS_ALERT_BAD_RECORD_MAC`.

## [0.5.3] - 2026-04-22

### Fixed

- **Styles** — Removed the trailing block comment after `.dark` in `index.css` and shortened the comment above `:root` so Tailwind / Lightning CSS no longer mangle or warn on comment text involving `:root` / `html.light` (consuming apps can drop any `pnpm patch` that only addressed this).

## [0.5.2] - 2026-04-22

### Added

- `**lib/floating-surface.ts**` — Shared `floatingSurface` (panel) and `floatingListItemInteractive` (menu / list rows) for popover-like UIs.

### Changed

- **Floating panels** — **Popover**, **DropdownMenu**, **Select** content, **ContextMenu**, **Menubar**, **NavigationMenu** viewport, **Combobox** content, **Command**, and **HoverCard** use the shared surface tokens. List rows use consistent **accent** highlight (plus Radix `data-[highlighted]` and cmdk `data-selected`). Panel chrome is intentionally light: **one** `border` and `**shadow-sm`** (no stacked `ring` + heavy `shadow-md`).
- **Select** — Dropdown panel uses solid `**bg-popover`** (FrostedGlass removed from the listbox shell).
- **CommandDialog** — **Dialog** shell is **transparent** (`border-0`, `ring-0`, `shadow-none`) so **Command** provides the single visible surface; inner **Command** uses `rounded-lg` to match other panels.
- **Hugeicons** — `@hugeicons/core-free-icons` **^4.1.0** (from 3.x) and `@hugeicons/react` **^1.1.6**; peer `**@hugeicons/core-free-icons`** is now **^4.1.0** (consumers on v3 should upgrade). Monorepo packages that pinned Hugeicons were aligned.

### Fixed

- **Postinstall / `init-cursor`:** `buildCursorRule` is implemented again — reads `scripts/cursor-rule-nqui-components.mdc` (shipped in the package) with a monorepo fallback to `.cursor/rules/nqui-components.mdc`. Resolves `The requested module './skill-templates.js' does not provide an export named 'buildCursorRule'`.

## [0.5.1] - 2026-04-20

### Added

- **Showcase themes** — Third mode `**mid`** alongside `**light`** and `**dark**`: `next-themes` includes `**mid**`, sidebar cycles **light → mid → dark** with **Light / Mid / Dark** labels matching stored ids. `**.mid`** surface tokens in CSS (warmer, dimmer than `:root` paper).
- `**light:`** custom variant — Matches `**.light**` and `**.mid**` so existing non-dark Tailwind utilities apply when **mid** is active.

### Changed

- `**showcase-theme`** — Cycle helper `**nextShowcaseTheme()`**, `**SHOWCASE_THEME_CYCLE**`, and accurate `**getShowcaseThemeLabel()**` for all three ids.
- **Showcase `ThemeProvider`** — Migrates only legacy `**system**` to `**light**` (stored `**mid**` is kept).
- `**useResolvedTheme**` — Docstring: `**mid**` resolves to `**light**` for binary light/dark logic.

### Fixed

- `**ThemeToggle**` (exported) — Remains **light ↔ dark** only so two-theme apps are not forced onto `**mid`**; `**mid`** still shows the non-dark icon when active.

## [0.5.0] - 2026-04-19

### Added

- **Docs / skills** — `docs/nqui-skills` restructured with hub `SKILL.md`, sub-skills (`nqui-components`, `nqui-design-system`, `nqui-shadcn`, bundle size, local/published toggle, install), `**HUMAN_GUIDE.md`** (task → docs), and `**COMPONENTS_INDEX.md`** (token-efficient routing).
- `**init-skills**` — Copies `docs/components` into `.cursor/nqui-skills/components/` alongside skills; `AGENTS.md` template updated.

### Changed

- **Component docs** — `docs/components/README.md` adds a **Start here (humans)** section; `**nqui-tooltip.md`** documents accessibility, touch, and alternatives (Popover / HoverCard / Alert).
- **Skills** — `nqui-components`: ToggleGroup vs RadioGroup semantics; accessibility & touch summary; fixed YAML frontmatter where corrupted. `nqui-design-system`: density & visual hierarchy; cleaned markdown; Card + ScrollArea section corrected.
- **Local/published toggle** — Example `PUBLISHED_VERSION` and dependency samples point at `**^0.5.0`**.

## [0.4.8] - 2026-04-10

### Fixed

- **Publish** — **0.4.7** was unpublished from npm; that version number cannot be reused on the public registry, so this release republishes the same codebase under **0.4.8**.

## [0.4.7] - 2026-04-09

### Changed

- **Packaging** — Maintainer-only `**internal-notes`** moved from `**docs/internal-notes/`** to `**packages/nqui/internal-notes/`** so it is not included in the published npm `**docs`** bundle. `**generate-docs.js**`, `**README**`, and **bundle-size** skill links updated.
- **Combobox** — Uses `**radix-ui`** Popover and `**cmdk`** `Command`; rows wrap shared `**CommandItem`**; `**aria-controls`** follows the real list id; optional `**debug**` (dev-only); Storybook interaction tests; removed direct `**@radix-ui/react-popover**` dependency.
- **Docs / skills** — **nqui-components** skill documents both monorepo (`packages/nqui/docs/components/`) and installed package (`node_modules/@nqlib/nqui/docs/components/`) paths; `**nqui-combobox.md`** troubleshooting expanded.

### Fixed

- **Combobox** — Mouse hover/click on rows when keyboard still worked: use `**aria-disabled:`** for disabled styling (avoid broad `**data-[disabled]:pointer-events-none`** on rows); hidden panel search `**sr-only`** wrapper + cmdk input `**pointer-events`** alignment.

## [0.4.5] - 2026-03-28

### Added

- **Mid theme** - `.mid` warm-paper surfaces with blue primary (hue 240) interpolated between light and dark primary scales; `@custom-variant mid`, showcase `ThemeProvider` / theme toggle, Storybook theme.

### Fixed

- **Publish** - New semver; **0.4.4** is already on the registry and cannot be overwritten.

## [0.4.4] - 2026-03-28

### Fixed

- **Publish** - Version bump only: npm forbids re-publishing the same semver; use **0.4.4** when **0.4.3** is already on the registry. No code changes from 0.4.3.

## [0.4.3] - 2026-03-27

### Changed

- **UI components** - Consolidated patterns across Button, Badge, Checkbox, Combobox, Select, Sonner, Spinner, Switch, Slider, Sheet, Drawer, Card, Carousel, Tabs, Toggle, ToggleGroup, Pagination, and Scroll Area (inline labels, sizing, and related behavior). Removed legacy `enhanced-`* wrappers from the public surface; import from `@nqlib/nqui` / `ui` paths as before.
- **ColorSlider / ColorPicker** - Tightened TypeScript types (`SliderProps` export on Slider; OKLCH slider callbacks and `rgbToOklch` cleanup).

### Added

- **Hit-area utilities** - `hit-area.css` and documented touch-target helpers aligned with the design system.
- **Debug** - Optional debug feature flags wiring for `DebugPanel` (`debug-features.ts`).

### Removed

- **Samples** - Login form block samples under shadcn-studio blocks (consumers should use their own auth UI).

### Fixed

- **Build** - `verify-build` no longer requires global viewport-lock rules in compiled CSS (viewport lock was removed from base styles in 0.3.3; opt-in via `AppLayout`).

### Docs

- Component skill docs (`docs/components`, `docs/nqui-skills`) updated for current APIs and patterns.

## [0.4.1] - 2026-02-23

### Fixed

- **Post-install skills injection** - Skills now write to project root (e.g. `frontend/.cursor/`) instead of `node_modules/@nqlib/nqui/`. Running from inside `node_modules` (as a dependency) correctly resolves the host project.

## [0.4.0] - 2026-02-23

### Changed (bundle size)

- **Code display extracted to @nqlib/nqcode** - CodeBlock, CodeEditor, Snippet, and Sandbox have been moved to a new package `@nqlib/nqcode`. Install with `pnpm add @nqlib/nqcode shiki @shikijs/transformers`. This reduces the nqui main bundle by ~92KB.
- Removed subpath export `@nqlib/nqui/code`. Use `@nqlib/nqcode` instead.
- **CodeBlockContentServer** (RSC/SSR) - Import from `@nqlib/nqcode/server` for Next.js Server Components.

### Removed (bundle size)

- **CodeEditor, Sandbox** - No longer exported from nqui. These components now live in `@nqlib/nqcode`.

### Added

- **Skills injection** - `npx @nqlib/nqui init-cursor` generates Cursor rules and skills for nqui component usage. Skills point to docs in `node_modules/@nqlib/nqui/docs/components/`.
- **init-cursor monorepo support** - `resolve-target-dir.js` detects workspace root and writes to the package that has `@nqlib/nqui` (e.g. `apps/frontend/`). Open that folder in Cursor for skills to work.

### Fixed

- **CLI dispatcher** - Main bin uses cli.js; `npx @nqlib/nqui init-cursor` routes to init-cursor (was invoking init-css with "init-cursor" as output path). `init-css` guard prints upgrade instructions when misused.
- **Post-install** - Skills message clarified; runs on install unless CI=1.
- **Publish to npm** - `publish-npmjs.js` strips `workspace:`* deps (@nqlib/nqcode, @nqlib/nqappbuilder) before publish so `npm install @nqlib/nqui` works without EUNSUPPORTEDPROTOCOL.

## [0.3.3] - 2026-02-17

### Changed

- **Viewport lock** - Removed from base styles (`@nqlib/nqui/styles`). Body scroll is now allowed by default. Use `AppLayout` for opt-in viewport lock when building dashboard-style apps; docs, marketing, and Fumadocs layouts work without overrides.

## [0.3.1] - 2026-02-10

### Changed

- **PM / Gantt** - Refactor around pm-definition, gantt contexts, sidebar, toolbar, modals, and types.
- **Keyboard** - Centralized key and shortcut handling in `lib/keyboard.ts` (Keys, isMod, shouldIgnoreKeyboardShortcut, SHORTCUT_KEYS); used in data grid, sidebar, charts, carousel.

### Fixed

- Chart, table, data-grid, and debug panel updates and fixes.
- UI components: carousel, resizable, sidebar.

## [0.3.0] - 2026-01-XX

### Added

- **FrostedGlass Component** - New reusable component for Apple-inspired frosted glass effects with extended backdrop technique (h-[200%]) for capturing reflections from nearby elements. Uses SVG mask for rounded corners and very light background for blur visibility. Based on Josh Comeau's method.
- **Card Component - Sticky Header Variant** - Added `stickyHeader` prop to Card component. When enabled, CardHeader becomes sticky with frosted glass effect, and CardContent becomes scrollable with fade mask. Content scrolls behind the header showing blur and reflections from nearby elements.
- **Enhanced Select** - Dropdown now features frosted glass effect with backdrop-filter showing reflections from nearby elements. Uses semi-transparent background (bg-popover/10) for optimal blur visibility.
- **SelectTrigger - minWidth Prop** - Added `minWidth` prop for consistent width control. Supports `"fit"` value for content-based width.

### Enhanced

- **AppLayout Header** - Enhanced with frosted glass backdrop-filter showing content behind. Sticky header with extended backdrop captures nearby element reflections.

### Fixed

- **TableOfContents** - Fixed scroll container integration for custom scroll contexts.

## [0.2.3] - 2026-01-16

### Fixed

- **Enhanced Calendar** - Fixed subtle square gray background appearing on the left half of the cell when only "from" date is selected in range mode. The issue was caused by the `range_end` class's `::after` pseudo-element being visible during single date selection.

## [0.2.2] - 2026-01-15

### Fixed

- **Round Checkbox** - Fixed round checkbox bug

## [0.2.0] - 2025-01-28

### Added

- **TableOfContents component** - A comprehensive table of contents component with three visual variants
  - Normal variant (Fumadocs-style)
  - Circuit variant (Clerk-style with continuous line)
  - Clerk variant (Enhanced with smooth curves and circle indicator)
  - Auto-detection of headings
  - Scroll spy with intersection observer
  - Persistent highlighting (remembers last active item)
  - Container scoping support
  - Manual TOC items support
  - Smooth animations and scrolling

### Enhanced

- **Enhanced Badge component** - Additional badge variants and styling options
- **Storybook integration** - Comprehensive Storybook setup with stories for UI and enhanced components

## [0.1.4] - 2025-01-27

### Added

- **CodeBlock component** - A comprehensive code display component with syntax highlighting
  - Support for multiple programming languages via Shiki
  - File selection dropdown for multi-file code blocks
  - Copy to clipboard functionality
  - Server-side rendering support (`CodeBlockContentServer`)
  - Customizable header with filename display
  - Theme-aware styling
  - Full TypeScript support with exported types

## [0.1.3] - Previous release

Initial release with core components and enhanced UI elements.