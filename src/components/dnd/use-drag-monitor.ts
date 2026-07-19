"use client";

import {
  type ElementEventBasePayload,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import * as React from "react";
import { useLatestRef } from "./internal";
import type { DragData } from "./types";

export type DragMonitorEvent = ElementEventBasePayload;

export interface UseDragMonitorOptions {
  /**
   * Restrict which drags this monitor observes. Receives the source data.
   * Typically `(d) => d.type === "card"`.
   */
  canMonitor?: (sourceData: DragData) => boolean;
  onDragStart?: (event: DragMonitorEvent) => void;
  onDrag?: (event: DragMonitorEvent) => void;
  /**
   * Fires when any observed drag finishes. Read
   * `event.location.current.dropTargets` (innermost first) and
   * `event.source.data` to reconcile your model.
   */
  onDrop?: (event: DragMonitorEvent) => void;
}

/**
 * Observe drag operations globally (not tied to a single element). This is how
 * cross-container reconciliation is done: one monitor at the board/grid level
 * reads the source and the resolved drop targets on drop.
 */
export function useDragMonitor(options: UseDragMonitorOptions): void {
  const canMonitorRef = useLatestRef(options.canMonitor);
  const onDragStartRef = useLatestRef(options.onDragStart);
  const onDragRef = useLatestRef(options.onDrag);
  const onDropRef = useLatestRef(options.onDrop);

  React.useEffect(() => {
    return monitorForElements({
      canMonitor: canMonitorRef.current
        ? ({ source }) => canMonitorRef.current!(source.data)
        : undefined,
      onDragStart: (event) => onDragStartRef.current?.(event),
      onDrag: (event) => onDragRef.current?.(event),
      onDrop: (event) => onDropRef.current?.(event),
    });
  }, [canMonitorRef, onDragStartRef, onDragRef, onDropRef]);
}
