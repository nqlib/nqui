import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from '@storybook/testing-library'
import { Input } from '@/components/ui/input'
import { mockFormData } from '../mockData'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A basic input component with various states and validation.',
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
      <div className="p-4 max-w-md">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    value: {
      control: 'text',
      description: 'Input value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default input value',
    },
    onChange: {
      action: 'changed',
      description: 'Change event handler',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// Default input
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
  },
}

// Email input
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email address',
    value: mockFormData.email,
  },
}

// Password input
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

// Number input
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number',
    min: '0',
    max: '100',
  },
}

// Disabled input
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this',
  },
}

// Required input
export const Required: Story = {
  args: {
    placeholder: 'Required field',
    required: true,
  },
}

// With default value
export const WithDefaultValue: Story = {
  args: {
    defaultValue: mockFormData.name,
    placeholder: 'Your name',
  },
}

// Search input
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
}

// Interactive input testing
export const Interactive: Story = {
  args: {
    placeholder: 'Type something...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    // Type text
    await userEvent.type(input, 'Hello World')

    // Verify the value
    await expect(input).toHaveValue('Hello World')
    await expect(input).toHaveFocus()
  },
}

// Form integration example
export const InForm: Story = {
  render: () => (
    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <Input
          id="name"
          placeholder="Enter your name"
          defaultValue={mockFormData.name}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={mockFormData.email}
        />
      </div>
      <div>
        <label htmlFor="age" className="block text-sm font-medium mb-1">
          Age
        </label>
        <Input
          id="age"
          type="number"
          placeholder="Enter your age"
          defaultValue={mockFormData.age.toString()}
        />
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input components used within a form context.',
      },
    },
  },
}