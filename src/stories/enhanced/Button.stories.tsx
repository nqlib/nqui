import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from '@storybook/testing-library'
import { Button } from '@/components'
import { mockUsers } from '../mockData'

const meta = {
  title: 'Enhanced/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced button component with 3D styling, gradients, and advanced states.',
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
      description: 'Button variant with enhanced styling',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: 'boolean',
      description: 'Whether to render as a child component',
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Default enhanced button
export const Default: Story = {
  args: {
    children: 'Enhanced Button',
    variant: 'default',
    size: 'default',
  },
}

// Interactive enhanced button
export const Interactive: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await userEvent.click(button)
    // await expect(button).toHaveFocus() // TODO: Fix expect import for Storybook 10
  },
}

// All enhanced variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All enhanced button variants with 3D styling and gradients.',
      },
    },
  },
}

// Fallback variants (outline, ghost, link)
export const FallbackVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Fallback variants that use the core button styling.',
      },
    },
  },
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔍</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Enhanced buttons in different sizes.',
      },
    },
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

// Loading state simulation
export const Loading: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state with disabled styling.',
      },
    },
  },
}

// Button with icon
export const WithIcon: Story = {
  args: {
    children: (
      <div className="flex items-center gap-2">
        <span>🚀</span>
        Launch
      </div>
    ),
  },
}

// Comparison with Core Button
export const Comparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Enhanced Button</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Enhanced</Button>
          <Button variant="destructive">Enhanced</Button>
          <Button variant="success">Enhanced</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Core Button</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">Core Outline</Button>
          <Button variant="ghost">Core Ghost</Button>
          <Button variant="link">Core Link</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison between enhanced variants and core button variants.',
      },
    },
  },
}

// Using mock data
export const WithUserData: Story = {
  args: {
    children: `Hello, ${mockUsers[0].name}`,
  },
  loaders: [
    async () => ({
      user: await Promise.resolve(mockUsers[0]),
    }),
  ],
}

// Action buttons example
export const ActionButtons: Story = {
  args: {
    variant: "default",
    asChild: true,
    size: "sm"
  },

  render: () => (
    <div className="flex gap-3">
      <Button variant="success">Save</Button>
      <Button variant="default">Submit</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="info">Info</Button>
    </div>
  ),

  parameters: {
    docs: {
      description: {
        story: 'Common action buttons with appropriate enhanced variants.',
      },
    },
  }
}