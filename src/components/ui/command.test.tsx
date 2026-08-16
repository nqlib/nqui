import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Command, CommandDialog, CommandInput, CommandList } from "./command"

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
