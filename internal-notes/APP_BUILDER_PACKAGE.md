# App Builder Package (@nqlib/nqappbuilder)

## Overview

The App Builder has been extracted from nqui into a separate package `@nqlib/nqappbuilder` to reduce nqui's bundle size and allow independent versioning. The visual app builder includes a drag-and-drop canvas, widget palette, configurator, and registry system.

## Installation

```bash
pnpm add @nqlib/nqappbuilder @nqlib/nqui
# or
npm install @nqlib/nqappbuilder @nqlib/nqui
```

## Peer Dependencies

- `react` (^18.2.0)
- `react-dom` (^18.2.0)
- `@nqlib/nqui` (required) — provides UI components, design tokens, and utilities

Consumers must install these alongside nqappbuilder.

## Usage

```tsx
import {
  AppBuilder,
  AppBuilderProvider,
  AppCanvas,
  WidgetPalette,
  WidgetConfigurator,
  defaultRegistry,
} from "@nqlib/nqappbuilder"

// All-in-one component
export default function MyAppBuilder() {
  return (
    <AppBuilderProvider registry={defaultRegistry}>
      <AppBuilder />
    </AppBuilderProvider>
  )
}

// Or compose manually
export default function CustomLayout() {
  return (
    <AppBuilderProvider registry={defaultRegistry}>
      <aside>
        <WidgetPalette />
      </aside>
      <main>
        <AppCanvas showToolbar enableCollisionDetection />
      </main>
      <WidgetConfigurator />
    </AppBuilderProvider>
  )
}
```

## Extending the Registry

Use `createWidgetRegistry`, `extendRegistry`, or pass a custom `registry` to `AppBuilderProvider`:

```tsx
import {
  createWidgetRegistry,
  extendRegistry,
  defaultRegistry,
  buttonWidget,
  containerWidget,
} from "@nqlib/nqappbuilder"

const myRegistry = extendRegistry(defaultRegistry, [
  buttonWidget,
  containerWidget,
  myCustomWidget,
])

<AppBuilderProvider registry={myRegistry}>
  <AppBuilder />
</AppBuilderProvider>
```

## Documentation App

Documentation maintainers: add a section or page for nqappbuilder in the documentation app. Link to this note for package details and migration context.