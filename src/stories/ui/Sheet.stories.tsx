import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components'

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A slide-over panel component that slides in from the edge of the screen.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

// Default sheet (right side)
export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Sheet content goes here.
          </p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

// Left side
export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Navigate through the application.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <nav className="space-y-2">
            <a href="#" className="block px-3 py-2 rounded hover:bg-muted">
              Home
            </a>
            <a href="#" className="block px-3 py-2 rounded hover:bg-muted">
              About
            </a>
            <a href="#" className="block px-3 py-2 rounded hover:bg-muted">
              Contact
            </a>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sheet that slides in from the left side.',
      },
    },
  },
}

// Top side
export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Top Sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            You have 3 new notifications.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="space-y-2">
            <div className="p-3 border rounded">Notification 1</div>
            <div className="p-3 border rounded">Notification 2</div>
            <div className="p-3 border rounded">Notification 3</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sheet that slides in from the top.',
      },
    },
  },
}

// Bottom side
export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Actions</SheetTitle>
          <SheetDescription>
            Choose an action to perform.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Button className="w-full" variant="outline">Action 1</Button>
            <Button className="w-full" variant="outline">Action 2</Button>
            <Button className="w-full" variant="outline">Action 3</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sheet that slides in from the bottom.',
      },
    },
  },
}
