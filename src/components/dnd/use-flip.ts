"use client";

import * as React from "react";

/** True when the user has asked for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** A measured position delta for one tracked element. */
export interface FlipMove {
  dx: number;
  dy: number;
}

/**
 * Did these deltas come from a *reorder*, or from the container moving?
 *
 * Extracted as a pure function because it is the whole correctness question of
 * this hook, and it cannot be exercised through the DOM — jsdom reports every
 * `offsetLeft`/`offsetTop` as 0, so a rendered test can never see a delta.
 *
 * - Nothing moved → not a reorder.
 * - Two or more elements all shifted by the *same* non-zero amount → the
 *   container moved (resize, fonts settling on mount, ancestor reflow).
 *   Animating that makes the entire list lurch.
 * - Anything else — a lone element moving, or elements moving by differing
 *   amounts — is a genuine reorder.
 */
export function isReorder(moves: readonly FlipMove[]): boolean {
  if (moves.length === 0) return false;
  if (moves.every((m) => m.dx === 0 && m.dy === 0)) return false;

  // A single element is trivially "uniform", so it can never be judged a
  // container shift — and one item moving alone is the commonest real reorder
  // (removing the first of two items moves exactly one survivor).
  if (moves.length === 1) return true;

  const [first] = moves;
  const uniform = moves.every((m) => m.dx === first.dx && m.dy === first.dy);
  return !uniform;
}

export interface UseFlipOptions {
  /** Animation duration in ms. Defaults to 200. */
  duration?: number;
  /** Easing curve. Defaults to a gentle deceleration. */
  easing?: string;
  /** Turn the animation off (e.g. for very large lists). Defaults to true. */
  enabled?: boolean;
  /**
   * Which elements this container owns. Defaults to its *direct* children —
   * a descendant selector would let an outer container (a Kanban board) also
   * claim an inner one's items (the cards), animating each item twice and
   * bleeding one list's drop into unrelated ones.
   */
  selector?: string;
}

/**
 * FLIP-animate direct descendants tagged with `data-flip-id` inside `ref`.
 *
 * After a reorder, items jump straight to their new coordinates — which reads
 * as a glitch. This measures each tagged element every commit, and when one has
 * moved, plays it from its previous position to its new one. The DOM is never
 * mutated; only a transient transform is animated, so layout stays authoritative.
 *
 * Automatically disabled under `prefers-reduced-motion`.
 */
export function useFlip(
  ref: React.RefObject<HTMLElement | null>,
  options: UseFlipOptions = {},
): void {
  const {
    duration = 200,
    easing = "cubic-bezier(0.2, 0, 0, 1)",
    enabled = true,
    selector = ":scope > [data-flip-id]",
  } = options;

  const reducedMotion = usePrefersReducedMotion();
  const previous = React.useRef<Map<string, { left: number; top: number }>>(
    new Map(),
  );

  React.useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>(selector);
    const next = new Map<string, { left: number; top: number }>();
    const active = enabled && !reducedMotion;

    // Measure everything first, so we can tell a reorder from a layout shift.
    const moves: { node: HTMLElement; dx: number; dy: number }[] = [];

    for (const node of nodes) {
      const id = node.dataset.flipId;
      if (!id) continue;

      // Offset positions, NOT getBoundingClientRect(): client rects are
      // viewport-relative, so any scroll during the interaction makes every
      // tracked element look like it moved and animates the whole list by the
      // scroll delta. Offsets are relative to the offset parent and immune.
      const position = { left: node.offsetLeft, top: node.offsetTop };
      next.set(id, position);
      if (!active) continue;

      const last = previous.current.get(id);
      if (!last) continue; // newly mounted — nothing to animate from

      moves.push({
        node,
        dx: last.left - position.left,
        dy: last.top - position.top,
      });
    }

    previous.current = next;
    if (!active || moves.length === 0) return;

    if (!isReorder(moves)) return;

    for (const { node, dx, dy } of moves) {
      if (dx === 0 && dy === 0) continue;
      node.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" },
        ],
        { duration, easing },
      );
    }
  });
}

/**
 * Brief highlight on an element that just moved — the post-drop confirmation
 * that replaces the native ghost snapping back. No-op under reduced motion.
 */
export function flashElement(
  element: HTMLElement | null,
  { duration = 500 }: { duration?: number } = {},
): void {
  if (!element || typeof element.animate !== "function") return;
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  element.animate(
    [
      { boxShadow: "0 0 0 2px var(--ring, currentColor)" },
      { boxShadow: "0 0 0 0 transparent" },
    ],
    { duration, easing: "ease-out" },
  );
}
