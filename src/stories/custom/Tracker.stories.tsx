import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { Tracker } from '@/components'
import type { TrackerBlockProps } from '@/components'
import { TooltipProvider } from '@/components/ui/tooltip'

// Sample data for stories
const sampleData: TrackerBlockProps[] = [
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-red-600 dark:bg-red-500", tooltip: "Error" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-red-600 dark:bg-red-500", tooltip: "Error" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-yellow-600 dark:bg-yellow-500", tooltip: "Warning" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { tooltip: "No data" },
  { tooltip: "No data" },
  { tooltip: "No data" },
  { tooltip: "No data" },
  { tooltip: "No data" },
  { tooltip: "No data" },
  { tooltip: "No data" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-yellow-600 dark:bg-yellow-500", tooltip: "Warning" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-red-600 dark:bg-red-500", tooltip: "Error" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
]

const shortData: TrackerBlockProps[] = sampleData.slice(0, 20)
const mediumData: TrackerBlockProps[] = sampleData.slice(0, 40)
const longData: TrackerBlockProps[] = sampleData

const meta = {
  title: 'Custom/Tracker',
  component: Tracker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A tracker component that displays a horizontal bar of colored blocks with optional tooltips. Similar to GitHub\'s contribution graph, useful for visualizing activity, status, or progress over time.',
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
    data: {
      control: 'object',
      description: 'Array of block data to display',
      table: {
        type: { summary: 'TrackerBlockProps[]' },
      },
    },
    defaultBackgroundColor: {
      control: 'text',
      description: 'Default background color for blocks without a color prop',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"bg-muted"' },
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
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Tracker>

export default meta
type Story = StoryObj<typeof meta>

// Default tracker
export const Default: Story = {
  args: {
    data: sampleData,
  },
  render: (args) => <Tracker {...args} data-testid="tracker-default" />,
}

// With tooltips
export const WithTooltips: Story = {
  args: {
    data: sampleData,
  },
  render: (args) => <Tracker {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Tracker component with tooltips enabled. Hover over blocks to see tooltip information.',
      },
    },
  },
}

// With hover effect
export const WithHoverEffect: Story = {
  args: {
    data: mediumData,
    hoverEffect: true,
  },
  render: (args) => <Tracker {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Tracker component with hover opacity effect enabled. Blocks will fade on hover.',
      },
    },
  },
}

// Color variants
export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Success (Green)</div>
        <Tracker
          data={shortData.map((item) => ({
            ...item,
            color: "bg-emerald-600 dark:bg-emerald-500",
          }))}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Error (Red)</div>
        <Tracker
          data={shortData.map((item) => ({
            ...item,
            color: "bg-red-600 dark:bg-red-500",
          }))}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Warning (Yellow)</div>
        <Tracker
          data={shortData.map((item) => ({
            ...item,
            color: "bg-yellow-600 dark:bg-yellow-500",
          }))}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Info (Blue)</div>
        <Tracker
          data={shortData.map((item) => ({
            ...item,
            color: "bg-blue-600 dark:bg-blue-500",
          }))}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tracker component with different color schemes using semantic colors.',
      },
    },
  },
}

// Responsive breakpoints
export const Responsive: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Short (20 blocks)</div>
        <Tracker data={shortData} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Medium (40 blocks)</div>
        <Tracker data={mediumData} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Long (96 blocks)</div>
        <Tracker data={longData} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tracker component with different data lengths to demonstrate responsive behavior. Spacing adapts to screen size.',
      },
    },
  },
}

// Empty state
export const EmptyState: Story = {
  args: {
    data: [],
  },
  render: (args) => <Tracker {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Tracker component with no data. Displays an empty container.',
      },
    },
  },
}

// Custom colors
export const CustomColors: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Purple Theme</div>
        <Tracker
          data={shortData.map((item) => ({
            ...item,
            color: "bg-purple-600 dark:bg-purple-400",
          }))}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Pink Theme</div>
        <Tracker
          data={shortData.map((item) => ({
            ...item,
            color: "bg-pink-600 dark:bg-pink-400",
          }))}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Indigo Theme</div>
        <Tracker
          data={shortData.map((item) => ({
            ...item,
            color: "bg-indigo-600 dark:bg-indigo-400",
          }))}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tracker component with custom Tailwind color classes.',
      },
    },
  },
}

// Mixed states
export const MixedStates: Story = {
  args: {
    data: [
      { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active - Jan 1" },
      { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active - Jan 2" },
      { color: "bg-yellow-600 dark:bg-yellow-500", tooltip: "Warning - Jan 3" },
      { color: "bg-red-600 dark:bg-red-500", tooltip: "Error - Jan 4" },
      { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active - Jan 5" },
      { tooltip: "No data - Jan 6" },
      { tooltip: "No data - Jan 7" },
      { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active - Jan 8" },
      { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active - Jan 9" },
      { color: "bg-blue-600 dark:bg-blue-500", tooltip: "Info - Jan 10" },
    ],
    hoverEffect: true,
  },
  render: (args) => <Tracker {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Tracker component showing mixed states with different colors and tooltips, demonstrating real-world usage.',
      },
    },
  },
}
