import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from '@/components/ui/popover'
import { Button } from '@/components'

const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A floating panel that appears on top of the content, triggered by a button or other control.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

// Default popover
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions for the layer.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
}

// With form
export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Create workspace</PopoverTitle>
          <PopoverDescription>
            Add a new workspace to your account.
          </PopoverDescription>
        </PopoverHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              placeholder="Workspace name"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Workspace description"
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Create</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Popover containing a form with input fields.',
      },
    },
  },
}

// Different sides
export const Sides: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8 p-12">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <PopoverHeader>
            <PopoverTitle>Popover on top</PopoverTitle>
            <PopoverDescription>
              This popover appears above the trigger.
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>

      <div className="flex gap-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Left</Button>
          </PopoverTrigger>
          <PopoverContent side="left">
            <PopoverHeader>
              <PopoverTitle>Popover on left</PopoverTitle>
              <PopoverDescription>
                This popover appears to the left.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Right</Button>
          </PopoverTrigger>
          <PopoverContent side="right">
            <PopoverHeader>
              <PopoverTitle>Popover on right</PopoverTitle>
              <PopoverDescription>
                This popover appears to the right.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <PopoverHeader>
            <PopoverTitle>Popover on bottom</PopoverTitle>
            <PopoverDescription>
              This popover appears below the trigger.
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Popovers positioned on different sides of the trigger element.',
      },
    },
  },
}

// Simple content
export const Simple: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <p className="text-sm font-medium">Simple Popover</p>
          <p className="text-sm text-muted-foreground">
            This is a simple popover with minimal content.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Simple popover without header components.',
      },
    },
  },
}
