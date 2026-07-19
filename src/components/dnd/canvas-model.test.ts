import { describe, expect, it } from "vitest";
import {
  bringToFront,
  type CanvasNode,
  moveNodes,
  nodeAt,
  nodesInRect,
  normalizeRect,
  snapValue,
} from "./canvas-model";

const node = (
  id: string,
  x: number,
  y: number,
  w = 100,
  h = 100,
  extra: Partial<CanvasNode> = {},
): CanvasNode => ({ id, x, y, w, h, ...extra });

const at = (nodes: CanvasNode[], id: string): CanvasNode => {
  const found = nodes.find((n) => n.id === id);
  if (!found) throw new Error(`missing node ${id}`);
  return found;
};

describe("snapValue", () => {
  it("rounds to the nearest multiple", () => {
    expect(snapValue(23, 10)).toBe(20);
    expect(snapValue(26, 10)).toBe(30);
  });

  it("handles negative values symmetrically", () => {
    expect(snapValue(-23, 10)).toBe(-20);
  });

  it("is a no-op for a non-positive grid", () => {
    expect(snapValue(23, 0)).toBe(23);
    expect(snapValue(23, -10)).toBe(23);
  });

  it("is a no-op for non-finite inputs", () => {
    expect(snapValue(23, Number.NaN)).toBe(23);
    expect(snapValue(Number.NaN, 10)).toBeNaN();
  });
});

describe("normalizeRect", () => {
  it("leaves a positive rect alone", () => {
    expect(normalizeRect({ x: 1, y: 2, w: 3, h: 4 })).toEqual({
      x: 1,
      y: 2,
      w: 3,
      h: 4,
    });
  });

  it("flips a rect dragged up and to the left", () => {
    expect(normalizeRect({ x: 10, y: 10, w: -4, h: -6 })).toEqual({
      x: 6,
      y: 4,
      w: 4,
      h: 6,
    });
  });
});

