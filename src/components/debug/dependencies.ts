/**
 * Debug Tools Dependencies
 *
 * This file centralizes all external dependencies for the debug tools.
 * When extracting to a separate package, only this file needs to be updated.
 *
 * All imports should come from the main library index (@/index) when possible.
 */

// ============================================================================
// UI Components - Import from main index
// ============================================================================
export { Button } from "@/index"
export { Switch } from "@/index"
export { Label } from "@/index"
export { Slider } from "@/index"
export { Input } from "@/index"
export { Textarea } from "@/index"
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/index"
export { Tabs, TabsList, TabsTrigger, TabsContent } from "@/index"
export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/index"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/index"
export { ColorPicker } from "@/index"
export type { ColorPickerProps } from "@/index"

// ============================================================================
// Utilities - Import from lib/utils (not exported in index)
// ============================================================================
export { cn } from "@/lib/utils"

// ============================================================================
// Type Exports (if needed)
// ============================================================================
export type { ButtonProps } from "@/index"

