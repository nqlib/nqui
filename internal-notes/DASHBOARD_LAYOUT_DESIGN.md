# Universal Three-Panel Dashboard Layout System

## Overview

A reusable, scalable dashboard layout system implementing a three-panel navigation pattern that works universally across different applications and content types. This design provides consistent navigation, contextual options, and responsive behavior regardless of the underlying content or domain.

## Universal Application

This layout system is designed to be **content-agnostic** and can be applied to any dashboard-style application:

- **Content Management Systems** (CMS)
- **Email/Calendar Applications**
- **Project Management Tools**
- **Analytics Dashboards**
- **E-commerce Admin Panels**
- **Developer Tools & IDEs**
- **Design/Prototyping Tools**

## Core Architecture

### Three-Panel Navigation Pattern

The layout follows a universal three-panel pattern applicable to any application:

1. **Primary Sidebar** (left): Icon-only global navigation menu
2. **Secondary Sidebar** (left, conditional): Context-specific tools/options/filters
3. **Main Content Area** (center): Flexible workspace/canvas area

```
┌─────────────────┬─────────────────┬─────────────────┐
│                 │                 │                 │
│   Global        │   Context       │   Main          │
│   Navigation    │   Tools         │   Workspace     │
│   (Icons)       │   (Filters)     │   (Content)     │
│                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

### Content Type Adaptations

The same layout pattern adapts to different content types by changing the secondary sidebar content:

**📧 Communication Apps (Email, Chat, Calendar):**
- Primary: Mailboxes, contacts, calendar views
- Secondary: Message list, contact filters, calendar filters
- Main: Message content, conversation threads, calendar events

**📊 Data Applications (Analytics, Reports):**
- Primary: Dashboard, reports, data sources
- Secondary: Filters, date ranges, metrics selector
- Main: Charts, tables, data visualizations

**🛠️ Creation Tools (Editors, Designers):**
- Primary: File browser, tools, views
- Secondary: Tool palette, layers, properties
- Main: Canvas, editor workspace, design area

**📋 Management Apps (Tasks, Projects):**
- Primary: Projects, teams, views
- Secondary: Task filters, project phases, team members
- Main: Task boards, timelines, project details

### Responsive States

**Desktop (> 768px):**
- All three panels visible simultaneously
- Primary sidebar collapsible to icon-only (22rem → 3rem)
- Secondary sidebar adapts content based on primary selection

**Tablet (768px):**
- Primary sidebar reduces to icons
- Secondary sidebar becomes overlay/modal
- Main content remains full-width workspace

**Mobile (< 768px):**
- Single-panel view with drawer navigation
- Secondary content in modal sheets
- Touch-optimized interactions with swipe gestures

## Universal Component Architecture

### LayoutProvider (Universal Root Component)

**Purpose:** Application-wide layout state management and responsive behavior

**Core Interface:**
```tsx
interface LayoutConfig {
  primarySidebar: {
    width: string
    iconWidth: string
    collapsible: boolean
  }
  secondarySidebar: {
    width: string
    contentType: 'filters' | 'tools' | 'navigation' | 'properties'
  }
  responsive: {
    mobileBreakpoint: number
    tabletBreakpoint: number
  }
}

interface LayoutContextValue {
  // Sidebar states
  primaryCollapsed: boolean
  secondaryVisible: boolean

  // Content management
  activePrimaryItem: string | null
  activeSecondaryItem: string | null

  // Responsive state
  isMobile: boolean
  isTablet: boolean

  // Actions
  togglePrimarySidebar: () => void
  setActivePrimaryItem: (item: string) => void
  showSecondaryContent: (content: React.ReactNode) => void
}
```

### PrimarySidebar (Global Navigation)

**Universal Structure:**
```tsx
interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType
  badge?: string | number
  disabled?: boolean
  requiresAuth?: boolean
}

interface PrimarySidebarProps {
  items: NavigationItem[]
  activeItem: string | null
  onItemSelect: (itemId: string) => void
  collapsed?: boolean
  className?: string
}
```

**Implementation Pattern:**
```tsx
<PrimarySidebar
  items={[
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'projects', label: 'Projects', icon: FolderIcon },
    { id: 'team', label: 'Team', icon: UsersIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ]}
  activeItem={activePrimaryItem}
  onItemSelect={handlePrimaryNavigation}
