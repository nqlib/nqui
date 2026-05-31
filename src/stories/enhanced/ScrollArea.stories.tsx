import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScrollArea, ScrollBar } from '@/components'

const meta = {
  title: 'Enhanced/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced scroll area component with fade mask effect and custom scrollbar styling.',
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
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
      description: 'Scroll orientation',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'vertical' },
      },
    },
    fadeMask: {
      control: 'boolean',
      description: 'Enable fade mask effect at edges',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

// Default scroll area
export const Default: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="space-y-2">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar />
    </ScrollArea>
  ),
}

// Vertical scrolling
export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-[300px] w-[350px] rounded-md border p-4">
      <div className="space-y-4">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="p-4 bg-muted rounded-md">
            <h4 className="font-semibold mb-2">Section {i + 1}</h4>
            <p className="text-sm text-muted-foreground">
              This is some content for section {i + 1}. Scroll down to see more sections.
            </p>
          </div>
        ))}
      </div>
      <ScrollBar />
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical scrolling with long content and fade mask effect.',
      },
    },
  },
}

// Horizontal scrolling
export const Horizontal: Story = {
  render: () => (
    <ScrollArea orientation="horizontal" className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="flex gap-4" style={{ width: '800px' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex-shrink-0 w-[150px] p-4 bg-muted rounded-md">
            <h4 className="font-semibold mb-2">Card {i + 1}</h4>
            <p className="text-sm text-muted-foreground">Scroll horizontally to see more cards.</p>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Horizontal scrolling with fade mask effect.',
      },
    },
  },
}

// Both orientations
export const BothOrientations: Story = {
  render: () => (
    <ScrollArea orientation="both" className="h-[300px] w-[350px] rounded-md border p-4">
      <div style={{ width: '600px', height: '500px' }}>
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="p-3 bg-muted rounded-md text-sm">
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Scroll area with both vertical and horizontal scrolling enabled.',
      },
    },
  },
}

// Without fade mask
export const WithoutFadeMask: Story = {
  render: () => (
    <ScrollArea fadeMask={false} className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="space-y-2">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="text-sm">
            Item {i + 1} (No fade mask)
          </div>
        ))}
      </div>
      <ScrollBar />
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Scroll area without fade mask effect.',
      },
    },
  },
}

// Long content
export const LongContent: Story = {
  render: () => (
    <ScrollArea className="h-[400px] w-[400px] rounded-md border p-4">
      <div className="space-y-6">
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-lg font-semibold">Chapter {i + 1}</h3>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        ))}
      </div>
      <ScrollBar />
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Scroll area with very long content to demonstrate scrolling behavior.',
      },
    },
  },
}

// Custom styling
export const CustomStyling: Story = {
  render: () => (
    <ScrollArea className="h-[250px] w-[350px] rounded-lg border-2 border-primary bg-muted/50 p-6">
      <div className="space-y-3">
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="p-3 bg-background rounded-md border">
            <div className="font-medium">Custom Styled Item {i + 1}</div>
            <div className="text-sm text-muted-foreground">With custom background and border</div>
          </div>
        ))}
      </div>
      <ScrollBar />
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Scroll area with custom styling and background.',
      },
    },
  },
}

// Interactive example
export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
        <div className="space-y-2">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-2 hover:bg-muted rounded cursor-pointer transition-colors">
              Interactive Item {i + 1} - Click or hover
            </div>
          ))}
        </div>
        <ScrollBar />
      </ScrollArea>
      <p className="text-sm text-muted-foreground">
        Scroll to see more items. The fade mask effect is visible at the top and bottom edges.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive scroll area with hover effects.',
      },
    },
  },
}
