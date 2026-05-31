import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Welcome',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Welcome to Nqui Component Library Storybook',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<any>

export default meta
type Story = StoryObj<typeof meta>

// Welcome story
export const Welcome: Story = {
  render: () => (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-foreground mb-4">
            Nqui
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A React component library with enhanced UI components and developer tools
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">Enhanced Components</h3>
            <p className="text-muted-foreground text-sm">
              Beautiful, accessible components with enhanced styling and animations
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Developer Experience</h3>
            <p className="text-muted-foreground text-sm">
              Comprehensive Storybook documentation with interactive controls
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold mb-2">TypeScript Support</h3>
            <p className="text-muted-foreground text-sm">
              Full TypeScript support with type-safe props and utilities
            </p>
          </div>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="text-left max-w-2xl mx-auto">
            <div className="space-y-4 text-muted-foreground">
              <p>
                This Storybook contains interactive examples of all Nqui components.
                Use the sidebar to explore different component categories:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>UI Components:</strong> Base shadcn/ui components</li>
                <li><strong>Enhanced:</strong> Components with additional styling and features</li>
                <li><strong>Custom:</strong> Specialized components for specific use cases</li>
                <li><strong>Shadcn-IO:</strong> Code editor, sandbox, and snippet components</li>
                <li><strong>Debug:</strong> Developer tools for component inspection</li>
              </ul>
              <p className="mt-6">
                Each component story includes interactive controls, documentation,
                and examples of different variants and use cases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}