describe("moveNodes", () => {
  const nodes = [node("a", 0, 0), node("b", 200, 100)];

  it("moves a single node by the delta", () => {
    const next = moveNodes(nodes, ["a"], 30, -10);
    expect(at(next, "a")).toMatchObject({ x: 30, y: -10 });
  });

  it("leaves untouched nodes at their position", () => {
    const next = moveNodes(nodes, ["a"], 30, 30);
    expect(at(next, "b")).toMatchObject({ x: 200, y: 100 });
  });

  it("moves a multi-selection rigidly", () => {
    const next = moveNodes(nodes, ["a", "b"], 25, 40);
    expect(at(next, "a")).toMatchObject({ x: 25, y: 40 });
    expect(at(next, "b")).toMatchObject({ x: 225, y: 140 });
  });

  it("returns the nodes unchanged when no id matches", () => {
    const next = moveNodes(nodes, ["nope"], 50, 50);
    expect(next).toEqual(nodes);
  });

  it("returns the nodes unchanged for an empty id list", () => {
    expect(moveNodes(nodes, [], 50, 50)).toEqual(nodes);
  });

  it("never mutates the input array or its nodes", () => {
    const input = [node("a", 0, 0)];
    const snapshot = structuredClone(input);
    const next = moveNodes(input, ["a"], 40, 40);
    expect(input).toEqual(snapshot);
    expect(next[0]).not.toBe(input[0]);
  });

  it("ignores a non-finite delta rather than producing NaN", () => {
    const next = moveNodes(nodes, ["a"], Number.NaN, 10);
    expect(at(next, "a")).toMatchObject({ x: 0, y: 10 });
  });

  describe("snapping", () => {
    it("snaps the destination, not the delta", () => {
      const next = moveNodes([node("a", 5, 5)], ["a"], 12, 12, { snap: 10 });
      // 5 + 12 = 17 -> 20
      expect(at(next, "a")).toMatchObject({ x: 20, y: 20 });
    });

    it("keeps the selection rigid by snapping only the anchor", () => {
      const set = [node("a", 5, 5), node("b", 108, 5)];
      const next = moveNodes(set, ["a", "b"], 12, 0, { snap: 10 });
      // anchor delta becomes +15; `b` keeps its 103px offset from `a`.
      expect(at(next, "a")).toMatchObject({ x: 20 });
      expect(at(next, "b")).toMatchObject({ x: 123 });
    });

    it("treats snap: 0 as disabled", () => {
      const next = moveNodes([node("a", 5, 5)], ["a"], 12, 12, { snap: 0 });
      expect(at(next, "a")).toMatchObject({ x: 17, y: 17 });
    });

    it("uses the first movable node as the anchor, skipping locked ones", () => {
      const set = [node("a", 3, 0, 100, 100, { locked: true }), node("b", 5, 0)];
      const next = moveNodes(set, ["a", "b"], 12, 0, { snap: 10 });
      expect(at(next, "b")).toMatchObject({ x: 20 });
    });
  });

  describe("bounds", () => {
    const bounds = { w: 500, h: 400 };

    it("clamps a node against the left/top edge", () => {
      const next = moveNodes([node("a", 10, 10)], ["a"], -50, -50, { bounds });
      expect(at(next, "a")).toMatchObject({ x: 0, y: 0 });
    });

    it("clamps a node against the right/bottom edge", () => {
      const next = moveNodes([node("a", 10, 10)], ["a"], 900, 900, { bounds });
      expect(at(next, "a")).toMatchObject({ x: 400, y: 300 });
    });

    it("clamps the shared delta so a selection stays rigid", () => {
      const set = [node("a", 0, 0), node("b", 380, 0)];
      const next = moveNodes(set, ["a", "b"], 100, 0, { bounds });
      // `b` can only travel 20px, so `a` travels 20px too.
      expect(at(next, "a")).toMatchObject({ x: 20 });
      expect(at(next, "b")).toMatchObject({ x: 400 });
    });

    it("pins the top-left when a node is larger than the canvas", () => {
      const next = moveNodes([node("a", 0, 0, 900, 900)], ["a"], 50, 50, {
        bounds,
      });
      expect(at(next, "a")).toMatchObject({ x: 0, y: 0 });
    });

    it("lets bounds override snapping", () => {
      const next = moveNodes([node("a", 0, 0)], ["a"], 900, 0, {
        bounds,
        snap: 30,
      });
      expect(at(next, "a")).toMatchObject({ x: 400 });
    });
  });

  describe("locked nodes", () => {
    it("never moves a locked node", () => {
      const set = [node("a", 0, 0, 100, 100, { locked: true })];
      expect(at(moveNodes(set, ["a"], 50, 50), "a")).toMatchObject({
        x: 0,
        y: 0,
      });
    });

    it("moves the movable members of a mixed selection", () => {
      const set = [node("a", 0, 0, 100, 100, { locked: true }), node("b", 0, 0)];
      const next = moveNodes(set, ["a", "b"], 50, 50);
      expect(at(next, "a")).toMatchObject({ x: 0, y: 0 });
      expect(at(next, "b")).toMatchObject({ x: 50, y: 50 });
    });

    it("does not let a locked node constrain the shared delta", () => {
      const set = [
        node("a", 480, 0, 100, 100, { locked: true }),
        node("b", 0, 0),
      ];
      const next = moveNodes(set, ["a", "b"], 100, 0, {
        bounds: { w: 500, h: 400 },
      });
      expect(at(next, "b")).toMatchObject({ x: 100 });
    });
  });
});

describe("nodeAt", () => {
  it("finds the node under the point", () => {
    expect(nodeAt([node("a", 0, 0)], 50, 50)?.id).toBe("a");
  });

  it("returns null on empty space", () => {
    expect(nodeAt([node("a", 0, 0)], 500, 500)).toBeNull();
  });

  it("returns null for an empty canvas", () => {
    expect(nodeAt([], 0, 0)).toBeNull();
  });

  it("includes the top-left edge and excludes the bottom-right", () => {
    const one = [node("a", 0, 0, 100, 100)];
    expect(nodeAt(one, 0, 0)?.id).toBe("a");
    expect(nodeAt(one, 100, 50)).toBeNull();
    expect(nodeAt(one, 50, 100)).toBeNull();
  });

  it("prefers the higher z when nodes overlap", () => {
    const set = [
      node("a", 0, 0, 100, 100, { z: 5 }),
      node("b", 0, 0, 100, 100, { z: 1 }),
    ];
    expect(nodeAt(set, 10, 10)?.id).toBe("a");
  });

  it("breaks a z tie in favour of the later (painted last) node", () => {
    const set = [node("a", 0, 0), node("b", 0, 0)];
    expect(nodeAt(set, 10, 10)?.id).toBe("b");
  });

  it("treats a missing z as 0", () => {
    const set = [node("a", 0, 0, 100, 100, { z: 3 }), node("b", 0, 0)];
    expect(nodeAt(set, 10, 10)?.id).toBe("a");
  });

  it("still hit-tests locked nodes (they remain selectable)", () => {
    expect(nodeAt([node("a", 0, 0, 100, 100, { locked: true })], 5, 5)?.id).toBe(
      "a",
    );
  });
});

