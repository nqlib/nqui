import { mockTOCItems, simpleTOCItems } from "@/mockdata/toc"

/**
 * Comprehensive mock data for Storybook stories
 * This file provides reusable mock data for all components
 */

// ============================================================================
// User Data
// ============================================================================

export interface MockUser {
  id: string
  name: string
  email: string
  avatar?: string
  initials?: string
  role: string
  status: "active" | "inactive" | "pending"
}

export const mockUsers: MockUser[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/john.jpg",
    initials: "JD",
    role: "Admin",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "/avatars/jane.jpg",
    initials: "JS",
    role: "User",
    status: "active",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    initials: "BJ",
    role: "Editor",
    status: "active",
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice@example.com",
    avatar: "/avatars/alice.jpg",
    initials: "AW",
    role: "Viewer",
    status: "inactive",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    initials: "CB",
    role: "User",
    status: "pending",
  },
]

// ============================================================================
// Navigation Data
// ============================================================================

export interface MockNavItem {
  title: string
  url: string
  icon?: string
  isActive?: boolean
  badge?: string | number
  children?: MockNavItem[]
}

export const mockNavItems: MockNavItem[] = [
  { title: "Home", url: "/", icon: "HomeIcon", isActive: true },
  { title: "Dashboard", url: "/dashboard", icon: "DashboardIcon", badge: "3" },
  { title: "Projects", url: "/projects", icon: "FolderIcon" },
  {
    title: "Settings",
    url: "/settings",
    icon: "SettingsIcon",
    children: [
      { title: "Profile", url: "/settings/profile" },
      { title: "Account", url: "/settings/account" },
      { title: "Preferences", url: "/settings/preferences" },
    ],
  },
  { title: "Help", url: "/help", icon: "HelpIcon" },
]

export const mockBreadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Button", href: "/components/button" },
]

// ============================================================================
// Form Data
// ============================================================================

export const mockFormData = {
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
  age: 30,
  country: "US",
  interests: ["coding", "design"],
  newsletter: true,
}

export const mockSelectOptions = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
]

export const mockRadioOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
]

export const mockCheckboxOptions = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Orange" },
  { value: "grape", label: "Grape" },
]

// ============================================================================
// Table Data
// ============================================================================

export interface MockTableRow {
  id: string
  name: string
  email: string
  role: string
  status: string
  date: string
  amount?: number
}

export const mockTableData: MockTableRow[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    date: "2024-01-15",
    amount: 1000,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
    date: "2024-01-14",
    amount: 500,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Editor",
    status: "Inactive",
    date: "2024-01-13",
    amount: 750,
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice@example.com",
    role: "Viewer",
    status: "Active",
    date: "2024-01-12",
    amount: 300,
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "User",
    status: "Pending",
    date: "2024-01-11",
    amount: 200,
  },
]

// ============================================================================
// Chart Data
// ============================================================================

export const mockChartData = {
  line: [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 450 },
    { name: "May", value: 600 },
    { name: "Jun", value: 550 },
  ],
  bar: [
    { category: "A", value: 100 },
    { category: "B", value: 200 },
    { category: "C", value: 150 },
    { category: "D", value: 250 },
    { category: "E", value: 180 },
  ],
  pie: [
    { name: "Category 1", value: 35 },
    { name: "Category 2", value: 25 },
    { name: "Category 3", value: 40 },
  ],
  area: [
    { name: "Q1", value: 1000 },
    { name: "Q2", value: 1200 },
    { name: "Q3", value: 1100 },
    { name: "Q4", value: 1300 },
  ],
}

// ============================================================================
// Content Data
// ============================================================================

// Re-export existing TOC data
export { mockTOCItems, simpleTOCItems }

// ============================================================================
// Component-Specific Data
// ============================================================================

export const mockBadgeLabels = ["New", "Hot", "Sale", "Featured", "Premium", "Pro"]

export const mockCardContent = {
  title: "Card Title",
  description: "This is a card description with some text that provides context about the card content.",
  footer: "Card Footer",
  image: "/images/card-placeholder.jpg",
}

export const mockToastMessages = [
  { title: "Success", description: "Operation completed successfully" },
  { title: "Error", description: "Something went wrong. Please try again." },
  { title: "Info", description: "Here is some information you should know." },
  { title: "Warning", description: "Please review this before proceeding." },
]

export const mockEmptyStates = {
  noData: {
    title: "No data",
    description: "There is no data to display at this time.",
  },
  noResults: {
    title: "No results",
    description: "Try adjusting your search or filter criteria.",
  },
  error: {
    title: "Error",
    description: "Failed to load data. Please try again later.",
  },
  empty: {
    title: "Empty",
    description: "This list is currently empty.",
  },
}

export const mockDialogContent = {
  title: "Confirm Action",
  description: "Are you sure you want to proceed with this action? This cannot be undone.",
  confirmText: "Confirm",
  cancelText: "Cancel",
}

export const mockTooltipContent = {
  default: "This is a tooltip",
  long: "This is a longer tooltip that provides more detailed information about the element.",
  short: "Info",
}

export const mockPaginationData = {
  currentPage: 1,
  totalPages: 10,
  itemsPerPage: 20,
  totalItems: 200,
}

// ============================================================================
// Mail/Message Data
// ============================================================================

export interface MockMail {
  id: string
  name: string
  email: string
  subject: string
  date: string
  teaser: string
  read?: boolean
}

export const mockMails: MockMail[] = [
  {
    id: "1",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Meeting Tomorrow",
    date: "09:34 AM",
    teaser: "Hi team, just a reminder about our meeting tomorrow at 10 AM.",
    read: false,
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alicesmith@example.com",
    subject: "Re: Project Update",
    date: "Yesterday",
    teaser: "Thanks for the update. The progress looks great so far.",
    read: true,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bobjohnson@example.com",
    subject: "Weekend Plans",
    date: "2 days ago",
    teaser: "Hey everyone! I'm thinking of organizing a team outing this weekend.",
    read: false,
  },
]

// ============================================================================
// Calendar Data
// ============================================================================

export const mockCalendarEvents = [
  {
    date: new Date(2024, 0, 15),
    title: "Team Meeting",
    description: "Weekly team sync",
  },
  {
    date: new Date(2024, 0, 20),
    title: "Project Deadline",
    description: "Final submission",
  },
  {
    date: new Date(2024, 0, 25),
    title: "Client Presentation",
    description: "Quarterly review",
  },
]

// ============================================================================
// Command Palette Data
// ============================================================================

export const mockCommands = [
  {
    id: "1",
    title: "Create New File",
    description: "Create a new file in the current directory",
    keywords: ["new", "file", "create"],
  },
  {
    id: "2",
    title: "Open Settings",
    description: "Open application settings",
    keywords: ["settings", "preferences", "config"],
  },
  {
    id: "3",
    title: "Search Files",
    description: "Search for files in the project",
    keywords: ["search", "find", "files"],
  },
]
