import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'
import { Rating } from '@/components'

const meta = {
  title: 'Custom/Rating',
  component: Rating,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A fully accessible rating component using native radio inputs. Supports half-star ratings, tooltips, and keyboard navigation.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'number',
      description: 'Controlled rating value (0 to maxRating)',
      table: {
        type: { summary: 'number' },
      },
    },
    defaultValue: {
      control: 'number',
      description: 'Default rating value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    onValueChange: {
      action: 'ratingChanged',
      description: 'Callback when rating changes',
      table: {
        type: { summary: '(value: number) => void' },
      },
    },
    maxRating: {
      control: 'number',
      description: 'Maximum rating value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5' },
      },
    },
    allowHalf: {
      control: 'boolean',
      description: 'Allow half-star ratings',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showTooltip: {
      control: 'boolean',
      description: 'Show tooltip on hover',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the rating is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    starSize: {
      control: 'text',
      description: 'Star size (Tailwind classes)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"h-6 w-6"' },
      },
    },
  },
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof meta>

// Default rating
export const Default: Story = {
  args: {
    defaultValue: 0,
    maxRating: 5,
    allowHalf: true,
    showTooltip: true,
  },
}

// With initial value
export const WithValue: Story = {
  args: {
    defaultValue: 3.5,
    maxRating: 5,
    allowHalf: true,
    showTooltip: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Rating component with an initial value of 3.5 stars.',
      },
    },
  },
}

// Whole stars only (no half ratings)
export const WholeStarsOnly: Story = {
  args: {
    defaultValue: 3,
    maxRating: 5,
    allowHalf: false,
    showTooltip: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Rating component that only allows whole star ratings (no half stars).',
      },
    },
  },
}

// Different max rating
export const MaxRating10: Story = {
  args: {
    defaultValue: 7.5,
    maxRating: 10,
    allowHalf: true,
    showTooltip: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Rating component with a maximum rating of 10 stars.',
      },
    },
  },
}

// Controlled rating
export const Controlled: Story = {
  render: () => {
    const [rating, setRating] = useState(2.5)

    return (
      <div className="space-y-4">
        <Rating
          value={rating}
          onValueChange={setRating}
          maxRating={5}
          allowHalf={true}
          showTooltip={true}
        />
        <div className="text-sm text-muted-foreground">
          Current rating: <code className="font-mono">{rating}</code>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRating(1)}
            className="px-3 py-1 text-sm border rounded"
          >
            Set to 1
          </button>
          <button
            onClick={() => setRating(3)}
            className="px-3 py-1 text-sm border rounded"
          >
            Set to 3
          </button>
          <button
            onClick={() => setRating(5)}
            className="px-3 py-1 text-sm border rounded"
          >
            Set to 5
          </button>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled rating component with external state management.',
      },
    },
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    defaultValue: 3.5,
    maxRating: 5,
    allowHalf: true,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled rating component that cannot be interacted with.',
      },
    },
  },
}

// Without tooltips
export const WithoutTooltips: Story = {
  args: {
    defaultValue: 2.5,
    maxRating: 5,
    allowHalf: true,
    showTooltip: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Rating component without tooltips on hover.',
      },
    },
  },
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Small (h-4 w-4)</div>
        <Rating defaultValue={3.5} maxRating={5} starSize="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Default (h-6 w-6)</div>
        <Rating defaultValue={3.5} maxRating={5} starSize="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Large (h-8 w-8)</div>
        <Rating defaultValue={3.5} maxRating={5} starSize="h-8 w-8" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Extra Large (h-12 w-12)</div>
        <Rating defaultValue={3.5} maxRating={5} starSize="h-12 w-12" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Rating component in different sizes using the starSize prop.',
      },
    },
  },
}

// Read-only display
export const ReadOnly: Story = {
  args: {
    value: 4.5,
    maxRating: 5,
    allowHalf: true,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only rating display (disabled with a fixed value).',
      },
    },
  },
}
