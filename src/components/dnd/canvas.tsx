"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  bringToFront,
  type CanvasNode,
  type CanvasRect,
  moveNodes,
  nodesInRect,
  normalizeRect,
} from "./canvas-model";
import { useDraggable } from "./use-draggable";
import { useDragMonitor } from "./use-drag-monitor";

const CANVAS_NODE_TYPE = "nqui:canvas-node";

/** Pointer travel (px) below which a background drag counts as a plain click. */
const MARQUEE_THRESHOLD = 4;

/** Breathing room under the lowest node when the canvas auto-sizes. */
const AUTO_HEIGHT_PADDING = 48;

/* -------------------------------------------------------------------------- */
/*  Canvas                                                                     */
/* -------------------------------------------------------------------------- */

/** State handed to the `children` render prop for each node. */
export interface CanvasNodeState {
  selected: boolean;
  /** True only for the node the pointer picked up, not the rest of the set. */
  dragging: boolean;
}

export interface CanvasProps
  extends Omit<React.ComponentProps<"div">, "children" | "onChange" | "onSelect"> {
  nodes: CanvasNode[];
  onNodesChange: (nodes: CanvasNode[]) => void;
  /** Grid pitch in px for snap-to-grid. 0 (the default) is free positioning. */
  snap?: number;
  /** Fixed canvas extent in px. Omit either axis to size it from the content. */
  width?: number;
  height?: number;
  /** Controlled selection. Omit to let the canvas own it. */
  selection?: string[];
  defaultSelection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Render each node's content. */
  children: (node: CanvasNode, state: CanvasNodeState) => React.ReactNode;
}

/**
 * A free-positioning canvas with draggable, multi-selectable nodes — the
 * substrate for whiteboards, form builders, and diagram editors.
 *
 * Controlled: pass `nodes` and update them from `onNodesChange`. Positions are
 * absolute px relative to the canvas box, not grid cells (see `GridLayout` for
 * the snap-to-grid dashboard case).
 */
