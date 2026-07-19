import { describe, expect, it } from "vitest";
import { applyCardDrop, type KanbanColumns } from "./kanban-model";

const base: KanbanColumns = {
  todo: ["t1", "t2", "t3"],
  doing: ["d1"],
  done: [],
};

describe("applyCardDrop", () => {
  it("reorders within a column", () => {
    const next = applyCardDrop(base, {
      cardId: "t1",
      fromColumnId: "todo",
      fromIndex: 0,
      toColumnId: "todo",
      toIndex: 2,
    });
    expect(next.todo).toEqual(["t2", "t3", "t1"]);
    expect(next.doing).toEqual(["d1"]);
  });

  it("moves a card to another column at an index", () => {
    const next = applyCardDrop(base, {
      cardId: "t2",
      fromColumnId: "todo",
      fromIndex: 1,
      toColumnId: "doing",
      toIndex: 0,
    });
    expect(next.todo).toEqual(["t1", "t3"]);
    expect(next.doing).toEqual(["t2", "d1"]);
  });

  it("appends when toIndex is -1", () => {
    const next = applyCardDrop(base, {
      cardId: "t1",
      fromColumnId: "todo",
      fromIndex: 0,
      toColumnId: "doing",
      toIndex: -1,
    });
    expect(next.doing).toEqual(["d1", "t1"]);
  });

  it("moves into an empty column", () => {
    const next = applyCardDrop(base, {
      cardId: "t3",
      fromColumnId: "todo",
      fromIndex: 2,
      toColumnId: "done",
      toIndex: -1,
    });
    expect(next.done).toEqual(["t3"]);
    expect(next.todo).toEqual(["t1", "t2"]);
  });

  it("clamps an out-of-range destination index", () => {
    const next = applyCardDrop(base, {
      cardId: "t1",
      fromColumnId: "todo",
      fromIndex: 0,
      toColumnId: "doing",
      toIndex: 99,
    });
    expect(next.doing).toEqual(["d1", "t1"]);
  });

  it("locates the card by id, tolerating a stale index", () => {
    const next = applyCardDrop(base, {
      cardId: "t3",
      fromColumnId: "todo",
      fromIndex: 0, // wrong on purpose
      toColumnId: "doing",
      toIndex: 0,
    });
    expect(next.todo).toEqual(["t1", "t2"]);
    expect(next.doing).toEqual(["t3", "d1"]);
  });

  it("returns the original state for an unknown card", () => {
    const next = applyCardDrop(base, {
      cardId: "nope",
      fromColumnId: "todo",
      fromIndex: 0,
      toColumnId: "doing",
      toIndex: 0,
    });
    expect(next).toBe(base);
  });

  it("returns the original state for an unknown column", () => {
    const next = applyCardDrop(base, {
      cardId: "t1",
      fromColumnId: "todo",
      fromIndex: 0,
      toColumnId: "missing",
      toIndex: 0,
    });
    expect(next).toBe(base);
  });

  it("does not mutate the input", () => {
    const snapshot = JSON.parse(JSON.stringify(base));
    applyCardDrop(base, {
      cardId: "t1",
      fromColumnId: "todo",
      fromIndex: 0,
      toColumnId: "doing",
      toIndex: 0,
    });
    expect(base).toEqual(snapshot);
  });
});
