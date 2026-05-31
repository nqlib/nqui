import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { CoreButton } from '@/components/ui/button'
import { mockCardContent, mockUsers } from '../mockData'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections.',
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
      <div className="p-4 max-w-md">
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
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// Basic card
export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>{mockCardContent.title}</CardTitle>
        <CardDescription>{mockCardContent.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
      </CardContent>
    </Card>
  ),
}

// Card with footer
export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
        <CardDescription>Current progress on the main project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Progress</span>
            <span>75%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-3/4"></div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <CoreButton>View Details</CoreButton>
      </CardFooter>
    </Card>
  ),
}

// User profile card
export const UserProfile: Story = {
  render: () => {
    const user = mockUsers[0]
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-xl">
            {user.initials}
          </div>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span>{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`capitalize ${
                user.status === 'active' ? 'text-success' :
                user.status === 'inactive' ? 'text-muted-foreground' :
                'text-warning'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <CoreButton variant="outline" size="sm">Edit</CoreButton>
          <CoreButton size="sm">View Profile</CoreButton>
        </CardFooter>
      </Card>
    )
  },
}

// Statistics card
export const Statistics: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl">1,234</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            +12% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Revenue</CardDescription>
          <CardTitle className="text-2xl">$45,678</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            +8% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Projects</CardDescription>
          <CardTitle className="text-2xl">23</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            +3 from last month
          </p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple cards used for displaying statistics.',
      },
    },
  },
}

// Interactive card
export const Interactive: Story = {
  render: () => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>
          This card responds to hover and click interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Click anywhere on this card to see the interaction.</p>
      </CardContent>
    </Card>
  ),
}

// Minimal card
export const Minimal: Story = {
  render: () => (
    <Card>
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground">
          This is a minimal card with just content.
        </p>
      </CardContent>
    </Card>
  ),
}

// Card with image placeholder
export const WithImage: Story = {
  render: () => (
    <Card>
      <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-t-lg flex items-center justify-center">
        <span className="text-muted-foreground">📷 Image Placeholder</span>
      </div>
      <CardHeader>
        <CardTitle>Card with Image</CardTitle>
        <CardDescription>
          Cards can include images or visual elements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>The image area can be customized with actual images, gradients, or icons.</p>
      </CardContent>
      <CardFooter>
        <CoreButton>Learn More</CoreButton>
      </CardFooter>
    </Card>
  ),
}

// Sticky header with frosted glass
export const StickyFrostedHeader: Story = {
  render: () => (
    <Card stickyHeader className="h-[500px] w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Frosted Glass Header with Scroll</CardTitle>
        <CardDescription>
          Scroll the content below to see the fade mask and frosted glass reflection effect.
          The header stays sticky while content scrolls behind it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Section 1: Red Section</h3>
            <p className="text-muted-foreground">
              This red section will blur and reflect through the frosted glass header as you scroll.
              Notice the color bleeding through the glass effect.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">Section 2: Blue Section</h3>
            <p className="text-muted-foreground">
              Blue content creates a cool reflection. The frosted glass effect uses backdrop-filter to blur
              content behind it, creating depth and visual interest.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Section 3: Green Section</h3>
            <p className="text-muted-foreground">
              Green adds vibrancy. The extended backdrop (200% height) captures nearby elements for a
              realistic reflection effect as content scrolls.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">Section 4: Purple Section</h3>
            <p className="text-muted-foreground">
              Purple creates a rich reflection. When content scrolls up toward the header, it first fades
              (from the scroll mask), then gets blurred as it passes behind the frosted glass.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Section 5: Orange Section</h3>
            <p className="text-muted-foreground">
              Orange provides warm tones. The FrostedGlass component extends its backdrop to capture nearby
              elements, while backdrop-filter: blur() creates the glass effect.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-pink-500/20 border border-pink-500/30">
            <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-400">Section 6: Pink Section</h3>
            <p className="text-muted-foreground">
              Pink adds softness. Keep scrolling to see how different colors reflect through the glass header.
              Each color creates a unique blur effect.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
            <h3 className="text-lg font-semibold text-cyan-700 dark:text-cyan-400">Section 7: Cyan Section</h3>
            <p className="text-muted-foreground">
              Cyan provides cool tones. The combination of fade mask and frosted glass provides excellent
              visual feedback with beautiful color reflections.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Section 8: Yellow Section</h3>
            <p className="text-muted-foreground">
              Yellow adds brightness. This effect is inspired by Apple's design language, where frosted glass
              is used extensively in macOS and iOS interfaces.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">Section 9: Indigo Section</h3>
            <p className="text-muted-foreground">
              Indigo creates depth. Backdrop-filter is hardware-accelerated and performs well in modern browsers.
              The extended backdrop technique ensures nearby elements are properly blurred.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-teal-500/20 border border-teal-500/30">
            <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400">Section 10: Teal Section</h3>
            <p className="text-muted-foreground">
              Teal completes the spectrum. Scroll back up to see the effect in reverse. The frosted glass header
              creates a beautiful, modern interface with colorful reflections.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with sticky header featuring frosted glass effect. The header stays fixed while content scrolls behind it, creating a beautiful blur reflection effect. Uses the stickyHeader prop.',
      },
    },
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="p-4 w-full">
        <Story />
      </div>
    ),
  ],
}