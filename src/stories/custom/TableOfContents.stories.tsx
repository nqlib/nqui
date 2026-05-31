import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useRef } from 'react'
import { TableOfContents } from '@/components'
import { mockTOCItems, simpleTOCItems } from '../mockData'
import type { TableOfContentsProps } from '@/components/custom/table-of-contents'

const meta = {
  title: 'Custom/TableOfContents',
  component: TableOfContents,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive Table of Contents component with auto-detection, scroll spy, and three visual variants (normal, circuit, clerk).',
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
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: false,
      description: 'Manual TOC items array',
      table: {
        type: { summary: 'TOCItem[]' },
      },
    },
    autoDetect: {
      control: 'boolean',
      description: 'Auto-detect headings from the page',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    headingSelector: {
      control: 'text',
      description: 'CSS selector for headings to detect',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"h1, h2, h3, h4, h5, h6"' },
      },
    },
    container: {
      control: false,
      description: 'Container element, ref, or selector to scope heading detection',
      table: {
        type: { summary: 'HTMLElement | RefObject<HTMLElement> | string | null' },
      },
    },
    activeId: {
      control: 'text',
      description: 'Controlled active section ID (overrides scroll spy)',
      table: {
        type: { summary: 'string' },
      },
    },
    onActiveChange: {
      action: 'activeChanged',
      description: 'Callback when active section changes',
      table: {
        type: { summary: '(id: string | null) => void' },
      },
    },
    scrollOffset: {
      control: 'number',
      description: 'Offset for scroll positioning (useful for fixed headers)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    smoothScroll: {
      control: 'boolean',
      description: 'Enable smooth scrolling',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    enableScrollSpy: {
      control: 'boolean',
      description: 'Enable automatic scroll spy',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    title: {
      control: 'text',
      description: 'Title to display above TOC',
      table: {
        type: { summary: 'string' },
      },
    },
    variant: {
      control: 'select',
      options: ['normal', 'circuit', 'clerk'],
      description:
        'Visual variant: normal (Fumadocs-style), circuit (Clerk-style with continuous lines), clerk (Enhanced Clerk-style with smooth corners)',
      table: {
        type: { summary: '"normal" | "circuit" | "clerk"' },
        defaultValue: { summary: '"normal"' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof TableOfContents>

export default meta
type Story = StoryObj<typeof meta>

// Default story with manual items
export const Default: Story = {
  args: {
    items: mockTOCItems,
    variant: 'normal',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Basic TOC with manual items using the comprehensive mock data structure.',
      },
    },
  },
}

// Simple flat structure
export const Simple: Story = {
  args: {
    items: simpleTOCItems,
    variant: 'normal',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Simple flat TOC structure with level 1 items only.',
      },
    },
  },
}

// Normal variant (Fumadocs-style)
export const NormalVariant: Story = {
  args: {
    items: mockTOCItems,
    variant: 'normal',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Normal variant with Fumadocs-style left border and animated thumb indicator.',
      },
    },
  },
}

// Circuit variant (Clerk-style with continuous lines)
export const CircuitVariant: Story = {
  args: {
    items: mockTOCItems,
    variant: 'circuit',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Circuit variant with Clerk-style continuous line structure and simple linear paths.',
      },
    },
  },
}

// Clerk variant (Enhanced Clerk-style with smooth corners)
export const ClerkVariant: Story = {
  args: {
    items: mockTOCItems,
    variant: 'clerk',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Enhanced Clerk variant with smooth corner radius and quadratic curves.',
      },
    },
  },
}

