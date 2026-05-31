import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from '@/components/ui/skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A skeleton loader component that displays a placeholder while content is loading.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for sizing and styling',
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

// Default skeleton
export const Default: Story = {
  args: {
    className: 'h-4 w-[250px]',
  },
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-12 w-[250px]" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton loaders in different sizes.',
      },
    },
  },
}

// Card skeleton
export const Card: Story = {
  render: () => (
    <div className="flex items-center space-x-4 w-[400px]">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton loader for a card component with avatar and text.',
      },
    },
  },
}

// Article skeleton
export const Article: Story = {
  render: () => (
    <div className="space-y-4 w-[500px]">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-[200px] w-full rounded-md" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton loader for an article layout with title, paragraphs, and image.',
      },
    },
  },
}

// Button skeleton
export const Button: Story = {
  render: () => (
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton loaders for button components.',
      },
    },
  },
}
