# Debug Tools

A collection of developer tools for debugging and inspecting React applications. These tools are designed to be easily extracted into a separate package for distribution.

## Activation and production bundles

- **Default behavior:** `DebugPanel` renders a small floating control that does **nothing** until the user opens it and enables tools. You can mount `<DebugPanel />` without `process.env.NODE_ENV` or `import.meta.env.DEV` if that matches your product (same pattern as the nqui showcase `AppLayout`).
- **Optional dev-only import:** To keep debug code out of production bundles, import from the separate entry and only reference it in dev code paths, e.g. `import { DebugPanel } from "@nqlib/nqui/debug"` (see `packages/nqui/src/entries/debug.ts`).
- **`NODE_ENV` / `import.meta.env.DEV`:** Wrapping `<DebugPanel />` in an environment check remains valid when you want an extra guard; it is **not required** for safety if users never open the panel.

## Feature inspectors (layout / libraries)

- **Hit areas:** When **Hit areas** is enabled in the Tools → Other Tools section, the panel scans the document for Bazza-style `hit-area-*` classes (see [hit-area](https://bazza.dev/craft/2026/hit-area)) and temporarily adds `hit-area-debug` where needed so expanded targets are visible. A `MutationObserver` rescans after DOM/class changes (throttled with `requestAnimationFrame`). Injected highlights are tracked with `data-nqui-debug-hit-area-injected` and removed when the toggle is turned off.
- **8px pixel grid:** The **8px pixel grid** toggle is a fixed background alignment grid; it is **not** a CSS Grid layout inspector (future work).

Shared helpers live in `debug-features.ts` (`buildLegacyDebugCss`, `createHitAreaDebugController`, overlay-root helpers for future visualizers).

## Implementation

### Installation

When published as a package, installation would be:

```bash
npm install @nqui/debug-tools
# or
pnpm add @nqui/debug-tools
# or
yarn add @nqui/debug-tools
```

### Peer Dependencies

The package requires these peer dependencies:

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@nqui/core": "^1.0.0",
    "lucide-react": "^0.263.0"
  }
}
```

### Basic Embedding

**Option A: Inactive until opened (recommended)**

The panel only activates after the user opens it; no environment check required:

```tsx
import { DebugPanel } from "@nqlib/nqui"

function App() {
  return (
    <>
      <YourAppContent />
      <DebugPanel />
    </>
  )
}
```

**Option B: Dev-only bundle (tree-shaking)**

Import from the debug entry so production builds can omit the module when not referenced:

```tsx
import { DebugPanel } from "@nqlib/nqui/debug"

// Use only in dev routes/layouts or behind import.meta.env.DEV if you choose
```

**Option C: Optional `NODE_ENV` / `import.meta.env.DEV` guard**

```tsx
import { DebugPanel } from "@nqlib/nqui"

function App() {
  return (
    <>
      <YourAppContent />
      {import.meta.env.DEV ? <DebugPanel /> : null}
    </>
  )
}
```

**Option D: Feature flag (e.g. Vite)**

```tsx
import { DebugPanel } from "@nqlib/nqui"

function App() {
  const showDebugTools = import.meta.env.VITE_ENABLE_DEBUG_TOOLS === "true"
  return (
    <>
      <YourAppContent />
      {showDebugTools ? <DebugPanel /> : null}
    </>
  )
}
```

### CSS/Design System Setup

The debug tools need access to your design system CSS variables.

**If using @nqui/core (recommended):**

```tsx
// The debug tools automatically use CSS variables from @nqui/core
// Just ensure your app imports the CSS:
import "@nqui/core/styles.css"  // or your main CSS file
import { DebugPanel } from "@nqui/debug-tools"
```

**Standalone with Custom CSS Variables:**

If extracted as a completely independent package, users would need to provide CSS variables:

```css
/* users would need to define these in their CSS */
:root {
  --popover: oklch(...);
  --popover-foreground: oklch(...);
  --border: oklch(...);
  --foreground: oklch(...);
  --background: oklch(...);
  --primary: oklch(...);
  --primary-foreground: oklch(...);
  /* ... all design tokens */
}
```

### Complete Setup Example

```tsx
// src/main.tsx or src/App.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'  // Your design system CSS

import { DebugPanel } from "@nqlib/nqui"

