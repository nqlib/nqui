import { fireEvent, render, waitFor } from "@testing-library/react"
import { useState, type ReactNode } from "react"
import { beforeAll, describe, expect, it } from "vitest"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "./combobox"

function rowLabels(root: ParentNode = document) {
  return [...root.querySelectorAll("[data-slot='combobox-item']")].map((el) =>
    (el.textContent ?? "").replace(/\s+/g, " ").trim()
  )
}

function rowByLabel(label: string) {
  const match = [...document.querySelectorAll("[data-slot='combobox-item']")].find(
    (el) => (el.textContent ?? "").trim() === label
  )
  if (!match) throw new Error(`Missing combobox row ${label}`)
  return match
}

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
})

describe("Combobox pin selected", () => {
  it("puts the selected row first after ComboboxEmpty", () => {
    render(
      <Combobox open value="banana">
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="cherry">Cherry</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(rowLabels()).toEqual(["Banana", "Apple", "Cherry"])
    const list = document.querySelector("[data-slot='combobox-list']")
    const empty = list?.querySelector("[data-slot='combobox-empty']")
    const firstItem = list?.querySelector("[data-slot='combobox-item']")
    if (empty && firstItem) {
      expect(empty.compareDocumentPosition(firstItem) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it("pins every selected value on top in original relative order", () => {
    render(
      <Combobox multiple open value={["cherry", "apple"]}>
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="cherry">Cherry</ComboboxItem>
            <ComboboxItem value="date">Date</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(rowLabels()).toEqual(["Apple", "Cherry", "Banana", "Date"])
  })

  it("keeps row order while the panel stays open, then rebuilds on the next open", () => {
    function Harness() {
      const [open, setOpen] = useState(true)
      const [value, setValue] = useState<string[]>(["banana"])
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            Close panel
          </button>
          <button type="button" onClick={() => setOpen(true)}>
            Open panel
          </button>
          <Combobox
            multiple
            open={open}
            onOpenChange={setOpen}
            value={value}
            onValueChange={(next) => setValue(Array.isArray(next) ? next : [])}
          >
            <ComboboxInput placeholder="Pick" />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxEmpty>No results.</ComboboxEmpty>
                <ComboboxItem value="apple">Apple</ComboboxItem>
                <ComboboxItem value="banana">Banana</ComboboxItem>
                <ComboboxItem value="cherry">Cherry</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </>
      )
    }

    const view = render(<Harness />)
    expect(rowLabels()).toEqual(["Banana", "Apple", "Cherry"])

    fireEvent.mouseDown(rowByLabel("Cherry"))
    expect(rowLabels()).toEqual(["Banana", "Apple", "Cherry"])

    fireEvent.click(view.getByRole("button", { name: "Close panel" }))
    fireEvent.click(view.getByRole("button", { name: "Open panel" }))
    expect(rowLabels()).toEqual(["Banana", "Cherry", "Apple"])
  })

  it("keeps pinned=\"start\" above the selected row", () => {
    render(
      <Combobox open value="banana">
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="all" pinned="start">
              All
            </ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="cherry">Cherry</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(rowLabels()).toEqual(["All", "Banana", "Apple", "Cherry"])
  })

  it("pins selected rows inside each group and does not swap rows across groups", () => {
    render(
      <Combobox multiple open value={["banana", "date"]}>
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem value="apple">Apple</ComboboxItem>
              <ComboboxItem value="banana">Banana</ComboboxItem>
            </ComboboxGroup>
            <ComboboxSeparator />
            <ComboboxGroup>
              <ComboboxItem value="cherry">Cherry</ComboboxItem>
              <ComboboxItem value="date">Date</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    const groups = [...document.querySelectorAll("[data-slot='combobox-group']")]
    expect(groups).toHaveLength(2)
    expect(rowLabels(groups[0]!)).toEqual(["Banana", "Apple"])
    expect(rowLabels(groups[1]!)).toEqual(["Date", "Cherry"])

    const list = document.querySelector("[data-slot='combobox-list']")
    const structure = [
      ...list!.querySelectorAll("[data-slot='combobox-group'], [data-slot='combobox-separator']"),
    ].map((el) => el.getAttribute("data-slot"))
    expect(structure).toEqual(["combobox-group", "combobox-separator", "combobox-group"])
  })

  it("filters a static list and keeps a selected match above an unselected match", async () => {
    render(
      <Combobox open value="banana" searchPlaceholder="Filter list">
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="cherry">Cherry</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    fireEvent.change(document.querySelector("[data-slot='input-group-control']")!, {
      target: { value: "a" },
    })

    await waitFor(() => {
      expect(rowLabels()).toEqual(["Banana", "Apple"])
    })
  })

  it("pins items from the render prop and from renderItem", async () => {
    const fruits = ["Apple", "Banana", "Cherry", "Date"]

    const { unmount } = render(
      <Combobox open items={fruits} value="Cherry" searchPlaceholder="Filter list">
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            {/* React 19 JSX types reject a function sibling. The list still accepts one at runtime. */}
            {((item: unknown) => (
              <ComboboxItem key={String(item)} value={String(item)}>
                {String(item)}
              </ComboboxItem>
            )) as unknown as ReactNode}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(rowLabels()).toEqual(["Cherry", "Apple", "Banana", "Date"])
    fireEvent.change(document.querySelector("[data-slot='input-group-control']")!, {
      target: { value: "e" },
    })
    await waitFor(() => {
      expect(rowLabels()).toEqual(["Cherry", "Apple", "Date"])
    })
    unmount()

    render(
      <Combobox multiple open items={fruits} value={["Date", "Apple"]}>
        <ComboboxInput placeholder="Pick many" />
        <ComboboxContent>
          <ComboboxList
            renderItem={(item) => (
              <ComboboxItem key={String(item)} value={String(item)}>
                {String(item)}
              </ComboboxItem>
            )}
          >
            <ComboboxEmpty>No results.</ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(rowLabels()).toEqual(["Apple", "Date", "Banana", "Cherry"])
  })

  it("keeps source order when the value is empty", () => {
    render(
      <Combobox open value="">
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="cherry">Cherry</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(rowLabels()).toEqual(["Apple", "Banana", "Cherry"])
  })

  it("keeps source order when pinSelected is false", () => {
    render(
      <Combobox open pinSelected={false} value="banana">
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="cherry">Cherry</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(rowLabels()).toEqual(["Apple", "Banana", "Cherry"])
  })
})

describe("Combobox selected summary", () => {
  it("shows selected chips above the list and keeps source order", async () => {
    render(
      <Combobox multiple open value={["cherry", "apple"]}>
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent showSelected>
          <ComboboxList>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="cherry">Cherry</ComboboxItem>
            <ComboboxItem value="date">Date</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(rowLabels()).toEqual(["Apple", "Banana", "Cherry", "Date"])
    const summary = document.querySelector("[data-slot='combobox-selected-summary']")
    const list = document.querySelector("[data-slot='combobox-list']")
    expect(summary).toBeTruthy()
    expect(summary!.compareDocumentPosition(list!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await waitFor(() => {
      expect(summary!.textContent).toContain("Cherry")
      expect(summary!.textContent).toContain("Apple")
    })
  })

  it("removes a chip without reordering the list", async () => {
    function Harness() {
      const [value, setValue] = useState<string[]>(["banana", "date"])
      return (
        <Combobox multiple open value={value} onValueChange={(next) => setValue(next as string[])}>
          <ComboboxInput placeholder="Pick" />
          <ComboboxContent showSelected>
            <ComboboxList>
              <ComboboxItem value="apple">Apple</ComboboxItem>
              <ComboboxItem value="banana">Banana</ComboboxItem>
              <ComboboxItem value="cherry">Cherry</ComboboxItem>
              <ComboboxItem value="date">Date</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )
    }

    render(<Harness />)
    expect(rowLabels()).toEqual(["Apple", "Banana", "Cherry", "Date"])
    await waitFor(() => {
      expect(document.querySelector("[aria-label='Remove Banana']")).toBeTruthy()
    })
    fireEvent.click(document.querySelector("[aria-label='Remove Banana']")!)
    await waitFor(() => {
      expect(document.querySelector("[data-slot='combobox-selected-summary']")?.textContent).not.toContain(
        "Banana"
      )
    })
    expect(rowLabels()).toEqual(["Apple", "Banana", "Cherry", "Date"])
    expect(document.querySelector("[data-slot='combobox-selected-summary']")?.textContent).toContain("Date")
  })

  it("omits the strip when nothing is selected", () => {
    render(
      <Combobox open value="">
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent showSelected>
          <ComboboxList>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )

    expect(document.querySelector("[data-slot='combobox-selected-summary']")).toBeNull()
    expect(rowLabels()).toEqual(["Apple", "Banana"])
  })
})

describe("ComboboxContent inline", () => {
  it("keeps the panel in the parent and pins the selected row first", () => {
    const { container } = render(
      <div data-testid="submenu-host">
        <Combobox open value="banana">
          <ComboboxContent inline showPanelSearch>
            <ComboboxList>
              <ComboboxEmpty>No results.</ComboboxEmpty>
              <ComboboxItem value="apple">Apple</ComboboxItem>
              <ComboboxItem value="banana">Banana</ComboboxItem>
              <ComboboxItem value="cherry">Cherry</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    )

    const host = container.querySelector("[data-testid='submenu-host']")
    const content = host?.querySelector("[data-slot='combobox-content']")
    expect(content).toBeTruthy()
    expect(content).toHaveAttribute("data-inline")
    // Inline panel must not portal out of the host (no second popover).
    expect(host?.contains(content)).toBe(true)
    expect(document.body.querySelector("[data-radix-popper-content-wrapper]")).toBeNull()
    expect(rowLabels(host!)).toEqual(["Banana", "Apple", "Cherry"])
  })
})

describe("Combobox create", () => {
  function FruitList() {
    return (
      <ComboboxList
        renderItem={(item) => (
          <ComboboxItem key={String(item)} value={String(item)}>
            {String(item)}
          </ComboboxItem>
        )}
      >
        <ComboboxEmpty>No results.</ComboboxEmpty>
      </ComboboxList>
    )
  }

  it("shows a create row when the search is not an option", () => {
    const created: string[] = []
    const selected: string[] = []
    render(
      <Combobox
        open
        items={["Apple", "Banana"]}
        onCreate={(value) => created.push(value)}
        onValueChange={(value) => selected.push(String(value))}
      >
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <FruitList />
        </ComboboxContent>
      </Combobox>
    )

    fireEvent.change(document.querySelector("[data-slot='input-group-control']")!, {
      target: { value: "Durian" },
    })

    const create = document.querySelector("[data-slot='combobox-create']")
    expect(create?.textContent).toContain("Durian")
    fireEvent.click(create!)
    expect(created).toEqual(["Durian"])
    expect(selected).toEqual(["Durian"])
    expect(document.querySelector("[data-slot='combobox-create']")).toBeNull()
  })

  it("keeps the create row beside a partial match and hides it for an exact match", () => {
    render(
      <Combobox open items={["Apple", "Banana"]} onCreate={() => {}}>
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <FruitList />
        </ComboboxContent>
      </Combobox>
    )

    const input = document.querySelector("[data-slot='input-group-control']")!
    fireEvent.change(input, { target: { value: "App" } })
    expect(rowLabels()).toEqual(["Apple"])
    expect(document.querySelector("[data-slot='combobox-create']")?.textContent).toContain("App")

    fireEvent.change(input, { target: { value: "apple" } })
    expect(document.querySelector("[data-slot='combobox-create']")).toBeNull()
  })

  it("does not render a create row without onCreate", () => {
    render(
      <Combobox open items={["Apple"]} >
        <ComboboxInput placeholder="Pick" />
        <ComboboxContent>
          <FruitList />
        </ComboboxContent>
      </Combobox>
    )

    fireEvent.change(document.querySelector("[data-slot='input-group-control']")!, {
      target: { value: "Durian" },
    })
    expect(document.querySelector("[data-slot='combobox-create']")).toBeNull()
  })
})
