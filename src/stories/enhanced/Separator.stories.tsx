import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from '@/components'

const meta = {
  title: 'Enhanced/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced separator component with multiple visual variants and orientations.',
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
      <div className="p-4 w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'solid',
        'shadow-outset',
        'shadow-inset',
        'dotted',
        'dashed',
        'glow',
        'thick',
        'gradient',
        'double',
        'fade-strong',
        'arrow-down',
        'tab-down',
        'stopper',
        'dot',
        'text-decoration',
        'shiny-corner',
        'shiny-edge',
      ],
      description: 'Separator visual variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Separator orientation',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'horizontal' },
      },
    },
    decorative: {
      control: 'boolean',
      description: 'Whether the separator is decorative',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    textContent: {
      control: 'text',
      description: 'Text content for text-decoration variant',
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

// Default separator
export const Default: Story = {
  args: {
    variant: 'default',
    orientation: 'horizontal',
  },
}

// Horizontal separators
export const Horizontal: Story = {
  render: () => (
    <div className="space-y-6 w-full">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Default</p>
        <Separator variant="default" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Solid</p>
        <Separator variant="solid" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Shadow Outset</p>
        <Separator variant="shadow-outset" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Shadow Inset</p>
        <Separator variant="shadow-inset" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Dotted</p>
        <Separator variant="dotted" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Dashed</p>
        <Separator variant="dashed" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Thick</p>
        <Separator variant="thick" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Gradient</p>
        <Separator variant="gradient" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Double</p>
        <Separator variant="double" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Glow</p>
        <Separator variant="glow" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Horizontal separator variants.',
      },
    },
  },
}

// Vertical separators
export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-6 h-32">
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">Default</p>
        <Separator variant="default" orientation="vertical" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">Solid</p>
        <Separator variant="solid" orientation="vertical" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">Shadow</p>
        <Separator variant="shadow-outset" orientation="vertical" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">Dotted</p>
        <Separator variant="dotted" orientation="vertical" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">Thick</p>
        <Separator variant="thick" orientation="vertical" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">Gradient</p>
        <Separator variant="gradient" orientation="vertical" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical separator variants.',
      },
    },
  },
}

// Decorative variants
export const Decorative: Story = {
  render: () => (
    <div className="space-y-8 w-full">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Arrow Down</p>
        <Separator variant="arrow-down" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Tab Down</p>
        <Separator variant="tab-down" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Stopper</p>
        <Separator variant="stopper" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Dot</p>
        <Separator variant="dot" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Text Decoration</p>
        <Separator variant="text-decoration" textContent="OR" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Shiny Corner</p>
        <Separator variant="shiny-corner" />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Shiny Edge</p>
        <Separator variant="shiny-edge" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Decorative separator variants with special styling.',
      },
    },
  },
}

// In context examples
export const InContext: Story = {
  render: () => (
    <div className="space-y-6 w-full">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Section Title</h3>
        <p className="text-sm text-muted-foreground">Some content here</p>
        <Separator variant="default" />
        <p className="text-sm text-muted-foreground">More content below</p>
      </div>

      <div className="flex items-center gap-4">
        <span>Item 1</span>
        <Separator orientation="vertical" variant="solid" />
        <span>Item 2</span>
        <Separator orientation="vertical" variant="solid" />
        <span>Item 3</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">Username</span>
          <Separator variant="text-decoration" textContent="•" />
          <span className="text-sm text-muted-foreground">2 hours ago</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Separators used in different contexts and layouts.',
      },
    },
  },
}
