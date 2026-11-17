import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ColorPicker } from "./color-picker"

function hexInput() {
  return screen.getByLabelText("HEX color value") as HTMLInputElement
}

describe("ColorPicker value format", () => {
  it("emits oklch(...) by default", () => {
    const onChange = vi.fn()
    render(<ColorPicker variant="inline" value="oklch(0.5 0.15 240)" onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Red" }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith("oklch(0.55 0.22 25)")
  })

  it('emits #rrggbb with format="hex"', () => {
    const onChange = vi.fn()
    render(<ColorPicker variant="inline" format="hex" value="#27272a" onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Red" }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toMatch(/^#[0-9a-f]{6}$/)
  })

  it.each(["#27272a", "#091f65", "#808080", "#ff0000"])(
    "shows a passed hex %s unchanged",
    (hex) => {
      render(<ColorPicker variant="inline" format="hex" value={hex} />)
      expect(hexInput().value).toBe(hex)
    }
  )

  it("normalizes #rgb and uppercase input", () => {
    render(<ColorPicker variant="inline" format="hex" value="#ABC" />)
    expect(hexInput().value).toBe("#aabbcc")
  })

  it("shows the hex of the oklch value in the default format", () => {
    render(<ColorPicker variant="inline" value="oklch(0.628 0.258 29.2)" />)
    expect(hexInput().value).toBe("#ff0000")
  })
})

describe("ColorPicker HEX field", () => {
  it("lets the user type a hex one character at a time and emits once, lowercase", () => {
    const onChange = vi.fn()
    render(<ColorPicker variant="inline" format="hex" value="#27272a" onChange={onChange} />)
    const input = hexInput()
    fireEvent.focus(input)
    let typed = ""
    for (const ch of "#FF8800") {
      typed += ch
      fireEvent.change(input, { target: { value: typed } })
      expect(input.value).toBe(typed)
    }
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith("#ff8800")
    expect(input.value).toBe("#ff8800")
  })

  it("accepts #rgb on Enter", () => {
    const onChange = vi.fn()
    render(<ColorPicker variant="inline" format="hex" value="#27272a" onChange={onChange} />)
    const input = hexInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "#F80" } })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith("#ff8800")
  })

  it("reverts an invalid draft on blur", () => {
    const onChange = vi.fn()
    render(<ColorPicker variant="inline" format="hex" value="#27272a" onChange={onChange} />)
    const input = hexInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "#zz" } })
    fireEvent.blur(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(input.value).toBe("#27272a")
  })

  it("emits oklch from the HEX field in the default format", () => {
    const onChange = vi.fn()
    render(<ColorPicker variant="inline" onChange={onChange} />)
    const input = hexInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "#ff0000" } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toMatch(/^oklch\(0\.6\d+ 0\.25\d+ 29\.\d+\)$/)
  })
})
