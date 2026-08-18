import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Checkbox, EnhancedCheckbox } from "./checkbox"
import { EnhancedRadioGroup, EnhancedRadioGroupItem } from "../custom/enhanced-radio-group"

describe("PROBE: gap handling", () => {
  it("numeric gap -> inline style, no constructed class", () => {
    const { container } = render(<EnhancedCheckbox gap={5}>A</EnhancedCheckbox>)
    const label = container.querySelector("label")!
    expect(label.style.gap).toBe("1.25rem")
    expect(label.className).not.toMatch(/gap-5/)
  })
  it("default gap=3 -> 0.75rem (same as old gap-3)", () => {
    const { container } = render(<EnhancedCheckbox>A</EnhancedCheckbox>)
    expect(container.querySelector("label")!.style.gap).toBe("0.75rem")
  })
  it("string gap stays a class", () => {
    const { container } = render(<EnhancedCheckbox gap="gap-6">A</EnhancedCheckbox>)
    const label = container.querySelector("label")!
    expect(label.className).toMatch(/gap-6/)
    expect(label.style.gap).toBe("")
  })
  it("CoreCheckbox numeric gap -> inline style", () => {
    const { container } = render(<Checkbox gap={2}>A</Checkbox>)
    expect(container.querySelector("label")!.style.gap).toBe("0.5rem")
  })
  it("radio-group numeric gap -> inline style + consumer style merged", () => {
    render(
      <EnhancedRadioGroup gap={4} style={{ color: "red" }} data-testid="rg">
        <EnhancedRadioGroupItem value="a">a</EnhancedRadioGroupItem>
      </EnhancedRadioGroup>
    )
    const rg = screen.getByTestId("rg")
    expect(rg.style.gap).toBe("1rem")
    expect(rg.style.color).toBe("red")
  })
  it("radio-group sliding variant ignores gap style", () => {
    render(
      <EnhancedRadioGroup variant="sliding" gap={4} data-testid="rg2">
        <EnhancedRadioGroupItem value="a">a</EnhancedRadioGroupItem>
      </EnhancedRadioGroup>
    )
    expect(screen.getByTestId("rg2").style.gap).toBe("")
  })
})
