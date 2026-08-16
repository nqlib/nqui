import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "./alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "./drawer"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./sheet"

describe("Dialog", () => {
  it("renders tray rim and stage when open", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Invite</DialogTitle>
          <DialogDescription>Add a reviewer.</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    const content = document.querySelector('[data-slot="dialog-content"]')
    const stage = document.querySelector('[data-slot="dialog-stage"]')
    expect(content).toHaveClass("bg-muted", "p-1", "rounded-xl")
    expect(content).not.toHaveClass("shadow-(--shadow-modal)")
    expect(stage).toHaveClass("bg-background", "border", "rounded-lg")
    expect(screen.getByText("Invite")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass(
      "bg-overlay",
      "supports-backdrop-filter:backdrop-blur-xs"
    )
  })

  it("skips the stage wrapper when stage is false", () => {
    render(
      <Dialog open>
        <DialogContent stage={false} showCloseButton={false} aria-describedby={undefined}>
          <DialogTitle>Palette</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(document.querySelector('[data-slot="dialog-stage"]')).toBeNull()
    expect(screen.getByText("Palette")).toBeInTheDocument()
  })
})

describe("AlertDialog", () => {
  it("renders tray rim and stage when open", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Purge cache?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    )

    const content = document.querySelector('[data-slot="alert-dialog-content"]')
    const stage = document.querySelector('[data-slot="alert-dialog-stage"]')
    expect(content).toHaveClass("bg-muted", "p-1", "rounded-xl")
    expect(stage).toHaveClass("bg-background", "border", "rounded-lg")
    expect(screen.getByText("Purge cache?")).toBeInTheDocument()
  })
})

describe("Sheet", () => {
  it("renders tray rim and stage when open", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Compliance</SheetTitle>
          <SheetDescription>Attach evidence.</SheetDescription>
        </SheetContent>
      </Sheet>
    )

    const content = document.querySelector('[data-slot="sheet-content"]')
    const stage = document.querySelector('[data-slot="sheet-stage"]')
    expect(content).toHaveClass("bg-muted", "p-1", "rounded-xl")
    expect(content).not.toHaveClass("shadow-(--shadow-modal)")
    expect(stage).toHaveClass("bg-background", "border", "rounded-lg")
    expect(screen.getByText("Compliance")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toHaveClass(
      "bg-overlay",
      "supports-backdrop-filter:backdrop-blur-xs"
    )
  })

  it("skips the stage wrapper when stage is false", () => {
    render(
      <Sheet open>
        <SheetContent stage={false} showCloseButton={false} aria-describedby={undefined}>
          <SheetTitle>Sidebar</SheetTitle>
        </SheetContent>
      </Sheet>
    )

    expect(document.querySelector('[data-slot="sheet-stage"]')).toBeNull()
    expect(screen.getByText("Sidebar")).toBeInTheDocument()
  })
})

describe("Drawer", () => {
  it("renders tray rim and stage when open", () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the set.</DrawerDescription>
        </DrawerContent>
      </Drawer>
    )

    const content = document.querySelector('[data-slot="drawer-content"]')
    const stage = document.querySelector('[data-slot="drawer-stage"]')
    expect(content).toHaveClass("bg-muted", "p-1", "rounded-xl")
    expect(content).not.toHaveClass("before:shadow-(--shadow-modal)")
    expect(stage).toHaveClass("bg-background", "border", "rounded-lg")
    expect(screen.getByText("Filters")).toBeInTheDocument()
  })
})
