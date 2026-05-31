import type { Meta, StoryObj } from '@storybook/react-vite'
import { CoreBadge } from '@/components/ui/badge'
import { mockBadgeLabels } from '../mockData'

const meta = {
  title: 'UI/Badge',
  component: CoreBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A small status descriptor for UI elements.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
      ],
    },
  },
  tags: ['autodocs', 'test'],
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Badge variant style',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof CoreBadge>

export default meta
type Story = StoryObj<typeof meta>

// Default badge
export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
}

// All variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <CoreBadge variant="default">Default</CoreBadge>
      <CoreBadge variant="secondary">Secondary</CoreBadge>
      <CoreBadge variant="destructive">Destructive</CoreBadge>
      <CoreBadge variant="outline">Outline</CoreBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available badge variants.',
      },
    },
  },
}

// Status badges
export const Status: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <CoreBadge variant="default">Active</CoreBadge>
      <CoreBadge variant="secondary">Pending</CoreBadge>
      <CoreBadge variant="destructive">Error</CoreBadge>
      <CoreBadge variant="outline">Disabled</CoreBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status indicators using different badge variants.',
      },
    },
  },
}

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <CoreBadge>
        <span className="mr-1">✓</span>
        Success
      </CoreBadge>
      <CoreBadge variant="destructive">
        <span className="mr-1">⚠</span>
        Warning
      </CoreBadge>
      <CoreBadge variant="secondary">
        <span className="mr-1">⏳</span>
        Pending
      </CoreBadge>
    </div>
  ),
}

// Different content
export const Content: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {mockBadgeLabels.map((label) => (
        <CoreBadge key={label} variant={label === 'Hot' ? 'destructive' : label === 'New' ? 'default' : 'secondary'}>
          {label}
        </CoreBadge>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges with various content and contextual colors.',
      },
    },
  },
}

// In context
export const InContext: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-medium">Project Status</h3>
          <p className="text-sm text-muted-foreground">Everything is running smoothly</p>
        </div>
        <CoreBadge variant="default">Active</CoreBadge>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-medium">System Health</h3>
          <p className="text-sm text-muted-foreground">All systems operational</p>
        </div>
        <CoreBadge variant="secondary">Healthy</CoreBadge>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-medium">Security Alert</h3>
          <p className="text-sm text-muted-foreground">Review required</p>
        </div>
        <CoreBadge variant="destructive">Critical</CoreBadge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used in real UI contexts like cards and status indicators.',
      },
    },
  },
}