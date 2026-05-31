import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from '@storybook/testing-library'
import { Toaster } from '@/components'
import { toast } from 'sonner'
import { Button } from '@/components'
import { ThemeProvider } from 'next-themes'

// Wrapper component that provides Toaster with theme support
const ToastWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster />
      {children}
    </ThemeProvider>
  )
}

const meta = {
  title: 'Enhanced/Sonner',
  component: ToastWrapper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced toast notifications with 3D gradient effects and semantic variants.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  tags: ['autodocs', 'test'],
  decorators: [
    (Story) => (
      <ToastWrapper>
        <div className="p-4">
          <Story />
        </div>
      </ToastWrapper>
    ),
  ],
} satisfies Meta<typeof ToastWrapper>

export default meta
type Story = StoryObj<typeof meta>

// Default toast
export const Default: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast('This is a default toast notification')
      }}
    >
      Show Default Toast
    </Button>
  ),
}

// Success toast
export const Success: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.success('Operation completed successfully!')
      }}
    >
      Show Success Toast
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Success toast with green styling and checkmark icon.',
      },
    },
  },
}

// Error toast
export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => {
        toast.error('Something went wrong. Please try again.')
      }}
    >
      Show Error Toast
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error toast with red styling and error icon.',
      },
    },
  },
}

// Warning toast
export const Warning: Story = {
  render: () => (
    <Button
      variant="warning"
      onClick={() => {
        toast.warning('Please review this before proceeding.')
      }}
    >
      Show Warning Toast
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Warning toast with yellow/orange styling and warning icon.',
      },
    },
  },
}

// Info toast
export const Info: Story = {
  render: () => (
    <Button
      variant="info"
      onClick={() => {
        toast.info('Here is some information you should know.')
      }}
    >
      Show Info Toast
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Info toast with blue styling and info icon.',
      },
    },
  },
}

// With actions
export const WithActions: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast('File uploaded', {
          action: {
            label: 'Undo',
            onClick: () => console.log('Undo clicked'),
          },
        })
      }}
    >
      Show Toast with Action
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with action button.',
      },
    },
  },
}

// With description
export const WithDescription: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.success('Profile updated', {
          description: 'Your profile information has been saved successfully.',
        })
      }}
    >
      Show Toast with Description
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with title and description.',
      },
    },
  },
}

// Loading toast
export const Loading: Story = {
  render: () => (
    <Button
      onClick={() => {
        const toastId = toast.loading('Processing your request...')
        setTimeout(() => {
          toast.success('Request completed!', { id: toastId })
        }, 2000)
      }}
    >
      Show Loading Toast
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading toast that transitions to success.',
      },
    },
  },
}

// Position variations
export const Positions: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => toast('Top Left', { position: 'top-left' })}
        >
          Top Left
        </Button>
        <Button
          size="sm"
          onClick={() => toast('Top Center', { position: 'top-center' })}
        >
          Top Center
        </Button>
        <Button
          size="sm"
          onClick={() => toast('Top Right', { position: 'top-right' })}
        >
          Top Right
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => toast('Bottom Left', { position: 'bottom-left' })}
        >
          Bottom Left
        </Button>
        <Button
          size="sm"
          onClick={() => toast('Bottom Center', { position: 'bottom-center' })}
        >
          Bottom Center
        </Button>
        <Button
          size="sm"
          onClick={() => toast('Bottom Right', { position: 'bottom-right' })}
        >
          Bottom Right
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toasts in different positions.',
      },
    },
  },
}

// All variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast('Default toast')}>Default</Button>
      <Button onClick={() => toast.success('Success!')}>Success</Button>
      <Button onClick={() => toast.error('Error occurred')}>Error</Button>
      <Button onClick={() => toast.warning('Warning message')}>Warning</Button>
      <Button onClick={() => toast.info('Information')}>Info</Button>
      <Button onClick={() => toast.loading('Loading...')}>Loading</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All toast variants displayed together.',
      },
    },
  },
}

// Interactive
export const Interactive: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast('Interactive toast', {
          action: {
            label: 'Click me',
            onClick: () => {
              toast.success('Action clicked!')
            },
          },
        })
      }}
    >
      Show Interactive Toast
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await userEvent.click(button)
  },
}

// Long duration
export const LongDuration: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast('This toast will stay for 10 seconds', {
          duration: 10000,
        })
      }}
    >
      Show Long Duration Toast
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with custom duration (10 seconds).',
      },
    },
  },
}
