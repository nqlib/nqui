import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty'
import { HugeiconsIcon } from '@hugeicons/react'
import { Package01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components'

const meta = {
  title: 'UI/Empty',
  component: Empty,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An empty state component for displaying when there is no data or content.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

// Default empty
export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <HugeiconsIcon icon={Package01Icon} size={32} className="h-8 w-8" />
        </EmptyMedia>
        <EmptyTitle>No items found</EmptyTitle>
        <EmptyDescription>
          Get started by creating a new item.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create Item</Button>
      </EmptyContent>
    </Empty>
  ),
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

// With icon variant
export const WithIconVariant: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Package01Icon} size={16} className="h-4 w-4" />
        </EmptyMedia>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filter criteria.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Empty state with icon variant (smaller, in a rounded box).',
      },
    },
  },
}

// Simple empty
export const Simple: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No data available</EmptyTitle>
        <EmptyDescription>
          There is no data to display at this time.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Simple empty state without icon or actions.',
      },
    },
  },
}
