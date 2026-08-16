"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { DropGhost, DropIndicator } from "./drop-indicator";
import {
  getInsertionIndex,
  getReorderDestinationIndex,
  meaningfulEdges,
} from "./reorder";
import type { KanbanColumnDropResult, KanbanDropResult } from "./kanban-model";
import type { DragData, Edge } from "./types";
import { useDraggable } from "./use-draggable";
import { useDragMonitor } from "./use-drag-monitor";
import { useDropTarget } from "./use-drop-target";
import { flashElement, useFlip } from "./use-flip";
import { useAnnouncer } from "./announcer";

/* -------------------------------------------------------------------------- */
/*  Drag payload shapes                                                        */
/* -------------------------------------------------------------------------- */

const CARD_TYPE = "nqui:kanban-card";
const COLUMN_TYPE = "nqui:kanban-column";

interface CardData extends DragData {
  type: typeof CARD_TYPE;
  /** Scopes the drag to one board, so two boards never see each other's items. */
  boardId: string;
  cardId: string;
  columnId: string;
  index: number;
}

interface ColumnData extends DragData {
  type: typeof COLUMN_TYPE;
  boardId: string;
  columnId: string;
  index: number;
}

function isCardData(data: DragData): data is CardData {
  return data.type === CARD_TYPE;
}

