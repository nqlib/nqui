import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  SortableList,
  SortableListItem,
  SortableListItemHandle,
} from "./sortable-list";

/**
 * Component-contract tests. Native drag events aren't dispatchable in jsdom, so
 * these cover structure, wiring, and the guard rails; the reorder math itself is
 * covered by reorder.test.ts.
 */

interface Row {
  id: string;
  label: string;
}

const ROWS: Row[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Bravo" },
  { id: "c", label: "Charlie" },
];

function Basic({
  orientation,
  disabledIds = [],
}: {
  orientation?: "vertical" | "horizontal";
  disabledIds?: string[];
}) {
  return (
    <SortableList
      value={ROWS}
      getItemValue={(row) => row.id}
      orientation={orientation}
      onValueChange={() => {}}
    >
      {ROWS.map((row) => (
        <SortableListItem
          key={row.id}
          value={row.id}
          disabled={disabledIds.includes(row.id)}
          asHandle
        >
          {row.label}
        </SortableListItem>
      ))}
    </SortableList>
  );
}

describe("SortableList", () => {
  it("renders every item", () => {
    render(<Basic />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("marks the root with its slot and orientation", () => {
    const { container } = render(<Basic />);
    const root = container.querySelector('[data-slot="sortable-list"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("data-orientation", "vertical");
  });

  it("reflects horizontal orientation on the root", () => {
    const { container } = render(<Basic orientation="horizontal" />);
    expect(
      container.querySelector('[data-slot="sortable-list"]'),
    ).toHaveAttribute("data-orientation", "horizontal");
  });

  it("stamps each item with its value and resolved index", () => {
    const { container } = render(<Basic />);
    const items = Array.from(
      container.querySelectorAll('[data-slot="sortable-list-item"]'),
    );
    expect(items).toHaveLength(3);
    expect(items.map((el) => el.getAttribute("data-value"))).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(items.map((el) => el.getAttribute("data-index"))).toEqual([
      "0",
      "1",
      "2",
    ]);
  });

  it("accepts a plain string array without getItemValue", () => {
    const { container } = render(
      <SortableList value={["x", "y"]} onValueChange={() => {}}>
        {["x", "y"].map((v) => (
          <SortableListItem key={v} value={v} asHandle>
            {v}
          </SortableListItem>
        ))}
      </SortableList>,
    );
    expect(
      container.querySelectorAll('[data-slot="sortable-list-item"]'),
    ).toHaveLength(2);
  });

  it("reports index -1 for an item missing from value", () => {
    const { container } = render(
      <SortableList value={["x"]} onValueChange={() => {}}>
        <SortableListItem value="ghost" asHandle>
          Ghost
        </SortableListItem>
      </SortableList>,
    );
    expect(
      container.querySelector('[data-slot="sortable-list-item"]'),
    ).toHaveAttribute("data-index", "-1");
  });
});

describe("SortableListItem", () => {
  it("marks disabled items with the disabled attribute", () => {
    const { container } = render(<Basic disabledIds={["b"]} />);
    const items = Array.from(
      container.querySelectorAll('[data-slot="sortable-list-item"]'),
    );
    expect(items[0]).not.toHaveAttribute("data-disabled");
    expect(items[1]).toHaveAttribute("data-disabled", "");
  });

  it("throws when used outside SortableList", () => {
    expect(() =>
      render(<SortableListItem value="a">Orphan</SortableListItem>),
    ).toThrow(/SortableList/);
  });

  it("throws on an empty value", () => {
    expect(() =>
      render(
        <SortableList value={[""]} onValueChange={() => {}}>
          <SortableListItem value="">Empty</SortableListItem>
        </SortableList>,
      ),
    ).toThrow(/empty string/);
  });

  it("throws when an object array is used without getItemValue", () => {
    expect(() =>
      render(
        // @ts-expect-error getItemValue is required for object arrays
        <SortableList value={ROWS} onValueChange={() => {}}>
          <SortableListItem value="a">Alpha</SortableListItem>
        </SortableList>,
      ),
    ).toThrow(/getItemValue/);
  });
});

describe("SortableListItemHandle", () => {
  function WithHandles({ disabled = false }: { disabled?: boolean }) {
    return (
      <SortableList value={ROWS} getItemValue={(r) => r.id}>
        {ROWS.map((row) => (
          <SortableListItem key={row.id} value={row.id} disabled={disabled}>
            <SortableListItemHandle aria-label={`Drag ${row.label}`}>
              ::
            </SortableListItemHandle>
            {row.label}
          </SortableListItem>
        ))}
      </SortableList>
    );
  }

  it("renders a button per item and points aria-controls at it", () => {
    const { container } = render(<WithHandles />);
    const handles = Array.from(
      container.querySelectorAll('[data-slot="sortable-list-item-handle"]'),
    );
    expect(handles).toHaveLength(3);

    const firstItem = container.querySelector(
      '[data-slot="sortable-list-item"]',
    );
    expect(handles[0]).toHaveAttribute("aria-controls", firstItem?.id);
  });

  it("inherits the disabled state from its item", () => {
    render(<WithHandles disabled />);
    const handle = screen.getByRole("button", { name: "Drag Alpha" });
    expect(handle).toBeDisabled();
    expect(handle).toHaveAttribute("data-disabled", "");
  });

  it("renders as a child element when asChild is set", () => {
    render(
      <SortableList value={["a"]}>
        <SortableListItem value="a">
          <SortableListItemHandle asChild>
            <span data-testid="custom-handle">::</span>
          </SortableListItemHandle>
        </SortableListItem>
      </SortableList>,
    );
    expect(screen.getByTestId("custom-handle")).toHaveAttribute(
      "data-slot",
      "sortable-list-item-handle",
    );
  });

  it("throws when used outside SortableListItem", () => {
    expect(() =>
      render(
        <SortableList value={["a"]}>
          <SortableListItemHandle />
        </SortableList>,
      ),
    ).toThrow(/SortableListItem/);
  });
});
