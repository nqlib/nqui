import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { waitFor } from '@testing-library/react'
import { expect, userEvent, within } from 'storybook/test'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
} from '@/components'
import { mockSelectOptions } from '../mockData'

const meta = {
  title: 'Enhanced/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced combobox component with search/filter functionality and button-like 3D effects.',
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
    value: {
      control: 'text',
      description: 'Selected value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default selected value',
    },
    onValueChange: {
      action: 'value changed',
      description: 'Value change handler',
    },
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

// Default combobox
export const Default: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Search countries..." />
      <ComboboxContent>
        <ComboboxList>
          {mockSelectOptions.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByPlaceholderText('Search countries...'))
    const body = within(document.body)
    const canada = await body.findByRole('option', { name: 'Canada' })
    await userEvent.click(canada)
    await waitFor(() => {
      expect(canvas.getByPlaceholderText('Search countries...')).toHaveValue('Canada')
    })
  },
}

// With placeholder
export const WithPlaceholder: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Type to search..." />
      <ComboboxContent>
        <ComboboxList>
          {mockSelectOptions.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Combobox with custom placeholder text.',
      },
    },
  },
}

// With default value
export const WithDefaultValue: Story = {
  render: () => (
    <Combobox defaultValue="us">
      <ComboboxInput />
      <ComboboxContent>
        <ComboboxList>
          {mockSelectOptions.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Combobox with a default selected value.',
      },
    },
  },
}

// Disabled state
export const Disabled: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Disabled combobox" disabled />
      <ComboboxContent>
        <ComboboxList>
          {mockSelectOptions.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled combobox component.',
      },
    },
  },
}

// With custom options
export const CustomOptions: Story = {
  render: () => {
    const frameworks = [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'next', label: 'Next.js' },
      { value: 'nuxt', label: 'Nuxt' },
    ]
    return (
      <Combobox>
        <ComboboxInput placeholder="Search frameworks..." />
        <ComboboxContent>
          <ComboboxList>
            {frameworks.map((option) => (
              <ComboboxItem key={option.value} value={option.value}>
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Combobox with custom option list.',
      },
    },
  },
}

// Search/filter example
export const SearchFilter: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Search countries..." />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results found</ComboboxEmpty>
          {mockSelectOptions.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Combobox with search/filter functionality. Type to filter options.',
      },
    },
  },
}

// With groups
export const WithGroups: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Select a region" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>North America</ComboboxLabel>
            <ComboboxItem value="us">United States</ComboboxItem>
            <ComboboxItem value="ca">Canada</ComboboxItem>
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxLabel>Europe</ComboboxLabel>
            <ComboboxItem value="uk">United Kingdom</ComboboxItem>
            <ComboboxItem value="de">Germany</ComboboxItem>
            <ComboboxItem value="fr">France</ComboboxItem>
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxLabel>Asia Pacific</ComboboxLabel>
            <ComboboxItem value="au">Australia</ComboboxItem>
            <ComboboxItem value="jp">Japan</ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Combobox with grouped options and separators.',
      },
    },
  },
}

// Controlled combobox
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>('')
    return (
      <div className="space-y-4">
        <Combobox value={value} onValueChange={setValue}>
          <ComboboxInput placeholder="Select an option" />
          <ComboboxContent>
            <ComboboxList>
              {mockSelectOptions.map((option) => (
                <ComboboxItem key={option.value} value={option.value}>
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p className="text-sm text-muted-foreground">
          Selected: {value || 'None'}
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled combobox with state management.',
      },
    },
  },
}

// Interactive
export const Interactive: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Click to search" />
      <ComboboxContent>
        <ComboboxList>
          {mockSelectOptions.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByPlaceholderText('Click to search')
    await userEvent.click(trigger)
    const body = within(document.body)
    const searchInput = body.getByPlaceholderText('Search...')
    await userEvent.type(searchInput, 'united')
    const uk = await body.findByRole('option', { name: 'United Kingdom' })
    await userEvent.click(uk)
    await waitFor(() => {
      expect(trigger).toHaveValue('United Kingdom')
    })
  },
}

// With clear button
export const WithClear: Story = {
  render: () => (
    <Combobox defaultValue="us">
      <ComboboxInput placeholder="Search..." showClear />
      <ComboboxContent>
        <ComboboxList>
          {mockSelectOptions.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Combobox with clear button to reset selection.',
      },
    },
  },
}