export function Canvas({
  nodes,
  onNodesChange,
  snap = 0,
  width,
  height,
  selection: selectionProp,
  defaultSelection,
  onSelectionChange,
  className,
  style,
  children,
  onPointerDown,
  ...props
}: CanvasProps) {
  const canvasId = React.useId();
  const canvasRef = React.useRef<HTMLDivElement | null>(null);

  // Ephemeral node positions shown mid-drag; falls back to the prop.
  const [preview, setPreview] = React.useState<CanvasNode[] | null>(null);
  const effective = preview ?? nodes;

  const [marquee, setMarquee] = React.useState<CanvasRect | null>(null);

  /* --- selection (controlled or self-owned) ------------------------------- */

  const [ownSelection, setOwnSelection] = React.useState<string[]>(
    defaultSelection ?? [],
  );
  const selection = selectionProp ?? ownSelection;

  const isControlled = selectionProp !== undefined;
  const isControlledRef = React.useRef(isControlled);
  isControlledRef.current = isControlled;
  const onSelectionChangeRef = React.useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  const setSelection = React.useCallback((ids: string[]) => {
    if (!isControlledRef.current) setOwnSelection(ids);
    onSelectionChangeRef.current?.(ids);
  }, []);

  // Live mirrors so the drag/pointer handlers never close over stale props.
  const nodesRef = React.useRef(nodes);
  nodesRef.current = nodes;
  const selectionRef = React.useRef(selection);
  selectionRef.current = selection;
  const onNodesChangeRef = React.useRef(onNodesChange);
  onNodesChangeRef.current = onNodesChange;

  const bounds =
    width !== undefined && height !== undefined ? { w: width, h: height } : undefined;
  const boundsRef = React.useRef(bounds);
  boundsRef.current = bounds;
  const snapRef = React.useRef(snap);
  snapRef.current = snap;

  /* --- dragging ----------------------------------------------------------- */

  // Captured on drag start: the pointer's offset inside the anchor node, plus
  // the whole set being moved (so a multi-selection travels together).
  const grabRef = React.useRef<{
    anchorId: string;
    ids: string[];
    dx: number;
    dy: number;
  } | null>(null);

  /**
   * Resolve the node positions implied by the pointer being at `input`, using
   * the grab offset captured on drag start. Null when the drag isn't ready.
   */
  const nodesFromPointer = React.useCallback(
    (input: { clientX: number; clientY: number }) => {
      const el = canvasRef.current;
      const grab = grabRef.current;
      if (!el || !grab) return null;
      const anchor = nodesRef.current.find((n) => n.id === grab.anchorId);
      if (!anchor) return null;

      const rect = el.getBoundingClientRect();
      const targetX = input.clientX - rect.left - grab.dx;
      const targetY = input.clientY - rect.top - grab.dy;
      return moveNodes(
        nodesRef.current,
        grab.ids,
        targetX - anchor.x,
        targetY - anchor.y,
        { snap: snapRef.current, bounds: boundsRef.current },
      );
    },
    [],
  );

  useDragMonitor({
    canMonitor: (d) => d.type === CANVAS_NODE_TYPE && d.canvasId === canvasId,
    onDragStart: ({ source, location }) => {
      const id = source.data.id as string;
      const node = nodesRef.current.find((n) => n.id === id);
      const el = canvasRef.current;
      if (!node || !el) return;
      const rect = el.getBoundingClientRect();
      const { clientX, clientY } = location.initial.input;
      grabRef.current = {
        anchorId: id,
        // Dragging a node that is part of the current selection moves the whole
        // selection; dragging an unselected one moves only it.
        ids: selectionRef.current.includes(id) ? [...selectionRef.current] : [id],
        dx: clientX - rect.left - node.x,
        dy: clientY - rect.top - node.y,
      };
    },
    onDrag: ({ location }) => {
      const next = nodesFromPointer(location.current.input);
      if (next) setPreview(next);
    },
    onDrop: ({ location }) => {
      // Resolve the final position from the drop input rather than replaying
      // the last `onDrag` preview: a fast (or synthetic) drag can land without
      // a single intermediate `onDrag`, which would silently drop the move.
      const next = nodesFromPointer(location.current.input);
      const ids = grabRef.current?.ids ?? [];
      grabRef.current = null;
      setPreview(null);
      if (next) onNodesChangeRef.current(bringToFront(next, ids));
    },
  });

  /* --- marquee selection --------------------------------------------------- */

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    // Only a press on the canvas backdrop starts a marquee; presses that
    // bubbled up from a node are that node's business.
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.target !== event.currentTarget) return;

    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const originX = event.clientX - rect.left;
    const originY = event.clientY - rect.top;
    const additive = event.shiftKey || event.metaKey || event.ctrlKey;
    const base = additive ? [...selectionRef.current] : [];

    const move = (ev: PointerEvent) => {
      setMarquee({
        x: originX,
        y: originY,
        w: ev.clientX - rect.left - originX,
        h: ev.clientY - rect.top - originY,
      });
    };

    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setMarquee(null);

      const box: CanvasRect = {
        x: originX,
        y: originY,
        w: ev.clientX - rect.left - originX,
        h: ev.clientY - rect.top - originY,
      };
      const travelled =
        Math.abs(box.w) >= MARQUEE_THRESHOLD || Math.abs(box.h) >= MARQUEE_THRESHOLD;
      if (!travelled) {
        // A plain click on empty canvas clears; an additive one leaves the
        // existing selection alone.
        if (!additive) setSelection([]);
        return;
      }
      const hits = nodesInRect(nodesRef.current, box).map((n) => n.id);
      setSelection([...new Set([...base, ...hits])]);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const selectNode = React.useCallback(
    (id: string, additive: boolean) => {
      const current = selectionRef.current;
      if (additive) {
        setSelection(
          current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
        );
        return;
      }
      // Keep a multi-selection intact when pressing one of its members, so the
      // press can turn into a group drag.
      if (!current.includes(id)) setSelection([id]);
    },
    [setSelection],
  );

  /* --- layout -------------------------------------------------------------- */

  const autoHeight = React.useMemo(
    () =>
      effective.reduce((max, n) => Math.max(max, n.y + n.h), 0) + AUTO_HEIGHT_PADDING,
    [effective],
  );
  const autoWidth = React.useMemo(
    () => effective.reduce((max, n) => Math.max(max, n.x + n.w), 0),
    [effective],
  );

  const selected = React.useMemo(() => new Set(selection), [selection]);
  const box = marquee ? normalizeRect(marquee) : null;

  return (
    <div
      ref={canvasRef}
      data-slot="canvas"
      data-marquee={marquee ? "" : undefined}
      onPointerDown={handlePointerDown}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card",
        "touch-none select-none",
        className,
      )}
      style={{
        width: width ?? "100%",
        height: height ?? autoHeight,
        minWidth: width === undefined ? autoWidth : undefined,
        ...style,
      }}
      {...props}
    >
      {effective.map((node) => (
        <CanvasNodeView
          key={node.id}
          canvasId={canvasId}
          node={node}
          selected={selected.has(node.id)}
          onSelect={selectNode}
        >
          {children}
        </CanvasNodeView>
      ))}

      {box && (
        <div
          data-slot="canvas-marquee"
          className="pointer-events-none absolute z-50 rounded-sm border border-primary bg-primary/10"
          style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Node                                                                       */
/* -------------------------------------------------------------------------- */

interface CanvasNodeViewProps {
  canvasId: string;
  node: CanvasNode;
  selected: boolean;
  onSelect: (id: string, additive: boolean) => void;
  children: (node: CanvasNode, state: CanvasNodeState) => React.ReactNode;
}

function CanvasNodeView({
  canvasId,
  node,
  selected,
  onSelect,
  children,
}: CanvasNodeViewProps) {
  const dragData = React.useMemo(
    () => ({ type: CANVAS_NODE_TYPE, canvasId, id: node.id }),
    [canvasId, node.id],
  );

  const { ref, isDragging, previewContainer } = useDraggable({
    data: dragData,
    disabled: node.locked,
    customPreview: true,
    previewOffset: "preserve",
  });

  const content = children(node, { selected, dragging: isDragging });

  return (
    <>
      <div
        ref={ref}
        data-slot="canvas-node"
        data-selected={selected ? "" : undefined}
        data-dragging={isDragging ? "" : undefined}
        data-locked={node.locked ? "" : undefined}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          onSelect(node.id, e.shiftKey || e.metaKey || e.ctrlKey);
        }}
        className={cn(
          "absolute overflow-hidden rounded-xl border border-border bg-card shadow-sm",
          "transition-[left,top] duration-150 ease-out",
          !node.locked && "cursor-grab data-dragging:cursor-grabbing",
          selected && "ring-2 ring-ring",
          // The source stays put and dims; the portalled preview follows the
          // pointer, so the native ghost never appears.
          isDragging && "z-20 opacity-40 transition-none",
        )}
        style={{
          left: node.x,
          top: node.y,
          width: node.w,
          height: node.h,
          zIndex: isDragging ? undefined : node.z,
        }}
      >
        {content}
      </div>

      {previewContainer &&
        createPortal(
          <div
            className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            style={{ width: node.w, height: node.h }}
          >
            {content}
          </div>,
          previewContainer,
        )}
    </>
  );
}
