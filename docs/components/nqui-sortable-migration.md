# Migrating `Sortable` → `SortableList`

`@nqlib/nqui/sortable` is built on **dnd-kit** (4 peer dependencies).
`@nqlib/nqui/dnd` is built on **Pragmatic drag-and-drop**, which already powers
Kanban, GridLayout, and the canvas. `SortableList` is the Pragmatic replacement
for the dnd-kit `Sortable` so single-list reorder stops being the one feature
that keeps dnd-kit in the tree.

> **Status.** `@nqlib/nqui/sortable` still ships and is not deprecated yet. Move
> when you can accept the keyboard regression below.

## Install

```bash
npm i @atlaskit/pragmatic-drag-and-drop \
      @atlaskit/pragmatic-drag-and-drop-hitbox \
      @atlaskit/pragmatic-drag-and-drop-auto-scroll \
      @atlaskit/pragmatic-drag-and-drop-live-region
```

Optional peers — only pulled when you import `@nqlib/nqui/dnd`. Once every
`Sortable` in your app is migrated you can drop `@dnd-kit/core`,
`@dnd-kit/sortable`, `@dnd-kit/modifiers`, and `@dnd-kit/utilities`.

## Side by side

```tsx
// Before — @nqlib/nqui/sortable (dnd-kit)
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@nqlib/nqui/sortable";

<Sortable value={rows} onValueChange={setRows} getItemValue={(r) => r.id}>
  <SortableContent className="flex flex-col gap-2">
    {rows.map((row) => (
      <SortableItem key={row.id} value={row.id}>
        <SortableItemHandle>::</SortableItemHandle>
        {row.label}
      </SortableItem>
    ))}
  </SortableContent>
  <SortableOverlay>
    {({ value }) => <div className="rounded-md border p-2">{value}</div>}
  </SortableOverlay>
</Sortable>;
```

```tsx
// After — @nqlib/nqui/dnd (Pragmatic)
import {
  SortableList,
  SortableListItem,
  SortableListItemHandle,
} from "@nqlib/nqui/dnd";

<SortableList
  value={rows}
  onValueChange={setRows}
  getItemValue={(r) => r.id}
  className="gap-2"
>
  {rows.map((row) => (
    <SortableListItem key={row.id} value={row.id}>
      <SortableListItemHandle>::</SortableListItemHandle>
      {row.label}
    </SortableListItem>
  ))}
</SortableList>;
```

Three mechanical edits: drop `SortableContent` (the root *is* the list
container), drop `SortableOverlay` (each item renders its own preview), and
rename the three components.

## API differences

| dnd-kit `Sortable` | Pragmatic `SortableList` | Notes |
|---|---|---|
| `Sortable` | `SortableList` | Root. Also renders the list container (`display: flex`, direction from `orientation`). |
| `SortableContent` | — | Removed. Put your layout classes on `SortableList`. |
| `SortableItem` | `SortableListItem` | Same `value`, `asHandle`, `disabled`. |
| `SortableItemHandle` | `SortableListItemHandle` | Same, plus `asChild`. |
| `SortableOverlay` | — | Removed. Each item portals its own drag preview; override with the item's `preview` prop. |
| `value` / `onValueChange` | same | Still controlled. |
| `getItemValue: (item) => UniqueIdentifier` | `getItemValue: (item) => string` | `string` only — ids become `data-value` attributes. Required for object arrays (throws otherwise), optional for string arrays. |
| `onMove({ ...DragEndEvent, activeIndex, overIndex })` | `onMove({ fromIndex, toIndex, value })` | No dnd-kit event object. `value` is the moved item's id. |
| `orientation: "vertical" \| "horizontal" \| "mixed"` | `orientation: "vertical" \| "horizontal"` | `"mixed"` (2-D grids) is gone — use `GridLayout` from the same entry. |
| `flatCursor` | same | Suppresses grab/grabbing cursors. |
| `strategy`, `modifiers`, `collisionDetection`, `sensors`, `accessibility` | — | dnd-kit concepts with no equivalent. Edge detection is hitbox-based and needs no strategy. |
| `asChild` on the item | — | Not supported: the item owns a `position: relative` layer for its drop indicator. `asChild` remains on the handle. |
| — | `disableAnimation` | New. Turns off the FLIP settle animation for very long lists. |
| — | `preview` on the item | New. Custom drag-preview node; defaults to the item's children. |

