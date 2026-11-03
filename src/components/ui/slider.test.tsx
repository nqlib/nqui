import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Slider } from "./slider"
import { ColorSlider } from "../custom/color-slider"

describe("Slider", () => {
  it("renders one thumb per value with stable data-slots", () => {
    const { container } = render(<Slider defaultValue={[20, 80]} aria-label="Price" />)
    expect(container.querySelector("[data-slot='slider']")).not.toBeNull()
    expect(container.querySelector("[data-slot='slider-track']")).not.toBeNull()
    expect(container.querySelector("[data-slot='slider-range']")).not.toBeNull()
    expect(screen.getAllByRole("slider")).toHaveLength(2)
  })

  it("arrow keys, Home and End change the value", () => {
    const onValueChange = vi.fn()
    render(<Slider defaultValue={[50]} step={5} onValueChange={onValueChange} />)
    const thumb = screen.getByRole("slider")
    expect(thumb).toHaveAttribute("aria-valuenow", "50")

    fireEvent.keyDown(thumb, { key: "ArrowRight" })
    expect(thumb).toHaveAttribute("aria-valuenow", "55")
    fireEvent.keyDown(thumb, { key: "Home" })
    expect(thumb).toHaveAttribute("aria-valuenow", "0")
    fireEvent.keyDown(thumb, { key: "End" })
    expect(thumb).toHaveAttribute("aria-valuenow", "100")
    expect(onValueChange).toHaveBeenLastCalledWith([100])
  })

  it("commits once per keyboard step", () => {
    const onValueCommit = vi.fn()
    render(<Slider defaultValue={[50]} onValueCommit={onValueCommit} />)
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" })
    expect(onValueCommit).toHaveBeenCalledTimes(1)
    expect(onValueCommit).toHaveBeenCalledWith([51])
  })

  it("disabled ignores keyboard input", () => {
    render(<Slider defaultValue={[50]} disabled />)
    const thumb = screen.getByRole("slider")
    fireEvent.keyDown(thumb, { key: "ArrowRight" })
    expect(thumb).toHaveAttribute("aria-valuenow", "50")
  })

  it.each([
    ["sm", "data-[orientation=horizontal]:h-6"],
    ["default", "data-[orientation=horizontal]:h-7"],
    ["lg", "data-[orientation=horizontal]:h-8"],
  ] as const)("size %s matches control row height", (size, cls) => {
    const { container } = render(<Slider size={size} defaultValue={[10]} />)
    expect(container.querySelector("[data-slot='slider']")!.className).toContain(cls)
  })

  it("uses the shared control tokens, not hardcoded colours or shadows", () => {
    const { container } = render(<Slider defaultValue={[10]} />)
    const track = container.querySelector("[data-slot='slider-track']")!
    const thumb = container.querySelector("[data-slot='slider-thumb']")!
    expect(track.className).toContain("bg-track")
    expect(thumb.className).toContain("bg-thumb")
    expect(thumb.className).toContain("shadow-[var(--shadow-thumb)]")
    expect(thumb.className).toContain("focus-visible:ring-[2px]")
    expect(thumb.className).not.toMatch(/hover:ring|border-primary|rgba/)
  })
})

describe("ColorSlider", () => {
  it("keeps its colour variables when the caller passes a style", () => {
    const { container } = render(
      <ColorSlider defaultValue={[30]} style={{ width: 120 }} rangeColor="red" />
    )
    const root = container.querySelector<HTMLElement>("[data-slot='slider']")!
    expect(root.style.width).toBe("120px")
    expect(root.style.getPropertyValue("--color-slider-range")).toBe("red")
  })

  it("falls back to valid token values", () => {
    const { container } = render(<ColorSlider defaultValue={[30]} />)
    const root = container.querySelector<HTMLElement>("[data-slot='slider']")!
    expect(root.style.getPropertyValue("--color-slider-track")).toBe("var(--track)")
    expect(root.style.getPropertyValue("--color-slider-range")).toBe("var(--primary)")
    expect(root.style.getPropertyValue("--color-slider-thumb-fill")).toBe("var(--thumb)")
  })
})

