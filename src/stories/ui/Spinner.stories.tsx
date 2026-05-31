import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from '@/components/ui/spinner'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A loading spinner component to indicate that content is being loaded.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for sizing',
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

// Default spinner
export const Default: Story = {
  args: {},
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <Spinner className="h-4 w-4" />
        <div className="text-xs text-muted-foreground mt-2">Small</div>
      </div>
      <div className="text-center">
        <Spinner className="h-6 w-6" />
        <div className="text-xs text-muted-foreground mt-2">Default</div>
      </div>
      <div className="text-center">
        <Spinner className="h-8 w-8" />
        <div className="text-xs text-muted-foreground mt-2">Medium</div>
      </div>
      <div className="text-center">
        <Spinner className="h-12 w-12" />
        <div className="text-xs text-muted-foreground mt-2">Large</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner component in different sizes.',
      },
    },
  },
}

// In button
export const InButton: Story = {
  render: () => (
    <div className="flex gap-4">
      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2">
        <Spinner className="h-4 w-4" />
        Loading...
      </button>
      <button className="px-4 py-2 border rounded-md flex items-center gap-2">
        <Spinner className="h-4 w-4" />
        Processing
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner used inside buttons to indicate loading state.',
      },
    },
  },
}
