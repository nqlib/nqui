/**
 * Components Index
 * Central export point for all UI components
 * Use this for selective imports to improve tree-shaking
 */

// ============================================================================
// Enhanced/Custom Components (exported as defaults)
// ============================================================================

// ScrollArea - Enhanced with fade mask
export { EnhancedScrollArea as ScrollArea, ScrollBar } from "./custom/enhanced-scroll-area"
export type { EnhancedScrollAreaProps as ScrollAreaProps } from "./custom/enhanced-scroll-area"

// Badge - Enhanced with button-like styling
export { EnhancedBadge as Badge, enhancedBadgeVariants as badgeVariants } from "./ui/badge"
export type { EnhancedBadgeProps as BadgeProps } from "./ui/badge"
// Core Badge (base shadcn version)
export { Badge as CoreBadge } from "./ui/badge"

// Button - Enhanced with meccs-ui styling (implementation: ui/button.tsx)
export { EnhancedButton as Button, enhancedButtonVariants as buttonVariants } from "./ui/button"
export type { EnhancedButtonProps as ButtonProps } from "./ui/button"
// Core Button (base shadcn version)
export { Button as CoreButton } from "./ui/button"

// Calendar - Enhanced with touch drag and hover preview
export { EnhancedCalendar as Calendar } from "./custom/enhanced-calendar"
export type { EnhancedCalendarProps as CalendarProps } from "./custom/enhanced-calendar"
// Core Calendar (base shadcn version)
export { Calendar as CoreCalendar, CalendarDayButton } from "./ui/calendar"

// Checkbox - Enhanced with animation variants
export { EnhancedCheckbox as Checkbox, checkboxVariants } from "./ui/checkbox"
export type { EnhancedCheckboxProps as CheckboxProps } from "./ui/checkbox"
// Core Checkbox (base Radix version)
export { Checkbox as CoreCheckbox } from "./ui/checkbox"

// Command Palette
export { CommandPalette } from "./custom/command-palette"
export type { CommandPaletteProps } from "./custom/command-palette"

// Dropdown Menu - Enhanced with button-like 3D effects
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./custom/enhanced-dropdown-menu"
// Core Dropdown Menu (base version)
export {
  DropdownMenu as CoreDropdownMenu,
  DropdownMenuTrigger as CoreDropdownMenuTrigger,
  DropdownMenuContent as CoreDropdownMenuContent,
  DropdownMenuItem as CoreDropdownMenuItem,
  DropdownMenuCheckboxItem as CoreDropdownMenuCheckboxItem,
  DropdownMenuRadioItem as CoreDropdownMenuRadioItem,
  DropdownMenuLabel as CoreDropdownMenuLabel,
  DropdownMenuSeparator as CoreDropdownMenuSeparator,
  DropdownMenuShortcut as CoreDropdownMenuShortcut,
  DropdownMenuGroup as CoreDropdownMenuGroup,
  DropdownMenuPortal as CoreDropdownMenuPortal,
  DropdownMenuSub as CoreDropdownMenuSub,
  DropdownMenuSubContent as CoreDropdownMenuSubContent,
  DropdownMenuSubTrigger as CoreDropdownMenuSubTrigger,
  DropdownMenuRadioGroup as CoreDropdownMenuRadioGroup,
} from "./ui/dropdown-menu"

// Combobox - Enhanced with button-like 3D effects (Form Input Component)
export {
  Combobox,
  ComboboxInput,
  ComboboxBadgeTrigger,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxContent,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxAnchor,
  ComboboxClear,
  useComboboxAnchor,
} from "./ui/combobox"
// Core Combobox (base version)
export {
  Combobox as CoreCombobox,
  ComboboxInput as CoreComboboxInput,
  ComboboxBadgeTrigger as CoreComboboxBadgeTrigger,
  ComboboxList as CoreComboboxList,
  ComboboxItem as CoreComboboxItem,
  ComboboxEmpty as CoreComboboxEmpty,
  ComboboxContent as CoreComboboxContent,
  ComboboxGroup as CoreComboboxGroup,
  ComboboxLabel as CoreComboboxLabel,
  ComboboxCollection as CoreComboboxCollection,
  ComboboxSeparator as CoreComboboxSeparator,
  ComboboxChips as CoreComboboxChips,
  ComboboxChip as CoreComboboxChip,
  ComboboxChipsInput as CoreComboboxChipsInput,
  ComboboxTrigger as CoreComboboxTrigger,
  ComboboxValue as CoreComboboxValue,
  ComboboxAnchor as CoreComboboxAnchor,
  ComboboxClear as CoreComboboxClear,
  useComboboxAnchor as CoreUseComboboxAnchor,
} from "./ui/combobox"

