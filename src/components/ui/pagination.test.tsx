import { describe, it, expect, vi, afterEach } from "vitest"
import { render } from "@testing-library/react"
import { PaginationAdaptive, scrollActivePageInStrip } from "./pagination"

function fakeBox(
  left: number,
  width: number
): DOMRect {
  return {
    x: left,
    y: 0,
    left,
    right: left + width,
    width,
    height: 28,
    top: 0,
    bottom: 28,
    toJSON: () => ({}),
  }
}

function fakeStrip(opts: {
  scrollWidth: number
  clientWidth: number
  scrollLeft?: number
  left?: number
}) {
  const el = document.createElement("div")
  Object.defineProperty(el, "scrollWidth", { get: () => opts.scrollWidth })
  Object.defineProperty(el, "clientWidth", { get: () => opts.clientWidth })
  el.scrollLeft = opts.scrollLeft ?? 0
  el.getBoundingClientRect = () => fakeBox(opts.left ?? 0, opts.clientWidth)
  el.scrollTo = vi.fn((arg?: ScrollToOptions | number) => {
    if (typeof arg === "object" && arg && "left" in arg) {
      el.scrollLeft = arg.left ?? 0
    }
  }) as HTMLElement["scrollTo"]
  return el
}

describe("scrollActivePageInStrip", () => {
  it("does nothing when the strip does not overflow", () => {
    const viewport = fakeStrip({ scrollWidth: 200, clientWidth: 200 })
    const active = document.createElement("a")
    active.getBoundingClientRect = () => fakeBox(40, 28)
    scrollActivePageInStrip(viewport, active, "center", "auto")
    expect(viewport.scrollTo).not.toHaveBeenCalled()
  })

  it("centers the active page inside the strip viewport", () => {
    const viewport = fakeStrip({ scrollWidth: 400, clientWidth: 100, scrollLeft: 0 })
    const active = document.createElement("a")
    active.getBoundingClientRect = () => fakeBox(200, 28)
    scrollActivePageInStrip(viewport, active, "center", "auto")
    expect(viewport.scrollTo).toHaveBeenCalledWith({
      left: 164,
      behavior: "auto",
    })
  })
})

describe("PaginationAdaptive", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("does not call scrollIntoView on mount (that moves page scrollers)", () => {
    const original = Element.prototype.scrollIntoView
    const spy = vi.fn()
    Element.prototype.scrollIntoView = spy
    try {
      render(<PaginationAdaptive page={3} totalPages={10} onPageChange={() => {}} />)
      expect(spy).not.toHaveBeenCalled()
    } finally {
      Element.prototype.scrollIntoView = original
    }
  })
})
