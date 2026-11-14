import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"

describe("CommandDialog", () => {
  it("pins the palette to the upper viewport and keeps fixed positioning", () => {
    render(
      <CommandDialog open>
        <Command>
          <CommandInput />
          <CommandList />
        </Command>
      </CommandDialog>
    )

    const content = document.querySelector('[data-slot="dialog-content"]')
    expect(content).toHaveClass("fixed")
    expect(content).not.toHaveClass("relative")
    expect(content).toHaveClass("top-[12vh]", "translate-y-0")
  })
})

describe("Command row scrolling", () => {
  const native = vi.fn()
  const original = Element.prototype.scrollIntoView

  beforeEach(() => {
    native.mockClear()
    Element.prototype.scrollIntoView = native
  })
  afterEach(() => {
    Element.prototype.scrollIntoView = original
  })

  const renderInline = () =>
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandGroup heading="Pages">
            <CommandItem>Inbox</CommandItem>
            <CommandItem>Files</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

  it("never scrolls the page when cmdk selects the first row on mount", async () => {
    renderInline()
    // cmdk scrolls the selected row (and its group heading) after it settles.
    await new Promise((r) => setTimeout(r, 0))
    expect(native).not.toHaveBeenCalled()
  })

  it("moves only the list viewport to bring a row into view", () => {
    renderInline()
    const viewport = document.querySelector<HTMLElement>('[data-slot="command-list-viewport"]')!
    const row = document.querySelectorAll<HTMLElement>('[data-slot="command-item"]')[1]!
    viewport.getBoundingClientRect = () => ({ top: 0, bottom: 100 }) as DOMRect
    row.getBoundingClientRect = () => ({ top: 150, bottom: 180 }) as DOMRect

    row.scrollIntoView({ block: "nearest" })

    expect(viewport.scrollTop).toBe(80)
    expect(native).not.toHaveBeenCalled()
  })

  it("contains group headings too", () => {
    renderInline()
    const heading = document.querySelector<HTMLElement>("[cmdk-group-heading]")!
    heading.scrollIntoView({ block: "nearest" })
    expect(native).not.toHaveBeenCalled()
  })
})
