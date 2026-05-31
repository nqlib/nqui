import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

const meta = {
  title: 'UI/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A keyboard key indicator component for displaying keyboard shortcuts.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

// Default kbd
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to open command palette
    </div>
  ),
}

// Keyboard shortcuts
export const Shortcuts: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
        <span className="text-sm text-muted-foreground">Command palette</span>
      </div>
      <div className="flex items-center gap-2">
        <Kbd>⌘</Kbd> + <Kbd>B</Kbd>
        <span className="text-sm text-muted-foreground">Toggle sidebar</span>
      </div>
      <div className="flex items-center gap-2">
        <Kbd>⌘</Kbd> + <Kbd>J</Kbd>
        <span className="text-sm text-muted-foreground">Toggle theme</span>
      </div>
      <div className="flex items-center gap-2">
        <Kbd>Esc</Kbd>
        <span className="text-sm text-muted-foreground">Close dialog</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Kbd components used to display keyboard shortcuts.',
      },
    },
  },
}

// With group
export const WithGroup: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      Press
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>Shift</Kbd>
        <span>+</span>
        <Kbd>P</Kbd>
      </KbdGroup>
      to open
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Kbd components grouped together with KbdGroup.',
      },
    },
  },
}

// Different keys
export const DifferentKeys: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Kbd>Enter</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Backspace</Kbd>
      <Kbd>Delete</Kbd>
      <Kbd>Arrow Up</Kbd>
      <Kbd>Arrow Down</Kbd>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Kbd components displaying different keyboard keys.',
      },
    },
  },
}
