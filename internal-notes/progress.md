# Progress Component

The Progress component displays progress indicators with two distinct styles: a block-based segmented design (dash style) similar to GitHub's contribution graph, or a smooth continuous bar (solid style).

## Installation

```bash
npm install @nqlib/nqui
```

## Import

```tsx
import { Progress } from '@nqlib/nqui';
// Or import the base version:
import { CoreProgress } from '@nqlib/nqui';
```

## Basic Usage

### Dash Style (Default)

The dash style displays progress as discrete colored blocks:

```tsx
import { Progress } from '@nqlib/nqui';

export default function Example() {
  return <Progress value={75} variant="success" />;
}
```

### Solid Style

The solid style displays progress as a smooth continuous bar:

```tsx
import { Progress } from '@nqlib/nqui';

export default function Example() {
  return (
    <Progress 
      value={75} 
      variant="success" 
      style="solid" 
    />
  );
}
```

## Props


| Prop            | Type                                                      | Default                           | Description                                                            |
| --------------- | --------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `value`         | `number`                                                  | **required**                      | Progress value (0 to max)                                              |
| `max`           | `number`                                                  | `100`                             | Maximum value                                                          |
| `variant`       | `'default' | 'success' | 'warning' | 'error' | 'neutral'` | `'default'`                       | Color variant                                                          |
| `style`         | `'dash' | 'solid'`                                        | `'dash'`                          | Progress style/appearance                                              |
| `blocks`        | `number`                                                  | auto                              | Number of blocks to display (dash style only, 20-100)                  |
| `showTooltip`   | `boolean`                                                 | `false`                           | Show tooltip on hover showing progress percentage                      |
| `hoverEffect`   | `boolean`                                                 | `false`                           | Enable hover opacity effect on blocks (dash style only)                |
| `showAnimation` | `boolean`                                                 | `false`                           | Show animation transition when value changes                           |
| `label`         | `string`                                                  | -                                 | Optional label text to display next to progress bar (solid style only) |
| `height`        | `string`                                                  | `'h-8'` (dash) or `'h-2'` (solid) | Height override (Tailwind class or CSS value)                          |
| `className`     | `string`                                                  | -                                 | Additional CSS classes                                                 |


## Variants

Progress comes in five color variants:

```tsx
<Progress value={60} variant="default" />   // Primary color
<Progress value={60} variant="success" />  // Green
<Progress value={60} variant="warning" />  // Yellow
<Progress value={60} variant="error" />    // Red
<Progress value={60} variant="neutral" />  // Gray
```

## Styles

### Dash Style

The dash style displays progress as discrete blocks, similar to GitHub's contribution graph. Blocks are auto-calculated based on container width, or you can specify a custom count.

```tsx
// Auto-calculated blocks (default)
<div className="w-96">
  <Progress value={60} variant="success" />
</div>

// Custom block count
<Progress value={60} blocks={50} variant="success" />

// With hover effect
<Progress 
  value={60} 
  variant="success" 
  hoverEffect 
/>

// With tooltip
<Progress 
  value={60} 
  variant="success" 
  showTooltip 
/>
```

### Solid Style

The solid style displays progress as a smooth continuous bar with rounded corners.

```tsx
// Basic solid bar
<Progress value={75} variant="success" style="solid" />

// With label
<Progress 
  value={75} 
  variant="success" 
  style="solid" 
  label="75% Complete" 
/>

// With animation
<Progress 
  value={progress} 
  variant="success" 
  style="solid" 
  showAnimation 
/>

// Custom height
<Progress 
  value={75} 
  variant="success" 
  style="solid" 
  height="h-4" 
/>
```

## Examples

### Dash Style Examples

#### Auto-calculated Blocks

The component automatically calculates the optimal number of blocks based on container width:

```tsx
<div className="w-64">
  <Progress value={60} variant="default" />
</div>

<div className="w-96">
  <Progress value={60} variant="success" />
</div>

<div className="w-full max-w-2xl">
  <Progress value={60} variant="warning" />
</div>
```

#### Custom Block Count

Specify a custom number of blocks (between 20-100):

```tsx
// Sparse (20 blocks)
<Progress value={60} blocks={20} variant="success" />

// Default density (50 blocks)
<Progress value={60} blocks={50} variant="success" />

// Dense (100 blocks)
<Progress value={60} blocks={100} variant="success" />
```

#### With Tooltip

Show progress percentage on hover:

```tsx
import { TooltipProvider } from '@nqlib/nqui';

<TooltipProvider>
  <Progress 
    value={65} 
    variant="success" 
    showTooltip 
  />
</TooltipProvider>
```

#### With Hover Effect

Enable opacity effect on blocks when hovering:

```tsx
<Progress 
  value={70} 
  variant="default" 
  hoverEffect 
/>
```

#### Custom Heights

```tsx
<Progress value={60} height="h-4" variant="success" />   // Small
<Progress value={60} height="h-6" variant="success" />   // Medium
<Progress value={60} height="h-8" variant="success" />   // Default
<Progress value={60} height="h-12" variant="success" />  // Large
<Progress value={60} height="2rem" variant="success" />  // Custom CSS
```

### Solid Style Examples

#### Basic Solid Bar

```tsx
<Progress value={75} variant="success" style="solid" />
```

#### With Label

```tsx
<Progress 
  value={75} 
  variant="success" 
  style="solid" 
  label="75%" 
/>
```

#### With Animation

Animate value changes smoothly:

```tsx
import { useState } from 'react';

function AnimatedProgress() {
  const [progress, setProgress] = useState(50);

  return (
    <Progress 
      value={progress} 
      variant="success" 
      style="solid" 
      showAnimation 
    />
  );
}
```

#### Different Progress Values

```tsx
<Progress value={0} variant="default" style="solid" />    // 0%
<Progress value={25} variant="success" style="solid" />   // 25%
<Progress value={50} variant="warning" style="solid" />   // 50%
<Progress value={75} variant="success" style="solid" />  // 75%
<Progress value={100} variant="success" style="solid" />  // 100%
```

## Controlled Progress

Use controlled state to update progress dynamically:

```tsx
import { useState } from 'react';
import { Progress } from '@nqlib/nqui';

function ControlledProgress() {
  const [progress, setProgress] = useState(50);

  return (
    <div className="space-y-4">
      <Progress 
        value={progress} 
        variant="success" 
        showTooltip 
      />
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
        className="w-full"
      />
      <div className="text-sm text-muted-foreground">
        Progress: {progress}%
      </div>
    </div>
  );
}
```

## Requirements

### CSS Import

Ensure the library CSS is imported in your application:

```tsx
import '@nqlib/nqui/dist/index.css';
```

### Tooltip Provider

If using `showTooltip`, wrap your app with `TooltipProvider`:

```tsx
import { TooltipProvider } from '@nqlib/nqui';

function App() {
  return (
    <TooltipProvider>
      {/* Your app */}
    </TooltipProvider>
  );
}
```

## Accessibility

- Includes ARIA attributes (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`)
- Proper progress semantics for screen readers
- Keyboard accessible (inherited from Radix UI primitives)

## Notes

- **Dash style**: Block-based design that auto-calculates block count based on container width if `blocks` prop is not provided
- **Solid style**: Smooth continuous bar with rounded corners, supports labels and animations
- **Responsive**: Dash style adapts block count to container width automatically
- **Performance**: Uses ResizeObserver for efficient width calculations in dash style

## Base Component

If you need the base Radix UI Progress component without enhancements, import `CoreProgress`:

```tsx
import { CoreProgress } from '@nqlib/nqui';

<CoreProgress value={33} />
```

