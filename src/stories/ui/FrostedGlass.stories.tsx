import type { Meta, StoryObj } from '@storybook/react-vite'
import { FrostedGlass } from '@/components/ui/frosted-glass'

const meta = {
  title: 'UI/FrostedGlass',
  component: FrostedGlass,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A frosted glass effect component using backdrop-filter for creating Apple-inspired blur effects.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    blur: {
      control: { type: 'number', min: 0, max: 50, step: 1 },
      description: 'Blur radius in pixels',
    },
    borderRadius: {
      control: { type: 'number', min: 0, max: 50, step: 1 },
      description: 'Border radius in pixels',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof FrostedGlass>

export default meta
type Story = StoryObj<typeof meta>

// Default frosted glass
export const Default: Story = {
  args: {
    blur: 16,
    borderRadius: 0,
  },
  render: (args) => (
    <div className="relative w-64 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
        Background Content
      </div>
      <FrostedGlass {...args} />
      <div className="absolute inset-0 flex items-center justify-center text-black font-semibold z-[var(--z-content)]">
        Frosted Glass Overlay
      </div>
    </div>
  ),
}

// Different blur levels
export const BlurLevels: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="relative w-64 h-16 bg-gradient-to-r from-pink-400 to-red-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
          Blur: 8px
        </div>
        <FrostedGlass blur={8} />
        <div className="absolute inset-0 flex items-center justify-center text-black font-semibold text-sm z-[var(--z-content)]">
          Overlay
        </div>
      </div>

      <div className="relative w-64 h-16 bg-gradient-to-r from-green-400 to-blue-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
          Blur: 16px
        </div>
        <FrostedGlass blur={16} />
        <div className="absolute inset-0 flex items-center justify-center text-black font-semibold text-sm z-[var(--z-content)]">
          Overlay
        </div>
      </div>

      <div className="relative w-64 h-16 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
          Blur: 24px
        </div>
        <FrostedGlass blur={24} />
        <div className="absolute inset-0 flex items-center justify-center text-black font-semibold text-sm z-[var(--z-content)]">
          Overlay
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Frosted glass effects with different blur levels.',
      },
    },
  },
}

// Rounded corners
export const RoundedCorners: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="relative w-64 h-20 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
          Border Radius: 8px
        </div>
        <FrostedGlass blur={16} borderRadius={8} />
        <div className="absolute inset-0 flex items-center justify-center text-black font-semibold text-sm z-[var(--z-content)]">
          Rounded Overlay
        </div>
      </div>

      <div className="relative w-64 h-20 bg-gradient-to-r from-orange-400 to-red-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
          Border Radius: 16px
        </div>
        <FrostedGlass blur={16} borderRadius={16} />
        <div className="absolute inset-0 flex items-center justify-center text-black font-semibold text-sm z-[var(--z-content)]">
          More Rounded
        </div>
      </div>

      <div className="relative w-64 h-20 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
          Border Radius: 50px
        </div>
        <FrostedGlass blur={16} borderRadius={50} />
        <div className="absolute inset-0 flex items-center justify-center text-black font-semibold text-sm z-[var(--z-content)]">
          Fully Rounded
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Frosted glass effects with different border radius values.',
      },
    },
  },
}

// Complex overlay example
export const ComplexOverlay: Story = {
  render: () => (
    <div className="relative w-80 h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl overflow-hidden">
      <div className="absolute inset-0 p-4">
        <div className="text-white space-y-2">
          <h3 className="font-bold text-lg">Complex Background</h3>
          <p className="text-sm opacity-90">This demonstrates the frosted glass effect over complex backgrounds with multiple elements.</p>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded"></div>
            <div className="w-8 h-8 bg-white/20 rounded"></div>
            <div className="w-8 h-8 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
      <FrostedGlass blur={20} borderRadius={12} className="mx-4 my-6" />
      <div className="absolute inset-4 top-6 flex items-center justify-center text-black font-semibold z-[var(--z-content)]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
          <h4 className="font-bold mb-2">Frosted Glass Panel</h4>
          <p className="text-sm text-gray-700">Content appears over the blurred background effect.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A complex example showing frosted glass overlay on a detailed background.',
      },
    },
  },
}