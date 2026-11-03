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

  it("uses rounded-md on filled and outline variants", () => {
    const { rerender } = render(<Button>Save</Button>)
    expect(screen.getByRole("button")).toHaveClass("rounded-md")
    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole("button")).toHaveClass("rounded-md")
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

describe("Button pressed and focus states", () => {
  it.each(["default", "destructive", "secondary", "success", "warning", "info"] as const)(
    "%s presses to a solid, flat darken with no mouse-focus tint",
    async (variant) => {
      const { EnhancedButton } = await import("./button")
      render(<EnhancedButton variant={variant}>Go</EnhancedButton>)
      const cls = screen.getByRole("button", { name: "Go" }).className
      expect(cls).toMatch(/active:bg-\[color-mix\(in_oklch,var\(--\w+\),black_10%\)\]/)
      expect(cls).toContain("active:shadow-none")
      expect(cls).not.toMatch(/active:bg-\w+\/\d+/) // no translucent pressed fill
      expect(cls).not.toMatch(/(^|\s)focus:bg-/) // mouse focus must not change the fill
      expect(cls).not.toContain("shadow-pressed")
    }
  )
})