describe("nodesInRect", () => {
  const nodes = [node("a", 0, 0), node("b", 200, 0), node("c", 400, 300)];

  it("selects fully contained nodes", () => {
    expect(nodesInRect(nodes, { x: -10, y: -10, w: 130, h: 130 })).toEqual([
      nodes[0],
    ]);
  });

  it("selects partially overlapped nodes", () => {
    expect(
      nodesInRect(nodes, { x: 50, y: 50, w: 200, h: 20 }).map((n) => n.id),
    ).toEqual(["a", "b"]);
  });

  it("excludes nodes outside the marquee", () => {
    expect(nodesInRect(nodes, { x: 0, y: 0, w: 50, h: 50 }).map((n) => n.id)).toEqual(
      ["a"],
    );
  });

  it("returns [] when nothing is touched", () => {
    expect(nodesInRect(nodes, { x: 1000, y: 1000, w: 50, h: 50 })).toEqual([]);
  });

  it("normalises a marquee dragged up and to the left", () => {
    expect(
      nodesInRect(nodes, { x: 130, y: 130, w: -140, h: -140 }).map((n) => n.id),
    ).toEqual(["a"]);
  });

  it("selects nothing for a zero-area marquee", () => {
    expect(nodesInRect(nodes, { x: 50, y: 50, w: 0, h: 100 })).toEqual([]);
  });

  it("does not count edge-only contact as an overlap", () => {
    // Marquee ends exactly where `a` begins.
    expect(nodesInRect(nodes, { x: -50, y: 0, w: 50, h: 100 })).toEqual([]);
  });

  it("preserves array order", () => {
    expect(
      nodesInRect(nodes, { x: -10, y: -10, w: 1000, h: 1000 }).map((n) => n.id),
    ).toEqual(["a", "b", "c"]);
  });

  it("never mutates the input", () => {
    const input = [node("a", 0, 0)];
    const snapshot = structuredClone(input);
    nodesInRect(input, { x: 0, y: 0, w: 10, h: 10 });
    expect(input).toEqual(snapshot);
  });
});

describe("bringToFront", () => {
  it("lifts a node above the current maximum", () => {
    const set = [node("a", 0, 0, 100, 100, { z: 1 }), node("b", 0, 0, 100, 100, { z: 7 })];
    const next = bringToFront(set, ["a"]);
    expect(at(next, "a").z).toBe(8);
    expect(at(next, "b").z).toBe(7);
  });

  it("keeps the array order stable", () => {
    const set = [node("a", 0, 0), node("b", 0, 0)];
    expect(bringToFront(set, ["a"]).map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("preserves relative stacking inside the raised set", () => {
    const set = [
      node("a", 0, 0, 100, 100, { z: 9 }),
      node("b", 0, 0, 100, 100, { z: 2 }),
      node("c", 0, 0, 100, 100, { z: 4 }),
    ];
    const next = bringToFront(set, ["a", "b"]);
    // `c` stays at 4; `b` (lower) lands below `a`.
    expect(at(next, "c").z).toBe(4);
    expect(at(next, "b").z).toBe(5);
    expect(at(next, "a").z).toBe(6);
  });

  it("treats a missing z as 0 when computing the top", () => {
    const set = [node("a", 0, 0), node("b", 0, 0)];
    expect(at(bringToFront(set, ["b"]), "b").z).toBe(1);
  });

  it("bases the lift on 0 when every node is raised", () => {
    const set = [node("a", 0, 0, 100, 100, { z: 50 })];
    expect(at(bringToFront(set, ["a"]), "a").z).toBe(1);
  });

  it("is a no-op when no id matches", () => {
    const set = [node("a", 0, 0, 100, 100, { z: 3 })];
    expect(bringToFront(set, ["nope"])).toEqual(set);
  });

  it("never mutates the input", () => {
    const input = [node("a", 0, 0, 100, 100, { z: 1 })];
    const snapshot = structuredClone(input);
    const next = bringToFront(input, ["a"]);
    expect(input).toEqual(snapshot);
    expect(next[0]).not.toBe(input[0]);
  });
});
