# Export Structure Documentation

This document explains the centralized export structure for the Nqui library.

## Centralized Index Files

### 1. `/hooks/index.ts` - All React Hooks
Central export point for all hooks:

```typescript
export { useDetectTouch } from "./use-detect-touch"
export { useOnWindowResize } from "./use-on-window-resize"
export { useChartHighlight } from "./use-chart-highlight"
export type { ChartHighlightState, UseChartHighlightOptions } from "./use-chart-highlight"
export { useScrollSpy } from "./use-scroll-spy"
export { useIsMobile } from "./use-mobile"
```

**Usage:**
```typescript
// Instead of:
import { useChartHighlight } from "@/hooks/use-chart-highlight"
import { useOnWindowResize } from "@/hooks/use-on-window-resize"

// Use:
import { useChartHighlight, useOnWindowResize } from "@/hooks"
```

### 2. `/utils/index.ts` - Chart Utilities
Central export point for all chart-related utilities:

```typescript
export * from "./chart-colors"
export * from "./chart-utils"
export * from "./get-y-axis-domain"
export * from "./focus-ring"
export * from "./chart-highlight"
```

**Usage:**
```typescript
// Instead of:
import { calculateHighlightOpacity } from "@/utils/chart-highlight"
import { constructCategoryColors } from "@/utils/chart-colors"

// Use:
import { calculateHighlightOpacity, constructCategoryColors } from "@/utils"
```

### 3. `/components/chart/index.ts` - Chart Components
Central export point for all chart components:

```typescript
export { AreaChart } from "./area-chart"
export { BarChart } from "./bar-chart"
export { LineChart } from "./line-chart"
// ... etc
```

**Usage:**
```typescript
import { AreaChart, BarChart, LineChart } from "@/components/chart"
```

### 4. `/index.ts` - Main Library Entry Point
Main entry point that re-exports from centralized indexes:

```typescript
// Utilities
export { cn } from "./lib/utils"
export * from "./utils"  // All chart utilities

// Hooks
export * from "./hooks"  // All hooks

// Components
export { AreaChart, BarChart, ... } from "./components/chart"
// ... all other components
```

**Usage:**
```typescript
// Everything from main index:
import { 
  useChartHighlight, 
  calculateHighlightOpacity,
  BarChart,
  Button 
} from "@/index"
```

## Benefits

1. **Single Source of Truth** - Each category has one index file
2. **Easy to Discover** - Check index files to see what's available
3. **Consistent Imports** - Same pattern across hooks, utils, components
4. **Maintainable** - Add new exports in one place
5. **Tree-shakeable** - Still works with bundlers for optimal bundle size

## Adding New Exports

### Adding a New Hook:
1. Create hook file: `/hooks/my-new-hook.ts`
2. Add to `/hooks/index.ts`: `export { myNewHook } from "./my-new-hook"`

### Adding a New Utility:
1. Create utility file: `/utils/my-new-utility.ts`
2. Add to `/utils/index.ts`: `export * from "./my-new-utility"`

### Adding a New Chart Component:
1. Create component in `/components/chart/my-chart/`
2. Add to `/components/chart/index.ts`: `export { MyChart } from "./my-chart"`

## Import Patterns

**Recommended:**
```typescript
// From main index (most common)
import { useChartHighlight, BarChart } from "@/index"

// From specific index (when you only need one category)
import { useChartHighlight } from "@/hooks"
import { calculateHighlightOpacity } from "@/utils"
import { BarChart } from "@/components/chart"
```

**Avoid:**
```typescript
// Direct file imports (breaks centralization)
import { useChartHighlight } from "@/hooks/use-chart-highlight"
import { calculateHighlightOpacity } from "@/utils/chart-highlight"
```