// Progress - Enhanced with block-based segmented design
export { EnhancedProgress as Progress } from "./custom/enhanced-progress"
export type { EnhancedProgressProps as ProgressProps } from "./custom/enhanced-progress"
// Core Progress (base Radix version)
export { Progress as CoreProgress } from "./ui/progress"

// Radio Group - Enhanced with variant support
export { EnhancedRadioGroup as RadioGroup, EnhancedRadioGroupItem as RadioGroupItem } from "./custom/enhanced-radio-group"
export type { EnhancedRadioGroupProps as RadioGroupProps, EnhancedRadioGroupItemProps as RadioGroupItemProps } from "./custom/enhanced-radio-group"
// Core Radio Group (base shadcn version)
export { RadioGroup as CoreRadioGroup, RadioGroupItem as CoreRadioGroupItem } from "./ui/radio-group"

// Color Picker - Enhanced component
export { ColorPicker } from "./custom/color-picker"
export type { ColorPickerProps } from "./custom/color-picker"

// Color Slider - Supporting component
export { ColorSlider } from "./custom/color-slider"
export type { ColorSliderProps } from "./custom/color-slider"

// Rating - Enhanced component based on meccs-ui slider rating variant
export { Rating } from "./custom/rating"
export type { RatingProps } from "./custom/rating"

// Tracker - Custom component for activity/status visualization
export { Tracker } from "./custom/tracker"
export type { TrackerProps, TrackerBlockProps } from "./custom/tracker"

// Select - Enhanced with button-like 3D effects
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./ui/select"
// Core Select (base version)
export {
  Select as CoreSelect,
  SelectGroup as CoreSelectGroup,
  SelectValue as CoreSelectValue,
  SelectTrigger as CoreSelectTrigger,
  SelectContent as CoreSelectContent,
  SelectLabel as CoreSelectLabel,
  SelectItem as CoreSelectItem,
  SelectSeparator as CoreSelectSeparator,
  SelectScrollUpButton as CoreSelectScrollUpButton,
  SelectScrollDownButton as CoreSelectScrollDownButton,
} from "./ui/select"

// Table of Contents
export { TableOfContents } from "./custom/table-of-contents"
export type { TOCItem, TableOfContentsProps } from "./custom/table-of-contents"

// Nqui Logo - Theme-aware logo component
export { NquiLogo } from "./custom/nqui-logo"
export type { NquiLogoProps } from "./custom/nqui-logo"

// Sonner (Toaster) — pill card-style, implementation in ui/sonner.tsx
export { Toaster, EnhancedSonner } from "./ui/sonner"
// Same component (API compatibility)
export { CoreToaster } from "./ui/sonner"

// Tabs - Enhanced with sliding indicator animation
export {
  EnhancedTabs as Tabs,
  EnhancedTabsList as TabsList,
  EnhancedTabsTrigger as TabsTrigger,
  EnhancedTabsContent as TabsContent,
} from "./custom/enhanced-tabs"
export type {
  EnhancedTabsProps as TabsProps,
  EnhancedTabsListProps as TabsListProps,
  EnhancedTabsTriggerProps as TabsTriggerProps,
  EnhancedTabsContentProps as TabsContentProps,
} from "./custom/enhanced-tabs"
// Core Tabs (base shadcn version)
export {
  Tabs as CoreTabs,
  TabsList as CoreTabsList,
  TabsTrigger as CoreTabsTrigger,
  TabsContent as CoreTabsContent,
} from "./ui/tabs"
export {
  InlineTabsList,
  InlineTabsTrigger,
  inlineTabsListClass,
  inlineTabsTriggerClass,
  inlineTabsPanelsClass,
  inlineTabsPanelsDemoClass,
} from "./custom/inline-tabs"

