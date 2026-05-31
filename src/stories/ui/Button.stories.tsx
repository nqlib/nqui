import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CoreButton } from '@/components/ui/button'
import { mockUsers } from '../mockData'

const meta = {
  title: 'UI/Button',
  component: CoreButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A basic button component with multiple variants and sizes.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
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
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Button variant style',
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
} satisfies Meta<typeof CoreButton>

export default meta
type Story = StoryObj<typeof meta>

// Default story with args
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
}

// Story with play function for interaction testing
export const Interactive: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await userEvent.click(button)
    await expect(button).toHaveFocus()
  },
}

// Variant showcase
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <CoreButton variant="default">Default</CoreButton>
      <CoreButton variant="destructive">Destructive</CoreButton>
      <CoreButton variant="outline">Outline</CoreButton>
      <CoreButton variant="secondary">Secondary</CoreButton>
      <CoreButton variant="ghost">Ghost</CoreButton>
      <CoreButton variant="link">Link</CoreButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants.',
      },
    },
  },
}

// Size showcase
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <CoreButton size="sm">Small</CoreButton>
      <CoreButton size="default">Default</CoreButton>
      <CoreButton size="lg">Large</CoreButton>
      <CoreButton size="icon">🔍</CoreButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes.',
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

// Loading state simulation
export const Loading: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in a loading state (disabled with loading text).',
      },
    },
  },
}