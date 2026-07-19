"use client";

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import * as React from "react";
import { resolveData, useLatestRef } from "./internal";
import type { DragData, DropTargetState, Edge } from "./types";

export interface UseDropTargetOptions<TData extends DragData = DragData> {
  /** Data attached to this target, read repeatedly while dragged over. */
  data?: TData | (() => TData);
  /**
   * Which edges to compute a "closest edge" for. Provide `["top","bottom"]`
   * for a vertical list, `["left","right"]` for a horizontal one. Omit to skip
   * edge detection (e.g. a whole-container drop zone).
   *
   * May be a function of the drag source, so one target can do different things
   * for different payloads — e.g. a Kanban column takes cards with no edges
   * (append to end) but other columns with left/right edges (reorder).
   */
  edges?: Edge[] | ((sourceData: DragData) => Edge[] | undefined);
  /**
   * Decide whether a given drag source may drop here. Receives the source's
   * attached data. Return false to reject (nested targets can still accept).
   */
  canDrop?: (sourceData: DragData) => boolean;
  /**
   * Keep this target active briefly after the pointer leaves ("stickiness").
   * Useful for small targets. Defaults to false.
   */
  sticky?: boolean;
  /** Fully disables the binding. */
  disabled?: boolean;
}

export interface UseDropTargetResult extends DropTargetState {
  /** Attach to the element you want to make a drop target. */
  ref: (node: HTMLElement | null) => void;
}

const IDLE: DropTargetState = { isDraggedOver: false, closestEdge: null };

/**
 * Make an element a drop target. Wraps Pragmatic's `dropTargetForElements`,
 * folding in hitbox edge detection so consumers get `closestEdge` for free.
 *
 * ```tsx
 * const { ref, isDraggedOver, closestEdge } = useDropTarget({
 *   edges: ["top", "bottom"],
 *   canDrop: (d) => d.type === "card",
 * });
 * ```
 */
export function useDropTarget<TData extends DragData = DragData>(
  options: UseDropTargetOptions<TData> = {},
): UseDropTargetResult {
  const { edges, sticky = false, disabled = false } = options;

  const [element, setElement] = React.useState<HTMLElement | null>(null);
  const [state, setState] = React.useState<DropTargetState>(IDLE);

  const dataRef = useLatestRef(options.data);
  const edgesRef = useLatestRef(edges);
  const canDropRef = useLatestRef(options.canDrop);
  const stickyRef = useLatestRef(sticky);

  React.useEffect(() => {
    if (!element || disabled) return;

    const update = (next: DropTargetState) =>
      setState((prev) =>
        prev.isDraggedOver === next.isDraggedOver &&
        prev.closestEdge === next.closestEdge
          ? prev
          : next,
      );

    return dropTargetForElements({
      element,
      getIsSticky: () => stickyRef.current === true,
      canDrop: canDropRef.current
        ? ({ source }) => canDropRef.current!(source.data)
        : undefined,
      getData: ({ input, element: el, source }) => {
        const base = resolveData(
          dataRef.current as DragData | (() => DragData) | undefined,
        );
        const configured = edgesRef.current;
        const allowed =
          typeof configured === "function" ? configured(source.data) : configured;
        return allowed && allowed.length > 0
          ? attachClosestEdge(base, { element: el, input, allowedEdges: allowed })
          : base;
      },
      onDragEnter: ({ self }) =>
        update({ isDraggedOver: true, closestEdge: extractClosestEdge(self.data) }),
      onDrag: ({ self }) =>
        update({ isDraggedOver: true, closestEdge: extractClosestEdge(self.data) }),
      onDragLeave: () => update(IDLE),
      onDrop: () => update(IDLE),
    });
  }, [element, disabled, dataRef, edgesRef, canDropRef, stickyRef]);

  React.useEffect(() => {
    // Safety: if the binding is torn down mid-drag, don't leave a stuck state.
    if (disabled) setState(IDLE);
  }, [disabled]);

  return { ref: setElement, ...state };
}
