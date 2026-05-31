import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from '@storybook/testing-library'
import { Switch } from '@/components'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle switch component for boolean on/off states.',
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
      description: 'Whether the switch is checked',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Default checked state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the switch is required',
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
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

// Default switch
export const Default: Story = {
  args: {
    defaultChecked: false,
  },
}

// Checked switch
export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

// Disabled switch
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

// Interactive switch
export const Interactive: Story = {
  args: {
    defaultChecked: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchElement = canvas.getByRole('switch')

    // Initially unchecked
    await expect(switchElement).not.toBeChecked()

    // Toggle on
    await userEvent.click(switchElement)
    await expect(switchElement).toBeChecked()

    // Toggle off
    await userEvent.click(switchElement)
    await expect(switchElement).not.toBeChecked()
  },
}

// Switch with label
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <label
        htmlFor="airplane-mode"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Airplane Mode
      </label>
    </div>
  ),
}

// Switch group with descriptions
export const SettingsGroup: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Notifications</label>
          <p className="text-sm text-muted-foreground">
            Receive notifications about account activity
          </p>
        </div>
        <Switch />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Dark Mode</label>
          <p className="text-sm text-muted-foreground">
            Toggle between light and dark themes
          </p>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Auto-save</label>
          <p className="text-sm text-muted-foreground">
            Automatically save changes as you type
          </p>
        </div>
        <Switch />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Analytics</label>
          <p className="text-sm text-muted-foreground">
            Help improve the product by sharing usage data
          </p>
        </div>
        <Switch disabled />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Switches used in a settings or preferences interface.',
      },
    },
  },
}

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch />
        <label className="text-sm">Unchecked</label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch defaultChecked />
        <label className="text-sm">Checked</label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch disabled />
        <label className="text-sm text-muted-foreground">Disabled</label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch defaultChecked disabled />
        <label className="text-sm text-muted-foreground">Disabled Checked</label>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible switch states and variations.',
      },
    },
  },
}

// Required switch
export const Required: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="required-switch" required />
      <label
        htmlFor="required-switch"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions *
      </label>
    </div>
  ),
}

// Toggle functionality demo
export const ToggleDemo: Story = {
  render: () => {
    const [isOn, setIsOn] = React.useState(false)

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isOn}
            onCheckedChange={setIsOn}
            id="demo-toggle"
          />
          <label htmlFor="demo-toggle" className="text-sm font-medium">
            Toggle Feature
          </label>
        </div>

        <div className={`p-4 rounded-md border ${
          isOn ? 'bg-success/10 border-success/20 dark:bg-success/5' : 'bg-muted border-border'
        }`}>
          <p className={`text-sm ${
            isOn ? 'text-success' : 'text-muted-foreground'
          }`}>
            Feature is {isOn ? 'enabled' : 'disabled'}
          </p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing switch state changes affecting UI.',
      },
    },
  },
}