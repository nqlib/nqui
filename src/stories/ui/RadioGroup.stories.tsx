import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from '@storybook/testing-library'
import { CoreRadioGroup, CoreRadioGroupItem } from '@/components'
import { mockRadioOptions } from '../mockData'

const meta = {
  title: 'UI/RadioGroup',
  component: CoreRadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A radio group component for single selection from multiple options.',
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
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default selected value',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the entire radio group is disabled',
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Callback when value changes',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof CoreRadioGroup>

export default meta
type Story = StoryObj<typeof meta>

// Default radio group
export const Default: Story = {
  render: () => (
    <CoreRadioGroup defaultValue="option1">
      {mockRadioOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <CoreRadioGroupItem value={option.value} id={option.value} />
          <label
            htmlFor={option.value}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </CoreRadioGroup>
  ),
}

// With pre-selected value
export const PreSelected: Story = {
  render: () => (
    <CoreRadioGroup defaultValue="option2">
      {mockRadioOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <CoreRadioGroupItem value={option.value} id={`pre-${option.value}`} />
          <label
            htmlFor={`pre-${option.value}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </CoreRadioGroup>
  ),
}

// Disabled radio group
export const Disabled: Story = {
  render: () => (
    <CoreRadioGroup disabled>
      {mockRadioOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <CoreRadioGroupItem value={option.value} id={`disabled-${option.value}`} />
          <label
            htmlFor={`disabled-${option.value}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </CoreRadioGroup>
  ),
}

// Interactive radio group
export const Interactive: Story = {
  render: () => (
    <CoreRadioGroup defaultValue="option1">
      {mockRadioOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <CoreRadioGroupItem value={option.value} id={`interactive-${option.value}`} />
          <label
            htmlFor={`interactive-${option.value}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </CoreRadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const radioButtons = canvas.getAllByRole('radio')

    // Initially first option should be checked
    await expect(radioButtons[0]).toBeChecked()

    // Click second option
    await userEvent.click(radioButtons[1])
    await expect(radioButtons[1]).toBeChecked()
    await expect(radioButtons[0]).not.toBeChecked()
  },
}

// Form integration
export const InForm: Story = {
  render: () => (
    <form className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Select your preferred contact method:</legend>
        <CoreRadioGroup defaultValue="email">
          <div className="flex items-center space-x-2">
            <CoreRadioGroupItem value="email" id="contact-email" />
            <label htmlFor="contact-email" className="text-sm">Email</label>
          </div>
          <div className="flex items-center space-x-2">
            <CoreRadioGroupItem value="phone" id="contact-phone" />
            <label htmlFor="contact-phone" className="text-sm">Phone</label>
          </div>
          <div className="flex items-center space-x-2">
            <CoreRadioGroupItem value="mail" id="contact-mail" />
            <label htmlFor="contact-mail" className="text-sm">Mail</label>
          </div>
        </CoreRadioGroup>
      </fieldset>
    </form>
  ),
}

// Horizontal layout
export const Horizontal: Story = {
  render: () => (
    <CoreRadioGroup defaultValue="option1" className="flex space-x-6">
      {mockRadioOptions.slice(0, 3).map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <CoreRadioGroupItem value={option.value} id={`horizontal-${option.value}`} />
          <label
            htmlFor={`horizontal-${option.value}`}
            className="text-sm font-medium leading-none"
          >
            {option.label}
          </label>
        </div>
      ))}
    </CoreRadioGroup>
  ),
}

// With descriptions
export const WithDescriptions: Story = {
  render: () => (
    <CoreRadioGroup defaultValue="standard">
      <div className="flex items-start space-x-3">
        <CoreRadioGroupItem value="standard" id="plan-standard" className="mt-1" />
        <div>
          <label htmlFor="plan-standard" className="text-sm font-medium">
            Standard Plan
          </label>
          <p className="text-sm text-muted-foreground">
            Perfect for small teams and startups
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <CoreRadioGroupItem value="premium" id="plan-premium" className="mt-1" />
        <div>
          <label htmlFor="plan-premium" className="text-sm font-medium">
            Premium Plan
          </label>
          <p className="text-sm text-muted-foreground">
            Advanced features for growing businesses
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <CoreRadioGroupItem value="enterprise" id="plan-enterprise" className="mt-1" />
        <div>
          <label htmlFor="plan-enterprise" className="text-sm font-medium">
            Enterprise Plan
          </label>
          <p className="text-sm text-muted-foreground">
            Full-featured solution for large organizations
          </p>
        </div>
      </div>
    </CoreRadioGroup>
  ),
}