import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from '@/components/ui/progress'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A progress indicator component that displays the completion status of a task.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
      table: {
        type: { summary: 'number' },
      },
    },
    variant: {
      control: 'select',
      options: ['default', 'neutral', 'success', 'warning', 'error'],
      description: 'Progress variant',
      table: {
        type: { summary: '"default" | "neutral" | "success" | "warning" | "error"' },
        defaultValue: { summary: '"default"' },
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
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

// Different values
export const Values: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div>
        <div className="text-sm font-medium mb-2">0%</div>
        <Progress value={0} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">25%</div>
        <Progress value={25} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">50%</div>
        <Progress value={50} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">75%</div>
        <Progress value={75} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">100%</div>
        <Progress value={100} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress indicators with different completion values.',
      },
    },
  },
}

// Variants
export const Variants: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div>
        <div className="text-sm font-medium mb-2">Default</div>
        <Progress value={60} variant="default" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Neutral</div>
        <Progress value={60} variant="neutral" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Success</div>
        <Progress value={60} variant="success" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Warning</div>
        <Progress value={60} variant="warning" />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Error</div>
        <Progress value={60} variant="error" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress indicators with different color variants.',
      },
    },
  },
}
