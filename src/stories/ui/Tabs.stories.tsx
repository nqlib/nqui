import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'Default active tab value',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Tab orientation',
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"horizontal"' },
      },
    },
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

// Default tabs
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="mt-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Account</h3>
          <p className="text-sm text-muted-foreground">
            Make changes to your account here. Click save when you're done.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="password" className="mt-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Password</h3>
          <p className="text-sm text-muted-foreground">
            Change your password here. After saving, you'll be logged out.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="settings" className="mt-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

// Line variant
export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <p className="text-sm">Overview content goes here.</p>
      </TabsContent>
      <TabsContent value="analytics" className="mt-4">
        <p className="text-sm">Analytics content goes here.</p>
      </TabsContent>
      <TabsContent value="reports" className="mt-4">
        <p className="text-sm">Reports content goes here.</p>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4">
        <p className="text-sm">Notifications content goes here.</p>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs with line variant styling (underlined active tab).',
      },
    },
  },
}

// Vertical tabs
export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="tab1" orientation="vertical" className="flex gap-4 w-[500px]">
      <TabsList variant="default" className="flex-col h-fit">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="tab1" className="mt-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Tab 1 Content</h3>
            <p className="text-sm text-muted-foreground">
              This is the content for the first tab in a vertical layout.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tab2" className="mt-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Tab 2 Content</h3>
            <p className="text-sm text-muted-foreground">
              This is the content for the second tab in a vertical layout.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tab3" className="mt-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Tab 3 Content</h3>
            <p className="text-sm text-muted-foreground">
              This is the content for the third tab in a vertical layout.
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical tabs layout with tabs on the left side.',
      },
    },
  },
}

// Many tabs
export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[600px]">
      <TabsList className="flex-wrap">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        <TabsTrigger value="tab4">Tab 4</TabsTrigger>
        <TabsTrigger value="tab5">Tab 5</TabsTrigger>
        <TabsTrigger value="tab6">Tab 6</TabsTrigger>
      </TabsList>
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <TabsContent key={num} value={`tab${num}`} className="mt-4">
          <p className="text-sm">Content for Tab {num}</p>
        </TabsContent>
      ))}
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs component with many tabs that wrap to multiple lines.',
      },
    },
  },
}
