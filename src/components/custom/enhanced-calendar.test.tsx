import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { EnhancedCalendar } from "./enhanced-calendar"

if (typeof PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number
    pointerType: string
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerId = init.pointerId ?? 0
      this.pointerType = init.pointerType ?? "mouse"
    }
  }
  globalThis.PointerEvent = PointerEventPolyfill as typeof PointerEvent
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}

const from = new Date(2026, 7, 10)
const to = new Date(2026, 7, 15)

function dispatchPointer(target: EventTarget, type: string, init: PointerEventInit = {}) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      ...init,
    })
  )
}

function drag(fromEl: Element, toEl: Element) {
  act(() => {
    dispatchPointer(fromEl, "pointerdown", { clientX: 0, clientY: 0 })
    dispatchPointer(fromEl, "pointermove", { clientX: 12, clientY: 0 })
    dispatchPointer(toEl, "pointermove", { clientX: 40, clientY: 0 })
    dispatchPointer(toEl, "pointerup", { clientX: 40, clientY: 0 })
  })
}

describe("EnhancedCalendar range endpoint drag", () => {
  it("marks a completed range so start/end can be grabbed", () => {
    const { container } = render(
      <EnhancedCalendar mode="range" month={from} selected={{ from, to }} />
    )
    expect(container.querySelector("[data-range-complete]")).toBeTruthy()
  })

  it("resizes the range when dragging the end date", () => {
    const onSelect = vi.fn()
    render(
      <EnhancedCalendar
        mode="range"
        month={from}
        selected={{ from, to }}
        onSelect={onSelect}
      />
    )
    const end = document.querySelector('[data-range-end="true"]')
    const later = document.querySelector('[data-iso-date="2026-08-18"]')
    expect(end).toBeTruthy()
    expect(later).toBeTruthy()
    drag(end!, later!)
    expect(onSelect).toHaveBeenCalled()
    const range = onSelect.mock.calls[0][0] as { from: Date; to: Date }
    expect(range.from.getDate()).toBe(10)
    expect(range.to.getDate()).toBe(18)
  })

  it("swaps ends when the start is dragged past the end", () => {
    const onSelect = vi.fn()
    render(
      <EnhancedCalendar
        mode="range"
        month={from}
        selected={{ from, to }}
        onSelect={onSelect}
      />
    )
    const start = document.querySelector('[data-range-start="true"]')
    const afterEnd = document.querySelector('[data-iso-date="2026-08-20"]')
    drag(start!, afterEnd!)
    const range = onSelect.mock.calls[0][0] as { from: Date; to: Date }
    expect(range.from.getDate()).toBe(15)
    expect(range.to.getDate()).toBe(20)
  })

  it("does not commit a resize on a click without moving", () => {
    const onSelect = vi.fn()
    render(
      <EnhancedCalendar
        mode="range"
        month={from}
        selected={{ from, to }}
        onSelect={onSelect}
      />
    )
    const end = document.querySelector('[data-range-end="true"]')!
    act(() => {
      dispatchPointer(end, "pointerdown", { clientX: 0, clientY: 0 })
      dispatchPointer(end, "pointerup", { clientX: 1, clientY: 0 })
    })
    expect(onSelect).not.toHaveBeenCalled()
  })
})
