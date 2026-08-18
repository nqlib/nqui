import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Checkbox, EnhancedCheckbox } from "./checkbox"
import { Rating } from "../custom/rating"
import { EnhancedProgress } from "../custom/enhanced-progress"
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
  it("consumer gap-* className beats the numeric gap inline style", () => {
    // Regression: the inline style introduced for numeric gap silently won over
    // a consumer's `className="gap-4"`, which used to win via cn()/twMerge.
    render(
      <EnhancedRadioGroup className="flex gap-4" data-testid="rg-cls">
        <EnhancedRadioGroupItem value="a">a</EnhancedRadioGroupItem>
      </EnhancedRadioGroup>
    )
    const rg = screen.getByTestId("rg-cls")
    expect(rg.className).toMatch(/\bgap-4\b/)
    expect(rg.style.gap).toBe("")
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

describe("no per-instance <style> injection", () => {
  // Regression: these components each rendered a full stylesheet per instance.
  // 50 checkboxes meant 50 <style> tags (~239 KB of duplicate CSS) and the CSS
  // text leaked into textContent, breaking getByText / toHaveTextContent.
  // The rules now ship in dist/styles.css (src/styles/components.css).
  it("checkbox renders no <style> and has clean textContent", () => {
    const { container } = render(<EnhancedCheckbox>Accept terms</EnhancedCheckbox>)
    expect(container.querySelectorAll("style")).toHaveLength(0)
    expect(container.textContent).toBe("Accept terms")
  })

  it("many checkboxes render no <style> at all", () => {
    const { container } = render(
      <div>
        {Array.from({ length: 20 }, (_, i) => (
          <EnhancedCheckbox key={i}>Row {i}</EnhancedCheckbox>
        ))}
      </div>
    )
    expect(container.querySelectorAll("style")).toHaveLength(0)
    expect(container.textContent).not.toMatch(/box-sizing|checkbox-pulse/)
  })

  it("checkbox without children renders no <style>", () => {
    const { container } = render(<EnhancedCheckbox />)
    expect(container.querySelectorAll("style")).toHaveLength(0)
  })

  it("rating renders no <style> and has clean textContent", () => {
    const { container } = render(<Rating value={3} />)
    expect(container.querySelectorAll("style")).toHaveLength(0)
    expect(container.textContent).not.toMatch(/rating-wrapper|mask:/)
  })

  it("progress renders no <style> and has clean textContent", () => {
    const { container } = render(<EnhancedProgress value={40} />)
    expect(container.querySelectorAll("style")).toHaveLength(0)
    expect(container.textContent).not.toMatch(/progress-block/)
  })
})
