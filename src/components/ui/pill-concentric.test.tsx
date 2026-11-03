import { describe, it, expect, vi, afterEach } from "vitest"
import { render, waitFor } from "@testing-library/react"
import { Tabs, TabsList, TabsTrigger } from "./tabs"
import { EnhancedRadioGroup, EnhancedRadioGroupItem } from "../custom/enhanced-radio-group"

/**
 * A sliding pill sits inside a padded shell. For the corners to stay concentric the pill radius
 * must be R − border − inset, and its absolute offsets must be measured from the padding box.
 * jsdom has no layout, so a 1px border is simulated through clientTop / clientLeft.
 */
function mockBorder(px: number) {
  vi.spyOn(HTMLElement.prototype, "clientTop", "get").mockReturnValue(px)
  vi.spyOn(HTMLElement.prototype, "clientLeft", "get").mockReturnValue(px)
}

afterEach(() => vi.restoreAllMocks())

describe("sliding pill inside a bordered shell", () => {
  it("RadioGroup sliding: subtracts the border from the pill offset and radius", async () => {
    mockBorder(1)
    const { container } = render(
      <EnhancedRadioGroup variant="sliding" defaultValue="a" className="border">
        <EnhancedRadioGroupItem value="a">A</EnhancedRadioGroupItem>
        <EnhancedRadioGroupItem value="b">B</EnhancedRadioGroupItem>
      </EnhancedRadioGroup>
    )
    const group = container.querySelector<HTMLElement>("[data-slot='radio-group']")!
    await waitFor(() => expect(container.querySelector("[data-slot='radio-group-pill']")).not.toBeNull())
    const pill = container.querySelector<HTMLElement>("[data-slot='radio-group-pill']")!
    // all rects are 0 in jsdom, so the offset is exactly −border
    expect(pill.style.top).toBe("-1px")
    expect(pill.style.left).toBe("-1px")
    expect(group.style.getPropertyValue("--radio-pill-border")).toBe("1px")
    expect(group.className).toContain("var(--radio-pill-border,0px)")
  })

  it("RadioGroup sliding: no border → no border variable", async () => {
    mockBorder(0)
    const { container } = render(
      <EnhancedRadioGroup variant="sliding" defaultValue="a">
        <EnhancedRadioGroupItem value="a">A</EnhancedRadioGroupItem>
      </EnhancedRadioGroup>
    )
    await waitFor(() => expect(container.querySelector("[data-slot='radio-group-pill']")).not.toBeNull())
    const group = container.querySelector<HTMLElement>("[data-slot='radio-group']")!
    expect(group.style.getPropertyValue("--radio-pill-border")).toBe("")
  })

  it("TabsList: measures the border into --tabs-pill-border and keeps the caller's style", () => {
    mockBorder(1)
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList className="border" style={{ marginTop: 4 }}>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const list = container.querySelector<HTMLElement>("[data-slot='tabs-list']")!
    expect(list.style.getPropertyValue("--tabs-pill-border")).toBe("1px")
    expect(list.style.marginTop).toBe("4px")
    expect(list.className).toContain("var(--tabs-pill-border,0px)")
    const pill = container.querySelector<HTMLElement>("[data-slot='tabs-pill']")!
    expect(pill.style.top).toBe("-1px")
  })
})

describe("flush segments inside a 1px shell", () => {
  it("ButtonGroup and ToggleGroup segment corners are radius-md − 1px", async () => {
    const { ButtonGroup } = await import("./button-group")
    const { ToggleGroup, ToggleGroupItem } = await import("./toggle-group")
    const { container } = render(
      <>
        <ButtonGroup>
          <button>A</button>
          <button>B</button>
        </ButtonGroup>
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>
      </>
    )
    expect(container.querySelector("[data-slot='button-group']")!.className).toContain(
      "[--toggle-inner-radius:calc(var(--radius-md)-1px)]"
    )
    expect(container.querySelector("[data-slot='toggle-group']")!.className).toContain(
      "[--toggle-inner-radius:calc(var(--radius-md)-1px)]"
    )
  })

  it("Card sticky header inherits the card radius", async () => {
    const { Card, CardHeader } = await import("./card")
    const { container } = render(
      <Card stickyHeader className="rounded-md">
        <CardHeader>Title</CardHeader>
      </Card>
    )
    const header = container.querySelector(".nqui-card > div")!
    expect(header.className).toContain("rounded-t-[inherit]")
    expect(header.className).not.toContain("rounded-t-lg")
  })
})

describe("hover next to a sliding pill", () => {
  it("tab triggers and sliding radio labels change colour only on hover", () => {
    const { container } = render(
      <>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
        </Tabs>
        <EnhancedRadioGroup variant="sliding" defaultValue="a">
          <EnhancedRadioGroupItem value="a">A</EnhancedRadioGroupItem>
          <EnhancedRadioGroupItem value="b">B</EnhancedRadioGroupItem>
        </EnhancedRadioGroup>
      </>
    )
    for (const el of container.querySelectorAll("[data-slot='tabs-trigger'], label.sliding-indicator-target")) {
      expect(el.className).not.toMatch(/(^|\s)hover:bg-/)
    }
  })
})
