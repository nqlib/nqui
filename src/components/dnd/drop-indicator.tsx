"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Edge } from "./types";

export interface DropIndicatorProps extends React.ComponentProps<"div"> {
  /** Which edge to render the line on. When null, nothing renders. */
  edge: Edge | null;
  /**
   * The layout gap (px) between sibling items. The line is drawn at the
   * *midpoint* of that gap, so it reads as "between these two items" rather
   * than "attached to this one".
   *
   * Omit to measure the nearest list ancestor's `row-gap`/`column-gap`
   * (and fall back to adjacent sibling margins when gap is 0).
   */
  gap?: number;
}

const edgeToClass: Record<Edge, string> = {
  top: "top-0 left-2 right-2 h-0.5 -translate-y-1/2",
  bottom: "bottom-0 left-2 right-2 h-0.5 translate-y-1/2",
  left: "left-0 top-2 bottom-2 w-0.5 -translate-x-1/2",
  right: "right-0 top-2 bottom-2 w-0.5 translate-x-1/2",
};

const edgeToMargin: Record<Edge, keyof React.CSSProperties> = {
  top: "marginTop",
  bottom: "marginBottom",
  left: "marginLeft",
  right: "marginRight",
};

function parseGap(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Walk up from the item to the flex/grid list that owns the gap. */
function findListElement(item: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = item?.parentElement ?? null;
  while (node) {
    if (
      node.dataset.slot === "kanban-column-list" ||
      node.dataset.slot === "sortable-list"
    ) {
      return node;
    }
    const styles = getComputedStyle(node);
    const display = styles.display;
    if (
      (display === "flex" || display === "inline-flex" || display === "grid") &&
      (parseGap(styles.rowGap) > 0 ||
        parseGap(styles.columnGap) > 0 ||
        parseGap(styles.gap) > 0)
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return item?.parentElement ?? null;
}

function measureBetweenGap(
  item: HTMLElement,
  edge: Edge,
  isVertical: boolean,
): number {
  const list = findListElement(item);
  if (list) {
    const styles = getComputedStyle(list);
    const fromGap = parseGap(
      isVertical
        ? styles.rowGap || styles.gap
        : styles.columnGap || styles.gap,
    );
    if (fromGap > 0) return fromGap;
  }

  // Margin-based stacks (no flex gap): use the margin that separates siblings.
  const itemStyles = getComputedStyle(item);
  if (edge === "top") {
    const prev = item.previousElementSibling as HTMLElement | null;
    const prevBottom = prev ? parseGap(getComputedStyle(prev).marginBottom) : 0;
    return prevBottom + parseGap(itemStyles.marginTop);
  }
  if (edge === "bottom") {
    const next = item.nextElementSibling as HTMLElement | null;
    const nextTop = next ? parseGap(getComputedStyle(next).marginTop) : 0;
    return parseGap(itemStyles.marginBottom) + nextTop;
  }
  if (edge === "left") {
    const prev = item.previousElementSibling as HTMLElement | null;
    const prevRight = prev ? parseGap(getComputedStyle(prev).marginRight) : 0;
    return prevRight + parseGap(itemStyles.marginLeft);
  }
  const next = item.nextElementSibling as HTMLElement | null;
  const nextLeft = next ? parseGap(getComputedStyle(next).marginLeft) : 0;
  return parseGap(itemStyles.marginRight) + nextLeft;
}

/**
 * A nqui-styled insertion line, shown at the gap the item would land in.
 *
 * Render inside a `position: relative` element and pass the `closestEdge` from
 * `useDropTarget`. The line sits on the shared boundary, then nudges *outward*
 * by half the list gap so it reads as an insertion point between neighbours.
 *
 * Prefer {@link DropGhost} for vertical card lists — a dashed placeholder that
 * actually reserves layout space reads clearer than a hairline.
 */
export function DropIndicator({
  edge,
  gap,
  className,
  style,
  ref,
  ...props
}: DropIndicatorProps) {
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const [measuredGap, setMeasuredGap] = React.useState(0);

  const isVertical = edge === "top" || edge === "bottom";

  React.useLayoutEffect(() => {
    if (gap !== undefined || !edge) return;
    const indicator = nodeRef.current;
    const item = indicator?.parentElement;
    if (!item) return;
    setMeasuredGap(measureBetweenGap(item, edge, isVertical));
  }, [edge, gap, isVertical]);

  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  if (!edge) return null;

  const effectiveGap = gap ?? measuredGap;

  return (
    <div
      aria-hidden
      data-slot="drop-indicator"
      data-edge={edge}
      {...props}
      ref={composedRef}
      className={cn(
        "pointer-events-none absolute z-20 rounded-full bg-foreground",
        "before:absolute before:size-1.5 before:rounded-full before:border-2 before:border-foreground before:bg-background",
        edge === "top" && "before:-top-[3px] before:-left-1",
        edge === "bottom" && "before:-bottom-[3px] before:-left-1",
        edge === "left" && "before:-left-[3px] before:-top-1",
        edge === "right" && "before:-right-[3px] before:-top-1",
        edgeToClass[edge],
        className,
      )}
      style={{
        [edgeToMargin[edge]]: -effectiveGap / 2,
        ...style,
      }}
    />
  );
}

export interface DropGhostProps extends Omit<
  React.ComponentProps<"div">,
  "height" | "width"
> {
  /** Height of the dragged item (px). Used for vertical lists / table rows. */
  height?: number | null;
  /** Width of the dragged item (px). Used for horizontal lists / table cols. */
  width?: number | null;
  /**
   * DOM element to render. Use `"tr"` / `"th"` inside tables so the ghost is a
   * valid table child (a `div` inside `tbody`/`tr` is invalid HTML).
   */
  as?: "div" | "tr" | "th";
  /** When `as="tr"`, colspan for the single spacer cell. Defaults to 99. */
  colSpan?: number;
}

const DROP_GHOST_FALLBACK = 64;

const GHOST_BORDER =
  "1px dashed color-mix(in oklab, var(--border) 70%, transparent)";
const GHOST_BG = "color-mix(in oklab, var(--background) 40%, transparent)";

/**
 * A dashed placeholder that *occupies layout space* so siblings open a slot
 * for the drop. Render as a flex/grid sibling (not absolutely positioned) —
 * typically before/after the hovered item based on `closestEdge`.
 *
 * Border/fill use inline styles so the ghost stays visible even when the
 * consumer's Tailwind scan doesn't see this package's class strings.
 */
export function DropGhost({
  height,
  width,
  as = "div",
  colSpan = 99,
  className,
  style,
  ...props
}: DropGhostProps) {
  const h =
    typeof height === "number" && height > 0 ? height : undefined;
  const w = typeof width === "number" && width > 0 ? width : undefined;

  if (as === "tr") {
    const rowH = h ?? DROP_GHOST_FALLBACK;
    return (
      <tr
        aria-hidden
        data-slot="drop-ghost"
        className={cn("pointer-events-none", className)}
        style={style}
        {...(props as React.ComponentProps<"tr">)}
      >
        <td
          colSpan={colSpan}
          style={{
            height: rowH,
            padding: 0,
            // `border-collapse` eats cell borders — paint a dashed inset via
            // outline + a muted wash so the destination slot is visible.
            background:
              "color-mix(in oklab, var(--muted) 85%, var(--foreground))",
            boxShadow:
              "inset 0 0 0 1.5px color-mix(in oklab, var(--foreground) 28%, transparent)",
            borderRadius: 6,
          }}
        />
      </tr>
    );
  }

  if (as === "th") {
    const colW = w ?? DROP_GHOST_FALLBACK;
    return (
      <th
        aria-hidden
        data-slot="drop-ghost"
        className={cn("pointer-events-none p-0 font-normal", className)}
        style={{
          width: colW,
          minWidth: colW,
          background:
            "color-mix(in oklab, var(--muted) 85%, var(--foreground))",
          boxShadow:
            "inset 0 0 0 1.5px color-mix(in oklab, var(--foreground) 28%, transparent)",
          borderRadius: 6,
          ...style,
        }}
        {...(props as React.ComponentProps<"th">)}
      />
    );
  }

  return (
    <div
      aria-hidden
      data-slot="drop-ghost"
      {...props}
      className={cn("pointer-events-none shrink-0 rounded-md", className)}
      style={{
        height: h ?? (w == null ? DROP_GHOST_FALLBACK : "100%"),
        width: w ?? (h == null ? DROP_GHOST_FALLBACK : "100%"),
        border: GHOST_BORDER,
        background: GHOST_BG,
        ...style,
      }}
    />
  );
}
