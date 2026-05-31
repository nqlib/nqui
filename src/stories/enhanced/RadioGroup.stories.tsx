import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from '@storybook/testing-library'
import { RadioGroup, RadioGroupItem, CoreRadioGroup, CoreRadioGroupItem } from '@/components'
import { mockRadioOptions } from '../mockData'

const meta = {
  title: 'Enhanced/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced radio group component with animated variants and smooth transitions.',
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
      options: ['animated', 'sliding', 'bar-left', 'bar-right'],
      description: 'Radio group variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'animated' },
      },
    },
    value: {
      control: 'text',
      description: 'Selected value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default selected value',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether all radio items are disabled',
    },
    onValueChange: {
      action: 'value changed',
      description: 'Value change handler',
    },
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

// Default radio group
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1')
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <RadioGroupItem value="option1">Option 1</RadioGroupItem>
        <RadioGroupItem value="option2">Option 2</RadioGroupItem>
        <RadioGroupItem value="option3">Option 3</RadioGroupItem>
      </RadioGroup>
    )
  },
}

// Animated variant
export const Animated: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1')
    return (
      <RadioGroup variant="animated" value={value} onValueChange={setValue}>
        {mockRadioOptions.map((option) => (
          <RadioGroupItem key={option.value} value={option.value}>
            {option.label}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Animated variant with circular radio buttons and pulse animation on selection.',
      },
    },
  },
}

// Sliding variant
export const Sliding: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1')
    return (
      <RadioGroup variant="sliding" value={value} onValueChange={setValue}>
        {mockRadioOptions.map((option) => (
          <RadioGroupItem key={option.value} value={option.value}>
            {option.label}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Sliding variant with animated background indicator that moves to the selected item.',
      },
    },
  },
}

// Bar variants
export const BarVariants: Story = {
  render: () => {
    const [valueLeft, setValueLeft] = React.useState('option1')
    const [valueRight, setValueRight] = React.useState('option1')
    return (
      <div className="flex gap-8">
        <div>
          <p className="text-sm font-medium mb-2">Bar Left</p>
          <RadioGroup variant="bar-left" value={valueLeft} onValueChange={setValueLeft}>
            {mockRadioOptions.map((option) => (
              <RadioGroupItem key={option.value} value={option.value}>
                {option.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Bar Right</p>
          <RadioGroup variant="bar-right" value={valueRight} onValueChange={setValueRight}>
            {mockRadioOptions.map((option) => (
              <RadioGroupItem key={option.value} value={option.value}>
                {option.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Bar variants with vertical bar and animated glider indicator.',
      },
    },
  },
}

// Horizontal layout
export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1')
    return (
      <RadioGroup variant="animated" value={value} onValueChange={setValue} className="flex gap-4">
        {mockRadioOptions.map((option) => (
          <RadioGroupItem key={option.value} value={option.value}>
            {option.label}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Radio group in horizontal layout.',
      },
    },
  },
}

// With labels
export const WithLabels: Story = {
  render: () => {
    const [value, setValue] = React.useState('email')
    return (
      <RadioGroup variant="animated" value={value} onValueChange={setValue}>
        <RadioGroupItem value="email">
          <div>
            <div className="font-medium">Email</div>
            <div className="text-sm text-muted-foreground">Receive notifications via email</div>
          </div>
        </RadioGroupItem>
        <RadioGroupItem value="sms">
          <div>
            <div className="font-medium">SMS</div>
            <div className="text-sm text-muted-foreground">Receive notifications via SMS</div>
          </div>
        </RadioGroupItem>
        <RadioGroupItem value="push">
          <div>
            <div className="font-medium">Push</div>
            <div className="text-sm text-muted-foreground">Receive push notifications</div>
          </div>
        </RadioGroupItem>
      </RadioGroup>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Radio group items with descriptive labels.',
      },
    },
  },
}

// Disabled state
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1')
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">All Disabled</p>
          <RadioGroup variant="animated" value={value} onValueChange={setValue} disabled>
            {mockRadioOptions.map((option) => (
              <RadioGroupItem key={option.value} value={option.value}>
                {option.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Individual Disabled</p>
          <RadioGroup variant="animated" value={value} onValueChange={setValue}>
            <RadioGroupItem value="option1">Option 1</RadioGroupItem>
            <RadioGroupItem value="option2" disabled>Option 2 (Disabled)</RadioGroupItem>
            <RadioGroupItem value="option3">Option 3</RadioGroupItem>
          </RadioGroup>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Radio groups with disabled states.',
      },
    },
  },
}

// Default selection
export const DefaultSelection: Story = {
  render: () => (
    <RadioGroup defaultValue="option2" variant="animated">
      {mockRadioOptions.map((option) => (
        <RadioGroupItem key={option.value} value={option.value}>
          {option.label}
        </RadioGroupItem>
      ))}
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Radio group with default selected value.',
      },
    },
  },
}

// Interactive
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1')
    return (
      <RadioGroup variant="animated" value={value} onValueChange={setValue}>
        <RadioGroupItem value="option1">Click me</RadioGroupItem>
        <RadioGroupItem value="option2">Or me</RadioGroupItem>
        <RadioGroupItem value="option3">Or this one</RadioGroupItem>
      </RadioGroup>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const option2 = canvas.getByText('Or me')
    await userEvent.click(option2)
  },
}

// Comparison with Core RadioGroup
export const Comparison: Story = {
  render: () => {
    const [enhancedValue, setEnhancedValue] = React.useState('option1')
    const [coreValue, setCoreValue] = React.useState('option1')
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Enhanced RadioGroup (Animated)</h3>
          <RadioGroup variant="animated" value={enhancedValue} onValueChange={setEnhancedValue}>
            {mockRadioOptions.map((option) => (
              <RadioGroupItem key={option.value} value={option.value}>
                {option.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Core RadioGroup</h3>
          <CoreRadioGroup value={coreValue} onValueChange={setCoreValue}>
            {mockRadioOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <CoreRadioGroupItem value={option.value} id={option.value} />
                <label htmlFor={option.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option.label}
                </label>
              </div>
            ))}
          </CoreRadioGroup>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Comparison between enhanced radio group and core radio group.',
      },
    },
  },
}
