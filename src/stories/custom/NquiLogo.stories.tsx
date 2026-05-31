import type { Meta, StoryObj } from '@storybook/react-vite'
import { NquiLogo } from '@/components'

const meta = {
  title: 'Custom/NquiLogo',
  component: NquiLogo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Theme-aware logo component that automatically adapts to light and dark modes. The logo uses SVG with CSS classes for theme switching.',
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
    className: {
      control: 'text',
      description: 'Additional CSS classes for sizing and styling',
      table: {
        type: { summary: 'string' },
      },
    },
    width: {
      control: 'text',
      description: 'SVG width attribute',
      table: {
        type: { summary: 'string | number' },
      },
    },
    height: {
      control: 'text',
      description: 'SVG height attribute',
      table: {
        type: { summary: 'string | number' },
      },
    },
  },
} satisfies Meta<typeof NquiLogo>

export default meta
type Story = StoryObj<typeof meta>

// Default logo
export const Default: Story = {
  args: {},
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <NquiLogo className="h-4 w-4" />
        <div className="text-xs text-muted-foreground mt-2">Small (h-4 w-4)</div>
      </div>
      <div className="text-center">
        <NquiLogo className="h-6 w-6" />
        <div className="text-xs text-muted-foreground mt-2">Default (h-6 w-6)</div>
      </div>
      <div className="text-center">
        <NquiLogo className="h-8 w-8" />
        <div className="text-xs text-muted-foreground mt-2">Medium (h-8 w-8)</div>
      </div>
      <div className="text-center">
        <NquiLogo className="h-12 w-12" />
        <div className="text-xs text-muted-foreground mt-2">Large (h-12 w-12)</div>
      </div>
      <div className="text-center">
        <NquiLogo className="h-16 w-16" />
        <div className="text-xs text-muted-foreground mt-2">Extra Large (h-16 w-16)</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Logo component in different sizes using Tailwind classes.',
      },
    },
  },
}

// Theme comparison
export const ThemeComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Light Mode</h3>
        <div className="bg-white p-8 rounded border">
          <NquiLogo className="h-12 w-12" />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dark Mode</h3>
        <div className="bg-[#0a0a0a] p-8 rounded border">
          <NquiLogo className="h-12 w-12" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Logo automatically adapts to theme. In light mode, it uses black fill. In dark mode, it uses white fill.',
      },
    },
  },
}

// Custom styling
export const CustomStyling: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <NquiLogo className="h-12 w-12 opacity-50" />
        <div className="text-xs text-muted-foreground mt-2">50% Opacity</div>
      </div>
      <div className="text-center">
        <NquiLogo className="h-12 w-12 rotate-45" />
        <div className="text-xs text-muted-foreground mt-2">Rotated 45°</div>
      </div>
      <div className="text-center">
        <NquiLogo className="h-12 w-12 scale-150" />
        <div className="text-xs text-muted-foreground mt-2">Scaled 150%</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Logo with custom CSS styling applied via className prop.',
      },
    },
  },
}

// In context (header/navbar)
export const InContext: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NquiLogo className="h-8 w-8" />
            <div>
              <div className="font-semibold">Nqui UI</div>
              <div className="text-xs text-muted-foreground">Component Library</div>
            </div>
          </div>
          <nav className="flex gap-4">
            <a href="#" className="text-sm hover:underline">
              Components
            </a>
            <a href="#" className="text-sm hover:underline">
              Documentation
            </a>
            <a href="#" className="text-sm hover:underline">
              Examples
            </a>
          </nav>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Logo used in a typical header/navbar context.',
      },
    },
  },
}