describe("Slider value label (ST-069)", () => {
  it("renders label and formatted value, and labels the thumb", () => {
    render(<Slider label="Opacity" showValue defaultValue={[72]} formatValue={(v) => `${v}%`} />)
    expect(screen.getByText("Opacity")).toBeInTheDocument()
    expect(screen.getByText("72%")).toBeInTheDocument()
    const thumb = screen.getByRole("slider", { name: "Opacity" })
    expect(thumb).toHaveAttribute("aria-valuetext", "72%")
  })

  it("formats a range as a – b and keeps a fixed width", () => {
    const { container } = render(
      <Slider showValue defaultValue={[20, 80]} formatValue={(v) => `$${v}`} max={200} />
    )
    const readout = screen.getByText("$20 – $80")
    // widest of "$0"/"$200" = 4 chars, ×2 + 3 for the separator
    expect(readout.style.minWidth).toBe("11ch")
    expect(container.querySelector("[data-slot='slider-control']")).not.toBeNull()
  })
})

describe("Slider scale (ST-070)", () => {
  it("log scale reports value-space aria and steps in value space", () => {
    const onValueChange = vi.fn()
    render(
      <Slider scale="log" min={25} max={400} step={5} defaultValue={[100]} onValueChange={onValueChange} aria-label="Zoom" />
    )
    const thumb = screen.getByRole("slider", { name: "Zoom" })
    expect(thumb).toHaveAttribute("aria-valuenow", "100")
    expect(thumb).toHaveAttribute("aria-valuemax", "400")
    fireEvent.keyDown(thumb, { key: "ArrowRight" })
    expect(onValueChange).toHaveBeenLastCalledWith([105])
    fireEvent.keyDown(thumb, { key: "End" })
    expect(onValueChange).toHaveBeenLastCalledWith([400])
  })

  it("draws marks with labels", () => {
    const { container } = render(<Slider defaultValue={[60]} marks={[{ value: 100, label: "100%" }, 50]} min={0} max={200} />)
    expect(container.querySelectorAll(".nqui-slider-mark")).toHaveLength(2)
    expect(screen.getByText("100%")).toBeInTheDocument()
    expect(container.querySelector("[data-slot='slider']")).toHaveAttribute("data-marks", "labelled")
  })
})

describe("Slider origin, track slot, read-only, menus (ST-071)", () => {
  it("fills from the origin in both directions", () => {
    const { container, rerender } = render(<Slider min={-12} max={12} origin={0} value={[6]} />)
    const fill = () => container.querySelector<HTMLElement>("[data-slot='slider-fill']")!
    expect(fill().style.left).toBe("50%")
    expect(fill().style.width).toBe("25%")
    expect(container.querySelector("[data-slot='slider-range']")!.className).toContain("hidden")
    rerender(<Slider min={-12} max={12} origin={0} value={[-6]} />)
    expect(fill().style.left).toBe("25%")
    expect(fill().style.width).toBe("25%")
  })

  it("trackBackground styles the track and showRange={false} hides the range", () => {
    const { container } = render(
      <Slider defaultValue={[50]} trackBackground="linear-gradient(red, blue)" showRange={false} />
    )
    expect(container.querySelector<HTMLElement>("[data-slot='slider-track']")!.style.background).toContain("linear-gradient")
    expect(container.querySelector("[data-slot='slider-range']")!.className).toContain("hidden")
  })

  it("read-only ignores keys and marks the thumb", () => {
    const onValueChange = vi.fn()
    render(<Slider readOnly defaultValue={[40]} onValueChange={onValueChange} aria-label="Score" />)
    const thumb = screen.getByRole("slider", { name: "Score" })
    expect(thumb).toHaveAttribute("aria-readonly", "true")
    fireEvent.keyDown(thumb, { key: "ArrowRight" })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(thumb).toHaveAttribute("aria-valuenow", "40")
  })

  it("arrow keys do not bubble out to an enclosing menu", () => {
    const onMenuKey = vi.fn()
    render(
      <div onKeyDown={onMenuKey}>
        <Slider defaultValue={[10]} aria-label="Zoom" />
      </div>
    )
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowDown" })
    expect(onMenuKey).not.toHaveBeenCalled()
  })
})

