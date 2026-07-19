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
   * Omit to measure the parent list's `row-gap`/`column-gap` automatically.
   */
  gap?: number;
}

const edgeToClass: Record<Edge, string> = {
  top: "top-0 left-0 right-0 h-0.5 -translate-y-1/2",
  bottom: "bottom-0 left-0 right-0 h-0.5 translate-y-1/2",
  left: "left-0 top-0 bottom-0 w-0.5 -translate-x-1/2",
  right: "right-0 top-0 bottom-0 w-0.5 translate-x-1/2",
};

const edgeToMargin: Record<Edge, keyof React.CSSProperties> = {
  top: "marginTop",
  bottom: "marginBottom",
  left: "marginLeft",
  right: "marginRight",
};

function parseGap(value: string): number {
  // `normal` (the initial value) means no gap.
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * A nqui-styled insertion line, shown at the gap the item would land in.
 *
 * Built in-house (rather than pulling `@atlaskit/*-react-drop-indicator`, which
 * drags in the Atlassian Design System) so it themes with nqui tokens.
 *
 * Render inside a `position: relative` element and pass the `closestEdge` from
 * `useDropTarget`. The line is positioned on the shared boundary and then
 * nudged *outward* by half the list's gap, which places it exactly between the
 * two neighbours — an insertion point is a gap, not a property of one item.
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
    // indicator → item → list. The list owns the flex/grid gap.
    const list = nodeRef.current?.parentElement?.parentElement;
    if (!list) return;
    const styles = getComputedStyle(list);
    setMeasuredGap(
      parseGap(isVertical ? styles.rowGap : styles.columnGap),
    );
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
        "pointer-events-none absolute z-10 rounded-full bg-primary",
        "before:absolute before:size-1.5 before:rounded-full before:border-2 before:border-primary before:bg-background",
        edge === "top" && "before:-top-[3px] before:-left-1",
        edge === "bottom" && "before:-bottom-[3px] before:-left-1",
        edge === "left" && "before:-left-[3px] before:-top-1",
        edge === "right" && "before:-right-[3px] before:-top-1",
        edgeToClass[edge],
        className,
      )}
      style={{
        // Negative: push the line off this item's border and into the middle
        // of the gap it shares with its neighbour.
        [edgeToMargin[edge]]: -effectiveGap / 2,
        ...style,
      }}
    />
  );
}