// ============================================================================
// Core UI Components (base shadcn components)
// ============================================================================

// Accordion
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion"

// Alert
export { Alert, AlertTitle, AlertDescription, AlertAction } from "./ui/alert"

// Alert Dialog
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog"

// Aspect Ratio
export { AspectRatio } from "./ui/aspect-ratio"

// Avatar
export { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"

// Breadcrumb
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./ui/breadcrumb"

// Button Group
export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants } from "./ui/button-group"

// Card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card"

// Carousel
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./ui/carousel"

// Collapsible
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible"

// Command
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./ui/command"

// Context Menu
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "./ui/context-menu"

// Dialog
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
} from "./ui/dialog"

// Drawer
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer"

// Empty
export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "./ui/empty"

// Field
export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle } from "./ui/field"

// Frosted Glass
export { FrostedGlass } from "./ui/frosted-glass"
export type { FrostedGlassProps } from "./ui/frosted-glass"

// Hover Card
export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "./ui/hover-card"

// Input
export { Input } from "./ui/input"

// Input Group
export { InputGroup, InputGroupText, InputGroupInput, InputGroupButton, InputGroupAddon, InputGroupTextarea } from "./ui/input-group"

// Input OTP
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./ui/input-otp"

// Item
export { Item, ItemMedia, ItemContent, ItemActions, ItemGroup, ItemSeparator, ItemTitle, ItemDescription, ItemHeader, ItemFooter } from "./ui/item"

// KBD
export { Kbd, KbdGroup } from "./ui/kbd"

// Label
export { Label } from "./ui/label"

// Menubar
export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
} from "./ui/menubar"

// Native Select
export { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./ui/native-select"

// Navigation Menu
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from "./ui/navigation-menu"

// Pagination
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationScroller,
  PaginationAdaptive,
} from "./ui/pagination"
export type { PaginationContentProps } from "./ui/pagination"

// Popover
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"

// Resizable
export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./ui/resizable"

// ScrollArea - Core version (enhanced version exported above as default)
export { ScrollArea as CoreScrollArea, ScrollBar as CoreScrollBar } from "./ui/scroll-area"

// Separator - Single component with variant support
export { Separator } from "./ui/separator"
export type { SeparatorProps, SeparatorVariant } from "./ui/separator"

// Sheet
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
} from "./ui/sheet"

// Sidebar
export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar"

// Skeleton
export { Skeleton } from "./ui/skeleton"

// Sortable
export {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "./ui/sortable"

// Slider
export { Slider, sliderTrackVariants, sliderThumbVariants } from "./ui/slider"

// Spinner
export { Spinner } from "./ui/spinner"

// Switch
export { Switch, switchVariants, switchThumbVariants } from "./ui/switch"
export type { SwitchProps } from "./ui/switch"

// Table (shadcn - core)
export {
  Table as CoreTable,
  TableHeader as CoreTableHeader,
  TableBody as CoreTableBody,
  TableFooter as CoreTableFooter,
  TableHead as CoreTableHead,
  TableRow as CoreTableRow,
  TableCell as CoreTableCell,
  TableCaption as CoreTableCaption,
} from "./ui/table"

// Table components (shadcn - direct exports for convenience)
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./ui/table"

// Textarea
export { Textarea } from "./ui/textarea"

// Toggle
export { Toggle, toggleVariants } from "./ui/toggle"

// Toggle Group
export { ToggleGroup, ToggleGroupItem, ToggleGroupSeparator } from "./ui/toggle-group"

// Tooltip
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip"

// Theme (next-themes; pair with ThemeProvider + enableSystem for “System” option)
export { ThemeToggle } from "./theme-toggle"
export { ThemeAppearanceMenu } from "./theme-appearance-menu"
export type { ThemeAppearanceMenuProps } from "./theme-appearance-menu"

// ============================================================================
// Debug Tools
// ============================================================================
export { DebugPanel, Magnifier, Crosshair, UITester } from "./debug"
export type { DebugPanelProps, MagnifierProps, CrosshairProps, UITesterProps } from "./debug"

// ============================================================================
// Utility Components
// ============================================================================
export { ErrorBoundary } from "./error-boundary"
export type { ErrorBoundaryProps, ErrorBoundaryState } from "./error-boundary"