function isColumnData(data: DragData): data is ColumnData {
  return data.type === COLUMN_TYPE;
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

interface KanbanColumnContextValue {
  columnId: string;
}

const KanbanColumnContext = React.createContext<KanbanColumnContextValue | null>(
  null,
);

function useColumnContext(consumer: string): KanbanColumnContextValue {
  const ctx = React.useContext(KanbanColumnContext);
  if (!ctx) {
    throw new Error(`\`${consumer}\` must be used within \`KanbanColumn\``);
  }
  return ctx;
}

interface KanbanBoardContextValue {
  /** Identifies this board instance; stamped onto every drag payload. */
  boardId: string;
  /** Ordered column ids, maintained by mounted columns that pass an `index`. */
  columnOrder: string[];
  registerColumn: (columnId: string, index: number) => () => void;
  requestCardMove: (result: KanbanDropResult) => void;
  /**
   * Measured height of the card currently being dragged, used by `DropGhost`
   * so the destination slot matches the floating preview.
   */
  activeCardHeight: number | null;
}

const KanbanBoardContext = React.createContext<KanbanBoardContextValue | null>(
  null,
);

/* -------------------------------------------------------------------------- */
/*  Board                                                                       */
/* -------------------------------------------------------------------------- */

export interface KanbanBoardProps extends React.ComponentProps<"div"> {
  /**
   * A card was dropped somewhere new. Apply with
   * `applyCardDrop(columns, result)`.
   */
  onCardDrop?: (result: KanbanDropResult) => void;
  /**
   * A whole column was reordered. Apply with
   * `applyColumnDrop(order, result)`. Omit to disable column dragging.
   */
  onColumnDrop?: (result: KanbanColumnDropResult) => void;
}

/**
 * Root of a cross-column Kanban board. A single global drag monitor reconciles
 * both card moves and column reorders against the resolved drop targets.
 */
export function KanbanBoard({
  onCardDrop,
  onColumnDrop,
  className,
  children,
  ...props
}: KanbanBoardProps) {
  const onCardDropRef = React.useRef(onCardDrop);
  onCardDropRef.current = onCardDrop;
  const onColumnDropRef = React.useRef(onColumnDrop);
  onColumnDropRef.current = onColumnDrop;

  const boardId = React.useId();
  const boardRef = React.useRef<HTMLDivElement | null>(null);
  // Columns settle smoothly after a reorder. Scoped to direct children so the
  // board animates *columns* only — cards belong to their column's own FLIP.
  useFlip(boardRef);

  // Columns register themselves so cards can resolve their left/right
  // neighbours for keyboard moves without the consumer wiring it up.
  const registry = React.useRef(new Map<string, number>());
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [activeCardHeight, setActiveCardHeight] = React.useState<number | null>(
    null,
  );

  const syncOrder = React.useCallback(() => {
    const next = [...registry.current.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([id]) => id);
    // Bail when nothing actually changed. A fresh array every time would give
    // the context a new identity on every commit, which re-runs the columns'
    // registration effect and loops forever.
    setColumnOrder((prev) =>
      prev.length === next.length && prev.every((id, i) => id === next[i])
        ? prev
        : next,
    );
  }, []);

  const registerColumn = React.useCallback(
    (columnId: string, index: number) => {
      registry.current.set(columnId, index);
      syncOrder();
      return () => {
        registry.current.delete(columnId);
        syncOrder();
      };
    },
    [syncOrder],
  );

  const requestCardMove = React.useCallback((result: KanbanDropResult) => {
    onCardDropRef.current?.(result);
    // Keep focus with the card the user just moved, and flash it so the change
    // is perceivable without sight of the drag.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(
          `[data-flip-id="card:${result.cardId}"]`,
        );
        el?.focus();
        flashElement(el);
      });
    });
  }, []);

  const boardContext = React.useMemo<KanbanBoardContextValue>(
    () => ({
      boardId,
      columnOrder,
      registerColumn,
      requestCardMove,
      activeCardHeight,
    }),
    [boardId, columnOrder, registerColumn, requestCardMove, activeCardHeight],
  );

  useDragMonitor({
    canMonitor: (d) =>
      (isCardData(d) || isColumnData(d)) && d.boardId === boardId,
    onDragStart: ({ source }) => {
      if (!isCardData(source.data)) {
        setActiveCardHeight(null);
        return;
      }
      const height = source.element.getBoundingClientRect().height;
      setActiveCardHeight(height > 0 ? height : null);
    },
    onDrop: ({ source, location }) => {
      setActiveCardHeight(null);
      const targets = location.current.dropTargets;
      if (targets.length === 0) return;

      /* ---- column reorder ---- */
      if (isColumnData(source.data)) {
        const target = targets.find((t) => isColumnData(t.data));
        if (!target || !isColumnData(target.data)) return;
        if (target.data.columnId === source.data.columnId) return;

        const toIndex = getReorderDestinationIndex({
          startIndex: source.data.index,
          indexOfTarget: target.data.index,
          closestEdgeOfTarget: extractClosestEdge(target.data) as Edge | null,
          axis: "horizontal",
        });
        if (toIndex === source.data.index) return;

        onColumnDropRef.current?.({
          columnId: source.data.columnId,
          fromIndex: source.data.index,
          toIndex,
        });
        flashOnNextFrame(`[data-flip-id="col:${source.data.columnId}"]`);
        return;
      }

      /* ---- card move ---- */
      if (!isCardData(source.data)) return;
      const sourceData = source.data;

      const cardTarget = targets.find((t) => isCardData(t.data));
      const columnTarget = targets.find((t) => isColumnData(t.data));

      let toColumnId: string;
      let toIndex: number;

      if (cardTarget && isCardData(cardTarget.data)) {
        const edge = extractClosestEdge(cardTarget.data) as Edge | null;
        toColumnId = cardTarget.data.columnId;
        toIndex =
          toColumnId === sourceData.columnId
            ? getReorderDestinationIndex({
                startIndex: sourceData.index,
                indexOfTarget: cardTarget.data.index,
                closestEdgeOfTarget: edge,
                axis: "vertical",
              })
            : getInsertionIndex({
                indexOfTarget: cardTarget.data.index,
                closestEdgeOfTarget: edge,
                axis: "vertical",
              });
      } else if (columnTarget && isColumnData(columnTarget.data)) {
        toColumnId = columnTarget.data.columnId;
        toIndex = -1; // append
      } else {
        return;
      }

      // Dropping a card back onto its own position is a no-op.
      if (toColumnId === sourceData.columnId && toIndex === sourceData.index) {
        return;
      }

      onCardDropRef.current?.({
        cardId: sourceData.cardId,
        fromColumnId: sourceData.columnId,
        fromIndex: sourceData.index,
        toColumnId,
        toIndex,
      });
      flashOnNextFrame(`[data-flip-id="card:${sourceData.cardId}"]`);
    },
  });

  const composedRef = React.useCallback((node: HTMLDivElement | null) => {
    boardRef.current = node;
  }, []);

  return (
    <KanbanBoardContext.Provider value={boardContext}>
      <div
        ref={composedRef}
        data-slot="kanban-board"
        className={cn("flex h-full items-start gap-4 overflow-x-auto", className)}
        {...props}
      >
        {children}
      </div>
    </KanbanBoardContext.Provider>
  );
}

