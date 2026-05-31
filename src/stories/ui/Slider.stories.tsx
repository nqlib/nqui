import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'
import { Slider } from '@/components/ui/slider'

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An input where the user selects a value from within a given range.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: false,
      description: 'Default value array',
    },
    value: {
      control: false,
      description: 'Controlled value array',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    max: {
      control: 'number',
      description: 'Maximum value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '100' },
      },
    },
    step: {
      control: 'number',
      description: 'Step value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled',
    },
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

// Default slider
export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

// Range slider
export const Range: Story = {
  args: {
    defaultValue: [20, 80],
    min: 0,
    max: 100,
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
        story: 'Slider with a range of values (two thumbs).',
      },
    },
  },
}

// Controlled slider
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState([50])

    return (
      <div className="w-[400px] space-y-4">
        <Slider value={value} onValueChange={setValue} min={0} max={100} />
        <div className="text-sm text-muted-foreground">
          Value: <code className="font-mono">{value[0]}</code>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled slider with external state management.',
      },
    },
  },
}

// Different ranges
export const DifferentRanges: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">0 to 100</div>
        <Slider defaultValue={[50]} min={0} max={100} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">0 to 1000</div>
        <Slider defaultValue={[500]} min={0} max={1000} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">-50 to 50</div>
        <Slider defaultValue={[0]} min={-50} max={50} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sliders with different value ranges.',
      },
    },
  },
}

// With step
export const WithStep: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 10,
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
        story: 'Slider with step value of 10.',
      },
    },
  },
}

// Disabled
export const Disabled: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    disabled: true,
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
        story: 'Disabled slider that cannot be interacted with.',
      },
    },
  },
}