// Auto-detection from headings
export const AutoDetect: Story = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
      <div className="flex gap-8 max-w-6xl">
        <div ref={containerRef} className="prose max-w-2xl flex-1">
          <h2 id="introduction">Introduction</h2>
          <p>
            This is an introduction section. The Table of Contents component can automatically
            detect headings from the DOM and build a hierarchical structure.
          </p>

          <h2 id="getting-started">Getting Started</h2>
          <p>Getting started with the component is straightforward.</p>

          <h3 id="installation">Installation</h3>
          <p>Install the package using your preferred package manager.</p>

          <h3 id="configuration">Configuration</h3>
          <p>Configure the component to match your needs.</p>

          <h4 id="basic-config">Basic Configuration</h4>
          <p>Start with basic configuration settings.</p>

          <h4 id="advanced-config">Advanced Configuration</h4>
          <p>For more control, use advanced configuration options.</p>

          <h3 id="first-steps">First Steps</h3>
          <p>Take your first steps with the component.</p>

          <h2 id="components">Components</h2>
          <p>Explore the available components.</p>

          <h3 id="buttons">Buttons</h3>
          <p>Button components for various use cases.</p>

          <h3 id="forms">Forms</h3>
          <p>Form components and input fields.</p>

          <h4 id="input-fields">Input Fields</h4>
          <p>Different types of input fields.</p>

          <h4 id="select-dropdowns">Select Dropdowns</h4>
          <p>Dropdown selection components.</p>

          <h3 id="navigation">Navigation</h3>
          <p>Navigation components and patterns.</p>

          <h2 id="advanced-topics">Advanced Topics</h2>
          <p>Dive into advanced topics.</p>

          <h3 id="customization">Customization</h3>
          <p>Customize the component to your needs.</p>

          <h3 id="theming">Theming</h3>
          <p>Apply themes and styling.</p>

          <h2 id="api-reference">API Reference</h2>
          <p>Complete API documentation.</p>

          <h2 id="examples">Examples</h2>
          <p>See examples and use cases.</p>
        </div>

        <div className="w-64 shrink-0">
          <TableOfContents
            autoDetect
            headingSelector="h2, h3, h4"
            container={containerRef}
            enableScrollSpy
            smoothScroll
            variant="normal"
          />
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Auto-detection from headings in a container. The TOC automatically builds from h2, h3, and h4 headings.',
      },
    },
  },
}

// With custom title
export const WithTitle: Story = {
  args: {
    items: mockTOCItems,
    variant: 'normal',
    title: 'Table of Contents',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'TOC with a custom title displayed above the items.',
      },
    },
  },
}

// Scroll spy demonstration
export const ScrollSpy: Story = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
      <div className="flex gap-8 max-w-6xl">
        <div ref={containerRef} className="prose max-w-2xl flex-1 max-h-[600px] overflow-y-auto">
          <h2 id="section-1">Section 1</h2>
          <p className="mb-8">
            Scroll down to see the scroll spy in action. The active section will be highlighted in
            the TOC as you scroll.
          </p>

          <h2 id="section-2">Section 2</h2>
          <p className="mb-8">This is section 2. Keep scrolling to see more sections.</p>

          <h3 id="section-2-1">Section 2.1</h3>
          <p className="mb-8">A subsection within section 2.</p>

          <h3 id="section-2-2">Section 2.2</h3>
          <p className="mb-8">Another subsection within section 2.</p>

          <h2 id="section-3">Section 3</h2>
          <p className="mb-8">This is section 3. The scroll spy will track your position.</p>

          <h2 id="section-4">Section 4</h2>
          <p className="mb-8">Final section. Scroll back up to see the active state change.</p>
        </div>

        <div className="w-64 shrink-0">
          <TableOfContents
            autoDetect
            headingSelector="h2, h3"
            container={containerRef}
            enableScrollSpy
            smoothScroll
            variant="clerk"
            title="Contents"
          />
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates scroll spy functionality. As you scroll through the content, the active section in the TOC is automatically highlighted.',
      },
    },
  },
}

// All variants side-by-side comparison
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-8 max-w-5xl">
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4">Normal Variant</h3>
        <TableOfContents items={mockTOCItems} variant="normal" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4">Circuit Variant</h3>
        <TableOfContents items={mockTOCItems} variant="circuit" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4">Clerk Variant</h3>
        <TableOfContents items={mockTOCItems} variant="clerk" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison of all three variants using the same data. Each variant has a distinct visual style.',
      },
    },
  },
}

