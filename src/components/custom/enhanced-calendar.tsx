import * as React from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { startOfDay, isSameDay, isAfter, isBefore } from "date-fns";
import { Calendar as CoreCalendar } from "@/components/ui/calendar";
import { useDetectTouch } from "@/hooks/use-detect-touch";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Enable touch drag functionality for range selection on touch devices
   * Only works when mode="range"
   */
  touchDragEnabled?: boolean;
};

const DRAG_THRESHOLD_PX = 4

function parseIsoDate(iso: string): Date | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function elementAtPoint(x: number, y: number): Element | null {
  if (typeof document.elementFromPoint !== "function") return null
  return document.elementFromPoint(x, y)
}

function findDayButton(root: Element, target: EventTarget | null): HTMLElement | null {
  if (!target || !(target instanceof Element)) return null
  const button = target.closest("button[data-iso-date], button.rdp-day")
  if (!button || !root.contains(button)) return null
  return button as HTMLElement
}

function getDateFromDayButton(element: HTMLElement): Date | null {
  const iso = element.getAttribute("data-iso-date")
  if (iso) {
    const parsed = parseIsoDate(iso)
    if (parsed) return parsed
  }

  const ariaLabel = element.getAttribute("aria-label")
  if (ariaLabel) {
    const dateMatch = ariaLabel.match(/(?:Choose\s+)?\w+,\s+(\w+)\s+(\d+),?\s+(\d{4})/i)
    if (dateMatch) {
      const [, monthName, day, year] = dateMatch
      const tempDate = new Date(`${monthName} 1, ${year}`)
      if (!Number.isNaN(tempDate.getTime())) {
        return new Date(Number(year), tempDate.getMonth(), Number(day))
      }
    }
  }

  const nameAttr = element.getAttribute("name")
  if (nameAttr?.startsWith("day-")) {
    const parsed = new Date(nameAttr.replace("day-", ""))
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  return null
}

function endpointKind(button: HTMLElement): "from" | "to" | null {
  const start = button.getAttribute("data-range-start") === "true"
  const end = button.getAttribute("data-range-end") === "true"
  if (start && end) return null
  if (start) return "from"
  if (end) return "to"
  return null
}

function isCompleteRange(range: { from?: Date; to?: Date } | null) {
  return Boolean(range?.from && range?.to && !isSameDay(range.from, range.to))
}

type RangeOnSelect = (
  next: DateRange | undefined,
  selectedDay: Date,
  activeModifiers: Record<string, boolean>,
  e?: React.MouseEvent | React.KeyboardEvent
) => void

function commitRange(
  onSelect: RangeOnSelect | undefined,
  range: DateRange,
  selectedDay: Date
) {
  onSelect?.(range, selectedDay, {}, undefined)
}

/**
 * Enhanced Calendar with touch drag and hover preview features
 *
 * Features:
 * - Touch drag for range selection on mobile/touch devices (when mode="range" and touchDragEnabled=true)
 * - Hover preview for range selection on desktop (when mode="range")
 * - Drag a completed range's start or end to resize (click without moving still resets)
 */
export function EnhancedCalendar({
  touchDragEnabled = false,
  ...props
}: EnhancedCalendarProps) {
  const isTouch = useDetectTouch();
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const rangeRef = React.useRef<{ from?: Date; to?: Date } | null>(null);
  const onSelectRef = React.useRef<RangeOnSelect | undefined>(undefined);
  const dragCurrentRef = React.useRef<Date | null>(null);

  // State for hover preview and touch drag
  const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>();
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartDate, setDragStartDate] = React.useState<Date | null>(null);
  const [dragCurrentDate, setDragCurrentDate] = React.useState<Date | null>(null);


  const isRangeMode = props.mode === "range";
  const selectedRange = isRangeMode && props.selected && typeof props.selected === "object" && "from" in props.selected
    ? props.selected as { from?: Date; to?: Date }
    : null;
  rangeRef.current = selectedRange;
  onSelectRef.current =
    "onSelect" in props && typeof props.onSelect === "function"
      ? (props.onSelect as RangeOnSelect)
      : undefined;
  const rangeComplete = isCompleteRange(selectedRange);

  // Check if from and to are the same date (treat as "only start selected" for preview)
  const isSameDateRange = selectedRange?.from && selectedRange?.to && isSameDay(selectedRange.from, selectedRange.to);
  const effectiveSelectedRange = isSameDateRange
    ? { from: selectedRange.from, to: undefined as Date | undefined }
    : selectedRange;


  // Touch drag range calculation
  const dragRange = React.useMemo(() => {
    if (!isDragging || !dragStartDate || !dragCurrentDate) return null;

    const start = startOfDay(dragStartDate);
    const end = startOfDay(dragCurrentDate);

    return start <= end ? { from: start, to: end } : { from: end, to: start };
  }, [isDragging, dragStartDate, dragCurrentDate]);

  // Preview range calculation for hover and drag
  const displayedStartDate = React.useMemo(() => {
    if (isDragging && dragRange) {
      return dragRange.from;
    }

    // Backward selection: no from, but has to
    if (!effectiveSelectedRange?.from && effectiveSelectedRange?.to && hoveredDate && !isSameDay(hoveredDate, effectiveSelectedRange.to)) {
      return hoveredDate;
    }

    // Backward selection: has from, but hovered is before from
    if (effectiveSelectedRange?.from && !effectiveSelectedRange?.to && hoveredDate && isBefore(hoveredDate, effectiveSelectedRange.from) && !isSameDay(hoveredDate, effectiveSelectedRange.from)) {
      return hoveredDate;
    }

    // Forward selection: has from, hovered is after from - use selected from as start
    if (effectiveSelectedRange?.from && !effectiveSelectedRange?.to && hoveredDate && isAfter(hoveredDate, effectiveSelectedRange.from) && !isSameDay(hoveredDate, effectiveSelectedRange.from)) {
      return startOfDay(effectiveSelectedRange.from);
    }

    // Normal case: return selected from if exists
    return effectiveSelectedRange?.from ? startOfDay(effectiveSelectedRange.from) : undefined;
  }, [isDragging, dragRange, effectiveSelectedRange, hoveredDate, isSameDateRange]);

  const displayedEndDate = React.useMemo(() => {
    if (isDragging && dragRange) {
      return dragRange.to;
    }

    if (!effectiveSelectedRange?.from && effectiveSelectedRange?.to && hoveredDate && !isSameDay(hoveredDate, effectiveSelectedRange.to)) {
      return effectiveSelectedRange.to;
    }

    if (effectiveSelectedRange?.from && !effectiveSelectedRange?.to && hoveredDate && isBefore(hoveredDate, effectiveSelectedRange.from) && !isSameDay(hoveredDate, effectiveSelectedRange.from)) {
      return effectiveSelectedRange.from;
    }

    if (!effectiveSelectedRange?.to && effectiveSelectedRange?.from && hoveredDate && isAfter(hoveredDate, effectiveSelectedRange.from) && !isSameDay(hoveredDate, effectiveSelectedRange.from)) {
      return hoveredDate;
    }

    return effectiveSelectedRange?.to ? startOfDay(effectiveSelectedRange.to) : undefined;
  }, [isDragging, dragRange, effectiveSelectedRange, hoveredDate, isSameDateRange]);

  // Helper functions for preview range detection.
  // During endpoint resize, keep DayPicker `selected` stable and paint the
  // live range with these modifiers so cell geometry does not chase the pointer.
  const isPreviewStartDate = (date: Date) => {
    if (!displayedStartDate || !displayedEndDate) {
      return false;
    }
    if (isSameDay(displayedStartDate, displayedEndDate)) return false;

    const isStart = isSameDay(date, displayedStartDate) && isBefore(date, displayedEndDate);
    if (!isStart) return false;

    if (!isDragging && effectiveSelectedRange?.from && effectiveSelectedRange?.to && isSameDay(date, effectiveSelectedRange.from)) {
      return false;
    }

    return true;
  };

  const isPreviewMiddleDate = (date: Date) => {
    if (!displayedStartDate || !displayedEndDate) return false;

    if (isAfter(date, displayedStartDate) && isBefore(date, displayedEndDate)) {
      if (!isDragging && effectiveSelectedRange?.from && effectiveSelectedRange?.to) {
        if (isAfter(date, effectiveSelectedRange.from) && isBefore(date, effectiveSelectedRange.to)) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  const isPreviewEndDate = (date: Date) => {
    if (!displayedEndDate || !displayedStartDate) return false;
    if (isSameDay(displayedStartDate, displayedEndDate)) return false;

    const isEnd = isSameDay(date, displayedEndDate) && isAfter(date, displayedStartDate);
    if (!isEnd) return false;

    if (!isDragging && effectiveSelectedRange?.from && effectiveSelectedRange?.to && isSameDay(date, effectiveSelectedRange.to)) {
      return false;
    }

    return true;
  };

  // Grab start/end of a completed range and drag to resize. Click without
  // moving still falls through to DayPicker (reset / new range).
  React.useEffect(() => {
    if (!isRangeMode) return
    const root = calendarRef.current
    if (!root) return

    type Gesture = {
      pointerId: number
      startX: number
      startY: number
      anchor: Date
      resizing: boolean
      lastDay: Date | null
    }

    let gesture: Gesture | null = null

    const dayFromEvent = (event: PointerEvent) => {
      const fromPoint = elementAtPoint(event.clientX, event.clientY)
      const button =
        findDayButton(root, fromPoint) ?? findDayButton(root, event.target)
      if (!button || button.hasAttribute("disabled") || button.classList.contains("day-disabled")) {
        return null
      }
      const date = getDateFromDayButton(button)
      if (!date) return null
      // Stay on the last day while the pointer is on a cell edge so adjacent
      // days cannot fight over hit-testing.
      const rect = button.getBoundingClientRect()
      const inset = 4
      if (rect.width > inset * 2 && rect.height > inset * 2) {
        const inside =
          event.clientX >= rect.left + inset &&
          event.clientX <= rect.right - inset &&
          event.clientY >= rect.top + inset &&
          event.clientY <= rect.bottom - inset
        if (!inside && gesture?.lastDay) {
          return gesture.lastDay
        }
      }
      return date
    }

    const finish = () => {
      if (gesture) {
        try {
          root.releasePointerCapture(gesture.pointerId)
        } catch {
          // jsdom / pointer already released
        }
      }
      document.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerup", onPointerUp)
      document.removeEventListener("pointercancel", onPointerUp)
      gesture = null
      dragCurrentRef.current = null
      setIsDragging(false)
      setDragStartDate(null)
      setDragCurrentDate(null)
      root.removeAttribute("data-range-resizing")
    }

    const onPointerDown = (event: PointerEvent) => {
      if ((event.button ?? 0) !== 0) return
      if (!isCompleteRange(rangeRef.current)) return
      const button = findDayButton(root, event.target)
      if (!button) return
      const kind = endpointKind(button)
      if (!kind) return
      const range = rangeRef.current
      const anchor = kind === "from" ? range?.to : range?.from
      if (!anchor) return

      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        anchor: startOfDay(anchor),
        resizing: false,
        lastDay: null,
      }
      // Keep the endpoint from taking focus so a ring/outline does not stick
      // on the old (or new) selected day after a pointer drag.
      event.preventDefault()
      document.addEventListener("pointermove", onPointerMove)
      document.addEventListener("pointerup", onPointerUp)
      document.addEventListener("pointercancel", onPointerUp)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return
      const dx = event.clientX - gesture.startX
      const dy = event.clientY - gesture.startY
      if (!gesture.resizing) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
        gesture.resizing = true
        dragCurrentRef.current = gesture.anchor
        setIsDragging(true)
        setDragStartDate(gesture.anchor)
        setDragCurrentDate(gesture.anchor)
        setHoveredDate(undefined)
        root.setAttribute("data-range-resizing", "")
        try {
          root.setPointerCapture(event.pointerId)
        } catch {
          // jsdom / older browsers
        }
      }

      event.preventDefault()
      const date = dayFromEvent(event)
      if (!date) return
      const next = startOfDay(date)
      if (gesture.lastDay && isSameDay(next, gesture.lastDay)) return
      gesture.lastDay = next
      dragCurrentRef.current = next
      setDragCurrentDate(next)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return
      const didResize = gesture.resizing
      const anchor = gesture.anchor
      const current = dragCurrentRef.current ?? anchor
      finish()

      if (!didResize) return

      event.preventDefault()
      const start = startOfDay(anchor)
      const end = startOfDay(current)
      const finalRange = start <= end ? { from: start, to: end } : { from: end, to: start }
      commitRange(onSelectRef.current, finalRange, end)
      const active = document.activeElement
      if (active instanceof HTMLElement && root.contains(active)) {
        active.blur()
      }
      root.addEventListener(
        "click",
        (clickEvent) => {
          clickEvent.preventDefault()
          clickEvent.stopPropagation()
        },
        { capture: true, once: true }
      )
    }

    root.addEventListener("pointerdown", onPointerDown, true)

    return () => {
      root.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerup", onPointerUp)
      document.removeEventListener("pointercancel", onPointerUp)
    }
  }, [isRangeMode])

  // Touch drag paints a new range from any day. Endpoint drags are owned above.
  React.useEffect(() => {
    if (!isRangeMode || !touchDragEnabled || !isTouch || !calendarRef.current) return;

    const calendarElement = calendarRef.current;
    let touchStartDate: Date | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const button = findDayButton(calendarElement, e.target);
      if (!button || button.classList.contains('day-disabled') || button.hasAttribute('disabled')) {
        return;
      }

      if (isCompleteRange(rangeRef.current) && endpointKind(button)) {
        return;
      }

      const date = getDateFromDayButton(button);
      if (!date) return;

      touchStartDate = date;
      dragCurrentRef.current = date;
      setIsDragging(true);
      setDragStartDate(date);
      setDragCurrentDate(date);
      setHoveredDate(undefined);

      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartDate) return;

      const touch = e.touches[0];
      if (!touch) return;

      const elementUnderTouch = elementAtPoint(touch.clientX, touch.clientY);
      const button = findDayButton(calendarElement, elementUnderTouch);

      if (button) {
        const date = getDateFromDayButton(button);
        if (date) {
          dragCurrentRef.current = date;
          setDragCurrentDate(date);
        }
      }

      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartDate) {
        setIsDragging(false);
        setDragStartDate(null);
        setDragCurrentDate(null);
        touchStartDate = null;
        return;
      }

      const touch = e.changedTouches[0];
      const elementUnderTouch = touch
        ? elementAtPoint(touch.clientX, touch.clientY)
        : null;
      const button = findDayButton(calendarElement, elementUnderTouch);

      let endDate = dragCurrentRef.current || touchStartDate;

      if (button) {
        const date = getDateFromDayButton(button);
        if (date) endDate = date;
      }

      if (touchStartDate && endDate) {
        const start = startOfDay(touchStartDate);
        const end = startOfDay(endDate);
        const finalRange = start <= end ? { from: start, to: end } : { from: end, to: start };
        commitRange(onSelectRef.current, finalRange, finalRange.from ?? endDate);
      }

      dragCurrentRef.current = null;
      setIsDragging(false);
      setDragStartDate(null);
      setDragCurrentDate(null);
      touchStartDate = null;
    };

    calendarElement.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
    calendarElement.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    calendarElement.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
    calendarElement.addEventListener('touchcancel', handleTouchEnd as EventListener, { passive: true });

    return () => {
      calendarElement.removeEventListener('touchstart', handleTouchStart as EventListener);
      calendarElement.removeEventListener('touchmove', handleTouchMove as EventListener);
      calendarElement.removeEventListener('touchend', handleTouchEnd as EventListener);
      calendarElement.removeEventListener('touchcancel', handleTouchEnd as EventListener);
    };
  }, [isRangeMode, touchDragEnabled, isTouch]);

  // Base modifiers plus preview modifiers
  const baseModifiers: Record<string, (date: Date) => boolean> = {
    ...(props.modifiers || {}),
    'range-preview-start': isPreviewStartDate,
    'range-preview-middle': isPreviewMiddleDate,
    'range-preview-end': isPreviewEndDate,
  };


  // Base classNames plus preview classNames for modifiers
  const enhancedModifiersClassNames = {
    ...(props.modifiersClassNames || {}),
    'range-preview-start': "day-range-preview-start",
    'range-preview-middle': "day-range-preview-middle",
    'range-preview-end': "day-range-preview-end",
  };

  return (
    <>
      <style>{`
        /* Remove muted background from range_start when only "from" is selected (no "to" yet) */
        /* The subtle square gray background appears because range_start has bg-muted on the cell */
        /* Note: react-day-picker uses rdp- prefix for modifier classes */
        /* When only "from" is selected, react-day-picker applies both rdp-range_start and rdp-range_end to the same cell */
        /* The square on the left half is from the range_end class's ::after pseudo-element */
        /* So we target cells that have both range_start AND range_end on the same cell (single date selection) */
        .rdp-day.rdp-range_start.rdp-range_end:not(.rdp-range_middle) {
          background-color: transparent !important;
        }

        /* Hide the ::after pseudo-element from range_end when only "from" is selected */
        /* The range_end class creates a ::after with after:left-0 that shows as a square on the left */
        .rdp-day.rdp-range_start.rdp-range_end:not(.rdp-range_middle)::after {
          display: none !important;
        }

        /* Alternative selector - also target without rdp- prefix in case classes are applied both ways */
        .rdp-day.range_start.range_end:not(.range_middle) {
          background-color: transparent !important;
        }
        .rdp-day.range_start.range_end:not(.range_middle)::after {
          display: none !important;
        }

        /* Ensure entire day cell is hoverable - prevent pointer events on children from blocking hover */
        /* Make all children inside the button non-interactive so hover works on entire button area */
        .rdp-day button * {
          pointer-events: none;
        }
        /* Ensure button itself captures all pointer events */
        .rdp-day button {
          pointer-events: auto;
        }

        /* Preview range styling - 50% opacity for preview backgrounds */
        /* Target the button element directly (not ::before) */
        .rdp-day.day-range-preview-start:not([data-selected-single="true"]):not([data-range-start="true"]):not([data-range-end="true"]):not([data-range-middle="true"]) button {
          background-color: color-mix(in oklch, var(--primary) 50%, transparent) !important;
          color: var(--primary-foreground) !important;
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          border-top-left-radius: var(--radius-md) !important;
          border-bottom-left-radius: var(--radius-md) !important;
        }

        .rdp-day.day-range-preview-end:not([data-selected-single="true"]):not([data-range-start="true"]):not([data-range-end="true"]):not([data-range-middle="true"]) button {
          background-color: color-mix(in oklch, var(--primary) 50%, transparent) !important;
          color: var(--primary-foreground) !important;
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-top-right-radius: var(--radius-md) !important;
          border-bottom-right-radius: var(--radius-md) !important;
        }

        .rdp-day.day-range-preview-middle:not([data-selected-single="true"]):not([data-range-start="true"]):not([data-range-end="true"]):not([data-range-middle="true"]) button {
          background-color: color-mix(in oklch, var(--primary) 50%, transparent) !important;
          color: var(--primary-foreground) !important;
          border-radius: 0 !important;
        }

        [data-range-complete] [data-range-start="true"],
        [data-range-complete] [data-range-end="true"] {
          cursor: ew-resize;
          touch-action: none;
        }
        [data-range-resizing] {
          user-select: none;
        }
        /* DayPicker keeps a "focused" day after pointer interaction. The 2px
           ring reads as a stray outline on the selected date after resize. */
        .rdp-day button:not(:focus-visible) {
          box-shadow: none;
        }
        /* Keep committed DayPicker range visually off while the live preview paints. */
        [data-range-resizing] .rdp-range_start::before,
        [data-range-resizing] .rdp-range_start::after,
        [data-range-resizing] .rdp-range_end::before,
        [data-range-resizing] .rdp-range_end::after,
        [data-range-resizing] .rdp-range_middle::before,
        [data-range-resizing] .rdp-range_middle::after {
          display: none !important;
        }
        [data-range-resizing] [data-range-start="true"],
        [data-range-resizing] [data-range-end="true"],
        [data-range-resizing] [data-range-middle="true"] {
          background-color: transparent !important;
          color: inherit !important;
        }
        [data-range-resizing] .rdp-day.day-range-preview-start button,
        [data-range-resizing] .rdp-day.day-range-preview-middle button,
        [data-range-resizing] .rdp-day.day-range-preview-end button {
          background-color: var(--primary) !important;
          color: var(--primary-foreground) !important;
        }
        [data-range-resizing] .rdp-day.day-range-preview-start button {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          border-top-left-radius: var(--radius-md) !important;
          border-bottom-left-radius: var(--radius-md) !important;
        }
        [data-range-resizing] .rdp-day.day-range-preview-middle button {
          border-radius: 0 !important;
        }
        [data-range-resizing] .rdp-day.day-range-preview-end button {
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-top-right-radius: var(--radius-md) !important;
          border-bottom-right-radius: var(--radius-md) !important;
        }
      `}</style>
      <div ref={calendarRef} {...(rangeComplete ? { "data-range-complete": "" } : {})}>
        <CoreCalendar
          {...props}
          modifiers={baseModifiers}
          modifiersClassNames={enhancedModifiersClassNames}
          onDayMouseEnter={(date, ...args) => {
            if (isRangeMode) {
              setHoveredDate(date);
            }
            props.onDayMouseEnter?.(date, ...args);
          }}
          onDayMouseLeave={(date, ...args) => {
            if (isRangeMode) {
              setHoveredDate(undefined);
            }
            props.onDayMouseLeave?.(date, ...args);
          }}
        />
      </div>
    </>
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";