import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from '@storybook/testing-library'
import { Checkbox, CoreCheckbox } from '@/components'
import { mockCheckboxOptions } from '../mockData'

const meta = {
  title: 'Enhanced/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced checkbox component with animated variants (square and round) and smooth transitions.',
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
      options: ['square', 'round'],
      description: 'Checkbox variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'square' },
      },
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    onCheckedChange: {
      action: 'checked',
      description: 'Checked state change handler',
    },
    children: {
      control: 'text',
      description: 'Checkbox label text',
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

// Default checkbox
export const Default: Story = {
  args: {
    variant: 'square',
    children: 'Accept terms and conditions',
  },
}

// Square variant
export const Square: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox variant="square">Unchecked</Checkbox>
      <Checkbox variant="square" checked>Checked</Checkbox>
      <Checkbox variant="square" disabled>Disabled</Checkbox>
      <Checkbox variant="square" checked disabled>Checked Disabled</Checkbox>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Square checkbox variant with animated checkmark and pulse effect.',
      },
    },
  },
}

// Round variant
export const Round: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox variant="round" />
      <Checkbox variant="round" checked />
      <Checkbox variant="round" disabled />
      <Checkbox variant="round" checked disabled />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Round checkbox variant with gooey splash animation.',
      },
    },
  },
}

// With labels
export const WithLabels: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox variant="square">Remember me</Checkbox>
      <Checkbox variant="square">Subscribe to newsletter</Checkbox>
      <Checkbox variant="square">Enable notifications</Checkbox>
      <Checkbox variant="square">Share analytics data</Checkbox>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkboxes with various label text.',
      },
    },
  },
}

// Checkbox group
export const CheckboxGroup: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string[]>([])

    return (
      <div className="space-y-3">
        {mockCheckboxOptions.map((option) => (
          <Checkbox
            key={option.value}
            variant="square"
            checked={selected.includes(option.value)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelected([...selected, option.value])
              } else {
                setSelected(selected.filter((v) => v !== option.value))
              }
            }}
          >
            {option.label}
          </Checkbox>
        ))}
        <p className="text-sm text-muted-foreground mt-4">
          Selected: {selected.length} items
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple checkboxes in a group with state management.',
      },
    },
  },
}

// Interactive
export const Interactive: Story = {
  args: {
    variant: 'square',
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')
    await userEvent.click(checkbox)
  },
}

// Comparison with Core Checkbox
export const Comparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Enhanced Checkbox (Square)</h3>
        <div className="space-y-3">
          <Checkbox variant="square">Enhanced Square</Checkbox>
          <Checkbox variant="square" checked>Enhanced Square Checked</Checkbox>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Enhanced Checkbox (Round)</h3>
        <div className="flex items-center gap-4">
          <Checkbox variant="round" />
          <Checkbox variant="round" checked />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Core Checkbox</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CoreCheckbox id="core-1" />
            <label htmlFor="core-1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Core Checkbox
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <CoreCheckbox id="core-2" checked />
            <label htmlFor="core-2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Core Checkbox Checked
            </label>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison between enhanced checkbox variants and core checkbox.',
      },
    },
  },
}

// States
export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Square Variant</p>
        <div className="space-y-2">
          <Checkbox variant="square">Unchecked</Checkbox>
          <Checkbox variant="square" checked>Checked</Checkbox>
          <Checkbox variant="square" disabled>Disabled</Checkbox>
          <Checkbox variant="square" checked disabled>Checked Disabled</Checkbox>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Round Variant</p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <Checkbox variant="round" />
            <span className="text-xs text-muted-foreground">Unchecked</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Checkbox variant="round" checked />
            <span className="text-xs text-muted-foreground">Checked</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Checkbox variant="round" disabled />
            <span className="text-xs text-muted-foreground">Disabled</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Checkbox variant="round" checked disabled />
            <span className="text-xs text-muted-foreground">Checked Disabled</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All checkbox states for both variants.',
      },
    },
  },
}
