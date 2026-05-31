import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggle } from '@/components/ui/toggle'
import { HugeiconsIcon } from '@hugeicons/react'
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from '@hugeicons/core-free-icons'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A two-state button that can be either on or off.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Toggle variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'Toggle size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

// Default toggle
export const Default: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <HugeiconsIcon icon={TextBoldIcon} size={16} className="h-4 w-4" />
    </Toggle>
  ),
}

// With text
export const WithText: Story = {
  render: () => (
    <Toggle>Toggle</Toggle>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toggle with text content.',
      },
    },
  },
}

// Variants
export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle variant="default" aria-label="Toggle bold">
        <HugeiconsIcon icon={TextBoldIcon} size={16} className="h-4 w-4" />
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle italic">
        <HugeiconsIcon icon={TextItalicIcon} size={16} className="h-4 w-4" />
      </Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toggle components with different variants.',
      },
    },
  },
}

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm" aria-label="Toggle small">
        <Bold className="h-3 w-3" />
      </Toggle>
      <Toggle size="default" aria-label="Toggle default">
        <HugeiconsIcon icon={TextBoldIcon} size={16} className="h-4 w-4" />
      </Toggle>
      <Toggle size="lg" aria-label="Toggle large">
        <HugeiconsIcon icon={TextBoldIcon} size={16} className="h-4 w-4" />
      </Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toggle components in different sizes.',
      },
    },
  },
}

// Formatting toolbar
export const FormattingToolbar: Story = {
  render: () => (
    <div className="flex gap-1 border rounded-md p-1">
      <Toggle aria-label="Toggle bold">
        <HugeiconsIcon icon={TextBoldIcon} size={16} className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <HugeiconsIcon icon={TextItalicIcon} size={16} className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <HugeiconsIcon icon={TextUnderlineIcon} size={16} className="h-4 w-4" />
      </Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toggle components used in a formatting toolbar.',
      },
    },
  },
}

// Disabled
export const Disabled: Story = {
  render: () => (
    <Toggle disabled aria-label="Toggle disabled">
      <HugeiconsIcon icon={TextBoldIcon} size={16} className="h-4 w-4" />
    </Toggle>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled toggle that cannot be interacted with.',
      },
    },
  },
}
