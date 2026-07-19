# nqui DnD (`@nqlib/nqui/dnd`)

General-purpose drag-and-drop for cross-container Kanban, snap-to-grid
dashboards, and canvas builders. Built on
[Pragmatic drag-and-drop](https://github.com/atlassian/pragmatic-drag-and-drop).

> **When to use which entry**
> - `@nqlib/nqui/sortable` — simple single-list reorder (dnd-kit). Keyboard
>   arrow-drag, no cross-container.
> - `@nqlib/nqui/dnd` — everything else: move items **between** containers, grid
>   layouts with resize, free canvases. One global drag model.

## Install

```bash
npm i @atlaskit/pragmatic-drag-and-drop \
      @atlaskit/pragmatic-drag-and-drop-hitbox \
      @atlaskit/pragmatic-drag-and-drop-auto-scroll \
      @atlaskit/pragmatic-drag-and-drop-live-region
```

All four are **optional peers** — only needed if you import `@nqlib/nqui/dnd`.
The core nqui bundle never pulls them.

## Primitives

Low-level hooks that wrap Pragmatic in React ergonomics. Build anything with
these; the Kanban and Grid components below are built on top of them.

```tsx
import { useDraggable, useDropTarget, useDragMonitor, DropIndicator } from "@nqlib/nqui/dnd";

function Card({ id }: { id: string }) {
  const { ref, isDragging } = useDraggable({ type: "card", data: { id } });
  const { ref: dropRef, isDraggedOver, closestEdge } = useDropTarget({
    edges: ["top", "bottom"],
    canDrop: (d) => d.type === "card",
  });
  const setRef = (n: HTMLElement | null) => { ref(n); dropRef(n); };
  return (
    <div ref={setRef} data-dragging={isDragging} className="relative">
      Card {id}
      {isDraggedOver && <DropIndicator edge={closestEdge} />}
    </div>
  );
}
```

| Hook / component | Purpose |
|---|---|
| `useDraggable({ data, type, canDrag, disabled })` | Make an element draggable. Returns `{ ref, handleRef, isDragging }`. Use `handleRef` for a drag handle. |
| `useDropTarget({ data, edges, canDrop, sticky })` | Make a drop target. Returns `{ ref, isDraggedOver, closestEdge }`. `edges` enables hitbox edge detection. |
| `useDragMonitor({ canMonitor, onDragStart, onDrag, onDrop })` | Observe drags globally. This is how cross-container reconciliation is done — read `event.location.current.dropTargets` (innermost first) and `event.source.data`. |
| `<DropIndicator edge={closestEdge} />` | nqui-styled insertion line. Render inside a `position: relative` target. |
| `useAnnouncer()` | Returns `announce(message)` for screen-reader announcements. |
| `reorder`, `getReorderDestinationIndex`, `getInsertionIndex` | Pure index math for list reordering. |

## Kanban

```tsx
import { useState } from "react";
import { KanbanBoard, KanbanColumn, KanbanCard, applyCardDrop, type KanbanColumns } from "@nqlib/nqui/dnd";

const COLUMNS = ["todo", "doing", "done"];

export function Board() {
  const [cols, setCols] = useState<KanbanColumns>({
    todo: ["a", "b"], doing: ["c"], done: [],
  });

  return (
    <KanbanBoard onCardDrop={(r) => setCols((c) => applyCardDrop(c, r))}>
      {COLUMNS.map((id) => (
        <KanbanColumn key={id} columnId={id} header={id}>
          {cols[id].map((cardId, index) => (
            <KanbanCard key={cardId} cardId={cardId} index={index}>
              {cardId}
            </KanbanCard>
          ))}
        </KanbanColumn>
      ))}
    </KanbanBoard>
  );
}
```

- **State model** is `Record<columnId, cardId[]>` — ordered card ids per column.
  Keep card *content* in a separate lookup.
- `applyCardDrop(columns, result)` returns a new map; it locates the card by id
  (stale-index safe) and clamps. `result.toIndex === -1` means "append".
- Columns are drop targets for the empty/append case; cards are reorder targets
  with top/bottom edge detection and render a `DropIndicator` automatically.
- **Auto-scroll** is on by default per column (`autoScroll={false}` to disable).

## GridLayout (dashboards)

```tsx
import { useState } from "react";
import { GridLayout, type GridItem } from "@nqlib/nqui/dnd";

export function Dashboard() {
  const [layout, setLayout] = useState<GridItem[]>([
    { i: "revenue", x: 0, y: 0, w: 6, h: 3, minW: 3 },
    { i: "users",   x: 6, y: 0, w: 6, h: 3 },
    { i: "table",   x: 0, y: 3, w: 12, h: 4 },
  ]);

  return (
    <GridLayout layout={layout} onLayoutChange={setLayout} cols={12} rowHeight={80} gap={12}>
      {(item) => <div className="p-4">{item.i}</div>}
    </GridLayout>
  );
}
```

- **Controlled**: pass `layout`, update from `onLayoutChange`. Coordinates are in
  grid cells (`x`/`w` = columns, `y`/`h` = rows).
- Tiles **drag to snap** and **resize** (E / S / SE handles). Others are pushed
  down and compacted upward (vertical compaction).
- Per-item constraints: `minW`, `maxW`, `minH`, `maxH`, and `static` (pinned).
- Geometry helpers (`moveItem`, `resizeItem`, `resolveLayout`, `cellToPx`, …)
  are exported and pure — reuse them for custom layouts or server-side layout.

## Accessibility

- Drop feedback, cursor states, and reduced-motion-friendly transitions are
  built in. Pointer + touch (native drag) work out of the box.
- `useAnnouncer()` wraps a shared ARIA live region for screen-reader updates.
- ⚠️ **Keyboard drag is not yet wired.** Pragmatic's native-drag model needs an
  explicit keyboard affordance (a per-card "Move to…" menu), which is a deliberate
  follow-up — see the handoff notes. Until then, provide a keyboard path for
  moving items (e.g. a menu calling the same `onCardDrop` reconciler).
