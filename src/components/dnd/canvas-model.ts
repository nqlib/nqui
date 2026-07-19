/**
 * Pure canvas geometry for `Canvas`. No React, no DOM — deterministic and
 * unit-tested, which keeps the interactive component thin (same split as
 * `grid-geometry.ts`).
 *
 * Unlike the grid, coordinates here are *free px*: a node sits wherever its
 * `{x,y}` puts it, and snapping is an opt-in rounding pass rather than the
 * coordinate system itself.
 *
 * Every function is pure and total: inputs are never mutated and nothing
 * throws, so callers can feed them raw pointer math without guarding.
 */

export interface CanvasNode {
  /** Stable id. */
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Paint/hit-test order. Higher wins; treated as 0 when omitted. */
  z?: number;
  /** When true, the node cannot be moved (it is still selectable). */
  locked?: boolean;
}

export interface CanvasRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MoveNodesOptions {
  /** Grid pitch in px for snap-to-grid. 0 or omitted disables snapping. */
  snap?: number;
  /** Canvas extent; moved nodes are kept fully inside it. */
  bounds?: { w: number; h: number };
}

/* -------------------------------------------------------------------------- */
/*  Scalars                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Round `v` to the nearest multiple of `grid`. A non-positive or non-finite
 * grid means "no snapping", so callers can pass `snap` straight through
 * without branching.
 */
export function snapValue(v: number, grid: number): number {
  if (!Number.isFinite(v)) return v;
  if (!Number.isFinite(grid) || grid <= 0) return v;
  return Math.round(v / grid) * grid;
}

function clamp(v: number, lo: number, hi: number): number {
  // `lo` wins when the range is inverted (node wider than the bounds): pinning
  // the top-left is less surprising than pinning the bottom-right.
  if (hi < lo) return lo;
  return Math.min(Math.max(v, lo), hi);
}

function zOf(node: CanvasNode): number {
  return node.z ?? 0;
}

/** Normalise a rect that may have been dragged right-to-left or bottom-to-top. */
export function normalizeRect(rect: CanvasRect): CanvasRect {
  return {
    x: rect.w < 0 ? rect.x + rect.w : rect.x,
    y: rect.h < 0 ? rect.y + rect.h : rect.y,
    w: Math.abs(rect.w),
    h: Math.abs(rect.h),
  };
}

/* -------------------------------------------------------------------------- */
/*  Movement                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Translate the nodes in `ids` by `(dx, dy)`.
 *
 * The delta is resolved once for the whole set rather than per node, so a
 * multi-selection moves rigidly: snapping is derived from the first movable
 * node (the anchor) and bounds clamping tightens the shared delta until every
 * moving node fits. Per-node clamping would deform the selection instead.
 *
 * Locked nodes are dropped from the set entirely — they neither move nor
 * constrain the delta. Returns a new array in the input order.
 */
export function moveNodes(
  nodes: CanvasNode[],
  ids: string[],
  dx: number,
  dy: number,
  opts: MoveNodesOptions = {},
): CanvasNode[] {
  const moving = new Set(ids);
  const targets = nodes.filter((n) => moving.has(n.id) && !n.locked);
  if (targets.length === 0) return nodes.map((n) => ({ ...n }));

  let deltaX = Number.isFinite(dx) ? dx : 0;
  let deltaY = Number.isFinite(dy) ? dy : 0;

  const snap = opts.snap ?? 0;
  if (snap > 0 && Number.isFinite(snap)) {
    const anchor = targets[0];
    deltaX = snapValue(anchor.x + deltaX, snap) - anchor.x;
    deltaY = snapValue(anchor.y + deltaY, snap) - anchor.y;
  }

  const bounds = opts.bounds;
  if (bounds) {
    // Widest delta that keeps *every* moving node inside the canvas.
    let loX = Number.NEGATIVE_INFINITY;
    let hiX = Number.POSITIVE_INFINITY;
    let loY = Number.NEGATIVE_INFINITY;
    let hiY = Number.POSITIVE_INFINITY;
    for (const n of targets) {
      loX = Math.max(loX, -n.x);
      hiX = Math.min(hiX, bounds.w - n.w - n.x);
      loY = Math.max(loY, -n.y);
      hiY = Math.min(hiY, bounds.h - n.h - n.y);
    }
    deltaX = clamp(deltaX, loX, hiX);
    deltaY = clamp(deltaY, loY, hiY);
  }

  return nodes.map((n) =>
    moving.has(n.id) && !n.locked
      ? { ...n, x: n.x + deltaX, y: n.y + deltaY }
      : { ...n },
  );
}

/* -------------------------------------------------------------------------- */
/*  Hit testing                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Topmost node containing the point, or null. "Topmost" is highest `z`, then
 * latest in the array — the same order the renderer paints in.
 *
 * Bounds are half-open (`x <= px < x + w`) so abutting nodes never both claim
 * the shared edge.
 */
export function nodeAt(
  nodes: CanvasNode[],
  x: number,
  y: number,
): CanvasNode | null {
  let hit: CanvasNode | null = null;
  for (const n of nodes) {
    const inside =
      x >= n.x && x < n.x + n.w && y >= n.y && y < n.y + n.h;
    if (!inside) continue;
    if (hit === null || zOf(n) >= zOf(hit)) hit = n;
  }
  return hit;
}

/**
 * Nodes touched by a marquee rect, in array order. Selection is by
 * intersection (Figma-style), not full containment, and the overlap must have
 * area — a zero-width or zero-height marquee selects nothing.
 */
export function nodesInRect(nodes: CanvasNode[], rect: CanvasRect): CanvasNode[] {
  const r = normalizeRect(rect);
  if (r.w <= 0 || r.h <= 0) return [];
  return nodes.filter(
    (n) =>
      n.x < r.x + r.w &&
      n.x + n.w > r.x &&
      n.y < r.y + r.h &&
      n.y + n.h > r.y,
  );
}

/* -------------------------------------------------------------------------- */
/*  Stacking                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Raise `ids` above every other node, preserving their relative order so a
 * multi-selection keeps its internal stacking. Array order is untouched;
 * only `z` changes.
 */
export function bringToFront(nodes: CanvasNode[], ids: string[]): CanvasNode[] {
  const raising = new Set(ids);
  const present = nodes.some((n) => raising.has(n.id));
  if (!present) return nodes.map((n) => ({ ...n }));

  const top = nodes.reduce(
    (max, n) => (raising.has(n.id) ? max : Math.max(max, zOf(n))),
    Number.NEGATIVE_INFINITY,
  );
  const base = Number.isFinite(top) ? top : 0;

  // Rank the raised nodes among themselves first, so their existing stacking
  // survives the lift.
  const ordered = nodes
    .filter((n) => raising.has(n.id))
    .map((n, index) => ({ id: n.id, z: zOf(n), index }))
    .sort((a, b) => a.z - b.z || a.index - b.index);
  const rank = new Map(ordered.map((entry, i) => [entry.id, i]));

  return nodes.map((n) =>
    raising.has(n.id) ? { ...n, z: base + 1 + (rank.get(n.id) ?? 0) } : { ...n },
  );
}
