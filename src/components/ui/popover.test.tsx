import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover"

describe("PopoverAnchor", () => {
  it("keeps a measurable host when asChild is used beside a separate trigger", () => {
    render(
      <Popover open>
        <PopoverAnchor asChild>
          <span data-testid="sku">SKU-9021</span>
        </PopoverAnchor>
        <PopoverTrigger>Stock snapshot</PopoverTrigger>
        <PopoverContent>On-hand</PopoverContent>
      </Popover>
    )

    const sku = screen.getByTestId("sku")
    const host = sku.closest("[data-slot='popover-anchor']")
    expect(host).not.toBeNull()
    expect(host).not.toBe(sku)
    expect(document.querySelector("[data-radix-popper-content-wrapper]")).not.toBeNull()
  })
})