/>
```

### SecondarySidebar (Contextual Tools)

**Content Type Variants:**

```tsx
type SecondaryContentType =
  | 'filters'      // Data filtering, search options
  | 'tools'        // Tool palettes, widgets
  | 'navigation'   // Hierarchical navigation, breadcrumbs
  | 'properties'   // Object properties, settings
  | 'list'         // Item lists, collections
  | 'preview'      // Content previews, thumbnails

interface SecondarySidebarProps {
  contentType: SecondaryContentType
  content: React.ReactNode
  title?: string
  searchable?: boolean
  collapsible?: boolean
  onClose?: () => void
}
```

### MainContent (Workspace Area)

**Flexible Layout System:**
```tsx
interface MainContentProps {
  children: React.ReactNode
  header?: React.ReactNode
  toolbar?: React.ReactNode
  footer?: React.ReactNode
  scrollable?: boolean
  className?: string
}
```

**Usage Patterns:**
```tsx
// Content-focused layout
<MainContent header={<PageHeader />}>
  <ContentGrid />
</MainContent>

// Canvas/workspace layout
<MainContent scrollable={false}>
  <CanvasArea />
</MainContent>

// Data table layout
<MainContent
  toolbar={<DataToolbar />}
  footer={<PaginationControls />}
>
  <DataTable />
</MainContent>
```

### ResponsiveContainer (Mobile Adaptation)

**Universal Mobile Handling:**
```tsx
interface ResponsiveContainerProps {
  primarySidebar: React.ReactNode
  secondarySidebar: React.ReactNode
  mainContent: React.ReactNode
  header?: React.ReactNode
}

// Automatically handles:
// - Drawer behavior on mobile
// - Sheet overlays for secondary content
// - Touch gesture support
// - Keyboard shortcuts
```

## Universal Responsive Design System

### Device Breakpoints (Configurable)

```tsx
interface ResponsiveBreakpoints {
  mobile: number    // Default: 768px
  tablet: number    // Default: 1024px
  desktop: number   // Default: 1440px
}

// Usage in any application
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440
} as const
```

### Responsive Hook (Universal)

**Device Detection:**
```tsx
// Universal hook for any application
export function useDeviceType(breakpoints = BREAKPOINTS) {
  const [device, setDevice] = React.useState<{
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    width: number
  }>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1440
  })

  React.useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth
      setDevice({
        isMobile: width < breakpoints.mobile,
        isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
        isDesktop: width >= breakpoints.tablet,
        width
      })
    }

    updateDevice()
    window.addEventListener('resize', updateDevice)
    return () => window.removeEventListener('resize', updateDevice)
  }, [breakpoints])

  return device
}
```

### Universal Layout Dimensions

```css
/* Configurable CSS Variables */
:root {
  /* Primary sidebar */
  --sidebar-primary-width: 22rem;
  --sidebar-primary-width-collapsed: 3rem;

  /* Secondary sidebar */
  --sidebar-secondary-width: 20rem;
  --sidebar-secondary-width-mobile: 18rem;

  /* Responsive breakpoints */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1440px;
}
```

### Responsive Behavior Patterns

**Three Layout States:**

```tsx
interface LayoutState {
  // Desktop: All panels visible
  desktop: {
    primarySidebar: 'expanded' | 'collapsed'
    secondarySidebar: 'visible' | 'hidden'
    mainContent: 'full' | 'constrained'
  }

  // Tablet: Primary collapsed, secondary overlay
  tablet: {
    primarySidebar: 'icons-only'
    secondarySidebar: 'overlay' | 'hidden'
    mainContent: 'full'
  }

  // Mobile: Single panel with drawers
  mobile: {
    primarySidebar: 'drawer'
    secondarySidebar: 'modal' | 'drawer'
    mainContent: 'full'
  }
}
```

**Conditional Rendering (Universal):**
```tsx
function ResponsiveLayout({ device, children }) {
  if (device.isMobile) {
    return <MobileLayout>{children}</MobileLayout>
  }

  if (device.isTablet) {
    return <TabletLayout>{children}</TabletLayout>
  }

  return <DesktopLayout>{children}</DesktopLayout>
}
```

**Overlay/Modal Patterns:**
```tsx
// Universal sheet for secondary content
function SecondaryContentSheet({ open, onOpen, content }) {
  return (
    <Sheet open={open} onOpenChange={onOpen}>
      <SheetContent side="right" className="w-full sm:max-w-[400px]">
        {content}
      </SheetContent>
    </Sheet>
  )
}

