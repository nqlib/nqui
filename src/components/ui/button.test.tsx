import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "./button"

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  it("applies the variant as a data attribute", () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive")
  })

  it("fires onClick when pressed", () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole("button", { name: "Go" }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>
    )
    fireEvent.click(screen.getByRole("button", { name: "Go" }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it("renders as a child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/next">Link</a>
      </Button>
    )
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute("href", "/next")
  })
})
