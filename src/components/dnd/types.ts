/**
 * Shared types for the nqui drag-and-drop primitive layer.
 *
 * This layer is a thin, React-idiomatic wrapper over Atlassian's
 * Pragmatic drag-and-drop (`@atlaskit/pragmatic-drag-and-drop`). Unlike the
 * `./sortable` entry (which is dnd-kit and only does single-list reorder),
 * this layer exposes low-level `useDraggable` / `useDropTarget` primitives with
 * a single global drag model — so cross-container Kanban, dashboards, and
 * canvas builders are all expressible.
 */

/** Arbitrary data attached to a drag source or drop target. */
export type DragData = Record<string | symbol, unknown>;

/** The side of a drop target closest to the pointer. */
export type Edge = "top" | "bottom" | "left" | "right";

/** Axis a reorder happens along. */
export type DragAxis = "vertical" | "horizontal";

/** Live state a drop target exposes to its consumer. */
export interface DropTargetState {
  /** True while a compatible draggable is hovering this target. */
  isDraggedOver: boolean;
  /** The closest edge, if `edges` were requested; otherwise `null`. */
  closestEdge: Edge | null;
}

/** The payload of the entity being dragged, surfaced to monitors/targets. */
export interface DragSource<TData extends DragData = DragData> {
  element: HTMLElement;
  dragHandle: Element | null;
  data: TData;
}