// Universal drawer for primary navigation
function PrimaryNavigationDrawer({ open, onOpen, navigation }) {
  return (
    <Drawer open={open} onOpenChange={onOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        {navigation}
      </DrawerContent>
    </Drawer>
  )
}
```

## Universal Content Patterns

### Pattern 1: List-Detail Navigation

**Use Case:** Email, tasks, documents, contacts, calendar events

**Navigation Flow:** Click primary item → show filtered list → display selected item details

```tsx
interface ListDetailPattern {
  primaryItems: Array<{ id: string, label: string, count?: number }>
  listFilters: Array<{ type: 'search' | 'status' | 'date' | 'tags' }>
  detailView: (item: any) => React.ReactNode
}

// Example: Email Application
const emailPattern: ListDetailPattern = {
  primaryItems: [
    { id: 'inbox', label: 'Inbox', count: 12 },
    { id: 'sent', label: 'Sent', count: 5 },
    { id: 'drafts', label: 'Drafts', count: 2 }
  ],
  listFilters: [
    { type: 'search' },
    { type: 'status' },
    { type: 'date' }
  ]
}

// Example: Task Management
const taskPattern: ListDetailPattern = {
  primaryItems: [
    { id: 'today', label: 'Today', count: 8 },
    { id: 'week', label: 'This Week', count: 23 },
    { id: 'projects', label: 'Projects', count: 5 }
  ],
  listFilters: [
    { type: 'search' },
    { type: 'tags' },
    { type: 'assignee' }
  ]
}
```

### Pattern 2: Hierarchical Content Navigation

**Use Case:** Documentation, file systems, category browsing, knowledge bases

**Navigation Flow:** Click primary section → show table of contents → navigate to content sections

```tsx
interface HierarchicalPattern {
  primarySections: Array<{ id: string, label: string, icon: string }>
  contentHierarchy: {
    [sectionId: string]: Array<{
      id: string
      title: string
      level: number
      scrollTarget?: string
    }>
  }
  scrollSpy?: boolean
}

// Example: Documentation Site
const docsPattern: HierarchicalPattern = {
  primarySections: [
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'api-reference', label: 'API Reference', icon: '📚' },
    { id: 'examples', label: 'Examples', icon: '💡' }
  ],
  contentHierarchy: {
    'getting-started': [
      { id: 'installation', title: 'Installation', level: 1 },
      { id: 'quick-start', title: 'Quick Start', level: 1 },
      { id: 'basic-usage', title: 'Basic Usage', level: 2 }
    ]
  },
  scrollSpy: true
}

// Example: File System Browser
const fileSystemPattern: HierarchicalPattern = {
  primarySections: [
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'videos', label: 'Videos', icon: '🎥' }
  ]
}
```

### Pattern 3: Tool-Based Creation

**Use Case:** Design tools, code editors, form builders, canvas applications

**Navigation Flow:** Click primary tool → show tool palette → create/edit in workspace

```tsx
interface CreationPattern {
  primaryTools: Array<{ id: string, label: string, icon: string }>
  toolPalette: {
    [toolId: string]: Array<{
      id: string
      name: string
      icon: string
      category: string
    }>
  }
  workspaceType: 'canvas' | 'editor' | 'form' | 'diagram'
  propertiesPanel?: boolean
}

// Example: Design Tool
const designPattern: CreationPattern = {
  primaryTools: [
    { id: 'shapes', label: 'Shapes', icon: '⬜' },
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'components', label: 'Components', icon: '🧩' }
  ],
  toolPalette: {
    'shapes': [
      { id: 'rectangle', name: 'Rectangle', icon: '▭', category: 'basic' },
      { id: 'circle', name: 'Circle', icon: '○', category: 'basic' }
    ]
  },
  workspaceType: 'canvas',
  propertiesPanel: true
}

// Example: Form Builder
const formBuilderPattern: CreationPattern = {
  primaryTools: [
    { id: 'inputs', label: 'Input Fields', icon: '📝' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'logic', label: 'Logic', icon: '⚡' }
  ],
  toolPalette: {
    'inputs': [
      { id: 'text-input', name: 'Text Input', icon: '📝', category: 'basic' },
      { id: 'select', name: 'Select', icon: '▼', category: 'choice' }
    ]
  },
  workspaceType: 'form',
  propertiesPanel: true
}
```

### Pattern 4: Data Dashboard

**Use Case:** Analytics, reporting, monitoring, business intelligence

**Navigation Flow:** Click primary metric → show filters/controls → display data visualizations

```tsx
interface DashboardPattern {
  primaryMetrics: Array<{ id: string, label: string, icon: string }>
  filterControls: Array<{
    type: 'date-range' | 'dropdown' | 'slider' | 'checkbox'
    label: string
    options?: string[]
  }>
  visualizationTypes: Array<'chart' | 'table' | 'map' | 'gauge'>
}

