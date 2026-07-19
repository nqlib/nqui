import { describe, expect, it } from "vitest";
import { isReorder } from "./use-flip";

/**
 * These lock in the rule that decides whether a FLIP pass animates. It has
 * regressed twice — once suppressing nothing (the whole board lurched on every
 * drop), once suppressing everything (real reorders stopped animating) — and
 * neither was catchable through the DOM, since jsdom reports every offset as 0.
 */
describe("isReorder", () => {
  it("is not a reorder when nothing moved", () => {
    expect(isReorder([{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }])).toBe(false);
  });

  it("is not a reorder with no tracked elements", () => {
    expect(isReorder([])).toBe(false);
  });

  it("treats a lone moving element as a reorder", () => {
    // Removing the first of two items leaves exactly one survivor to move.
    expect(isReorder([{ dx: 0, dy: 78 }])).toBe(true);
  });

  it("treats a two-item swap as a reorder", () => {
    expect(isReorder([{ dx: 0, dy: 54 }, { dx: 0, dy: -54 }])).toBe(true);
  });

  it("treats a cascade of differing shifts as a reorder", () => {
    expect(
      isReorder([
        { dx: 0, dy: 46 },
        { dx: 0, dy: 46 },
        { dx: 0, dy: -92 },
      ]),
    ).toBe(true);
  });

  it("rejects a uniform vertical shift across every element", () => {
    // The container moved — e.g. fonts settling on mount.
    expect(
      isReorder([
        { dx: 0, dy: 12 },
        { dx: 0, dy: 12 },
        { dx: 0, dy: 12 },
      ]),
    ).toBe(false);
  });

  it("rejects a uniform horizontal shift across every element", () => {
    expect(
      isReorder([
        { dx: 24, dy: 0 },
        { dx: 24, dy: 0 },
      ]),
    ).toBe(false);
  });

  it("rejects a uniform diagonal shift", () => {
    expect(
      isReorder([
        { dx: 8, dy: 12 },
        { dx: 8, dy: 12 },
      ]),
    ).toBe(false);
  });

  it("accepts a shift that is uniform for most but not all elements", () => {
    // One element breaking the pattern means real reordering happened.
    expect(
      isReorder([
        { dx: 0, dy: 12 },
        { dx: 0, dy: 12 },
        { dx: 0, dy: 40 },
      ]),
    ).toBe(true);
  });

  it("accepts a mix of moving and stationary elements", () => {
    expect(
      isReorder([
        { dx: 0, dy: 0 },
        { dx: 0, dy: 60 },
      ]),
    ).toBe(true);
  });
});