/** Flash the moved element once React has committed its new position. */
function flashOnNextFrame(selector: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flashElement(document.querySelector<HTMLElement>(selector));
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  Column                                                                      */
/* -------------------------------------------------------------------------- */

export interface KanbanColumnProps extends React.ComponentProps<"div"> {
  columnId: string;
  /**
   * Position in the board's column order. Required to enable column dragging;
   * omit if columns are fixed.
   */
  index?: number;
  /** Sticky header content. Doubles as the column drag handle when draggable. */
  header?: React.ReactNode;
  /** Enable edge auto-scroll of the card list during a drag. Default true. */
  autoScroll?: boolean;
  /** Disable dragging this column even when `index` is provided. */
  disableColumnDrag?: boolean;
}

/**
 * A column: a drop target for cards (append / empty-column case), optionally a
 * draggable itself so whole groups can be reordered by their header.
 */
export function KanbanColumn({
  columnId,
  index,
  header,
  autoScroll = true,
  disableColumnDrag = false,
  className,
  children,
  ...props
}: KanbanColumnProps) {
  const draggableColumn = index !== undefined && !disableColumnDrag;

  const board = React.useContext(KanbanBoardContext);
  const boardId = board?.boardId ?? "";

  const columnData = React.useMemo<ColumnData>(
    () => ({ type: COLUMN_TYPE, boardId, columnId, index: index ?? -1 }),
    [boardId, columnId, index],
  );

  const {
    ref: dragRef,
    handleRef,
    isDragging,
    previewContainer,
  } = useDraggable<ColumnData>({
    data: columnData,
    disabled: !draggableColumn,
    customPreview: true,
    previewOffset: "preserve",
  });

  const columnEdgesFor = React.useCallback(
    (d: ColumnData) =>
      index === undefined
        ? []
        : meaningfulEdges({
            sourceIndex: d.index,
            targetIndex: index,
            axis: "horizontal",
          }),
    [index],
  );

  const {
    ref: dropRef,
    isDraggedOver,
    closestEdge,
  } = useDropTarget<ColumnData>({
    data: columnData,
    canDrop: (d) => {
      if (d.boardId !== boardId) return false;
      if (isCardData(d)) return true;
      if (!draggableColumn || !isColumnData(d)) return false;
      // A column is never its own drop target, and a neighbour with no
      // order-changing edge is inert rather than a dead hover zone.
      return columnEdgesFor(d).length > 0;
    },
    // Cards append (no edges). Columns reorder horizontally, and are offered
    // only the edges that actually change the order.
    edges: (d) => (isColumnData(d) ? columnEdgesFor(d) : undefined),
  });

  // Depend on the *stable* registerColumn, never the whole context object —
  // the context identity changes whenever the order updates, which would make
  // this effect re-register in a loop.
  const registerColumn = board?.registerColumn;
  React.useEffect(() => {
    if (!registerColumn || index === undefined) return;
    return registerColumn(columnId, index);
  }, [registerColumn, columnId, index]);

  const listRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = listRef.current;
    if (!el || !autoScroll) return;
    return autoScrollForElements({ element: el });
  }, [autoScroll]);

  // Cards settle smoothly after a reorder.
  useFlip(listRef);

  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      dragRef(node);
      dropRef(node);
    },
    [dragRef, dropRef],
  );

  const ctx = React.useMemo(() => ({ columnId }), [columnId]);
  const activeCardHeight = board?.activeCardHeight ?? null;
  // Card append / empty column: no closestEdge (edges omitted for cards).
  // Column reorder keeps left/right edges and still uses the hairline indicator.
  const showCardAppendGhost =
    isDraggedOver && !closestEdge && activeCardHeight != null;

  const headerNode =
    header != null ? (
      <div
        ref={draggableColumn ? handleRef : undefined}
        data-slot="kanban-column-header"
        className={cn(
          "shrink-0 px-2 py-1.5 text-sm font-medium",
          draggableColumn && "cursor-grab active:cursor-grabbing select-none",
        )}
      >
        {header}
      </div>
    ) : null;

  return (
    <KanbanColumnContext.Provider value={ctx}>
      <div
        ref={composedRef}
        data-slot="kanban-column"
        data-flip-id={`col:${columnId}`}
        data-dragging={isDragging ? "" : undefined}
        data-dragged-over={isDraggedOver ? "" : undefined}
        className={cn(
          "relative flex h-full w-72 shrink-0 flex-col rounded-lg bg-muted p-1",
          "data-dragged-over:bg-muted/80",
          "transition-colors",
          isDragging && "opacity-40",
          className,
        )}
        {...props}
      >
        {headerNode}
        <div
          ref={listRef}
          data-slot="kanban-column-list"
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1"
        >
          {children}
          {showCardAppendGhost && <DropGhost height={activeCardHeight} />}
        </div>
        {isDraggedOver && closestEdge && <DropIndicator edge={closestEdge} />}
      </div>

      {previewContainer &&
        createPortal(
          <div className="w-72 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium shadow-lg">
            {header}
          </div>,
          previewContainer,
        )}
    </KanbanColumnContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                        */
/* -------------------------------------------------------------------------- */

export interface KanbanCardProps extends React.ComponentProps<"div"> {
  cardId: string;
  /** Position of this card within its column (0-based). */
  index: number;
  /** Overrides the column id from context (rarely needed). */
  columnId?: string;
  disabled?: boolean;
  asChild?: boolean;
}

/**
 * A draggable card that is also a reorder drop target (top/bottom edges).
 * Renders a custom drag preview so the browser's washed-out native ghost — and
 * its spring-back-to-origin animation — never appear.
 */
export function KanbanCard({
  cardId,
  index,
  columnId: columnIdProp,
  disabled,
  asChild,
  className,
  children,
  ...props
}: KanbanCardProps) {
  const ctx = useColumnContext("KanbanCard");
  const columnId = columnIdProp ?? ctx.columnId;

  const board = React.useContext(KanbanBoardContext);
  const boardId = board?.boardId ?? "";

  const cardData = React.useMemo<CardData>(
    () => ({ type: CARD_TYPE, boardId, cardId, columnId, index }),
    [boardId, cardId, columnId, index],
  );

  const {
    ref: dragRef,
    isDragging,
    previewContainer,
  } = useDraggable<CardData>({
    data: cardData,
    disabled,
    customPreview: true,
    previewOffset: "preserve",
  });

  const cardEdgesFor = React.useCallback(
    (d: CardData) =>
      meaningfulEdges({
        sourceIndex: d.index,
        targetIndex: index,
        axis: "vertical",
        // Coming from another column, the card isn't in this list yet, so both
        // gaps are genuine insertions.
        sameContainer: d.columnId === columnId,
      }),
    [columnId, index],
  );

  const {
    ref: dropRef,
    isDraggedOver,
    closestEdge,
  } = useDropTarget<CardData>({
    data: cardData,
    // Only offer edges that change the order. When just one qualifies, the
    // whole card resolves to it — no half that silently does nothing.
    edges: (d) => (isCardData(d) ? cardEdgesFor(d) : undefined),
    canDrop: (d) =>
      d.boardId === boardId &&
      isCardData(d) &&
      d.cardId !== cardId &&
      cardEdgesFor(d).length > 0,
    // The gap between two cards belongs to the column, not to either card, so
    // crossing it would otherwise fall through to "append to end" and make the
    // indicator flicker. Stickiness keeps the last card active across the gap.
    sticky: true,
  });

  const elementRef = React.useRef<HTMLElement | null>(null);
  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node;
      dragRef(node);
      dropRef(node);
    },
    [dragRef, dropRef],
  );

  const announce = useAnnouncer();

  /**
   * Keyboard moves. Native HTML drag-and-drop cannot be driven from the
   * keyboard at all, so without this the board is unusable without a pointer.
   * A modifier is required so plain arrows still scroll/navigate normally.
   */
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (disabled || !board) return;
      if (!(event.metaKey || event.ctrlKey)) return;

      const el = elementRef.current;
      const move = (result: KanbanDropResult, message: string) => {
        event.preventDefault();
        event.stopPropagation();
        board.requestCardMove(result);
        announce(message);
      };

      const base = {
        cardId,
        fromColumnId: columnId,
        fromIndex: index,
        toColumnId: columnId,
      };

      switch (event.key) {
        case "ArrowUp": {
          if (index === 0) return;
          move({ ...base, toIndex: index - 1 }, `Moved up to position ${index}.`);
          return;
        }
        case "ArrowDown": {
          const hasNext =
            el?.nextElementSibling instanceof HTMLElement &&
            el.nextElementSibling.dataset.slot === "kanban-card";
          if (!hasNext) return;
          move(
            { ...base, toIndex: index + 1 },
            `Moved down to position ${index + 2}.`,
          );
          return;
        }
        case "ArrowLeft":
        case "ArrowRight": {
          const order = board.columnOrder;
          const at = order.indexOf(columnId);
          if (at === -1) return;
          const next = order[at + (event.key === "ArrowLeft" ? -1 : 1)];
          if (!next) return;
          move(
            { ...base, toColumnId: next, toIndex: -1 },
            `Moved to ${next}, last position.`,
          );
          return;
        }
        default:
          return;
      }
    },
    [announce, board, cardId, columnId, disabled, index],
  );

  const Primitive = asChild ? Slot : "div";
  const activeCardHeight = board?.activeCardHeight ?? null;
  const showGhost = isDraggedOver && closestEdge != null;

  return (
    <>
      {showGhost && closestEdge === "top" && (
        <DropGhost height={activeCardHeight} />
      )}
      <Primitive
        ref={composedRef}
        onKeyDown={onKeyDown}
        data-slot="kanban-card"
        data-flip-id={`card:${cardId}`}
        data-dragging={isDragging ? "" : undefined}
        data-dragged-over={isDraggedOver ? "" : undefined}
        className={cn(
          "relative select-none rounded-md bg-background p-3 text-sm",
          "cursor-grab data-dragging:cursor-grabbing",
          // Lift the source out of flow while dragging so the DropGhost at the
          // destination is the only reserved space — reads as the card moving.
          isDragging && "pointer-events-none absolute opacity-0",
          "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        tabIndex={disabled ? undefined : 0}
        aria-roledescription={disabled ? undefined : "Draggable card"}
        aria-keyshortcuts={
          disabled ? undefined : "Control+ArrowUp Control+ArrowDown Control+ArrowLeft Control+ArrowRight"
        }
        {...props}
      >
        {children}
      </Primitive>
      {showGhost && closestEdge === "bottom" && (
        <DropGhost height={activeCardHeight} />
      )}

      {previewContainer &&
        createPortal(
          <div className="rounded-lg border border-border bg-background p-3 text-sm shadow-lg">
            {children}
          </div>,
          previewContainer,
        )}
    </>
  );
}