// Example: Analytics Dashboard
const analyticsPattern: DashboardPattern = {
  primaryMetrics: [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'revenue', label: 'Revenue', icon: '💰' }
  ],
  filterControls: [
    { type: 'date-range', label: 'Date Range' },
    { type: 'dropdown', label: 'Region', options: ['US', 'EU', 'Asia'] },
    { type: 'checkbox', label: 'Compare with previous period' }
  ],
  visualizationTypes: ['chart', 'table', 'gauge']
}
```

## Z-Index Elevation System

### Layer Hierarchy

```css
/* styles/elevation.css */
--z-base: 0
--z-background: 0
--z-content: 10
--z-sticky-content: 15
--z-sticky-page: 20
--z-floating: 30
--z-modal-backdrop: 40
--z-modal: 50
--z-popover: 60
--z-tooltip: 70
--z-debug: 9999
```

### Usage Examples

**Page Headers:**
```tsx
<header className="sticky top-0 z-[var(--z-sticky-page)]">
```

**Modal Overlays:**
```tsx
<div className="z-[var(--z-modal)]">
  <div className="z-[var(--z-modal-backdrop)]" />
  <div className="z-[var(--z-modal)]" />
</div>
```

## Scroll Management

### Container Isolation

**AppLayout Scroll Container:**
```tsx
<div
  ref={scrollContainerRef}
  className={cn(
    "flex-1 min-h-0 flex flex-col",
    isAppBuilder ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
  )}
>
```

**Context-based Scrolling:**
```tsx
// ScrollContainerContext for main content
// PageContentContext for page-specific content
// TableOfContents integrates with both
```

### Scroll Prevention

**Body Scroll Lock:**
```tsx
React.useEffect(() => {
  // Disable browser scroll restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }

  // Prevent body/html from scrolling
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'

  return () => {
    // Restore on cleanup
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  }
}, [])
```

## Universal Implementation Guide

### Step 1: Choose Your Content Pattern

Based on your application type, select the appropriate pattern:

```tsx
// For a task management app
const APP_CONFIG = {
  pattern: 'list-detail',
  primaryItems: ['inbox', 'today', 'projects'],
  secondaryType: 'filters',
  mainContentType: 'task-board'
}

// For a design tool
const APP_CONFIG = {
  pattern: 'creation',
  primaryItems: ['shapes', 'text', 'components'],
  secondaryType: 'tools',
  mainContentType: 'canvas'
}

// For analytics dashboard
const APP_CONFIG = {
  pattern: 'dashboard',
  primaryItems: ['overview', 'users', 'revenue'],
  secondaryType: 'filters',
  mainContentType: 'charts'
}
```

### Step 2: Set Up Core Layout Components

**Create the Layout Provider:**
```tsx
// src/contexts/LayoutContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

interface LayoutContextType {
  activePrimaryItem: string | null
  activeSecondaryItem: string | null
  secondaryContent: ReactNode | null
  isMobile: boolean
  setActivePrimaryItem: (item: string) => void
  setSecondaryContent: (content: ReactNode) => void
  toggleSecondarySidebar: () => void
}

const LayoutContext = createContext<LayoutContextType | null>(null)

