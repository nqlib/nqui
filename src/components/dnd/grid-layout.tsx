"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  cellToPx,
  columnWidth,
  type GridConfig,
  type GridItem,
  layoutRowCount,
  moveItem,
  pxToCell,
  pxToSpan,
  resizeItem,
} from "./grid-geometry";
import { useDraggable } from "./use-draggable";
import { useDragMonitor } from "./use-drag-monitor";

const GRID_ITEM_TYPE = "nqui:grid-item";

/* -------------------------------------------------------------------------- */
/*  Context                                                                     */
/* -------------------------------------------------------------------------- */

interface GridContextValue {
  gridId: string;
  colWidth: number;
  config: GridConfig;
  layout: GridItem[];
  interactionRef: React.MutableRefObject<"idle" | "resize">;
  beginResize: (id: string, w: number, h: number) => void;
}

const GridContext = React.createContext<GridContextValue | null>(null);

function useGridContext(consumer: string): GridContextValue {
  const ctx = React.useContext(GridContext);
  if (!ctx) throw new Error(`\`${consumer}\` must be used within \`GridLayout\``);
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  GridLayout                                                                  */
/* -------------------------------------------------------------------------- */

export interface GridLayoutProps
  extends Omit<React.ComponentProps<"div">, "onChange" | "children"> {
  layout: GridItem[];
  onLayoutChange: (layout: GridItem[]) => void;
  cols?: number;
  rowHeight?: number;
  gap?: number;
  /** Render each item. Receives the item; return its inner content. */
  children: (item: GridItem) => React.ReactNode;
}

/**
 * A snap-to-grid layout with draggable, resizable tiles and vertical
 * compaction — the substrate for BI dashboards and Retool-style grid builders.
 * Controlled: pass `layout` and update it from `onLayoutChange`.
 */
export function GridLayout({
  layout,
  onLayoutChange,
  cols = 12,
  rowHeight = 80,
  gap = 12,
  className,
  style,
  children,
  ...props
}: GridLayoutProps) {
  const gridId = React.useId();
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);
  const interactionRef = React.useRef<"idle" | "resize">("idle");

  // Ephemeral layout shown during an interaction; falls back to the prop.
  const [preview, setPreview] = React.useState<GridItem[] | null>(null);
  const effective = preview ?? layout;

  const layoutRef = React.useRef(layout);
  layoutRef.current = layout;
  const onChangeRef = React.useRef(onLayoutChange);
  onChangeRef.current = onLayoutChange;

  const config: GridConfig = React.useMemo(
    () => ({ cols, rowHeight, gap }),
    [cols, rowHeight, gap],
  );
  const colWidth = width > 0 ? columnWidth(width, cols, gap) : 0;

  // Measure available width.
  React.useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Drag grab offset: pointer position minus item's top-left, in px.
  const grabRef = React.useRef<{ dx: number; dy: number } | null>(null);

  /**
   * Resolve the layout implied by the pointer being at `input`, using the grab
   * offset captured on drag start. Returns null when the drag isn't ready.
   */
  const layoutFromPointer = React.useCallback(
    (id: string, input: { clientX: number; clientY: number }) => {
      const grid = gridRef.current;
      const grab = grabRef.current;
      if (!grid || !grab || colWidth <= 0) return null;
      const rect = grid.getBoundingClientRect();
      const left = input.clientX - rect.left - grab.dx;
      const top = input.clientY - rect.top - grab.dy;
      const cell = pxToCell(left, top, colWidth, config);
      return moveItem(layoutRef.current, id, cell.x, cell.y, cols);
    },
    [colWidth, config, cols],
  );

  useDragMonitor({
    canMonitor: (d) => d.type === GRID_ITEM_TYPE && d.gridId === gridId,
    onDragStart: ({ source, location }) => {
      const id = source.data.id as string;
      const item = layoutRef.current.find((i) => i.i === id);
      const grid = gridRef.current;
      if (!item || !grid) return;
      const rect = grid.getBoundingClientRect();
      const px = cellToPx(item, colWidth, config);
      const { clientX, clientY } = location.initial.input;
      grabRef.current = {
        dx: clientX - rect.left - px.left,
        dy: clientY - rect.top - px.top,
      };
    },
    onDrag: ({ source, location }) => {
      const next = layoutFromPointer(
        source.data.id as string,
        location.current.input,
      );
      if (next) setPreview(next);
    },
    onDrop: ({ source, location }) => {
      // Compute the final layout from the drop position itself rather than
      // replaying the last `onDrag` preview: on a fast drag (or a synthetic
      // one) no intermediate `onDrag` fires, which would otherwise silently
      // drop the move.
      const next = layoutFromPointer(
        source.data.id as string,
        location.current.input,
      );
      grabRef.current = null;
      setPreview(null);
      if (next) onChangeRef.current(next);
    },
  });

  const beginResize = React.useCallback(
    (id: string, w: number, h: number) => {
      setPreview(resizeItem(layoutRef.current, id, w, h, cols));
    },
    [cols],
  );

  // Commit resize when the interaction ends (driven by GridItemView pointerup).
  const commitResize = React.useCallback(() => {
    setPreview((current) => {
      if (current) onChangeRef.current(current);
      return null;
    });
  }, []);

  const rows = layoutRowCount(effective);
  const height = rows > 0 ? rows * (rowHeight + gap) - gap : 0;

  const ctx = React.useMemo<GridContextValue>(
    () => ({ gridId, colWidth, config, layout: effective, interactionRef, beginResize }),
    [gridId, colWidth, config, effective, beginResize],
  );

  return (
    <GridContext.Provider value={ctx}>
      <div
        ref={gridRef}
        data-slot="grid-layout"
        className={cn("relative w-full", className)}
        style={{ height, ...style }}
        {...props}
      >
        {colWidth > 0 &&
          effective.map((item) => (
            <GridItemView key={item.i} item={item} onResizeCommit={commitResize}>
              {children(item)}
            </GridItemView>
          ))}
      </div>
    </GridContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Grid item                                                                   */
/* -------------------------------------------------------------------------- */

interface GridItemViewProps {
  item: GridItem;
  onResizeCommit: () => void;
  children: React.ReactNode;
}

function GridItemView({ item, onResizeCommit, children }: GridItemViewProps) {
  const { gridId, colWidth, config, interactionRef, beginResize } =
    useGridContext("GridItem");

  const dragData = React.useMemo(
    () => ({ type: GRID_ITEM_TYPE, gridId, id: item.i }),
    [gridId, item.i],
  );

  const { ref, isDragging, previewContainer } = useDraggable({
    data: dragData,
    disabled: item.static,
    // Cancel the card drag if the gesture started on a resize handle.
    // Evaluated live so the resize pointerdown (which flips the ref) wins.
    canDrag: () => interactionRef.current !== "resize",
    customPreview: true,
    previewOffset: "preserve",
  });

  const px = cellToPx(item, colWidth, config);

  const startResize = (e: React.PointerEvent, axis: "se" | "e" | "s") => {
    if (item.static) return;
    e.preventDefault();
    e.stopPropagation();
    interactionRef.current = "resize";
    (e.target as Element).setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = px.width;
    const startH = px.height;

    const onMove = (ev: PointerEvent) => {
      const nextW = axis === "s" ? startW : startW + (ev.clientX - startX);
      const nextH = axis === "e" ? startH : startH + (ev.clientY - startY);
      const span = pxToSpan(nextW, nextH, colWidth, config);
      beginResize(item.i, span.w, span.h);
    };
    const onUp = (ev: PointerEvent) => {
      (e.target as Element).releasePointerCapture?.(ev.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      interactionRef.current = "idle";
      onResizeCommit();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <>
    <div
      ref={ref}
      data-slot="grid-item"
      data-dragging={isDragging ? "" : undefined}
      data-static={item.static ? "" : undefined}
      className={cn(
        "absolute overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        "transition-[left,top,width,height] duration-150 ease-out",
        !item.static && "cursor-grab data-dragging:cursor-grabbing",
        // Source stays put and dims; the custom preview follows the pointer.
        isDragging && "z-20 opacity-40 transition-none",
      )}
      style={{
        left: px.left,
        top: px.top,
        width: px.width,
        height: px.height,
      }}
    >
      {children}
      {!item.static && (
        <>
          <ResizeHandle axis="e" onPointerDown={(e) => startResize(e, "e")} />
          <ResizeHandle axis="s" onPointerDown={(e) => startResize(e, "s")} />
          <ResizeHandle axis="se" onPointerDown={(e) => startResize(e, "se")} />
        </>
      )}
    </div>

    {previewContainer &&
      createPortal(
        <div
          className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          style={{ width: px.width, height: px.height }}
        >
          {children}
        </div>,
        previewContainer,
      )}
    </>
  );
}

function ResizeHandle({
  axis,
  onPointerDown,
}: {
  axis: "se" | "e" | "s";
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const pos = {
    e: "right-0 top-1/2 h-8 w-1.5 -translate-y-1/2 cursor-ew-resize",
    s: "bottom-0 left-1/2 h-1.5 w-8 -translate-x-1/2 cursor-ns-resize",
    se: "bottom-0 right-0 size-3 cursor-nwse-resize",
  }[axis];

  return (
    <div
      role="separator"
      aria-orientation={axis === "s" ? "horizontal" : "vertical"}
      aria-label="Resize"
      data-slot="grid-resize-handle"
      onPointerDown={onPointerDown}
      className={cn(
        "absolute z-10 rounded-full bg-transparent hover:bg-primary/40",
        "touch-none opacity-0 transition-opacity hover:opacity-100",
        "[[data-slot=grid-item]:hover_&]:opacity-60",
        pos,
      )}
    />
  );
}
