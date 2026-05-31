import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CoreCheckbox } from '@/components/ui/checkbox'
import { mockCheckboxOptions } from '../mockData'

const meta = {
  title: 'UI/Checkbox',
  component: CoreCheckbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A checkbox input component with indeterminate state support.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
      ],
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
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Default checked state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in indeterminate state',
    },
    onCheckedChange: {
      action: 'checkedChanged',
      description: 'Callback when checked state changes',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof CoreCheckbox>

export default meta
type Story = StoryObj<typeof meta>

// Default checkbox
export const Default: Story = {
  args: {
    defaultChecked: false,
  },
}

// Checked checkbox
export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

// Disabled checkbox
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

// Indeterminate checkbox
export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
}

// Interactive checkbox
export const Interactive: Story = {
  args: {
    defaultChecked: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')

    // Check the checkbox
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()

    // Uncheck the checkbox
    await userEvent.click(checkbox)
    await expect(checkbox).not.toBeChecked()
  },
}

// Checkbox group
export const CheckboxGroup: Story = {
  render: () => (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium mb-3">Select your interests:</legend>
      {mockCheckboxOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <CoreCheckbox id={option.value} />
          <label
            htmlFor={option.value}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple checkboxes used together as a group.',
      },
    },
  },
}

// Checkbox with label
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <CoreCheckbox id="terms" />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
}

// Required checkbox
export const Required: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <CoreCheckbox id="required" required />
      <label
        htmlFor="required"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        I agree to the terms *
      </label>
    </div>
  ),
}

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <CoreCheckbox />
        <label className="text-sm">Unchecked</label>
      </div>

      <div className="flex items-center space-x-2">
        <CoreCheckbox defaultChecked />
        <label className="text-sm">Checked</label>
      </div>

      <div className="flex items-center space-x-2">
        <CoreCheckbox indeterminate />
        <label className="text-sm">Indeterminate</label>
      </div>

      <div className="flex items-center space-x-2">
        <CoreCheckbox disabled />
        <label className="text-sm text-muted-foreground">Disabled</label>
      </div>

      <div className="flex items-center space-x-2">
        <CoreCheckbox defaultChecked disabled />
        <label className="text-sm text-muted-foreground">Disabled Checked</label>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible checkbox states and variations.',
      },
    },
  },
}