// Auto-detect with different heading levels
export const DifferentHeadingLevels: Story = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
      <div className="flex gap-8 max-w-6xl">
        <div ref={containerRef} className="prose max-w-2xl flex-1">
          <h1 id="main-title">Main Title (H1)</h1>
          <p>This is the main title of the document.</p>

          <h2 id="chapter-1">Chapter 1 (H2)</h2>
          <p>First chapter content.</p>

          <h3 id="section-1-1">Section 1.1 (H3)</h3>
          <p>First section in chapter 1.</p>

          <h4 id="subsection-1-1-1">Subsection 1.1.1 (H4)</h4>
          <p>First subsection.</p>

          <h4 id="subsection-1-1-2">Subsection 1.1.2 (H4)</h4>
          <p>Second subsection.</p>

          <h3 id="section-1-2">Section 1.2 (H3)</h3>
          <p>Second section in chapter 1.</p>

          <h2 id="chapter-2">Chapter 2 (H2)</h2>
          <p>Second chapter content.</p>

          <h3 id="section-2-1">Section 2.1 (H3)</h3>
          <p>First section in chapter 2.</p>
        </div>

        <div className="w-64 shrink-0">
          <TableOfContents
            autoDetect
            headingSelector="h1, h2, h3, h4"
            container={containerRef}
            enableScrollSpy
            smoothScroll
            variant="normal"
            title="Contents"
          />
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Auto-detection with various heading levels (H1-H4) showing deep nesting capabilities.',
      },
    },
  },
}

// With smooth scrolling
export const WithSmoothScroll: Story = {
  args: {
    items: mockTOCItems,
    variant: 'normal',
    smoothScroll: true,
    enableScrollSpy: true,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'TOC with smooth scrolling enabled for a better user experience when navigating.',
      },
    },
  },
}

// With scroll offset (for fixed headers)
export const WithScrollOffset: Story = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
      <div className="flex gap-8 max-w-6xl">
        <div ref={containerRef} className="prose max-w-2xl flex-1 max-h-[600px] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 mb-4 z-10">
            <h3 className="m-0">Fixed Header (Scroll offset accounts for this)</h3>
          </div>

          <h2 id="offset-section-1">Section 1</h2>
          <p className="mb-8">Content with scroll offset to account for fixed header.</p>

          <h2 id="offset-section-2">Section 2</h2>
          <p className="mb-8">The scroll offset ensures proper positioning.</p>

          <h2 id="offset-section-3">Section 3</h2>
          <p className="mb-8">More content here.</p>

          <h2 id="offset-section-4">Section 4</h2>
          <p className="mb-8">Final section.</p>
        </div>

        <div className="w-64 shrink-0">
          <TableOfContents
            autoDetect
            headingSelector="h2"
            container={containerRef}
            enableScrollSpy
            smoothScroll
            scrollOffset={80}
            variant="normal"
            title="Contents"
          />
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'TOC with scroll offset to account for fixed headers. The offset ensures sections are properly positioned when scrolled to.',
      },
    },
  },
}

// Empty state (no items)
export const EmptyState: Story = {
  args: {
    items: [],
    variant: 'normal',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'TOC behavior when no items are provided. The component handles empty states gracefully.',
      },
    },
  },
}

// Controlled active ID
export const ControlledActiveId: Story = {
  render: () => {
    const [activeId, setActiveId] = React.useState<string | null>('getting-started')

    return (
      <div className="flex gap-8 max-w-6xl">
        <div className="max-w-xs">
          <TableOfContents
            items={mockTOCItems}
            variant="normal"
            activeId={activeId}
            onActiveChange={setActiveId}
            title="Contents"
          />
        </div>
        <div className="flex-1">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Control Active Section</h3>
            <div className="flex flex-wrap gap-2">
              {mockTOCItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    activeId === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Current active ID: <code>{activeId || 'null'}</code>
            </p>
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled active section ID. The active section can be controlled programmatically via the activeId prop.',
      },
    },
  },
}

