# nqui Rating

> Star rating. Half-star, maxRating, tooltipContent.

## Import

```tsx
import { Rating } from "@nqlib/nqui"
```

## Basic

```tsx
<Rating value={3.5} onChange={setVal} />
```

## maxRating / starSize

```tsx
<Rating value={val} onChange={setVal} maxRating={10} starSize={24} />
```

## tooltipContent

```tsx
<Rating
  value={val}
  onChange={setVal}
  tooltipContent={(v) => `${v} stars`}
/>
```

## Notes

- Styles (including the SVG star mask) ship in `dist/styles.css` — import `@nqlib/nqui/styles`.
  (Before 0.8.1 the component injected a `<style>` element per instance; it no longer does, so no
  SSR guard is needed.)