### Data attributes

| dnd-kit | Pragmatic |
|---|---|
| `data-slot="sortable-content"` | *(root)* `data-slot="sortable-list"`, `data-orientation` |
| `data-slot="sortable-item"` | `data-slot="sortable-list-item"` |
| `data-slot="sortable-item-handle"` | `data-slot="sortable-list-item-handle"` |
| `data-dragging`, `data-disabled` | same, plus `data-dragged-over`, `data-value`, `data-index` |

`data-dragging:` / `data-disabled:` Tailwind variants you already wrote keep
working.

## Behaviour changes

1. **⚠️ No keyboard drag.** This is the real regression. dnd-kit shipped a
   `KeyboardSensor`: focus an item, press space, move with arrow keys, press
   space to drop. Pragmatic is built on the browser's native HTML5 drag-and-drop,
   which has **no keyboard equivalent** — there is nothing to wire up. The
   accessible replacement is an explicit **"Move to…" menu** per item (or
   Move up / Move down buttons) that calls the same `onMove` / `onValueChange`
   reconciler. Pair it with `useAnnouncer()` for the live-region update. If you
   have a keyboard-accessibility requirement you cannot ship an alternative for,
   stay on `@nqlib/nqui/sortable`.
2. **No overlay, per-item previews.** dnd-kit rendered one `SortableOverlay`
   portalled to `document.body`. Each `SortableListItem` now portals its own
   native drag preview, positioned at the exact grab point. The source element
   stays in place at 50% opacity instead of being lifted out.
3. **No live transform while dragging.** dnd-kit translated the other items as
   you dragged. Pragmatic shows a `DropIndicator` line on the closest edge
   instead, then FLIP-animates the settle after the drop commits. Fewer moving
   parts, and it matches Kanban and GridLayout.
4. **Nothing snaps back.** Dropping outside the list is a silent no-op — the
   native "ghost flies home" animation is suppressed, because it reads as
   rejection even on a successful move.
5. **Indices are re-derived on drop.** The root recomputes `fromIndex` and the
   target index from the live `value` array rather than trusting the payload
   captured at drag start, so a list that changes mid-drag still reorders
   correctly.
6. **No axis/parent restriction.** dnd-kit applied `restrictToVerticalAxis` and
   `restrictToParentElement` modifiers. The native drag preview follows the
   pointer freely; `orientation` only controls which edges are detected and which
   axis the reorder math uses.
7. **Handle required unless `asHandle`.** Same contract as dnd-kit — an item with
   neither `asHandle` nor a mounted `SortableListItemHandle` cannot be picked up.
   A disabled handle does not register, so the item stays undraggable rather than
   falling back to whole-element dragging.
8. **Lists are isolated.** Each `SortableList` derives a unique drag type from
   `useId`, so two lists on one page never accept each other's items — matching
   one `DndContext` per list. Cross-list moves need Kanban.
9. **Touch behaves differently.** dnd-kit used a `TouchSensor` with a press
   delay. Pragmatic uses native drag, so on touch devices a long-press starts the
   drag; there is no configurable activation constraint.
10. **Motion respects `prefers-reduced-motion`.** The FLIP settle and the
    post-drop flash are skipped automatically.

## Checklist

- [ ] Replace `Sortable` / `SortableItem` / `SortableItemHandle` imports with the
      `@nqlib/nqui/dnd` names.
- [ ] Delete `SortableContent`, moving its `className` to `SortableList`.
- [ ] Delete `SortableOverlay`; use the item's `preview` prop if you had custom
      overlay content.
- [ ] Narrow `getItemValue` to return `string`.
- [ ] Update `onMove` handlers to `{ fromIndex, toIndex, value }`.
- [ ] Replace `orientation="mixed"` with `GridLayout`.
- [ ] Drop `strategy` / `modifiers` / `collisionDetection` props.
- [ ] **Add a keyboard move affordance** (menu or up/down buttons) before
      shipping.
- [ ] Once no `Sortable` usage remains, remove the four `@dnd-kit/*` deps.

## See also

- [`nqui-dnd.md`](./nqui-dnd.md) — the full DnD entry: primitives, Kanban,
  GridLayout.
