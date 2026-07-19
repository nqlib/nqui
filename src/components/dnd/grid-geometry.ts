/**
 * Pure grid geometry for `GridLayout`. No React, no DOM — all functions here are
 * deterministic and unit-tested, which keeps the interactive component thin.
 *
 * Coordinates are in *grid cells*: `x`/`w` in columns, `y`/`h` in rows.
 */

export interface GridItem {
  /** Stable id. */
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  /** When true, the item cannot be dragged or resized. */
  static?: boolean;
}

export interface GridConfig {
  cols: number;
  rowHeight: number;
  /** Gap in px between cells, both axes. */
  gap: number;
}

export interface PxRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Width of a single column in px, given the container's content width. */
export function columnWidth(containerWidth: number, cols: number, gap: number): number {
  if (cols <= 0) return 0;
  return (containerWidth - gap * (cols - 1)) / cols;
}

/** Convert a cell rect to an absolute px rect. */
export function cellToPx(
  item: Pick<GridItem, "x" | "y" | "w" | "h">,
  colWidth: number,
  { rowHeight, gap }: Pick<GridConfig, "rowHeight" | "gap">,
): PxRect {
  return {
    left: Math.round(item.x * (colWidth + gap)),
    top: Math.round(item.y * (rowHeight + gap)),
    width: Math.round(item.w * colWidth + Math.max(0, item.w - 1) * gap),
    height: Math.round(item.h * rowHeight + Math.max(0, item.h - 1) * gap),
  };
}

/** Convert a px offset (relative to the grid's top-left) to the nearest cell. */
export function pxToCell(
  left: number,
  top: number,
  colWidth: number,
  { rowHeight, gap }: Pick<GridConfig, "rowHeight" | "gap">,
): { x: number; y: number } {
  return {
    x: Math.round(left / (colWidth + gap)),
    y: Math.round(top / (rowHeight + gap)),
  };
}

/** Convert a px size to a cell size (rounded, min 1). */
export function pxToSpan(
  width: number,
  height: number,
  colWidth: number,
  { rowHeight, gap }: Pick<GridConfig, "rowHeight" | "gap">,
): { w: number; h: number } {
  return {
    w: Math.max(1, Math.round((width + gap) / (colWidth + gap))),
    h: Math.max(1, Math.round((height + gap) / (rowHeight + gap))),
  };
}

/** Do two items overlap? */
export function collides(a: GridItem, b: GridItem): boolean {
  if (a.i === b.i) return false;
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function collidesAny(item: GridItem, list: GridItem[]): boolean {
  return list.some((other) => collides(item, other));
}

/** Clamp an item to the grid bounds and its own min/max constraints. */
export function clampItem(item: GridItem, cols: number): GridItem {
  const minW = item.minW ?? 1;
  const maxW = Math.min(item.maxW ?? cols, cols);
  const w = Math.max(minW, Math.min(item.w, maxW));

  const minH = item.minH ?? 1;
  const maxH = item.maxH ?? Number.POSITIVE_INFINITY;
  const h = Math.max(minH, Math.min(item.h, maxH));

  const x = Math.max(0, Math.min(item.x, cols - w));
  const y = Math.max(0, item.y);

  return { ...item, x, y, w, h };
}

/**
 * Resolve overlaps after `activeId` has moved/resized: the active item stays
 * pinned where the user put it, and every other item is pushed down and then
 * compacted upward around it (vertical compaction, react-grid-layout style).
 * Returns a new layout preserving the input order.
 */
export function resolveLayout(layout: GridItem[], activeId: string): GridItem[] {
  const active = layout.find((i) => i.i === activeId);
  if (!active) return layout;

  const placed: GridItem[] = [active];
  const others = layout
    .filter((i) => i.i !== activeId)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (const it of others) {
    const cur: GridItem = { ...it };
    // Float up as far as possible.
    while (cur.y > 0 && !collidesAny({ ...cur, y: cur.y - 1 }, placed)) {
      cur.y -= 1;
    }
    // If still overlapping (e.g. the active item sits here), sink until free.
    let guard = 0;
    while (collidesAny(cur, placed) && guard < 1000) {
      cur.y += 1;
      guard += 1;
    }
    placed.push(cur);
  }

  // Re-key back to input order for stable diffing.
  const byId = new Map(placed.map((i) => [i.i, i]));
  return layout.map((i) => byId.get(i.i) ?? i);
}

/** Total number of rows the layout occupies (for sizing the container). */
export function layoutRowCount(layout: GridItem[]): number {
  return layout.reduce((max, i) => Math.max(max, i.y + i.h), 0);
}

/** Move `id` to a new cell position, clamped and de-collided. */
export function moveItem(
  layout: GridItem[],
  id: string,
  x: number,
  y: number,
  cols: number,
): GridItem[] {
  const next = layout.map((i) =>
    i.i === id ? clampItem({ ...i, x, y }, cols) : i,
  );
  return resolveLayout(next, id);
}

/** Resize `id` to a new cell span, clamped and de-collided. */
export function resizeItem(
  layout: GridItem[],
  id: string,
  w: number,
  h: number,
  cols: number,
): GridItem[] {
  const next = layout.map((i) =>
    i.i === id ? clampItem({ ...i, w, h }, cols) : i,
  );
  return resolveLayout(next, id);
}
