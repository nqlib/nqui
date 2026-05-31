import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { mockUsers } from '../mockData'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An image element with a fallback for representing the user.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
      ],
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
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

// Default avatar with image
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src={mockUsers[0].avatar} alt={mockUsers[0].name} />
      <AvatarFallback>{mockUsers[0].initials}</AvatarFallback>
    </Avatar>
  ),
}

// Fallback only
export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar className="w-6 h-6">
        <AvatarImage src={mockUsers[0].avatar} alt={mockUsers[0].name} />
        <AvatarFallback className="text-xs">{mockUsers[0].initials}</AvatarFallback>
      </Avatar>

      <Avatar className="w-8 h-8">
        <AvatarImage src={mockUsers[0].avatar} alt={mockUsers[0].name} />
        <AvatarFallback className="text-xs">{mockUsers[0].initials}</AvatarFallback>
      </Avatar>

      <Avatar className="w-12 h-12">
        <AvatarImage src={mockUsers[0].avatar} alt={mockUsers[0].name} />
        <AvatarFallback>{mockUsers[0].initials}</AvatarFallback>
      </Avatar>

      <Avatar className="w-16 h-16">
        <AvatarImage src={mockUsers[0].avatar} alt={mockUsers[0].name} />
        <AvatarFallback className="text-lg">{mockUsers[0].initials}</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatars in different sizes using custom classes.',
      },
    },
  },
}

// Group of avatars
export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {mockUsers.slice(0, 4).map((user) => (
        <Avatar key={user.id} className="w-8 h-8 border-2 border-background">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
        </Avatar>
      ))}
      <Avatar className="w-8 h-8 border-2 border-background">
        <AvatarFallback className="text-xs bg-muted">+3</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Stacked avatars showing a group of users.',
      },
    },
  },
}

// Loading state (no image, showing fallback)
export const LoadingState: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

// Error state (image fails to load)
export const ErrorState: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="invalid-image-url.jpg" alt="User" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

// With user data
export const WithUserData: Story = {
  render: () => (
    <div className="flex items-center space-x-3">
      <Avatar>
        <AvatarImage src={mockUsers[0].avatar} alt={mockUsers[0].name} />
        <AvatarFallback>{mockUsers[0].initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{mockUsers[0].name}</p>
        <p className="text-sm text-muted-foreground">{mockUsers[0].email}</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar used alongside user information.',
      },
    },
  },
}

// Different fallback styles
export const FallbackStyles: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Initials</p>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Single Letter</p>
        <Avatar>
          <AvatarFallback>J</AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Icon</p>
        <Avatar>
          <AvatarFallback>
            <span className="text-lg">👤</span>
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Number</p>
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">1</AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different types of fallback content for avatars.',
      },
    },
  },
}

// Square avatar
export const Square: Story = {
  render: () => (
    <Avatar className="rounded-md">
      <AvatarImage src={mockUsers[0].avatar} alt={mockUsers[0].name} />
      <AvatarFallback className="rounded-md">{mockUsers[0].initials}</AvatarFallback>
    </Avatar>
  ),
}