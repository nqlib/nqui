import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import {
  EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger,
  EnhancedTabsContent,
} from "./enhanced-tabs"

// Radix Tabs selects on pointer interaction, not a bare click, so a real
// activation requires the pointerDown → mouseDown → click sequence.
function selectTab(el: HTMLElement) {
  fireEvent.pointerDown(el)
  fireEvent.mouseDown(el)
  fireEvent.click(el)
}

// The reviewer specifically flagged the tabs as complex and untested. These
// cover the controlled/uncontrolled switching contract that the enhanced
// wrapper adds on top of Radix.

function renderTabs(props?: ComponentProps<typeof EnhancedTabs>) {
  return render(
    <EnhancedTabs defaultValue="one" {...props}>
      <EnhancedTabsList>
        <EnhancedTabsTrigger value="one">One</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="two">Two</EnhancedTabsTrigger>
      </EnhancedTabsList>
      <EnhancedTabsContent value="one">Panel one</EnhancedTabsContent>
      <EnhancedTabsContent value="two">Panel two</EnhancedTabsContent>
    </EnhancedTabs>
  )
}

describe("EnhancedTabs", () => {
  it("shows the default tab's content", () => {
    renderTabs()
    expect(screen.getByText("Panel one")).toBeVisible()
  })

  it("switches content when another trigger is clicked (uncontrolled)", () => {
    renderTabs()
    selectTab(screen.getByRole("tab", { name: "Two" }))
    expect(screen.getByText("Panel two")).toBeVisible()
  })

  it("respects a controlled value and reports changes", () => {
    const onValueChange = vi.fn()
    render(
      <EnhancedTabs value="one" onValueChange={onValueChange}>
        <EnhancedTabsList>
          <EnhancedTabsTrigger value="one">One</EnhancedTabsTrigger>
          <EnhancedTabsTrigger value="two">Two</EnhancedTabsTrigger>
        </EnhancedTabsList>
        <EnhancedTabsContent value="one">Panel one</EnhancedTabsContent>
        <EnhancedTabsContent value="two">Panel two</EnhancedTabsContent>
      </EnhancedTabs>
    )
    selectTab(screen.getByRole("tab", { name: "Two" }))
    // Controlled: value prop wins, so the callback fires but the view stays put.
    expect(onValueChange).toHaveBeenCalledWith("two")
    expect(screen.getByText("Panel one")).toBeVisible()
  })

  it("forwards variant=line to a sliding underline", () => {
    render(
      <EnhancedTabs defaultValue="one">
        <EnhancedTabsList variant="line">
          <EnhancedTabsTrigger value="one">One</EnhancedTabsTrigger>
          <EnhancedTabsTrigger value="two">Two</EnhancedTabsTrigger>
        </EnhancedTabsList>
        <EnhancedTabsContent value="one">Panel one</EnhancedTabsContent>
      </EnhancedTabs>
    )
    expect(document.querySelector('[data-slot="tabs-line"]')).toBeTruthy()
    expect(document.querySelector('[data-slot="tabs-pill"]')).toBeNull()
  })

  it("throws if a trigger is used outside EnhancedTabs", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() =>
      render(<EnhancedTabsTrigger value="x">X</EnhancedTabsTrigger>)
    ).toThrow(/must be used within EnhancedTabs/)
    spy.mockRestore()
  })

  it("accepts trigger children on the list (types + runtime)", () => {
    const { container } = render(
      <EnhancedTabs defaultValue="one">
        <EnhancedTabsList>
          <EnhancedTabsTrigger value="one">One</EnhancedTabsTrigger>
        </EnhancedTabsList>
        <EnhancedTabsContent value="one">Panel</EnhancedTabsContent>
      </EnhancedTabs>
    )
    expect(container.querySelector('[role="tab"]')).toHaveTextContent("One")
  })
})

/** Compile-time: public list props must include children, className, and variant. */
function _tabsListConsumerProps(
  props: ComponentProps<typeof EnhancedTabsList>,
) {
  const children: ReactNode | undefined = props.children
  const className: string | undefined = props.className
  const variant: "default" | "line" | null | undefined = props.variant
  void children
  void className
  void variant
}
void _tabsListConsumerProps
