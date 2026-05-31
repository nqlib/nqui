import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert, AlertTitle, AlertDescription } from '@/components'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays a callout for user attention with optional title and description.',
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
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

// Default alert
export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
}

// Destructive alert
export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

// Success alert
export const Success: Story = {
  render: () => (
    <Alert className="border-success/20 bg-success/10 dark:bg-success/5">
      <div className="text-success">✓</div>
      <div>
        <AlertTitle className="text-success">Success</AlertTitle>
        <AlertDescription className="text-success/80">
          Your changes have been saved successfully.
        </AlertDescription>
      </div>
    </Alert>
  ),
}

// Warning alert
export const Warning: Story = {
  render: () => (
    <Alert className="border-warning/20 bg-warning/10 dark:bg-warning/5">
      <div className="text-warning">⚠</div>
      <div>
        <AlertTitle className="text-warning">Warning</AlertTitle>
        <AlertDescription className="text-warning/80">
          Please review your input before proceeding.
        </AlertDescription>
      </div>
    </Alert>
  ),
}

// Info alert
export const Info: Story = {
  render: () => (
    <Alert className="border-info/20 bg-info/10 dark:bg-info/5">
      <div className="text-info">ℹ</div>
      <div>
        <AlertTitle className="text-info">Information</AlertTitle>
        <AlertDescription className="text-info/80">
          Here is some important information you should know.
        </AlertDescription>
      </div>
    </Alert>
  ),
}

// Without title
export const WithoutTitle: Story = {
  render: () => (
    <Alert>
      <AlertDescription>
        This alert only has a description without a title.
      </AlertDescription>
    </Alert>
  ),
}

// Only title
export const OnlyTitle: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Just a Title</AlertTitle>
    </Alert>
  ),
}

// Multiple alerts
export const MultipleAlerts: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Update Available</AlertTitle>
        <AlertDescription>
          A new version of the app is available. Please update to get the latest features.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTitle>Connection Lost</AlertTitle>
        <AlertDescription>
          Unable to connect to the server. Please check your internet connection.
        </AlertDescription>
      </Alert>

      <Alert className="border-success/20 bg-success/10 dark:bg-success/5">
        <div className="text-success">✓</div>
        <div>
          <AlertTitle className="text-success">Backup Complete</AlertTitle>
          <AlertDescription className="text-success/80">
            Your data has been successfully backed up.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple alerts shown together, demonstrating different types and states.',
      },
    },
  },
}

// Dismissible alert (simulated)
export const Dismissible: Story = {
  render: () => (
    <Alert className="relative">
      <div className="flex-1">
        <AlertTitle>Notification</AlertTitle>
        <AlertDescription>
          This is a dismissible alert. Click the X to close it.
        </AlertDescription>
      </div>
      <button
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        ✕
      </button>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with a close button for dismissal.',
      },
    },
  },
}