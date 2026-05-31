import type { TOCItem } from "@/components/custom/table-of-contents"

/**
 * Mock TOC items for showcase examples
 * Can be used for manual TOC examples or as reference for auto-detection
 */
export const mockTOCItems: TOCItem[] = [
  {
    id: "introduction",
    label: "Introduction",
    level: 1,
  },
  {
    id: "getting-started",
    label: "Getting Started",
    level: 1,
    children: [
      {
        id: "installation",
        label: "Installation",
        level: 2,
      },
      {
        id: "configuration",
        label: "Configuration",
        level: 2,
        children: [
          {
            id: "basic-config",
            label: "Basic Configuration",
            level: 3,
          },
          {
            id: "advanced-config",
            label: "Advanced Configuration",
            level: 3,
          },
        ],
      },
      {
        id: "first-steps",
        label: "First Steps",
        level: 2,
      },
    ],
  },
  {
    id: "components",
    label: "Components",
    level: 1,
    children: [
      {
        id: "buttons",
        label: "Buttons",
        level: 2,
      },
      {
        id: "forms",
        label: "Forms",
        level: 2,
        children: [
          {
            id: "input-fields",
            label: "Input Fields",
            level: 3,
          },
          {
            id: "select-dropdowns",
            label: "Select Dropdowns",
            level: 3,
          },
        ],
      },
      {
        id: "navigation",
        label: "Navigation",
        level: 2,
      },
    ],
  },
  {
    id: "advanced-topics",
    label: "Advanced Topics",
    level: 1,
    children: [
      {
        id: "customization",
        label: "Customization",
        level: 2,
      },
      {
        id: "theming",
        label: "Theming",
        level: 2,
      },
    ],
  },
  {
    id: "api-reference",
    label: "API Reference",
    level: 1,
  },
  {
    id: "examples",
    label: "Examples",
    level: 1,
  },
]

/**
 * Simple flat TOC items for basic examples
 */
export const simpleTOCItems: TOCItem[] = [
  { id: "section-1", label: "Section 1", level: 1 },
  { id: "section-2", label: "Section 2", level: 1 },
  { id: "section-3", label: "Section 3", level: 1 },
  { id: "section-4", label: "Section 4", level: 1 },
]

/**
 * Deep nested TOC items for demonstrating deep hierarchy (up to 4 levels)
 */
export const deepNestedTOCItems: TOCItem[] = [
  {
    id: "chapter-1",
    label: "Chapter 1",
    level: 1,
    children: [
      {
        id: "section-1-1",
        label: "Section 1.1",
        level: 2,
        children: [
          {
            id: "subsection-1-1-1",
            label: "Subsection 1.1.1",
            level: 3,
            children: [
              {
                id: "subsubsection-1-1-1-1",
                label: "Subsubsection 1.1.1.1",
                level: 4,
              },
              {
                id: "subsubsection-1-1-1-2",
                label: "Subsubsection 1.1.1.2",
                level: 4,
              },
            ],
          },
          {
            id: "subsection-1-1-2",
            label: "Subsection 1.1.2",
            level: 3,
          },
        ],
      },
      {
        id: "section-1-2",
        label: "Section 1.2",
        level: 2,
        children: [
          {
            id: "subsection-1-2-1",
            label: "Subsection 1.2.1",
            level: 3,
            children: [
              {
                id: "subsubsection-1-2-1-1",
                label: "Subsubsection 1.2.1.1",
                level: 4,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "chapter-2",
    label: "Chapter 2",
    level: 1,
    children: [
      {
        id: "section-2-1",
        label: "Section 2.1",
        level: 2,
        children: [
          {
            id: "subsection-2-1-1",
            label: "Subsection 2.1.1",
            level: 3,
          },
        ],
      },
    ],
  },
]

/**
 * Long TOC items with many entries for testing performance and scrolling
 */
export const longTOCItems: TOCItem[] = [
  { id: "intro", label: "Introduction", level: 1 },
  { id: "getting-started", label: "Getting Started", level: 1 },
  { id: "installation", label: "Installation", level: 1 },
  { id: "quick-start", label: "Quick Start", level: 1 },
  { id: "basics", label: "Basics", level: 1 },
  { id: "advanced", label: "Advanced", level: 1 },
  { id: "components", label: "Components", level: 1 },
  { id: "api", label: "API Reference", level: 1 },
  { id: "examples", label: "Examples", level: 1 },
  { id: "guides", label: "Guides", level: 1 },
  { id: "tutorials", label: "Tutorials", level: 1 },
  { id: "best-practices", label: "Best Practices", level: 1 },
  { id: "troubleshooting", label: "Troubleshooting", level: 1 },
  { id: "faq", label: "FAQ", level: 1 },
  { id: "changelog", label: "Changelog", level: 1 },
  { id: "contributing", label: "Contributing", level: 1 },
  { id: "license", label: "License", level: 1 },
]

/**
 * Documentation-style TOC items (typical for technical documentation)
 */
export const documentationTOCItems: TOCItem[] = [
  {
    id: "overview",
    label: "Overview",
    level: 1,
  },
  {
    id: "getting-started",
    label: "Getting Started",
    level: 1,
    children: [
      {
        id: "installation",
        label: "Installation",
        level: 2,
        children: [
          {
            id: "npm-install",
            label: "npm",
            level: 3,
          },
          {
            id: "yarn-install",
            label: "yarn",
            level: 3,
          },
          {
            id: "pnpm-install",
            label: "pnpm",
            level: 3,
          },
        ],
      },
      {
        id: "configuration",
        label: "Configuration",
        level: 2,
      },
      {
        id: "first-steps",
        label: "First Steps",
        level: 2,
      },
    ],
  },
  {
    id: "core-concepts",
    label: "Core Concepts",
    level: 1,
    children: [
      {
        id: "architecture",
        label: "Architecture",
        level: 2,
      },
      {
        id: "data-flow",
        label: "Data Flow",
        level: 2,
      },
      {
        id: "state-management",
        label: "State Management",
        level: 2,
      },
    ],
  },
  {
    id: "api-reference",
    label: "API Reference",
    level: 1,
    children: [
      {
        id: "components",
        label: "Components",
        level: 2,
        children: [
          {
            id: "button",
            label: "Button",
            level: 3,
          },
          {
            id: "input",
            label: "Input",
            level: 3,
          },
          {
            id: "select",
            label: "Select",
            level: 3,
          },
        ],
      },
      {
        id: "hooks",
        label: "Hooks",
        level: 2,
        children: [
          {
            id: "use-state",
            label: "useState",
            level: 3,
          },
          {
            id: "use-effect",
            label: "useEffect",
            level: 3,
          },
        ],
      },
    ],
  },
  {
    id: "examples",
    label: "Examples",
    level: 1,
  },
  {
    id: "migration",
    label: "Migration Guide",
    level: 1,
  },
]