export function LayoutProvider({ children, config }) {
  const [activePrimaryItem, setActivePrimaryItem] = useState(null)
  const [secondaryContent, setSecondaryContent] = useState(null)
  const [isMobile] = useDeviceType()

  const value = {
    activePrimaryItem,
    secondaryContent,
    isMobile,
    setActivePrimaryItem,
    setSecondaryContent,
    toggleSecondarySidebar: () => setSecondaryContent(null)
  }

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used within LayoutProvider')
  return context
}
```

**Create Layout Components:**
```tsx
// src/components/layout/Layout.tsx
export function Layout({ config, children }) {
  return (
    <LayoutProvider config={config}>
      <div className="flex h-screen bg-background">
        <PrimarySidebar config={config.primary} />
        <SecondarySidebar config={config.secondary} />
        <MainContent config={config.main}>
          {children}
        </MainContent>
      </div>
    </LayoutProvider>
  )
}
```

### Step 3: Implement Pattern-Specific Components

**For List-Detail Pattern:**
```tsx
// src/components/patterns/ListDetailPattern.tsx
export function ListDetailPattern({ config, data }) {
  const { setSecondaryContent, isMobile } = useLayout()

  const handlePrimarySelect = (itemId) => {
    const filteredData = filterData(data, itemId)
    const listComponent = (
      <DataList
        items={filteredData}
        onItemSelect={(item) => setSecondaryContent(
          <ItemDetailView item={item} />
        )}
      />
    )

    if (isMobile) {
      // Show as modal on mobile
      setSecondaryContent(
        <Sheet open={true} onOpenChange={() => setSecondaryContent(null)}>
          <SheetContent>{listComponent}</SheetContent>
        </Sheet>
      )
    } else {
      setSecondaryContent(listComponent)
    }
  }

  return (
    <PrimaryNavigation
      items={config.primaryItems}
      onSelect={handlePrimarySelect}
    />
  )
}
```

**For Creation Pattern:**
```tsx
// src/components/patterns/CreationPattern.tsx
export function CreationPattern({ config }) {
  const { setSecondaryContent } = useLayout()

  const handlePrimarySelect = (toolId) => {
    const paletteComponent = (
      <ToolPalette
        tools={config.toolPalette[toolId]}
        onToolSelect={(tool) => {
          // Add tool to canvas
          canvasActions.addTool(tool)
        }}
      />
    )

    setSecondaryContent(paletteComponent)
  }

  return (
    <>
      <PrimaryNavigation
        items={config.primaryTools}
        onSelect={handlePrimarySelect}
      />
      <Canvas workspaceType={config.workspaceType} />
      {config.propertiesPanel && <PropertiesPanel />}
    </>
  )
}
```

### Step 4: Configure Your Application

**Create App Configuration:**
```tsx
// src/config/appConfig.ts
export const APP_CONFIG = {
  // Application metadata
  name: 'My Dashboard App',
  version: '1.0.0',

  // Layout configuration
  layout: {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1440
    },
    dimensions: {
      primarySidebar: '22rem',
      secondarySidebar: '20rem',
      iconWidth: '3rem'
    }
  },

  // Content pattern
  pattern: 'list-detail', // or 'creation', 'dashboard', 'hierarchical'

  // Primary navigation items
  primaryNavigation: [
    { id: 'dashboard', label: 'Dashboard', icon: 'HomeIcon' },
    { id: 'projects', label: 'Projects', icon: 'FolderIcon' },
    { id: 'team', label: 'Team', icon: 'UsersIcon' },
    { id: 'settings', label: 'Settings', icon: 'SettingsIcon' }
  ],

  // Secondary content configuration
  secondaryContent: {
    type: 'filters', // 'filters', 'tools', 'navigation', 'properties'
    searchable: true,
    collapsible: true
  },

  // Main content configuration
  mainContent: {
    type: 'workspace', // 'workspace', 'canvas', 'dashboard'
    scrollable: true,
    header: true,
    footer: false
  }
}
```

### Step 5: Integrate with Your App

**Update Your Root Component:**
```tsx
// src/App.tsx
import { Layout } from '@/components/layout/Layout'
import { APP_CONFIG } from '@/config/appConfig'
import { DashboardView } from '@/views/DashboardView'
import { ProjectsView } from '@/views/ProjectsView'
// ... other views

function AppContent() {
  const { activePrimaryItem } = useLayout()

  switch (activePrimaryItem) {
    case 'dashboard':
      return <DashboardView />
    case 'projects':
      return <ProjectsView />
    case 'team':
      return <TeamView />
    case 'settings':
      return <SettingsView />
    default:
      return <DashboardView />
  }
}

