import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Button } from '@/components'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An interactive component which expands/collapses to reveal or hide content.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

// Default collapsible
export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[350px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

// Simple collapsible
export const Simple: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[400px]">
        <CollapsibleTrigger asChild>
          <Button variant="outline">
            {open ? 'Hide' : 'Show'} Content
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 p-4 border rounded-md">
          <p className="text-sm">
            This is collapsible content that can be shown or hidden by clicking the trigger button.
          </p>
        </CollapsibleContent>
      </Collapsible>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple collapsible with a button trigger.',
      },
    },
  },
}

// Default open
export const DefaultOpen: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true)

    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[400px]">
        <CollapsibleTrigger asChild>
          <Button variant="outline">
            {open ? 'Hide' : 'Show'} Content
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 p-4 border rounded-md">
          <p className="text-sm">
            This collapsible starts open by default.
          </p>
        </CollapsibleContent>
      </Collapsible>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Collapsible that starts in the open state.',
      },
    },
  },
}
