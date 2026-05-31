import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A textarea component for multi-line text input.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    rows: {
      control: 'number',
      description: 'Number of visible rows',
    },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

// Default textarea
export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

// With label
export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Textarea with a label.',
      },
    },
  },
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <Label>Small (3 rows)</Label>
        <Textarea rows={3} placeholder="Small textarea..." />
      </div>
      <div className="space-y-2">
        <Label>Medium (5 rows)</Label>
        <Textarea rows={5} placeholder="Medium textarea..." />
      </div>
      <div className="space-y-2">
        <Label>Large (10 rows)</Label>
        <Textarea rows={10} placeholder="Large textarea..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Textareas with different row counts.',
      },
    },
  },
}

// Disabled
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea...',
    disabled: true,
    defaultValue: 'This textarea is disabled',
  },
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
        story: 'Disabled textarea that cannot be edited.',
      },
    },
  },
}

// With value
export const WithValue: Story = {
  args: {
    defaultValue: 'This is some pre-filled text in the textarea component.',
  },
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
        story: 'Textarea with a default value.',
      },
    },
  },
}