export function App() {
  return (
    <Layout config={APP_CONFIG}>
      <AppContent />
    </Layout>
  )
}
```

### Step 6: Add Responsive Behavior

**Mobile Optimizations:**
```tsx
// src/hooks/useResponsiveLayout.ts
export function useResponsiveLayout() {
  const { isMobile, isTablet } = useDeviceType()
  const { setSecondaryContent } = useLayout()

  const adaptToMobile = (content) => {
    if (isMobile) {
      return (
        <Sheet>
          <SheetContent side="right" className="w-full">
            {content}
          </SheetContent>
        </Sheet>
      )
    }
    return content
  }

  const adaptNavigation = (navigation) => {
    if (isMobile) {
      return (
        <Drawer>
          <DrawerContent>
            {navigation}
          </DrawerContent>
        </Drawer>
      )
    }
    return navigation
  }

  return { adaptToMobile, adaptNavigation, isMobile, isTablet }
}
```

### Step 7: Testing & Validation

**Cross-Device Testing Checklist:**
- [ ] Desktop (1440px+): All panels visible, collapsible primary sidebar
- [ ] Tablet (768px-1024px): Primary sidebar icons-only, secondary overlay
- [ ] Mobile (<768px): Single panel, drawer navigation, modal secondary content
- [ ] Touch targets: Minimum 44px for mobile interactions
- [ ] Keyboard navigation: Tab order, shortcuts, focus management
- [ ] Content overflow: Proper scrolling in constrained layouts

## Future Scaling Considerations

### Modular Sidebar System

**Component Registry Pattern:**
```tsx
interface SidebarConfig {
  route: string
  component: React.ComponentType
  header?: React.ComponentType
  requiresAuth?: boolean
}

// Registry-based sidebar rendering
const sidebarConfigs: SidebarConfig[] = [
  { route: "/inbox", component: MailboxSidebar },
  { route: "/charts", component: TocSidebar },
  { route: "/app-builder", component: WidgetPalette },
]
```

### Advanced State Management

**Global Layout Context:**
```tsx
interface LayoutContextValue {
  primarySidebar: {
    collapsed: boolean
    width: number
  }
  secondarySidebar: {
    visible: boolean
    content: React.ReactNode
  }
  breadcrumbs: BreadcrumbItem[]
}

const LayoutContext = React.createContext<LayoutContextValue | null>(null)
```

### Performance Optimizations

**Lazy Loading Sidebars:**
```tsx
const LazyMailboxSidebar = React.lazy(() => import('./sidebars/MailboxSidebar'))
const LazyTocSidebar = React.lazy(() => import('./sidebars/TocSidebar'))

<Suspense fallback={<Skeleton />}>
  {isMailboxRoute && <LazyMailboxSidebar />}
  {isShowcaseRoute && <LazyTocSidebar />}
</Suspense>
```

### Accessibility Enhancements

**ARIA Landmark Pattern:**
```tsx
<aside aria-label="Primary navigation" role="navigation">
  {/* Primary sidebar */}
</aside>

<aside aria-label="Secondary content" role="complementary">
  {/* Secondary sidebar */}
</aside>

<main role="main" aria-label="Main content">
  {/* Main content */}
</main>
```

### Theme & Customization

**Dynamic Sidebar Widths:**
```tsx
const sidebarWidth = useThemePreference('sidebar.width') || '22rem'

style={{
  '--sidebar-width': sidebarWidth
}}
```

## Migration Guide

### From Single Sidebar to Multi-Level

1. Wrap existing sidebar in nested structure
2. Add collapsible behavior to primary sidebar
3. Implement conditional rendering for secondary content
4. Update responsive breakpoints
5. Add scroll container management

### From Fixed to Flexible Layout

1. Replace fixed widths with CSS variables
2. Implement flex-based layout
3. Add responsive breakpoints
4. Update z-index usage
5. Add scroll management

## Testing Strategy

### Layout Testing Checklist

- [ ] Desktop: All panels visible, collapsible
- [ ] Tablet: Primary sidebar icons, secondary overlay
- [ ] Mobile: Single panel, drawer navigation
- [ ] Keyboard: Tab navigation, shortcuts work
- [ ] Touch: Swipe gestures, touch targets adequate
- [ ] Performance: Smooth animations, no layout thrashing
- [ ] Accessibility: Screen readers, focus management

### Component Testing

```tsx
// Test responsive behavior
describe('AppSidebar', () => {
  it('shows secondary sidebar on desktop', () => {
    // Mock desktop viewport
    // Assert secondary sidebar visible
  })

  it('hides secondary sidebar on mobile', () => {
    // Mock mobile viewport
    // Assert secondary sidebar hidden
  })
})
```

## Universal Scaling Architecture

### Content-Agnostic Component Registry

**Plugin-Based Sidebar System:**
```tsx
interface SidebarPlugin {
  id: string
  name: string
  pattern: ContentPattern
  primaryItems: NavigationItem[]
  secondaryRenderer: (context: any) => React.ReactNode
  mainRenderer: (context: any) => React.ReactNode
  config: PluginConfig
}

