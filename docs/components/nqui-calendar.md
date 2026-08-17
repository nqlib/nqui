# nqui Calendar

> Date picker. Single, range, multiple. Touch drag, hover preview (enhanced).

## Import

```tsx
import { Calendar } from "@nqlib/nqui/calendar"
import type { DateRange } from "react-day-picker"
```

## Basic

```tsx
<Calendar mode="single" selected={date} onSelect={setDate} />
```

## Range

```tsx
<Calendar mode="range" selected={range} onSelect={setRange} />
```

## Multiple

```tsx
<Calendar mode="multiple" selected={dates} onSelect={setDates} />
```

## numberOfMonths

```tsx
<Calendar numberOfMonths={2} />
```

## Disabled

```tsx
<Calendar disabled={(d) => d < new Date()} />
```

## Notes

- Peer: `react-day-picker` v9+.
- Enhanced: touch drag selection, hover preview on drag.
- Range: after `from` and `to` are set, drag either endpoint to resize. A click without moving still starts a new range.
- Day cells pin the pointer target to the painted square. Adjacent days would otherwise overlap via Button's `hit-area-2`.
- Footer slot for custom footer.
