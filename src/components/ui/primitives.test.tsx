import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Badge } from "./badge"
import { Card, CardHeader, CardTitle, CardContent } from "./card"
import { Input } from "./input"
import { Checkbox } from "./checkbox"
import { Switch } from "./switch"
import { Label } from "./label"
import { Separator } from "./separator"

// Smoke coverage for the highest-traffic primitives: they must render without
// throwing and honor their core interactive contract. This replaces
// "verified by the author's eyeballs" with a mechanical guarantee.

describe("Badge", () => {
  it("renders its content", () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText("New")).toBeInTheDocument()
  })
})

describe("Card", () => {
  it("renders a composed card without throwing", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    )
    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Body")).toBeInTheDocument()
  })
})

describe("Input", () => {
  it("reflects typed values via onChange", () => {
    const onChange = vi.fn()
    render(<Input placeholder="Email" onChange={onChange} />)
    const input = screen.getByPlaceholderText("Email")
    fireEvent.change(input, { target: { value: "a@b.com" } })
    expect(onChange).toHaveBeenCalled()
    expect(input).toHaveValue("a@b.com")
  })

  it("does not accept input when disabled", () => {
    render(<Input placeholder="Email" disabled />)
    expect(screen.getByPlaceholderText("Email")).toBeDisabled()
  })
})

describe("Checkbox", () => {
  it("toggles checked state on click", () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox onCheckedChange={onCheckedChange} />)
    fireEvent.click(screen.getByRole("checkbox"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})

describe("Switch", () => {
  it("toggles on click", () => {
    const onCheckedChange = vi.fn()
    render(<Switch onCheckedChange={onCheckedChange} />)
    fireEvent.click(screen.getByRole("switch"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})

describe("Label", () => {
  it("associates with a control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
      </>
    )
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
  })
})

describe("Separator", () => {
  it("renders with a separator role when not decorative", () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole("separator")).toBeInTheDocument()
  })
})
