import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextAlignLeft01Icon,
  TextAlignCenterIcon,
  TextAlignRight01Icon,
} from '@hugeicons/core-free-icons'

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toggle group. type="single" → segmented (primary fill). type="multiple" → outline. Separators between items by default.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

// Default toggle group
export const Default: Story = {
  render: () => (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <HugeiconsIcon icon={TextBoldIcon} size={16} className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <HugeiconsIcon icon={TextItalicIcon} size={16} className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <HugeiconsIcon icon={TextUnderlineIcon} size={16} className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

// Single selection
export const Single: Story = {
  render: () => (
    <ToggleGroup type="single">
      <ToggleGroupItem value="left" aria-label="Left align">Left</ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center align">Center</ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right align">Right</ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toggle group with single selection mode.',
      },
    },
  },
}

// With spacing
export const WithSpacing: Story = {
  render: () => (
    <ToggleGroup type="multiple" spacing={2}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <HugeiconsIcon icon={TextBoldIcon} size={16} className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <HugeiconsIcon icon={TextItalicIcon} size={16} className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <HugeiconsIcon icon={TextUnderlineIcon} size={16} className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toggle group with spacing between items.',
      },
    },
  },
}

// Segmented (single = primary fill on selected, default)
export const Segmented: Story = {
  render: function SegmentedStory() {
    const [value, setValue] = React.useState('linear')
    return (
      <ToggleGroup type="single" value={value} onValueChange={setValue}>
        <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
        <ToggleGroupItem value="log">Log</ToggleGroupItem>
      </ToggleGroup>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'type="single" defaults to segmented (primary fill on selected).',
      },
    },
  },
}

export const SegmentedThreeOptions: Story = {
  render: function SegmentedThreeOptionsStory() {
    const [value, setValue] = React.useState('medium')
    return (
      <ToggleGroup type="single" value={value} onValueChange={setValue}>
        <ToggleGroupItem value="small">Small</ToggleGroupItem>
        <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
        <ToggleGroupItem value="large">Large</ToggleGroupItem>
      </ToggleGroup>
    )
  },
}

export const SegmentedWithIcons: Story = {
  render: function SegmentedWithIconsStory() {
    const [value, setValue] = React.useState('left')
    return (
      <ToggleGroup type="single" value={value} onValueChange={setValue}>
        <ToggleGroupItem value="left" aria-label="Align left">
          <HugeiconsIcon icon={TextAlignLeft01Icon} className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <HugeiconsIcon icon={TextAlignCenterIcon} className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <HugeiconsIcon icon={TextAlignRight01Icon} className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    )
  },
}

export const SegmentedSizes: Story = {
  render: function SegmentedSizesStory() {
    const [value, setValue] = React.useState('linear')
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Default size</p>
          <ToggleGroup type="single" value={value} onValueChange={setValue}>
            <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
            <ToggleGroupItem value="log">Log</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Small size</p>
          <ToggleGroup type="single" size="sm" value={value} onValueChange={setValue}>
            <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
            <ToggleGroupItem value="log">Log</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    )
  },
}

export const SegmentedVertical: Story = {
  render: function SegmentedVerticalStory() {
    const [value, setValue] = React.useState('option1')
    return (
      <ToggleGroup type="single" orientation="vertical" value={value} onValueChange={setValue}>
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
      </ToggleGroup>
    )
  },
}
