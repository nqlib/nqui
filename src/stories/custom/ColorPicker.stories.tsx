import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'
import { ColorPicker } from '@/components'

const meta = {
  title: 'Custom/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A color picker component that uses OKLCH color space for better color manipulation. Supports both popover and inline variants.',
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
  argTypes: {
    value: {
      control: 'text',
      description: 'OKLCH color string (e.g., "oklch(0.75 0.15 240)")',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"oklch(0.5 0.15 240)"' },
      },
    },
    onChange: {
      action: 'colorChanged',
      description: 'Callback when color changes',
      table: {
        type: { summary: '(color: string) => void' },
      },
    },
    variant: {
      control: 'select',
      options: ['popover', 'inline'],
      description: 'Display mode: popover (trigger button) or inline (always visible)',
      table: {
        type: { summary: '"popover" | "inline"' },
        defaultValue: { summary: '"popover"' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the color picker is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

// Default popover variant
export const Default: Story = {
  args: {
    value: 'oklch(0.5 0.15 240)',
    variant: 'popover',
  },
}

// Inline variant
export const Inline: Story = {
  args: {
    value: 'oklch(0.6 0.2 120)',
    variant: 'inline',
  },
  decorators: [
    (Story) => (
      <div className="p-8 max-w-md">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Inline variant displays the color picker directly without a popover trigger.',
      },
    },
  },
}

// Controlled color picker
export const Controlled: Story = {
  render: () => {
    const [color, setColor] = useState('oklch(0.7 0.15 180)')

    return (
      <div className="space-y-4">
        <ColorPicker value={color} onChange={setColor} variant="popover" />
        <div className="text-sm text-muted-foreground">
          Current color: <code className="font-mono">{color}</code>
        </div>
        <div
          className="w-32 h-32 rounded border"
          style={{ backgroundColor: color }}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled color picker with state management. The color value is managed externally.',
      },
    },
  },
}

// Different color formats
export const DifferentColors: Story = {
  render: () => {
    const colors = [
      { name: 'Blue', value: 'oklch(0.5 0.15 240)' },
      { name: 'Red', value: 'oklch(0.55 0.22 25)' },
      { name: 'Green', value: 'oklch(0.6 0.2 120)' },
      { name: 'Purple', value: 'oklch(0.5 0.18 300)' },
      { name: 'Orange', value: 'oklch(0.7 0.15 70)' },
      { name: 'Cyan', value: 'oklch(0.65 0.15 200)' },
    ]

    return (
      <div className="space-y-4">
        {colors.map((color) => (
          <div key={color.name} className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded border flex-shrink-0"
              style={{ backgroundColor: color.value }}
            />
            <div className="flex-1">
              <div className="font-semibold">{color.name}</div>
              <code className="text-xs text-muted-foreground">{color.value}</code>
            </div>
            <ColorPicker value={color.value} variant="popover" />
          </div>
        ))}
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Color picker with different preset colors demonstrating various OKLCH values.',
      },
    },
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    value: 'oklch(0.5 0.15 240)',
    variant: 'popover',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled color picker that cannot be interacted with.',
      },
    },
  },
}

// With alpha (if supported)
export const HighChroma: Story = {
  args: {
    value: 'oklch(0.6 0.3 120)',
    variant: 'inline',
  },
  decorators: [
    (Story) => (
      <div className="p-8 max-w-md">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Color picker with high chroma (saturation) value for vibrant colors.',
      },
    },
  },
}

// Low chroma (grayscale)
export const LowChroma: Story = {
  args: {
    value: 'oklch(0.5 0.05 240)',
    variant: 'inline',
  },
  decorators: [
    (Story) => (
      <div className="p-8 max-w-md">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Color picker with low chroma value, resulting in near-grayscale colors.',
      },
    },
  },
}
