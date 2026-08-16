import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DropGhost, DropIndicator } from "./drop-indicator";
import { GridLayout } from "./grid-layout";
import { KanbanBoard, KanbanCard, KanbanColumn } from "./kanban";

/**
 * Smoke tests: these mount the Pragmatic-backed components in jsdom to prove the
 * bindings attach without throwing. Interaction behaviour (native drag events)
 * isn't exercisable in jsdom — the reconciliation math is covered in dnd.test.ts.
 */

describe("DropIndicator", () => {
  it("renders nothing when edge is null", () => {
    const { container } = render(<DropIndicator edge={null} />);
    expect(container.firstChild).toBeNull();
  });
  it("renders a line with the edge data attribute", () => {
    render(<DropIndicator edge="bottom" data-testid="ind" />);
    expect(screen.getByTestId("ind")).toHaveAttribute("data-edge", "bottom");
  });
});

describe("DropGhost", () => {
  it("reserves the given height", () => {
    const { container } = render(<DropGhost height={48} data-testid="ghost" />);
    expect(screen.getByTestId("ghost")).toHaveStyle({ height: "48px" });
    expect(container.querySelector('[data-slot="drop-ghost"]')).not.toBeNull();
  });
});

describe("Kanban mounts", () => {
  it("renders a board, columns, and cards", () => {
    render(
      <KanbanBoard>
        <KanbanColumn columnId="todo" header="To do" autoScroll={false}>
          <KanbanCard cardId="a" index={0}>
            Card A
          </KanbanCard>
          <KanbanCard cardId="b" index={1}>
            Card B
          </KanbanCard>
        </KanbanColumn>
        <KanbanColumn columnId="done" header="Done" autoScroll={false} />
      </KanbanBoard>,
    );
    expect(screen.getByText("Card A")).toBeInTheDocument();
    expect(screen.getByText("Card B")).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
  });

  it("throws if a card is used outside a column", () => {
    // Suppress React's error boundary console noise for this expected throw.
    const spy = () =>
      render(
        <KanbanBoard>
          {/* @ts-expect-error intentionally missing column context */}
          <KanbanCard cardId="x" index={0}>
            Orphan
          </KanbanCard>
        </KanbanBoard>,
      );
    expect(spy).toThrow(/KanbanColumn/);
  });
});

describe("GridLayout mounts", () => {
  it("renders its container without crashing", () => {
    const layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
    const { container } = render(
      <GridLayout layout={layout} onLayoutChange={() => {}}>
        {(item) => <div>Tile {item.i}</div>}
      </GridLayout>,
    );
    expect(
      container.querySelector('[data-slot="grid-layout"]'),
    ).toBeInTheDocument();
  });
});
