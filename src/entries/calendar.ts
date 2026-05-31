/**
 * Subpath export for Calendar components.
 * Use for smaller bundles when you only need Calendar.
 * Requires: react-day-picker, date-fns
 */
export { EnhancedCalendar as Calendar } from "../components/custom/enhanced-calendar"
export type { EnhancedCalendarProps as CalendarProps } from "../components/custom/enhanced-calendar"
export { Calendar as CoreCalendar, CalendarDayButton } from "../components/ui/calendar"
