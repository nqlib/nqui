import type { Meta, StoryObj } from '@storybook/react-vite'
import { AspectRatio } from '@/components/ui/aspect-ratio'

const meta = {
  title: 'UI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays content within a desired ratio.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'number',
      description: 'Aspect ratio (width / height)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '16 / 9' },
      },
    },
  },
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

// Default aspect ratio (16:9)
export const Default: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden w-[500px]">
      <img
        src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        alt="Photo"
        className="h-full w-full object-cover"
      />
    </AspectRatio>
  ),
}

// Square (1:1)
export const Square: Story = {
  render: () => (
    <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden w-[300px]">
      <img
        src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        alt="Photo"
        className="h-full w-full object-cover"
      />
    </AspectRatio>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Square aspect ratio (1:1).',
      },
    },
  },
}

// Portrait (4:5)
export const Portrait: Story = {
  render: () => (
    <AspectRatio ratio={4 / 5} className="bg-muted rounded-md overflow-hidden w-[300px]">
      <img
        src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        alt="Photo"
        className="h-full w-full object-cover"
      />
    </AspectRatio>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Portrait aspect ratio (4:5).',
      },
    },
  },
}

// Video
export const Video: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden w-[500px]">
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Video Player
      </div>
    </AspectRatio>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Aspect ratio used for video content.',
      },
    },
  },
}
