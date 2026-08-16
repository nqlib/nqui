const STYLE_ID = "nqui-enhanced-calendar-styles"

const ENHANCED_CALENDAR_CSS = `
.nqui-enhanced-calendar .rdp-day.rdp-range_start.rdp-range_end:not(.rdp-range_middle) {
  background-color: transparent !important;
}
.nqui-enhanced-calendar .rdp-day.rdp-range_start.rdp-range_end:not(.rdp-range_middle)::after {
  display: none !important;
}
.nqui-enhanced-calendar .rdp-day.range_start.range_end:not(.range_middle) {
  background-color: transparent !important;
}
.nqui-enhanced-calendar .rdp-day.range_start.range_end:not(.range_middle)::after {
  display: none !important;
}
.nqui-enhanced-calendar .rdp-day button * {
  pointer-events: none;
}
.nqui-enhanced-calendar .rdp-day button {
  pointer-events: auto;
}
.nqui-enhanced-calendar .rdp-day.day-range-preview-start:not([data-selected-single="true"]):not([data-range-start="true"]):not([data-range-end="true"]):not([data-range-middle="true"]) button {
  background-color: color-mix(in oklch, var(--primary) 50%, transparent) !important;
  color: var(--primary-foreground) !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-top-left-radius: var(--radius-md) !important;
  border-bottom-left-radius: var(--radius-md) !important;
}
.nqui-enhanced-calendar .rdp-day.day-range-preview-end:not([data-selected-single="true"]):not([data-range-start="true"]):not([data-range-end="true"]):not([data-range-middle="true"]) button {
  background-color: color-mix(in oklch, var(--primary) 50%, transparent) !important;
  color: var(--primary-foreground) !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-top-right-radius: var(--radius-md) !important;
  border-bottom-right-radius: var(--radius-md) !important;
}
.nqui-enhanced-calendar .rdp-day.day-range-preview-middle:not([data-selected-single="true"]):not([data-range-start="true"]):not([data-range-end="true"]):not([data-range-middle="true"]) button {
  background-color: color-mix(in oklch, var(--primary) 50%, transparent) !important;
  color: var(--primary-foreground) !important;
  border-radius: 0 !important;
}
.nqui-enhanced-calendar[data-range-complete] [data-range-start="true"],
.nqui-enhanced-calendar[data-range-complete] [data-range-end="true"] {
  cursor: ew-resize;
  touch-action: none;
}
.nqui-enhanced-calendar[data-touch-drag] {
  touch-action: none;
}
.nqui-enhanced-calendar[data-range-resizing] {
  user-select: none;
}
.nqui-enhanced-calendar[data-range-resizing] .rdp-range_start::before,
.nqui-enhanced-calendar[data-range-resizing] .rdp-range_start::after,
.nqui-enhanced-calendar[data-range-resizing] .rdp-range_end::before,
.nqui-enhanced-calendar[data-range-resizing] .rdp-range_end::after,
.nqui-enhanced-calendar[data-range-resizing] .rdp-range_middle::before,
.nqui-enhanced-calendar[data-range-resizing] .rdp-range_middle::after {
  display: none !important;
}
.nqui-enhanced-calendar[data-range-resizing] [data-range-start="true"],
.nqui-enhanced-calendar[data-range-resizing] [data-range-end="true"],
.nqui-enhanced-calendar[data-range-resizing] [data-range-middle="true"] {
  background-color: transparent !important;
  color: inherit !important;
}
.nqui-enhanced-calendar[data-range-resizing] .rdp-day.day-range-preview-start button,
.nqui-enhanced-calendar[data-range-resizing] .rdp-day.day-range-preview-middle button,
.nqui-enhanced-calendar[data-range-resizing] .rdp-day.day-range-preview-end button {
  background-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
}
.nqui-enhanced-calendar[data-range-resizing] .rdp-day.day-range-preview-start button {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-top-left-radius: var(--radius-md) !important;
  border-bottom-left-radius: var(--radius-md) !important;
}
.nqui-enhanced-calendar[data-range-resizing] .rdp-day.day-range-preview-middle button {
  border-radius: 0 !important;
}
.nqui-enhanced-calendar[data-range-resizing] .rdp-day.day-range-preview-end button {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-top-right-radius: var(--radius-md) !important;
  border-bottom-right-radius: var(--radius-md) !important;
}
`

let injected = false

export function ensureEnhancedCalendarStyles() {
  if (injected || typeof document === "undefined") return
  if (document.getElementById(STYLE_ID)) {
    injected = true
    return
  }
  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = ENHANCED_CALENDAR_CSS
  document.head.appendChild(style)
  injected = true
}
