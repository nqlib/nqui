/**
 * nqui drag-and-drop — a general-purpose primitive layer built on Atlassian's
 * Pragmatic drag-and-drop. Unlike `@nqlib/nqui/sortable` (dnd-kit, single-list
 * reorder only), this layer supports cross-container Kanban, snap-to-grid
 * dashboards, and canvas builders from one global drag model.
 *
 * Requires the optional peers:
 *   @atlaskit/pragmatic-drag-and-drop
 *   @atlaskit/pragmatic-drag-and-drop-hitbox
 *   @atlaskit/pragmatic-drag-and-drop-auto-scroll
 *   @atlaskit/pragmatic-drag-and-drop-live-region
 */

// Primitives
export { useDraggable } from "./use-draggable";
export type {
  DragPreviewOffset,
  UseDraggableOptions,
  UseDraggableResult,
} from "./use-draggable";
export { useDropTarget } from "./use-drop-target";
export type {
  UseDropTargetOptions,
  UseDropTargetResult,
} from "./use-drop-target";
export { useDragMonitor } from "./use-drag-monitor";
export type {
  DragMonitorEvent,
  UseDragMonitorOptions,
} from "./use-drag-monitor";

// Visual + a11y helpers
export { DropIndicator } from "./drop-indicator";
export type { DropIndicatorProps } from "./drop-indicator";
export { useAnnouncer, announceLive, cleanupLiveRegion } from "./announcer";
export { flashElement, useFlip, usePrefersReducedMotion } from "./use-flip";
export type { UseFlipOptions } from "./use-flip";

// Reorder math
export {
  reorder,
  getReorderDestinationIndex,
  getInsertionIndex,
} from "./reorder";

// Shared types
export type {
  DragAxis,
  DragData,
  DragSource,
  DropTargetState,
  Edge,
} from "./types";

// Kanban
export { KanbanBoard, KanbanColumn, KanbanCard } from "./kanban";
export type {
  KanbanBoardProps,
  KanbanColumnProps,
  KanbanCardProps,
} from "./kanban";
export { applyCardDrop, applyColumnDrop } from "./kanban-model";
export type {
  KanbanColumnDropResult,
  KanbanColumns,
  KanbanDropResult,
} from "./kanban-model";

// Sortable list — Pragmatic-based successor to the dnd-kit `./sortable` entry.
// See docs/components/nqui-sortable-migration.md before switching.
export {
  SortableList,
  SortableListItem,
  SortableListItemHandle,
} from "./sortable-list";
export type {
  SortableListItemHandleProps,
  SortableListItemProps,
  SortableListMoveEvent,
  SortableListProps,
} from "./sortable-list";

// Canvas (free positioning, multi-select, marquee)
export { Canvas } from "./canvas";
export type { CanvasNodeState, CanvasProps } from "./canvas";
export {
  bringToFront,
  moveNodes,
  nodeAt,
  nodesInRect,
  normalizeRect,
  snapValue,
} from "./canvas-model";
export type { CanvasNode, CanvasRect, MoveNodesOptions } from "./canvas-model";

// Grid layout
export { GridLayout } from "./grid-layout";
export type { GridLayoutProps } from "./grid-layout";
export {
  cellToPx,
  clampItem,
  collides,
  columnWidth,
  layoutRowCount,
  moveItem,
  pxToCell,
  pxToSpan,
  resizeItem,
  resolveLayout,
} from "./grid-geometry";
export type { GridConfig, GridItem, PxRect } from "./grid-geometry";
