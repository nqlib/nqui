import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"

describe("Tabs", () => {
  it("default variant mounts a sliding pill", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">A</TabsContent>
      </Tabs>
    )
    expect(document.querySelector('[data-slot="tabs-pill"]')).toBeTruthy()
    expect(document.querySelector('[data-slot="tabs-line"]')).toBeNull()
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("data-state", "active")
  })

  it("line variant mounts a sliding underline", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList variant="line">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">A</TabsContent>
      </Tabs>
    )
    expect(document.querySelector('[data-slot="tabs-line"]')).toBeTruthy()
    expect(document.querySelector('[data-slot="tabs-pill"]')).toBeNull()
  })

  it("sizes triggers to the full label instead of ellipsizing", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">Tab 1</TabsTrigger>
          <TabsTrigger value="two">Tab 2</TabsTrigger>
          <TabsTrigger value="three">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="one">A</TabsContent>
      </Tabs>
    )
    const tab2 = screen.getByRole("tab", { name: "Tab 2" })
    expect(tab2).toHaveClass("shrink-0")
    expect(tab2.querySelector(".truncate")).toBeNull()
    expect(tab2).toHaveTextContent("Tab 2")
  })
})