// Registry for different application types
const PLUGIN_REGISTRY = {
  'email-client': emailPlugin,
  'task-manager': taskManagerPlugin,
  'design-tool': designToolPlugin,
  'analytics-dashboard': analyticsPlugin,
  'cms': contentManagementPlugin
}

// Dynamic layout based on plugin
function DynamicLayout({ pluginId, context }) {
  const plugin = PLUGIN_REGISTRY[pluginId]

  return (
    <LayoutProvider config={plugin.config}>
      <PrimarySidebar items={plugin.primaryItems} />
      <SecondarySidebar>
        {plugin.secondaryRenderer(context)}
      </SecondarySidebar>
      <MainContent>
        {plugin.mainRenderer(context)}
      </MainContent>
    </LayoutProvider>
  )
}
```

### Advanced State Management Patterns

**Universal Layout State:**
```tsx
interface UniversalLayoutState {
  // Navigation state
  navigation: {
    primary: string | null
    secondary: string | null
    breadcrumbs: BreadcrumbItem[]
  }

  // Content state
  content: {
    type: ContentType
    data: any
    filters: Record<string, any>
    selection: any[]
  }

  // UI state
  ui: {
    device: DeviceType
    theme: ThemeConfig
    preferences: UserPreferences
  }

  // Actions
  actions: {
    navigate: (primary: string, secondary?: string) => void
    updateFilters: (filters: Record<string, any>) => void
    selectItems: (items: any[]) => void
    toggleSidebar: (sidebar: 'primary' | 'secondary') => void
  }
}
```

### Performance Optimization Strategies

**Component Virtualization:**
```tsx
// For large lists in secondary sidebar
import { FixedSizeList as List } from 'react-window'

function VirtualizedItemList({ items, itemHeight = 50 }) {
  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={itemHeight}
    >
      {({ index, style }) => (
        <div style={style}>
          <ItemComponent item={items[index]} />
        </div>
      )}
    </List>
  )
}
```

**Lazy Loading by Pattern:**
```tsx
const PATTERN_COMPONENTS = {
  'list-detail': React.lazy(() => import('./patterns/ListDetailPattern')),
  'creation': React.lazy(() => import('./patterns/CreationPattern')),
  'dashboard': React.lazy(() => import('./patterns/DashboardPattern')),
  'hierarchical': React.lazy(() => import('./patterns/HierarchicalPattern'))
}

function LazyPatternRenderer({ pattern, ...props }) {
  const PatternComponent = PATTERN_COMPONENTS[pattern]

  return (
    <Suspense fallback={<PatternSkeleton />}>
      <PatternComponent {...props} />
    </Suspense>
  )
}
```

### Accessibility & Internationalization

**Universal ARIA Implementation:**
```tsx
function AccessibleLayout({ config }) {
  return (
    <div role="application" aria-label={config.name}>
      <aside
        role="navigation"
        aria-label="Primary navigation"
        aria-expanded={!config.collapsed}
      >
        <PrimarySidebar {...config.primary} />
      </aside>

      <aside
        role="complementary"
        aria-label={`${config.secondary.type} panel`}
        aria-hidden={config.isMobile && !config.secondary.open}
      >
        <SecondarySidebar {...config.secondary} />
      </aside>

      <main
        role="main"
        aria-label="Main content area"
        tabIndex={-1}
      >
        <MainContent {...config.main} />
      </main>
    </div>
  )
}
```

**Internationalization Support:**
```tsx
interface I18nLayoutConfig {
  locale: string
  direction: 'ltr' | 'rtl'
  translations: {
    navigation: Record<string, string>
    secondaryContent: Record<string, string>
    actions: Record<string, string>
  }
}

// RTL-aware layout adjustments
function RTLLayout({ children, direction }) {
  return (
    <div dir={direction} className={direction === 'rtl' ? 'rtl-layout' : ''}>
      {children}
    </div>
  )
}
```

### Theme & Customization System

**Dynamic Theming:**
```tsx
interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    sidebar: string
    background: string
  }
  spacing: {
    sidebarWidth: string
    contentPadding: string
  }
  typography: {
    fontFamily: string
    fontSize: string
  }
  animations: {
    duration: string
    easing: string
  }
}

