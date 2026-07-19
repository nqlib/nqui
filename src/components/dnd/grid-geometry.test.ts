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

const config = { rowHeight: 100, gap: 10 };

describe("columnWidth", () => {
  it("subtracts the inter-column gaps", () => {
    // 1000px, 10 cols, 9 gaps of 10px => 910 / 10 = 91
    expect(columnWidth(1000, 10, 10)).toBe(91);
  });

  it("returns 0 for a non-positive column count", () => {
    expect(columnWidth(1000, 0, 10)).toBe(0);
  });
});

describe("cellToPx", () => {
  it("positions and sizes a single cell", () => {
    expect(cellToPx({ x: 0, y: 0, w: 1, h: 1 }, 100, config)).toEqual({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });
  });

  it("includes interior gaps in a multi-cell span", () => {
    // w:2 => 2*100 + 1*10 = 210
    expect(cellToPx({ x: 1, y: 2, w: 2, h: 3 }, 100, config)).toEqual({
      left: 110,
      top: 220,
      width: 210,
      height: 320,
    });
  });
});

describe("pxToCell / pxToSpan", () => {
  it("round-trips a cell position", () => {
    const px = cellToPx({ x: 3, y: 2, w: 1, h: 1 }, 100, config);
    expect(pxToCell(px.left, px.top, 100, config)).toEqual({ x: 3, y: 2 });
  });

  it("round-trips a span", () => {
    const px = cellToPx({ x: 0, y: 0, w: 4, h: 2 }, 100, config);
    expect(pxToSpan(px.width, px.height, 100, config)).toEqual({ w: 4, h: 2 });
  });

  it("never returns a span below 1", () => {
    expect(pxToSpan(0, 0, 100, config)).toEqual({ w: 1, h: 1 });
  });
});

describe("collides", () => {
  const a: GridItem = { i: "a", x: 0, y: 0, w: 2, h: 2 };

  it("detects an overlap", () => {
    expect(collides(a, { i: "b", x: 1, y: 1, w: 2, h: 2 })).toBe(true);
  });

  it("treats edge adjacency as non-overlapping", () => {
    expect(collides(a, { i: "b", x: 2, y: 0, w: 2, h: 2 })).toBe(false);
    expect(collides(a, { i: "b", x: 0, y: 2, w: 2, h: 2 })).toBe(false);
  });

  it("never collides with itself", () => {
    expect(collides(a, { ...a })).toBe(false);
  });
});

describe("clampItem", () => {
  it("keeps an item inside the right edge", () => {
    expect(clampItem({ i: "a", x: 11, y: 0, w: 3, h: 1 }, 12)).toMatchObject({
      x: 9,
    });
  });

  it("applies min and max width", () => {
    expect(
      clampItem({ i: "a", x: 0, y: 0, w: 1, h: 1, minW: 3 }, 12),
    ).toMatchObject({ w: 3 });
    expect(
      clampItem({ i: "a", x: 0, y: 0, w: 8, h: 1, maxW: 4 }, 12),
    ).toMatchObject({ w: 4 });
  });

  it("caps width at the column count", () => {
    expect(clampItem({ i: "a", x: 0, y: 0, w: 99, h: 1 }, 6)).toMatchObject({
      w: 6,
      x: 0,
    });
  });

  it("clamps negative coordinates", () => {
    expect(clampItem({ i: "a", x: -5, y: -5, w: 1, h: 1 }, 12)).toMatchObject({
      x: 0,
      y: 0,
    });
  });
});

describe("resolveLayout", () => {
  it("pins the active item and pushes a colliding item below it", () => {
    const layout: GridItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 0, w: 2, h: 2 }, // dropped on top of a
    ];
    const next = resolveLayout(layout, "b");
    const b = next.find((i) => i.i === "b")!;
    const a = next.find((i) => i.i === "a")!;
    expect(b).toMatchObject({ x: 0, y: 0 }); // active stays put
    expect(a.y).toBe(2); // pushed down, no overlap
    expect(collides(a, b)).toBe(false);
  });

  it("floats non-active items up into free space", () => {
    const layout: GridItem[] = [
      { i: "a", x: 0, y: 5, w: 2, h: 1 },
      { i: "b", x: 4, y: 0, w: 2, h: 1 },
    ];
    const next = resolveLayout(layout, "b");
    expect(next.find((i) => i.i === "a")!.y).toBe(0);
  });

  it("preserves the input order", () => {
    const layout: GridItem[] = [
      { i: "a", x: 0, y: 3, w: 1, h: 1 },
      { i: "b", x: 0, y: 0, w: 1, h: 1 },
      { i: "c", x: 2, y: 1, w: 1, h: 1 },
    ];
    expect(resolveLayout(layout, "b").map((i) => i.i)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("returns the layout untouched for an unknown active id", () => {
    const layout: GridItem[] = [{ i: "a", x: 0, y: 0, w: 1, h: 1 }];
    expect(resolveLayout(layout, "zzz")).toBe(layout);
  });

  it("leaves a non-overlapping layout stable", () => {
    const layout: GridItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 1 },
      { i: "b", x: 2, y: 0, w: 2, h: 1 },
    ];
    expect(resolveLayout(layout, "a")).toEqual(layout);
  });
});

describe("moveItem / resizeItem", () => {
  const layout: GridItem[] = [
    { i: "a", x: 0, y: 0, w: 3, h: 2 },
    { i: "b", x: 3, y: 0, w: 3, h: 2 },
  ];

  it("moves an item and de-collides the rest", () => {
    const next = moveItem(layout, "a", 3, 0, 12);
    const a = next.find((i) => i.i === "a")!;
    const b = next.find((i) => i.i === "b")!;
    expect(a).toMatchObject({ x: 3, y: 0 });
    expect(collides(a, b)).toBe(false);
  });

  it("clamps a move past the right edge", () => {
    expect(moveItem(layout, "a", 99, 0, 12).find((i) => i.i === "a")).toMatchObject(
      { x: 9 },
    );
  });

  it("resizes and reflows", () => {
    const next = resizeItem(layout, "a", 6, 2, 12);
    const a = next.find((i) => i.i === "a")!;
    const b = next.find((i) => i.i === "b")!;
    expect(a.w).toBe(6);
    expect(collides(a, b)).toBe(false);
  });

  it("respects minW during a resize", () => {
    const constrained: GridItem[] = [
      { i: "a", x: 0, y: 0, w: 4, h: 2, minW: 3 },
    ];
    expect(resizeItem(constrained, "a", 1, 2, 12)[0].w).toBe(3);
  });
});

describe("layoutRowCount", () => {
  it("returns the furthest occupied row", () => {
    expect(
      layoutRowCount([
        { i: "a", x: 0, y: 0, w: 1, h: 2 },
        { i: "b", x: 1, y: 3, w: 1, h: 1 },
      ]),
    ).toBe(4);
  });

  it("returns 0 for an empty layout", () => {
    expect(layoutRowCount([])).toBe(0);
  });
});
