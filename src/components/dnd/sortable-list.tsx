"use client";

import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { DropIndicator } from "./drop-indicator";
import { getReorderDestinationIndex, meaningfulEdges, reorder } from "./reorder";
import type { DragAxis, DragData, Edge } from "./types";
import { useDraggable } from "./use-draggable";
import { useDragMonitor } from "./use-drag-monitor";
import { useDropTarget } from "./use-drop-target";
import { flashElement, useFlip } from "./use-flip";

/* -------------------------------------------------------------------------- */
/*  Names + constants                                                          */
/* -------------------------------------------------------------------------- */

const ROOT_NAME = "SortableList";
const ITEM_NAME = "SortableListItem";
const ITEM_HANDLE_NAME = "SortableListItemHandle";


/* -------------------------------------------------------------------------- */
/*  Drag payload                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Payload attached to every item of one list instance. `type` is derived from
 * the root's `useId`, so two `SortableList`s on the same page never accept each
 * other's items — matching dnd-kit's per-`DndContext` isolation.
 */
interface SortableItemData extends DragData {
  type: string;
  value: string;
  index: number;
}

function isItemData(data: DragData, listType: string): data is SortableItemData {
  return data.type === listType && typeof data.value === "string";
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                     */
/* -------------------------------------------------------------------------- */

interface SortableListContextValue {
  /** Unique drag type for this list instance. */
  listType: string;
  /** Current position of an item id, or -1 if it is no longer in `value`. */
  indexOf: (itemValue: string) => number;
  orientation: "vertical" | "horizontal";
  axis: DragAxis;
  flatCursor: boolean;
}

const SortableListContext = React.createContext<SortableListContextValue | null>(
  null,
);

function useSortableListContext(consumer: string): SortableListContextValue {
  const context = React.useContext(SortableListContext);
  if (!context) {
    throw new Error(`\`${consumer}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface SortableListItemContextValue {
  /** DOM id of the item, so the handle can point `aria-controls` at it. */
  id: string;
  /** Registers a child as the drag activation area. */
  setHandle: (node: HTMLElement | null) => void;
  isDragging: boolean;
  disabled: boolean;
}

const SortableListItemContext =
  React.createContext<SortableListItemContextValue | null>(null);

function useSortableListItemContext(
  consumer: string,
): SortableListItemContextValue {
  const context = React.useContext(SortableListItemContext);
  if (!context) {
    throw new Error(`\`${consumer}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/*  Root                                                                        */
/* -------------------------------------------------------------------------- */

/** Result handed to `onMove` when a drop resolves to a real position change. */
export interface SortableListMoveEvent {
  /** Index the item was at when the drop resolved. */
  fromIndex: number;
  /** Index it should end up at. */
  toIndex: number;
  /** The moved item's id, as produced by `getItemValue`. */
  value: string;
}

interface GetItemValue<T> {
  /**
   * Returns a stable unique id for each item. Required for an array of objects,
   * optional when `value` is already an array of strings.
   * @example getItemValue={(item) => item.id}
   */
  getItemValue: (item: T) => string;
}

export type SortableListProps<T> = React.ComponentProps<"div"> &
  (T extends object ? GetItemValue<T> : Partial<GetItemValue<T>>) & {
    /** The ordered list. Controlled — render one `SortableListItem` per entry. */
    value: T[];
    /**
     * Receives the reordered array. Ignored when `onMove` is supplied, so a
     * consumer can own the mutation (e.g. persist an index server-side).
     */
    onValueChange?: (items: T[]) => void;
    /** Lower-level alternative to `onValueChange`: apply the move yourself. */
    onMove?: (event: SortableListMoveEvent) => void;
    /**
     * Drives both the drop edges (top/bottom vs left/right) and the axis the
     * reorder math resolves against. Defaults to `vertical`.
     */
    orientation?: "vertical" | "horizontal";
    /** Suppress grab/grabbing cursors (for touch-first or dense UIs). */
    flatCursor?: boolean;
    /** Disable the FLIP settle animation (worth it for very long lists). */
    disableAnimation?: boolean;
  };

/**
 * Single-list reorder built on Pragmatic drag-and-drop.
 *
 * The root owns the *only* drag monitor: items publish their id + index, and on
 * drop the root resolves the destination once and emits a single change. Items
 * never reconcile locally, which is what keeps the list correct when the array
 * shifts underneath an in-flight drag (indices are re-derived from `value`, not
 * trusted from the drag payload).
 *
 * ```tsx
 * <SortableList value={items} onValueChange={setItems} getItemValue={(i) => i.id}>
 *   {items.map((item) => (
 *     <SortableListItem key={item.id} value={item.id} asHandle>
 *       {item.label}
 *     </SortableListItem>
 *   ))}
 * </SortableList>
 * ```
 */
export function SortableList<T>(props: SortableListProps<T>) {
  const {
    value,
    onValueChange,
    onMove,
    orientation = "vertical",
    flatCursor = false,
    disableAnimation = false,
    getItemValue: getItemValueProp,
    className,
    children,
    ref,
    ...rootProps
  } = props as SortableListProps<T> & Partial<GetItemValue<T>>;

  const id = React.useId();
  const listType = `nqui:sortable-list${id}`;

  const getItemValue = React.useCallback(
    (item: T): string => {
      if (typeof item === "object" && item !== null && !getItemValueProp) {
        throw new Error("getItemValue is required when using array of objects");
      }
      return getItemValueProp ? getItemValueProp(item) : String(item);
    },
    [getItemValueProp],
  );

  // One id list per render feeds both index lookup and the drop reconciler.
  const items = React.useMemo(
    () => value.map((item) => getItemValue(item)),
    [value, getItemValue],
  );

  const axis: DragAxis = orientation === "horizontal" ? "horizontal" : "vertical";

  const indexOf = React.useCallback(
    (itemValue: string) => items.indexOf(itemValue),
    [items],
  );

  const listRef = React.useRef<HTMLDivElement | null>(null);
  // Items glide to their new slots instead of teleporting after the commit.
  useFlip(listRef, { enabled: !disableAnimation });

  useDragMonitor({
    canMonitor: (data) => isItemData(data, listType),
    onDrop: ({ source, location }) => {
      if (!isItemData(source.data, listType)) return;

      const target = location.current.dropTargets.find((candidate) =>
        isItemData(candidate.data, listType),
      );
      if (!target) return;
      const targetData = target.data as SortableItemData;
      if (targetData.value === source.data.value) return;

      // Re-derive both indices from the live array: the payload's `index` was
      // captured at drag start and may be stale if `value` changed mid-drag.
      const fromIndex = items.indexOf(source.data.value);
      const indexOfTarget = items.indexOf(targetData.value);
      if (fromIndex === -1 || indexOfTarget === -1) return;

      const toIndex = getReorderDestinationIndex({
        startIndex: fromIndex,
        indexOfTarget,
        closestEdgeOfTarget: extractClosestEdge(targetData) as Edge | null,
        axis,
      });
      if (toIndex === fromIndex) return;

      if (onMove) {
        onMove({ fromIndex, toIndex, value: source.data.value });
      } else {
        onValueChange?.(reorder(value, fromIndex, toIndex));
      }
      flashOnNextFrame(listRef.current, source.data.value);
    },
  });

  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const contextValue = React.useMemo<SortableListContextValue>(
    () => ({ listType, indexOf, orientation, axis, flatCursor }),
    [listType, indexOf, orientation, axis, flatCursor],
  );

  return (
    <SortableListContext.Provider value={contextValue}>
      <div
        ref={composedRef}
        data-slot="sortable-list"
        data-orientation={orientation}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        )}
        {...rootProps}
      >
        {children}
      </div>
    </SortableListContext.Provider>
  );
}

/**
 * Highlight the item that just moved, once React has committed its new slot.
 * Two frames: one for the commit, one for the FLIP animation to start.
 */
function flashOnNextFrame(root: HTMLElement | null, itemValue: string) {
  if (!root || typeof requestAnimationFrame !== "function") return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flashElement(
        root.querySelector<HTMLElement>(
          `[data-slot="sortable-list-item"][data-value="${CSS.escape(itemValue)}"]`,
        ),
      );
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  Item                                                                        */
/* -------------------------------------------------------------------------- */

export interface SortableListItemProps
  extends Omit<React.ComponentProps<"div">, "value"> {
  /** This item's id — must match what `getItemValue` returns for it. */
  value: string;
  /** Make the whole item the drag activation area (no separate handle). */
  asHandle?: boolean;
  /** Not draggable, not a drop target, visually dimmed. */
  disabled?: boolean;
  /**
   * Custom node for the drag preview that follows the pointer. Defaults to the
   * item's own children in a lifted surface.
   */
  preview?: React.ReactNode;
}

/**
 * One entry of a `SortableList`: a draggable *and* a drop target with edge
 * detection, so the insertion line lands where the pointer actually is.
 *
 * A custom drag preview is always used. The browser's native ghost is a
 * washed-out screenshot and, on an unhandled drop, plays a spring-back-to-origin
 * animation that reads as rejection even on a successful reorder.
 */
export function SortableListItem({
  value,
  asHandle = false,
  disabled = false,
  preview,
  className,
  children,
  ref,
  ...itemProps
}: SortableListItemProps) {
  const context = useSortableListContext(ITEM_NAME);

  if (value === "") {
    throw new Error(`\`${ITEM_NAME}\` value cannot be an empty string`);
  }

  const id = React.useId();
  const index = context.indexOf(value);

  const data = React.useMemo<SortableItemData>(
    () => ({ type: context.listType, value, index }),
    [context.listType, value, index],
  );

  // Without `asHandle`, the item is only draggable once a
  // `SortableListItemHandle` has registered itself — mirroring dnd-kit, where an
  // item with no activator node cannot be picked up.
  const hasHandleRef = React.useRef(false);

  const {
    ref: dragRef,
    handleRef,
    isDragging,
    previewContainer,
  } = useDraggable<SortableItemData>({
    data,
    disabled: disabled || index === -1,
    canDrag: () => asHandle || hasHandleRef.current,
    customPreview: true,
    previewOffset: "preserve",
  });

  // Only expose edges that actually change the order. With `[A, B]` and B in
  // hand, "after A" resolves straight back to B's own index — offering it would
  // render a drop indicator for a move that never happens. When a single edge
  // qualifies, the whole item resolves to it, so there's no inert half.
  const edgesFor = React.useCallback(
    (source: DragData) =>
      meaningfulEdges({
        sourceIndex: context.indexOf(
          (source as SortableItemData).value as string,
        ),
        targetIndex: index,
        axis: context.axis,
      }),
    [context, index],
  );

  const {
    ref: dropRef,
    isDraggedOver,
    closestEdge,
  } = useDropTarget<SortableItemData>({
    data,
    edges: edgesFor,
    disabled,
    canDrop: (source) =>
      isItemData(source, context.listType) &&
      source.value !== value &&
      edgesFor(source).length > 0,
    // The gap between items belongs to the list, not either item; stickiness
    // keeps the last item active while the pointer crosses it.
    sticky: true,
  });

  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      dragRef(node);
      dropRef(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [dragRef, dropRef, ref],
  );

  const setHandle = React.useCallback(
    (node: HTMLElement | null) => {
      hasHandleRef.current = node !== null;
      handleRef(node);
    },
    [handleRef],
  );

  const itemContext = React.useMemo<SortableListItemContextValue>(
    () => ({ id, setHandle, isDragging, disabled }),
    [id, setHandle, isDragging, disabled],
  );

  return (
    <SortableListItemContext.Provider value={itemContext}>
      <div
        id={id}
        ref={composedRef}
        data-slot="sortable-list-item"
        data-value={value}
        data-index={index}
        data-flip-id={`sortable-item:${value}`}
        data-disabled={disabled ? "" : undefined}
        data-dragging={isDragging ? "" : undefined}
        data-dragged-over={isDraggedOver ? "" : undefined}
        className={cn(
          "relative focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
          {
            "touch-none select-none": asHandle,
            "cursor-default": context.flatCursor,
            "data-dragging:cursor-grabbing": !context.flatCursor,
            "cursor-grab": !isDragging && asHandle && !context.flatCursor,
            // The source stays put, dimmed, while the preview follows the
            // pointer — there is nothing to spring back.
            "opacity-50": isDragging,
            "pointer-events-none opacity-50": disabled,
          },
          className,
        )}
        {...itemProps}
      >
        {children}
        {isDraggedOver && <DropIndicator edge={closestEdge} />}
      </div>

      {previewContainer &&
        createPortal(
          <div className="rounded-lg border border-border bg-background text-sm shadow-lg">
            {preview ?? children}
          </div>,
          previewContainer,
        )}
    </SortableListItemContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Item handle                                                                 */
/* -------------------------------------------------------------------------- */

export interface SortableListItemHandleProps
  extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

/**
 * Restricts drag activation to this element. Use when the item itself contains
 * interactive content (links, inputs) that must stay clickable — otherwise put
 * `asHandle` on the item and skip the handle entirely.
 */
export function SortableListItemHandle({
  asChild,
  disabled,
  className,
  ref,
  ...handleProps
}: SortableListItemHandleProps) {
  const context = useSortableListContext(ITEM_HANDLE_NAME);
  const itemContext = useSortableListItemContext(ITEM_HANDLE_NAME);

  const isDisabled = disabled ?? itemContext.disabled;

  const composedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      // A disabled handle stays unregistered, so the item reports "no activator"
      // and refuses to drag rather than falling back to whole-element dragging.
      itemContext.setHandle(isDisabled ? null : node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [itemContext, isDisabled, ref],
  );

  const HandlePrimitive = asChild ? Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={itemContext.id}
      data-slot="sortable-list-item-handle"
      data-disabled={isDisabled ? "" : undefined}
      data-dragging={itemContext.isDragging ? "" : undefined}
      ref={composedRef}
      disabled={isDisabled}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      {...handleProps}
    />
  );
}