function ThemedLayout({ theme, children }) {
  // Apply CSS variables dynamically
  useEffect(() => {
    Object.entries(theme).forEach(([category, values]) => {
      Object.entries(values).forEach(([key, value]) => {
        document.documentElement.style.setProperty(
          `--theme-${category}-${key}`,
          value
        )
      })
    })
  }, [theme])

  return <div className="themed-layout">{children}</div>
}
```

## Universal Migration Strategy

### Pattern Migration Matrix

| Current App Type | Recommended Pattern | Migration Steps |
|------------------|-------------------|-----------------|
| Email Client | List-Detail | 1. Extract message list to secondary sidebar<br>2. Convert primary nav to mailbox selector<br>3. Move message view to main content |
| Task Manager | List-Detail | 1. Primary: Today/Week/Projects<br>2. Secondary: Task filters & lists<br>3. Main: Task details & boards |
| Design Tool | Creation | 1. Primary: Tool categories<br>2. Secondary: Tool palettes<br>3. Main: Canvas workspace |
| Analytics | Dashboard | 1. Primary: Metric categories<br>2. Secondary: Date/filter controls<br>3. Main: Charts & visualizations |
| File Manager | Hierarchical | 1. Primary: Drive shortcuts<br>2. Secondary: Folder tree<br>3. Main: File content viewer |
| CMS | Hierarchical | 1. Primary: Content types<br>2. Secondary: Content list<br>3. Main: Content editor |

### Step-by-Step Migration Process

1. **Analyze Current Layout:**
   - Identify primary navigation items
   - Map secondary content/filtering
   - Determine main content type

2. **Choose Appropriate Pattern:**
   - Match against pattern matrix
   - Consider user workflows
   - Evaluate complexity vs. benefits

3. **Implement Core Layout:**
   - Set up LayoutProvider
   - Create responsive components
   - Configure breakpoints

4. **Migrate Content Components:**
   - Adapt existing components to new structure
   - Implement pattern-specific logic
   - Add responsive behavior

5. **Testing & Refinement:**
   - Cross-device testing
   - Performance optimization
   - User experience validation

## Quality Assurance Framework

### Automated Testing Suite

**Layout Component Tests:**
```tsx
describe('Universal Layout System', () => {
  describe('Responsive Behavior', () => {
    it('adapts to mobile layout', () => {
      // Mock mobile viewport
      const { result } = renderHook(() => useDeviceType(), {
        wrapper: ({ children }) => (
          <div style={{ width: '375px' }}>{children}</div>
        )
      })

      expect(result.current.isMobile).toBe(true)
    })

    it('maintains state across device changes', () => {
      // Test layout state persistence
    })
  })

  describe('Pattern Implementation', () => {
    it('renders list-detail pattern correctly', () => {
      const config = { pattern: 'list-detail' }
      render(<Layout config={config} />)

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('complementary')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(<AccessibleLayout config={mockConfig} />)

      expect(screen.getByLabelText('Primary navigation')).toBeInTheDocument()
      expect(screen.getByLabelText('Main content area')).toBeInTheDocument()
    })
  })
})
```

### Performance Benchmarks

**Layout Rendering Performance:**
- Desktop: < 16ms initial render
- Mobile: < 32ms initial render
- Sidebar transitions: < 8ms
- Content switches: < 50ms

### User Experience Metrics

**Key Performance Indicators:**
- Time to interactive: < 2 seconds
- Layout shift: < 0.1 cumulative
- Touch target accuracy: > 95%
- Keyboard navigation: Full WCAG compliance

## Conclusion

This universal three-panel layout system provides a **content-agnostic foundation** for building any dashboard-style application. The design patterns are proven, the implementation is flexible, and the architecture scales from simple prototypes to complex enterprise applications.

### Key Universal Principles:

1. **Content Pattern Matching**: Choose the right pattern for your content type
2. **Progressive Enhancement**: Desktop-first, mobile-optimized
3. **Component Modularity**: Reusable components across applications
4. **Responsive Consistency**: Same behavior patterns across devices
5. **Accessibility First**: WCAG compliance built-in
6. **Performance Focused**: Optimized for real-world usage
7. **Themeable & Customizable**: Adaptable to any design system

### Implementation Checklist:

- [ ] Choose appropriate content pattern
- [ ] Set up universal layout components
- [ ] Configure responsive breakpoints
- [ ] Implement pattern-specific logic
- [ ] Add accessibility features
- [ ] Test across devices and screen sizes
- [ ] Optimize for performance
- [ ] Document customizations

This system enables you to build the same architectural excellence across different applications, ensuring consistent user experience and developer productivity regardless of the underlying content or domain.