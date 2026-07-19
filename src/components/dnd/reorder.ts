import type { DragAxis, Edge } from "./types";

/** Move an item within an array, returning a new array. */
export function reorder<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  if (from < 0 || from >= next.length) return next;
  const [moved] = next.splice(from, 1);
  const clamped = Math.max(0, Math.min(to, next.length));
  next.splice(clamped, 0, moved);
  return next;
}

/**
 * Destination index when reordering *within the same list*, accounting for the
 * moved item being removed first. Mirrors Pragmatic's hitbox helper so we don't
 * take a hard dependency on its exact export path.
 */
export function getReorderDestinationIndex({
  startIndex,
  indexOfTarget,
  closestEdgeOfTarget,
  axis = "vertical",
}: {
  startIndex: number;
  indexOfTarget: number;
  closestEdgeOfTarget: Edge | null;
  axis?: DragAxis;
}): number {
  if (startIndex === indexOfTarget || indexOfTarget === -1) return startIndex;

  const edgeAfter: Edge = axis === "vertical" ? "bottom" : "right";

  if (startIndex < indexOfTarget) {
    return closestEdgeOfTarget === edgeAfter ? indexOfTarget : indexOfTarget - 1;
  }
  return closestEdgeOfTarget === edgeAfter ? indexOfTarget + 1 : indexOfTarget;
}

/**
 * Which edges of a drop target actually produce a *different* order.
 *
 * Edge hitboxes are a lie by default: with items `[A, B]`, grabbing `B` offers
 * four zones (either side of A, either side of B) but only "before A" changes
 * anything — the other three all resolve back to B's current index. Showing a
 * drop indicator for those promises a move that never happens.
 *
 * Think in *insertion gaps*, not element edges: n items have n+1 gaps, and the
 * two gaps touching the dragged item are always no-ops. So the real count is
 * n-1 (with 2 items: exactly one).
 *
 * Feed the result to `useDropTarget`'s `edges`. Two useful consequences:
 * - an empty result means the target is inert — reject it in `canDrop`;
 * - a single-edge result makes the *whole element* resolve to that edge, so
 *   there is no dead half where hovering does nothing.
 */
export function meaningfulEdges({
  sourceIndex,
  targetIndex,
  axis = "vertical",
  sameContainer = true,
}: {
  sourceIndex: number;
  targetIndex: number;
  axis?: DragAxis;
  /**
   * False when the item is moving between containers — every gap is then a
   * real move, because the item isn't in this list to begin with.
   */
  sameContainer?: boolean;
}): Edge[] {
  const leading: Edge = axis === "vertical" ? "top" : "left";
  const trailing: Edge = axis === "vertical" ? "bottom" : "right";

  if (!sameContainer) return [leading, trailing];
  // Hovering the dragged item itself can never reorder it.
  if (sourceIndex === targetIndex) return [];

  return [leading, trailing].filter(
    (edge) =>
      getReorderDestinationIndex({
        startIndex: sourceIndex,
        indexOfTarget: targetIndex,
        closestEdgeOfTarget: edge,
        axis,
      }) !== sourceIndex,
  );
}

/**
 * Insertion index when moving an item *into a different list* (the moved item
 * is not already present, so no removal adjustment applies).
 */
export function getInsertionIndex({
  indexOfTarget,
  closestEdgeOfTarget,
  axis = "vertical",
}: {
  indexOfTarget: number;
  closestEdgeOfTarget: Edge | null;
  axis?: DragAxis;
}): number {
  if (indexOfTarget === -1) return 0;
  const edgeAfter: Edge = axis === "vertical" ? "bottom" : "right";
  return closestEdgeOfTarget === edgeAfter ? indexOfTarget + 1 : indexOfTarget;
}
