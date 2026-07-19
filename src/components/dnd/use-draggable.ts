"use client";

import {
  draggable,
  type ElementDropTargetGetFeedbackArgs,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { centerUnderPointer } from "@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import * as React from "react";
import { resolveData, useLatestRef } from "./internal";
import type { DragData } from "./types";

/**
 * How a custom drag preview is positioned relative to the pointer.
 * - `preserve` — keeps the exact grab point (feels like picking the card up).
 * - `center` — centres the preview under the pointer.
 * - `pointer` — offsets the preview ahead of the pointer.
 */
export type DragPreviewOffset = "preserve" | "center" | "pointer";

export interface UseDraggableOptions<TData extends DragData = DragData> {
  /**
   * Data attached to the drag operation, read once as the drag starts. May be a
   * value or a factory. A `type` (see below) is merged in automatically.
   */
  data?: TData | (() => TData);
  /**
   * Convenience discriminator merged into `data` as `{ type }`. Lets drop
   * targets filter with `canDrop`.
   */
  type?: string;
  /**
   * When false (or a function returning false), the element cannot be picked
   * up. A function is evaluated live as the drag tries to start. Defaults to
   * true.
   */
  canDrag?: boolean | (() => boolean);
  /** Fully disables the binding (no drag, no listeners). */
  disabled?: boolean;
  /** Fired when the drag starts. */
  onDragStart?: () => void;
  /** Fired when the drag ends (dropped or cancelled). */
  onDrop?: () => void;
  /**
   * Render your own drag preview instead of the browser's default ghost.
   * Portal your preview node into the returned `previewContainer`.
   *
   * Strongly recommended: the native ghost is a washed-out screenshot of the
   * element and, on an unhandled drop, the browser plays a "fly back to
   * origin" animation that reads as the drop being rejected.
   */
  customPreview?: boolean;
  /** Positioning of the custom preview. Defaults to `preserve`. */
  previewOffset?: DragPreviewOffset;
}

export interface UseDraggableResult {
  /** Attach to the element you want to make draggable. */
  ref: (node: HTMLElement | null) => void;
  /**
   * Attach to a child element to restrict the drag activation area to a handle.
   * Optional — omit to make the whole element the handle.
   */
  handleRef: (node: HTMLElement | null) => void;
  /** True while this element is being dragged. */
  isDragging: boolean;
  /**
   * When `customPreview` is set, the element to portal your preview into while
   * a drag is active (null otherwise).
   *
   * ```tsx
   * {previewContainer && createPortal(<CardPreview />, previewContainer)}
   * ```
   */
  previewContainer: HTMLElement | null;
}

/**
 * Make an element draggable. Wraps Pragmatic's `draggable`.
 *
 * ```tsx
 * const { ref, isDragging } = useDraggable({ type: "card", data: { id } });
 * return <div ref={ref} data-dragging={isDragging} />;
 * ```
 */
export function useDraggable<TData extends DragData = DragData>(
  options: UseDraggableOptions<TData> = {},
): UseDraggableResult {
  const {
    type,
    canDrag = true,
    disabled = false,
    customPreview = false,
    previewOffset = "preserve",
  } = options;

  const [element, setElement] = React.useState<HTMLElement | null>(null);
  const [handle, setHandle] = React.useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [previewContainer, setPreviewContainer] =
    React.useState<HTMLElement | null>(null);

  const dataRef = useLatestRef(options.data);
  const typeRef = useLatestRef(type);
  const canDragRef = useLatestRef(canDrag);
  const onDragStartRef = useLatestRef(options.onDragStart);
  const onDropRef = useLatestRef(options.onDrop);

  React.useEffect(() => {
    if (!element || disabled) return;

    return draggable({
      element,
      dragHandle: handle ?? undefined,
      canDrag: () => {
        const value = canDragRef.current;
        if (typeof value === "function") return value();
        return value !== false;
      },
      getInitialData: () =>
        resolveData(
          dataRef.current as DragData | (() => DragData) | undefined,
          typeRef.current ? { type: typeRef.current } : undefined,
        ),
      onGenerateDragPreview: customPreview
        ? ({ nativeSetDragImage, location, source }) => {
            setCustomNativeDragPreview({
              nativeSetDragImage,
              getOffset:
                previewOffset === "center"
                  ? centerUnderPointer
                  : previewOffset === "pointer"
                    ? pointerOutsideOfPreview({ x: "16px", y: "8px" })
                    : preserveOffsetOnSource({
                        element: source.element,
                        input: location.current.input,
                      }),
              render: ({ container }) => {
                setPreviewContainer(container);
                return () => setPreviewContainer(null);
              },
            });
          }
        : undefined,
      onDragStart: () => {
        // Suppress the browser's default handling of drops that land outside a
        // drop target — that default is the "ghost springs back to origin"
        // animation, which reads as rejection even on a successful move.
        preventUnhandled.start();
        setIsDragging(true);
        onDragStartRef.current?.();
      },
      onDrop: () => {
        preventUnhandled.stop();
        setIsDragging(false);
        onDropRef.current?.();
      },
    });
    // Refs keep callbacks/data fresh, so only structural inputs re-bind.
  }, [
    element,
    handle,
    disabled,
    customPreview,
    previewOffset,
    dataRef,
    typeRef,
    canDragRef,
    onDragStartRef,
    onDropRef,
  ]);

  return { ref: setElement, handleRef: setHandle, isDragging, previewContainer };
}

/** Re-exported so consumers can type their own `getData`/feedback callbacks. */
export type { ElementDropTargetGetFeedbackArgs };
