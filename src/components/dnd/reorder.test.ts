import { describe, expect, it } from "vitest";
import {
  getInsertionIndex,
  getReorderDestinationIndex,
  meaningfulEdges,
  reorder,
} from "./reorder";

describe("reorder", () => {
  it("moves an item forward", () => {
    expect(reorder(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
  });

  it("moves an item backward", () => {
    expect(reorder(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"]);
  });

  it("clamps an out-of-range destination", () => {
    expect(reorder(["a", "b"], 0, 99)).toEqual(["b", "a"]);
  });

  it("returns a copy when the source index is invalid", () => {
    const list = ["a", "b"];
    expect(reorder(list, 5, 0)).toEqual(["a", "b"]);
  });
});

describe("getReorderDestinationIndex (same list)", () => {
  // list: [A,B,C,D] — moving A (index 0)
  it("drops before a later target", () => {
    expect(
      getReorderDestinationIndex({
        startIndex: 0,
        indexOfTarget: 2,
        closestEdgeOfTarget: "top",
      }),
    ).toBe(1);
  });

  it("drops after a later target", () => {
    expect(
      getReorderDestinationIndex({
        startIndex: 0,
        indexOfTarget: 2,
        closestEdgeOfTarget: "bottom",
      }),
    ).toBe(2);
  });

  // moving D (index 3) backward
  it("drops before an earlier target", () => {
    expect(
      getReorderDestinationIndex({
        startIndex: 3,
        indexOfTarget: 1,
        closestEdgeOfTarget: "top",
      }),
    ).toBe(1);
  });

  it("drops after an earlier target", () => {
    expect(
      getReorderDestinationIndex({
        startIndex: 3,
        indexOfTarget: 1,
        closestEdgeOfTarget: "bottom",
      }),
    ).toBe(2);
  });

  it("is a no-op onto itself", () => {
    expect(
      getReorderDestinationIndex({
        startIndex: 2,
        indexOfTarget: 2,
        closestEdgeOfTarget: "top",
      }),
    ).toBe(2);
  });

  it("honours the horizontal axis", () => {
    expect(
      getReorderDestinationIndex({
        startIndex: 0,
        indexOfTarget: 2,
        closestEdgeOfTarget: "right",
        axis: "horizontal",
      }),
    ).toBe(2);
  });

  it("round-trips through reorder to the expected order", () => {
    const list = ["a", "b", "c", "d"];
    const to = getReorderDestinationIndex({
      startIndex: 0,
      indexOfTarget: 2,
      closestEdgeOfTarget: "bottom",
    });
    expect(reorder(list, 0, to)).toEqual(["b", "c", "a", "d"]);
  });
});

describe("meaningfulEdges", () => {
  // The motivating case: [A, B] horizontal, grab B (index 1).
  // Only "before A" changes anything; the other three zones are no-ops.
  describe("two items, dragging the last one", () => {
    it("offers only the leading edge of the other item", () => {
      expect(
        meaningfulEdges({ sourceIndex: 1, targetIndex: 0, axis: "horizontal" }),
      ).toEqual(["left"]);
    });

    it("offers nothing on the dragged item itself", () => {
      expect(
        meaningfulEdges({ sourceIndex: 1, targetIndex: 1, axis: "horizontal" }),
      ).toEqual([]);
    });

    it("yields exactly one real destination across the whole list", () => {
      const total = [0, 1].flatMap((targetIndex) =>
        meaningfulEdges({ sourceIndex: 1, targetIndex, axis: "horizontal" }),
      );
      expect(total).toHaveLength(1);
    });
  });

  describe("two items, dragging the first one", () => {
    it("offers only the trailing edge of the other item", () => {
      expect(
        meaningfulEdges({ sourceIndex: 0, targetIndex: 1, axis: "horizontal" }),
      ).toEqual(["right"]);
    });
  });

  describe("three items, dragging the last one", () => {
    // [A, B, C] grab C (2). Real destinations: before A (0), between A and B (1).
    it("offers both edges of the far item", () => {
      expect(meaningfulEdges({ sourceIndex: 2, targetIndex: 0 })).toEqual([
        "top",
        "bottom",
      ]);
    });

    it("offers only the leading edge of the adjacent item", () => {
      expect(meaningfulEdges({ sourceIndex: 2, targetIndex: 1 })).toEqual([
        "top",
      ]);
    });

    it("exposes n-1 real destinations for n items", () => {
      const edges = [0, 1, 2].flatMap((targetIndex) =>
        meaningfulEdges({ sourceIndex: 2, targetIndex }),
      );
      // 3 hitboxes, but "bottom of A" and "top of B" are the same gap.
      const gaps = new Set(
        [0, 1, 2].flatMap((targetIndex) =>
          meaningfulEdges({ sourceIndex: 2, targetIndex }).map((edge) =>
            getReorderDestinationIndex({
              startIndex: 2,
              indexOfTarget: targetIndex,
              closestEdgeOfTarget: edge,
            }),
          ),
        ),
      );
      expect(edges).toHaveLength(3);
      expect([...gaps].sort()).toEqual([0, 1]); // n-1 = 2 distinct destinations
    });

    it("never resolves a offered edge back to the source index", () => {
      for (const targetIndex of [0, 1, 2]) {
        for (const edge of meaningfulEdges({ sourceIndex: 2, targetIndex })) {
          expect(
            getReorderDestinationIndex({
              startIndex: 2,
              indexOfTarget: targetIndex,
              closestEdgeOfTarget: edge,
            }),
          ).not.toBe(2);
        }
      }
    });
  });

  it("offers both edges when moving between containers", () => {
    // The item isn't in this list, so every gap is a real insertion.
    expect(
      meaningfulEdges({ sourceIndex: 1, targetIndex: 1, sameContainer: false }),
    ).toEqual(["top", "bottom"]);
  });

  it("uses vertical edges by default", () => {
    expect(meaningfulEdges({ sourceIndex: 0, targetIndex: 2 })).toEqual([
      "top",
      "bottom",
    ]);
  });
});

describe("getInsertionIndex (cross list)", () => {
  it("inserts before the target on the leading edge", () => {
    expect(
      getInsertionIndex({ indexOfTarget: 1, closestEdgeOfTarget: "top" }),
    ).toBe(1);
  });

  it("inserts after the target on the trailing edge", () => {
    expect(
      getInsertionIndex({ indexOfTarget: 1, closestEdgeOfTarget: "bottom" }),
    ).toBe(2);
  });

  it("falls back to the start when there is no target", () => {
    expect(
      getInsertionIndex({ indexOfTarget: -1, closestEdgeOfTarget: null }),
    ).toBe(0);
  });
});