describe("Slider variants (ST-071)", () => {
  it("field shows label and value inside and edits on Enter", async () => {
    const onValueCommit = vi.fn()
    const { container } = render(
      <Slider variant="field" label="Radius" defaultValue={[12]} max={32} formatValue={(v) => `${v} px`} onValueCommit={onValueCommit} />
    )
    expect(container.querySelector("[data-slot='slider']")).toHaveAttribute("data-variant", "field")
    expect(screen.getByText("12 px")).toBeInTheDocument()
    const thumb = screen.getByRole("slider", { name: "Radius" })
    fireEvent.keyDown(thumb, { key: "Enter" })
    const input = screen.getByRole("textbox", { name: "Radius" })
    fireEvent.change(input, { target: { value: "20" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onValueCommit).toHaveBeenCalledWith([20])
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(screen.getByText("20 px")).toBeInTheDocument()
  })

  it("field editing clamps, snaps and cancels with Escape", () => {
    const onValueCommit = vi.fn()
    render(<Slider variant="field" label="Budget" defaultValue={[500]} max={1000} step={50} onValueCommit={onValueCommit} />)
    const thumb = screen.getByRole("slider", { name: "Budget" })
    fireEvent.keyDown(thumb, { key: "Enter" })
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "$5,000" } })
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" })
    expect(onValueCommit).toHaveBeenLastCalledWith([1000])
    fireEvent.keyDown(thumb, { key: "Enter" })
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "123" } })
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" })
    expect(onValueCommit).toHaveBeenCalledTimes(1)
  })

  it("segments render one block per step and raise the current one", () => {
    const { container } = render(<Slider variant="segments" min={1} max={7} defaultValue={[4]} />)
    const segs = container.querySelectorAll(".nqui-slider-segment")
    expect(segs).toHaveLength(7)
    expect(container.querySelectorAll(".nqui-slider-segment[data-on]")).toHaveLength(4)
    expect(segs[3]).toHaveAttribute("data-current")
  })

  it("segments outside 5–12 steps fall back to default with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const { container } = render(<Slider variant="segments" min={1} max={3} defaultValue={[2]} />)
    expect(container.querySelector("[data-slot='slider']")).toHaveAttribute("data-variant", "default")
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("5–12 steps"))
    warn.mockRestore()
  })

  it("ruler tick count follows the track width", () => {
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
    rect.mockReturnValue({ width: 600, height: 28, top: 0, left: 0, right: 600, bottom: 28, x: 0, y: 0, toJSON() {} } as DOMRect)
    const wide = render(<Slider variant="ruler" min={0} max={24} step={0.5} defaultValue={[9]} />)
    const wideCount = wide.container.querySelectorAll(".nqui-slider-tick").length
    wide.unmount()
    rect.mockReturnValue({ width: 120, height: 28, top: 0, left: 0, right: 120, bottom: 28, x: 0, y: 0, toJSON() {} } as DOMRect)
    const narrow = render(<Slider variant="ruler" min={0} max={24} step={0.5} defaultValue={[9]} />)
    const narrowCount = narrow.container.querySelectorAll(".nqui-slider-tick").length
    rect.mockRestore()
    expect(wideCount).toBeGreaterThan(narrowCount)
    expect(narrowCount).toBeGreaterThan(0)
    expect(narrow.container.querySelector(".nqui-slider-bubble")).toHaveTextContent("9")
  })

  it("non-default variants fall back when vertical", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const { container } = render(<Slider variant="field" orientation="vertical" defaultValue={[2]} />)
    expect(container.querySelector("[data-slot='slider']")).toHaveAttribute("data-variant", "default")
    warn.mockRestore()
  })
})
