import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'
import { Progress } from '@/components'
import { TooltipProvider } from '@/components/ui/tooltip'

const meta = {
  title: 'Custom/EnhancedProgress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A block-based progress component that displays progress as discrete colored blocks. Supports auto-calculated block count based on container width, or manual block count override. Similar visual design to Tracker component.',
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
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="w-full max-w-4xl p-4">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Progress value (0 to max)',
      table: {
        type: { summary: 'number' },
      },
    },
    max: {
      control: { type: 'number', min: 1 },
      description: 'Maximum value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '100' },
      },
    },
    blocks: {
      control: { type: 'number', min: 20, max: 100 },
      description: 'Number of blocks to display (optional - auto-calculated if not provided)',
      table: {
        type: { summary: 'number' },
      },
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'neutral'],
      description: 'Variant color scheme',
      table: {
        type: { summary: "'default' | 'success' | 'warning' | 'error' | 'neutral'" },
        defaultValue: { summary: "'default'" },
      },
    },
    showTooltip: {
      control: 'boolean',
      description: 'Show tooltip on hover showing progress percentage',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hoverEffect: {
      control: 'boolean',
      description: 'Enable hover opacity effect on blocks',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    height: {
      control: 'text',
      description: 'Height override (Tailwind class or CSS value)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"h-8"' },
      },
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

// Default progress
export const Default: Story = {
  args: {
    value: 50,
    max: 100,
    variant: 'default',
  },
}

// With value
export const WithValue: Story = {
  args: {
    value: 75,
    max: 100,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress component at 75% completion.',
      },
    },
  },
}

// Variants
export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Default (Primary)</div>
        <Progress value={60} variant="default" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Success (Green)</div>
        <Progress value={60} variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Warning (Yellow)</div>
        <Progress value={60} variant="warning" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Error (Red)</div>
        <Progress value={60} variant="error" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Neutral (Gray)</div>
        <Progress value={60} variant="neutral" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress component with different color variants.',
      },
    },
  },
}

// Custom blocks
export const CustomBlocks: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">20 Blocks (Sparse)</div>
        <Progress value={60} blocks={20} variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">50 Blocks (Default)</div>
        <Progress value={60} blocks={50} variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">100 Blocks (Dense)</div>
        <Progress value={60} blocks={100} variant="success" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress component with custom block counts. More blocks = higher density, fewer blocks = sparser appearance.',
      },
    },
  },
}

// Auto-calculated blocks
export const AutoBlocks: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Narrow Container (Auto-calculated)</div>
        <div className="w-64">
          <Progress value={60} variant="default" />
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Medium Container (Auto-calculated)</div>
        <div className="w-96">
          <Progress value={60} variant="default" />
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Wide Container (Auto-calculated)</div>
        <div className="w-full max-w-2xl">
          <Progress value={60} variant="default" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress component with auto-calculated block count based on container width. Block count adapts to available space.',
      },
    },
  },
}

// With tooltip
export const WithTooltip: Story = {
  args: {
    value: 65,
    showTooltip: true,
    variant: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress component with tooltip showing progress percentage on hover.',
      },
    },
  },
}

// With hover effect
export const WithHoverEffect: Story = {
  args: {
    value: 70,
    hoverEffect: true,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress component with hover opacity effect enabled. Blocks will fade on hover.',
      },
    },
  },
}

// Custom heights
export const CustomHeight: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Height: h-4 (Small)</div>
        <Progress value={60} height="h-4" variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Height: h-6 (Medium)</div>
        <Progress value={60} height="h-6" variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Height: h-8 (Default)</div>
        <Progress value={60} height="h-8" variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Height: h-12 (Large)</div>
        <Progress value={60} height="h-12" variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Height: 2rem (Custom CSS)</div>
        <Progress value={60} height="2rem" variant="success" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress component with different heights using Tailwind classes or custom CSS values.',
      },
    },
  },
}

// Different progress values
export const ProgressValues: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">0%</div>
        <Progress value={0} variant="default" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">25%</div>
        <Progress value={25} variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">50%</div>
        <Progress value={50} variant="warning" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">75%</div>
        <Progress value={75} variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">100%</div>
        <Progress value={100} variant="success" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress component showing different completion percentages.',
      },
    },
  },
}

// Controlled progress
export const Controlled: Story = {
  render: () => {
    const [progress, setProgress] = useState(50)

    return (
      <div className="space-y-4">
        <Progress value={progress} variant="success" showTooltip />
        <div className="text-sm text-muted-foreground">
          Progress: <code className="font-mono">{progress}%</code>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setProgress(0)}
            className="px-3 py-1 text-sm border rounded"
          >
            Reset
          </button>
          <button
            onClick={() => setProgress(25)}
            className="px-3 py-1 text-sm border rounded"
          >
            Set to 25%
          </button>
          <button
            onClick={() => setProgress(50)}
            className="px-3 py-1 text-sm border rounded"
          >
            Set to 50%
          </button>
          <button
            onClick={() => setProgress(75)}
            className="px-3 py-1 text-sm border rounded"
          >
            Set to 75%
          </button>
          <button
            onClick={() => setProgress(100)}
            className="px-3 py-1 text-sm border rounded"
          >
            Set to 100%
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full"
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled progress component with external state management and interactive controls.',
      },
    },
  },
}

// Responsive behavior
export const Responsive: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Mobile Width (320px)</div>
        <div className="w-[320px] border p-4">
          <Progress value={60} variant="default" />
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Tablet Width (768px)</div>
        <div className="w-[768px] border p-4">
          <Progress value={60} variant="default" />
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Desktop Width (1024px)</div>
        <div className="w-[1024px] border p-4">
          <Progress value={60} variant="default" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress component demonstrating responsive block calculation at different container widths.',
      },
    },
  },
}
