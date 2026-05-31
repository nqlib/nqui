import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from '@storybook/testing-library'
import { Badge, CoreBadge } from '@/components'
import { mockUsers } from '../mockData'

const meta = {
  title: 'Enhanced/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced badge component with button-like styling, gradients, and advanced variants.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
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
      options: ['default', 'destructive', 'secondary', 'success', 'warning', 'info', 'outline', 'ghost', 'link'],
      description: 'Badge variant with enhanced styling',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    asChild: {
      control: 'boolean',
      description: 'Whether to render as a child component',
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
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

// Default enhanced badge
export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
}

// All enhanced variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All enhanced badge variants with 3D styling and gradients.',
      },
    },
  },
}

// Fallback variants (outline, ghost, link)
export const FallbackVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Fallback variants that use the core badge styling.',
      },
    },
  },
}

// Badge with icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default">
        <span>✓</span>
        Success
      </Badge>
      <Badge variant="destructive">
        <span>✕</span>
        Error
      </Badge>
      <Badge variant="info">
        Info
        <span>ℹ</span>
      </Badge>
      <Badge variant="warning">
        <span>⚠</span>
        Warning
        <span>⚠</span>
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges with leading and trailing icons.',
      },
    },
  },
}

// Interactive badge
export const Interactive: Story = {
  args: {
    children: 'Click me',
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByText('Click me')
    await userEvent.click(badge)
  },
}

// Comparison with Core Badge
export const Comparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Enhanced Badge</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Enhanced</Badge>
          <Badge variant="destructive">Enhanced</Badge>
          <Badge variant="success">Enhanced</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Core Badge</h3>
        <div className="flex flex-wrap gap-3">
          <CoreBadge variant="default">Core</CoreBadge>
          <CoreBadge variant="destructive">Core</CoreBadge>
          <CoreBadge variant="secondary">Core</CoreBadge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison between enhanced variants and core badge variants.',
      },
    },
  },
}

// Using mock data
export const WithUserData: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">{mockUsers[0].role}</Badge>
      <Badge variant={mockUsers[0].status === 'active' ? 'success' : 'secondary'}>
        {mockUsers[0].status}
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges using mock user data.',
      },
    },
  },
}

// Status badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="success">Active</Badge>
      <Badge variant="destructive">Inactive</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="info">Processing</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common status badges with appropriate variants.',
      },
    },
  },
}
