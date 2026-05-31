import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'
import { ColorSlider } from '@/components'

const meta = {
  title: 'Custom/ColorSlider',
  component: ColorSlider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A specialized color slider component for adjusting hue, saturation, lightness, or custom color values. Used internally by ColorPicker.',
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
    value: {
      control: false,
      description: 'Array of slider values',
      table: {
        type: { summary: 'number[]' },
      },
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Callback when slider value changes',
      table: {
        type: { summary: '(value: number[]) => void' },
      },
    },
    min: {
      control: 'number',
      description: 'Minimum value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    max: {
      control: 'number',
      description: 'Maximum value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '100' },
      },
    },
    step: {
      control: 'number',
      description: 'Step value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    sliderType: {
      control: 'select',
      options: ['hue', 'saturation', 'lightness', 'custom'],
      description: 'Type of slider for automatic gradient generation',
      table: {
        type: { summary: '"hue" | "saturation" | "lightness" | "custom"' },
        defaultValue: { summary: '"custom"' },
      },
    },
    currentHue: {
      control: 'number',
      description: 'Current hue value (used for saturation/lightness sliders)',
      table: {
        type: { summary: 'number' },
      },
    },
    currentChroma: {
      control: 'number',
      description: 'Current chroma value',
      table: {
        type: { summary: 'number' },
      },
    },
  },
} satisfies Meta<typeof ColorSlider>

export default meta
type Story = StoryObj<typeof meta>

// Default custom slider
export const Default: Story = {
  args: {
    value: [50],
    min: 0,
    max: 100,
    step: 1,
    sliderType: 'custom',
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4">
        <Story />
      </div>
    ),
  ],
}

// Hue slider
export const HueSlider: Story = {
  args: {
    value: [180],
    min: 0,
    max: 360,
    step: 1,
    sliderType: 'hue',
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Hue slider with automatic rainbow gradient background.',
      },
    },
  },
}

// Saturation slider
export const SaturationSlider: Story = {
  args: {
    value: [50],
    min: 0,
    max: 100,
    step: 1,
    sliderType: 'saturation',
    currentHue: 180,
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Saturation slider with gradient from desaturated to fully saturated at a specific hue.',
      },
    },
  },
}

// Lightness slider
export const LightnessSlider: Story = {
  args: {
    value: [50],
    min: 0,
    max: 100,
    step: 1,
    sliderType: 'lightness',
    currentHue: 240,
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Lightness slider with gradient from black to white at a specific hue.',
      },
    },
  },
}

// Controlled slider
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState([50])

    return (
      <div className="w-64 space-y-4 p-4">
        <ColorSlider
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          step={1}
          sliderType="custom"
        />
        <div className="text-sm text-muted-foreground">
          Value: <code className="font-mono">{value[0]}</code>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled slider with external state management.',
      },
    },
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    value: [50],
    min: 0,
    max: 100,
    step: 1,
    disabled: true,
    sliderType: 'custom',
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Disabled slider that cannot be interacted with.',
      },
    },
  },
}

// All slider types comparison
export const AllTypes: Story = {
  render: () => {
    const [hue, setHue] = useState([180])
    const [saturation, setSaturation] = useState([50])
    const [lightness, setLightness] = useState([50])
    const [custom, setCustom] = useState([50])

    return (
      <div className="w-80 space-y-6 p-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Hue Slider</label>
          <ColorSlider
            value={hue}
            onValueChange={setHue}
            min={0}
            max={360}
            step={1}
            sliderType="hue"
          />
          <div className="text-xs text-muted-foreground mt-1">Value: {hue[0]}°</div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Saturation Slider</label>
          <ColorSlider
            value={saturation}
            onValueChange={setSaturation}
            min={0}
            max={100}
            step={1}
            sliderType="saturation"
            currentHue={hue[0]}
          />
          <div className="text-xs text-muted-foreground mt-1">Value: {saturation[0]}%</div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Lightness Slider</label>
          <ColorSlider
            value={lightness}
            onValueChange={setLightness}
            min={0}
            max={100}
            step={1}
            sliderType="lightness"
            currentHue={hue[0]}
          />
          <div className="text-xs text-muted-foreground mt-1">Value: {lightness[0]}%</div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Custom Slider</label>
          <ColorSlider
            value={custom}
            onValueChange={setCustom}
            min={0}
            max={100}
            step={1}
            sliderType="custom"
          />
          <div className="text-xs text-muted-foreground mt-1">Value: {custom[0]}</div>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all slider types with their automatic gradient backgrounds.',
      },
    },
  },
}
