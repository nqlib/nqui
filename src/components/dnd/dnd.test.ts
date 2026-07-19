import { describe, expect, it } from "vitest";
import {
  cellToPx,
  clampItem,
  collides,
  columnWidth,
  type GridItem,
  layoutRowCount,
  moveItem,
  pxToCell,
  pxToSpan,
  resizeItem,
  resolveLayout,
} from "./grid-geometry";
import { applyCardDrop, type KanbanColumns } from "./kanban-model";
import {
  getInsertionIndex,
  getReorderDestinationIndex,
  reorder,
} from "./reorder";

/* --------------------------------- reorder -------------------------------- */

describe("reorder", () => {
  it("moves an item forward", () => {
    expect(reorder(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
  });
  it("moves an item backward", () => {
    expect(reorder(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"]);
  });
  it("clamps out-of-range destinations", () => {
    expect(reorder(["a", "b"], 0, 99)).toEqual(["b", "a"]);
  });
  it("ignores out-of-range source", () => {
    expect(reorder(["a", "b"], 5, 0)).toEqual(["a", "b"]);
  });
});

describe("getReorderDestinationIndex (same list)", () => {
  const axis = "vertical" as const;
  it("returns start when target is self", () => {
    expect(
      getReorderDestinationIndex({ startIndex: 2, indexOfTarget: 2, closestEdgeOfTarget: "top", axis }),
    ).toBe(2);
  });
  it("moving forward, top edge lands before target (minus removal)", () => {
    expect(
      getReorderDestinationIndex({ startIndex: 0, indexOfTarget: 2, closestEdgeOfTarget: "top", axis }),
    ).toBe(1);
  });
  it("moving forward, bottom edge lands at target", () => {
    expect(
      getReorderDestinationIndex({ startIndex: 0, indexOfTarget: 2, closestEdgeOfTarget: "bottom", axis }),
    ).toBe(2);
  });
  it("moving backward, top edge lands at target", () => {
    expect(
      getReorderDestinationIndex({ startIndex: 3, indexOfTarget: 1, closestEdgeOfTarget: "top", axis }),
    ).toBe(1);
  });
  it("moving backward, bottom edge lands after target", () => {
    expect(
      getReorderDestinationIndex({ startIndex: 3, indexOfTarget: 1, closestEdgeOfTarget: "bottom", axis }),
    ).toBe(2);
  });
  it("respects horizontal axis (right = after)", () => {
    expect(
      getReorderDestinationIndex({ startIndex: 0, indexOfTarget: 2, closestEdgeOfTarget: "right", axis: "horizontal" }),
    ).toBe(2);
  });
});

describe("getInsertionIndex (cross list)", () => {
  it("top edge inserts before target", () => {
    expect(getInsertionIndex({ indexOfTarget: 2, closestEdgeOfTarget: "top" })).toBe(2);
  });
  it("bottom edge inserts after target", () => {
    expect(getInsertionIndex({ indexOfTarget: 2, closestEdgeOfTarget: "bottom" })).toBe(3);
  });
  it("empty target list inserts at 0", () => {
    expect(getInsertionIndex({ indexOfTarget: -1, closestEdgeOfTarget: null })).toBe(0);
  });
});

/* ------------------------------- kanban model ----------------------------- */

describe("applyCardDrop", () => {
  const base: KanbanColumns = { todo: ["a", "b", "c"], doing: ["d"], done: [] };

  it("reorders within a column", () => {
    const next = applyCardDrop(base, {
      cardId: "a",
      fromColumnId: "todo",
      fromIndex: 0,
      toColumnId: "todo",
      toIndex: 2,
    });
    expect(next.todo).toEqual(["b", "c", "a"]);
  });

  it("moves a card to another column at an index", () => {
    const next = applyCardDrop(base, {
      cardId: "b",
      fromColumnId: "todo",
      fromIndex: 1,
      toColumnId: "doing",
      toIndex: 0,
    });
    expect(next.todo).toEqual(["a", "c"]);
    expect(next.doing).toEqual(["b", "d"]);
  });

  it("appends to an empty column with toIndex -1", () => {
    const next = applyCardDrop(base, {
      cardId: "c",
      fromColumnId: "todo",
      fromIndex: 2,
      toColumnId: "done",
      toIndex: -1,
    });
    expect(next.todo).toEqual(["a", "b"]);
    expect(next.done).toEqual(["c"]);
  });

  it("locates the card by id when the index is stale", () => {
    const next = applyCardDrop(base, {
      cardId: "c",
      fromColumnId: "todo",
      fromIndex: 0, // wrong on purpose
      toColumnId: "doing",
      toIndex: 1,
    });
    expect(next.todo).toEqual(["a", "b"]);
    expect(next.doing).toEqual(["d", "c"]);
  });

  it("is a no-op for unknown columns", () => {
    const next = applyCardDrop(base, {
      cardId: "a",
      fromColumnId: "nope",
      fromIndex: 0,
      toColumnId: "todo",
      toIndex: 0,
    });
    expect(next).toBe(base);
  });

  it("does not mutate the input", () => {
    const snapshot = JSON.parse(JSON.stringify(base));
    applyCardDrop(base, {
      cardId: "a",
      fromColumnId: "todo",
      fromIndex: 0,
      toColumnId: "doing",
      toIndex: 0,
    });
    expect(base).toEqual(snapshot);
  });
});

/* ------------------------------ grid geometry ----------------------------- */

describe("grid geometry — px conversions", () => {
  it("columnWidth accounts for gaps", () => {
    // 12 cols, 11 gaps of 10px in a 1330px container → (1330 - 110)/12 = 101.67
    expect(columnWidth(1330, 12, 10)).toBeCloseTo(101.666, 2);
  });
  it("cellToPx positions and sizes a cell", () => {
    const px = cellToPx({ x: 2, y: 1, w: 3, h: 2 }, 100, { rowHeight: 80, gap: 10 });
    expect(px.left).toBe(2 * 110);
    expect(px.top).toBe(1 * 90);
    expect(px.width).toBe(3 * 100 + 2 * 10);
    expect(px.height).toBe(2 * 80 + 1 * 10);
  });
  it("pxToCell inverts cellToPx (approximately)", () => {
    const cfg = { rowHeight: 80, gap: 10 };
    const px = cellToPx({ x: 3, y: 4, w: 1, h: 1 }, 100, cfg);
    expect(pxToCell(px.left, px.top, 100, cfg)).toEqual({ x: 3, y: 4 });
  });
  it("pxToSpan rounds to at least 1 cell", () => {
    expect(pxToSpan(0, 0, 100, { rowHeight: 80, gap: 10 })).toEqual({ w: 1, h: 1 });
    expect(pxToSpan(320, 170, 100, { rowHeight: 80, gap: 10 })).toEqual({ w: 3, h: 2 });
  });
});

describe("grid geometry — collision + clamp", () => {
  it("detects overlap and ignores self", () => {
    const a: GridItem = { i: "a", x: 0, y: 0, w: 2, h: 2 };
    const b: GridItem = { i: "b", x: 1, y: 1, w: 2, h: 2 };
    const c: GridItem = { i: "c", x: 5, y: 5, w: 1, h: 1 };
    expect(collides(a, b)).toBe(true);
    expect(collides(a, c)).toBe(false);
    expect(collides(a, { ...a, i: "a" })).toBe(false);
  });
  it("clamps width, position, and min/max", () => {
    const item: GridItem = { i: "a", x: 20, y: -3, w: 20, h: 1, maxW: 4 };
    const clamped = clampItem(item, 12);
    expect(clamped.w).toBe(4);
    expect(clamped.x).toBe(12 - 4);
    expect(clamped.y).toBe(0);
  });
  it("enforces minimum sizes", () => {
    const clamped = clampItem({ i: "a", x: 0, y: 0, w: 1, h: 1, minW: 3, minH: 2 }, 12);
    expect(clamped.w).toBe(3);
    expect(clamped.h).toBe(2);
  });
});

describe("grid geometry — resolveLayout / move / resize", () => {
  it("pushes colliding items down and compacts", () => {
    const layout: GridItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 2, w: 2, h: 2 },
    ];
    // Move b onto a's spot: b is the active item and wins (0,0); a is pushed
    // down and compacts to just under b.
    const next = moveItem(layout, "b", 0, 0, 12);
    const a = next.find((i) => i.i === "a")!;
    const b = next.find((i) => i.i === "b")!;
    expect(b.y).toBe(0);
    expect(collides(a, b)).toBe(false);
    expect(a.y).toBe(2);
  });

  it("floats items up to fill vacated space", () => {
    const layout: GridItem[] = [
      { i: "a", x: 0, y: 5, w: 2, h: 1 },
      { i: "b", x: 3, y: 0, w: 2, h: 1 },
    ];
    // b is the active item at its own spot; a should float to the top.
    const next = resolveLayout(layout, "b");
    expect(next.find((i) => i.i === "a")!.y).toBe(0);
  });

  it("keeps the active item pinned while others avoid it", () => {
    const layout: GridItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 2, w: 2, h: 2 },
      { i: "c", x: 0, y: 4, w: 2, h: 2 },
    ];
    const next = resizeItem(layout, "a", 2, 4, 12); // a grows down over b
    const a = next.find((i) => i.i === "a")!;
    expect(a.h).toBe(4);
    for (const other of next.filter((i) => i.i !== "a")) {
      expect(collides(a, other)).toBe(false);
    }
  });

  it("layoutRowCount returns the furthest occupied row", () => {
    expect(
      layoutRowCount([
        { i: "a", x: 0, y: 0, w: 1, h: 2 },
        { i: "b", x: 1, y: 3, w: 1, h: 2 },
      ]),
    ).toBe(5);
  });
});