function Root() {
  return (
    <BrowserRouter>
      <App />
      <DebugPanel />
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
```

### Advanced: Provider Pattern (Optional)

For more control, you could create a provider:

```tsx
// packages/debug-tools/src/DebugProvider.tsx
import { createContext, useContext, ReactNode } from 'react'
import { DebugPanel } from './debug-panel'

interface DebugConfig {
  enabled: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  // ... other config
}

const DebugContext = createContext<DebugConfig | null>(null)

export function DebugProvider({ 
  children, 
  enabled = false,
  ...config 
}: { 
  children: ReactNode 
} & DebugConfig) {
  return (
    <DebugContext.Provider value={{ enabled, ...config }}>
      {children}
      {enabled && <DebugPanel />}
    </DebugContext.Provider>
  )
}

export function useDebug() {
  return useContext(DebugContext)
}
```

Usage:

```tsx
import { DebugProvider } from "@nqui/debug-tools"

function App() {
  return (
    <DebugProvider enabled={import.meta.env.DEV /* optional; can use true if panel-only gating is enough */}>
      <YourAppContent />
    </DebugProvider>
  )
}
```

### Package.json Structure (When Published)

```json
{
  "name": "@nqui/debug-tools",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/styles.css"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@nqui/core": "^1.0.0",
    "lucide-react": "^0.263.0"
  },
  "files": [
    "dist"
  ]
}
```

## Components

### DebugPanel
The main debug panel that provides a floating UI for accessing various debug tools.

**Features:**
- **Hit areas**: Scans for `hit-area-*` utilities and applies Bazza `hit-area-debug` while enabled (with DOM rescan)
- **Show Borders**: Toggle to display red outlines around all elements
- **Show Shadows**: Toggle to display blue outlines showing box shadows
- **8px pixel grid**: Toggle to display a fixed 8px background grid (not a CSS Grid inspector)
- **Magnifier**: Zoom tool for inspecting elements (see below)
- **Element Inspector**: Shows detailed information about the element under the magnifier cursor
- **Draggable**: The debug button can be dragged to reposition
- **Persistent Position**: Button position is saved to localStorage

**Usage:**
```tsx
import { DebugPanel } from "@/components/debug"

function App() {
  return (
    <>
      <YourApp />
      <DebugPanel />
    </>
  )
}
```

### Magnifier
A CSS-based magnifying glass that zooms in on content under the cursor.

**Features:**
- **High Performance**: Uses CSS transforms and DOM cloning (no canvas)
- **Layout Aware**: Automatically adjusts when sidebar/layout changes
- **Smart Hiding**: Hides when cursor is over debug UI to avoid interference
- **Configurable Zoom**: Adjustable zoom level (1x to 10x)
- **Element Detection**: Can notify parent of element under cursor
- **Responsive**: Works with dynamic layouts and responsive designs

**Props:**
```tsx
interface MagnifierProps {
  enabled: boolean        // Enable/disable the magnifier
  zoom?: number          // Zoom level (default: 3)
  size?: number          // Size of magnifier circle in px (default: 200)
  onElementChange?: (element: HTMLElement | null) => void  // Callback when element under cursor changes
}
```

**Usage:**
```tsx
import { Magnifier } from "@/components/debug"

function MyComponent() {
  const [enabled, setEnabled] = useState(false)
  
  return (
    <>
      <button onClick={() => setEnabled(!enabled)}>
        Toggle Magnifier
      </button>
      <Magnifier 
        enabled={enabled}
        zoom={3}
        size={200}
        onElementChange={(element) => {
          console.log('Element under cursor:', element)
        }}
      />
    </>
  )
}
```

## Architecture

### How the Magnifier Works

1. **DOM Cloning**: Creates a deep clone of `document.body` when visible
2. **CSS Transforms**: Uses `transform: scale()` and `translate()` to zoom content
3. **Clip Path**: Uses `clip-path: circle()` to create the circular magnifier effect
4. **Layout Tracking**: Monitors sidebar state and recreates clone when layout changes
5. **Smart Cleanup**: Removes magnifier elements from clone to avoid recursion

### Key Design Decisions

- **CSS-based**: No canvas rendering, uses native browser capabilities
- **Clone on Demand**: Only clones DOM when magnifier is visible
- **Layout Synchronization**: Automatically handles dynamic layout changes
- **Non-intrusive**: Hides when over debug UI to allow normal interactions

## Future Expansion

This folder is designed to be easily extracted into a separate package. Potential additions:

- **Performance Monitor**: FPS, render times, component re-render tracking
- **Network Inspector**: API call monitoring and debugging
- **State Inspector**: Redux/Zustand state visualization
- **Accessibility Checker**: WCAG compliance checking
- **Color Picker**: Extract colors from elements
- **Layout Inspector**: Show flexbox/grid overlays
- **Console Overlay**: In-page console for mobile debugging

## Extraction Plan

To extract this into a separate package:

1. **Create new repo**: `nqui-debug-tools` or similar
2. **Copy this folder**: Move `src/components/debug/` to new package
3. **Update `dependencies.ts`**: This is the ONLY file that needs import changes!
   - Change imports from `@/index` to your package name or peer dependencies
   - Example: `export { Button } from "@your-org/nqui"` or bundle minimal versions
4. **Create package.json**: Set up as npm package with peer dependencies
5. **Add TypeScript**: Ensure types are exported
6. **Documentation**: Create README and usage examples

## Dependencies

All external dependencies are centralized in `dependencies.ts`. This makes extraction trivial:

**Current dependencies (listed in `dependencies.ts`):**
- React (peer dependency)
- lucide-react (icons - direct import)
- UI components from `@/index` (Button, Switch, Label, Slider)
- `@/lib/utils` (cn utility)

**Key Design:**
- All debug components import from `./dependencies` instead of direct imports
- When extracting, only `dependencies.ts` needs to be updated
- No need to search/replace across the entire codebase

## File Structure

```
debug/
├── README.md           # This file
├── index.ts            # Public exports
├── debug-features.ts   # Hit-area inspector, legacy CSS builders, overlay helpers
├── dependencies.ts     # Centralized dependency imports (KEY FILE for extraction)
├── debug-panel.tsx     # Main debug panel UI
├── magnifier.tsx       # Magnifier component
├── crosshair.tsx       # Crosshair component
└── types.ts           # Shared TypeScript types (future)
```

### dependencies.ts

This is the **most important file** for extraction. It centralizes all external dependencies:

```typescript
// Current (in nqui repo):
export { Button, Switch, Label, Slider } from "@/index"
export { cn } from "@/lib/utils"

// After extraction (separate package):
export { Button, Switch, Label, Slider } from "@your-org/nqui"  // or peer deps
export { cn } from "./utils/cn"  // or bundled utility
```

**Benefits:**
- Single file to update when extracting
- Clear documentation of all dependencies
- Easy to swap implementations (e.g., use Radix primitives)

