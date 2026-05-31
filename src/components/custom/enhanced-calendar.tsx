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

/**
 * Enhanced Calendar with touch drag and hover preview features
 *
 * Features:
 * - Touch drag for range selection on mobile/touch devices (when mode="range" and touchDragEnabled=true)
 * - Hover preview for range selection on desktop (when mode="range")
 */
export function EnhancedCalendar({
  touchDragEnabled = false,
  ...props
}: EnhancedCalendarProps) {
  const isTouch = useDetectTouch();
  const calendarRef = React.useRef<HTMLDivElement>(null);

  // State for hover preview and touch drag
  const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>();
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartDate, setDragStartDate] = React.useState<Date | null>(null);
  const [dragCurrentDate, setDragCurrentDate] = React.useState<Date | null>(null);


  const isRangeMode = props.mode === "range";
  const selectedRange = isRangeMode && props.selected && typeof props.selected === "object" && "from" in props.selected
    ? props.selected as { from?: Date; to?: Date }
    : null;

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

  // Helper functions for preview range detection
  const isPreviewStartDate = (date: Date) => {
    if (!displayedStartDate || !displayedEndDate) {
      return false;
    }
    if (isSameDay(displayedStartDate, displayedEndDate)) return false;

    const isStart = isSameDay(date, displayedStartDate) && isBefore(date, displayedEndDate);

    if (effectiveSelectedRange?.from && effectiveSelectedRange?.to && isSameDay(date, effectiveSelectedRange.from)) {
      return false;
    }

    return isStart;
  };

  const isPreviewMiddleDate = (date: Date) => {
    if (!displayedStartDate || !displayedEndDate) return false;

    if (isAfter(date, displayedStartDate) && isBefore(date, displayedEndDate)) {
      if (effectiveSelectedRange?.from && effectiveSelectedRange?.to) {
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

    if (effectiveSelectedRange?.from && effectiveSelectedRange?.to && isSameDay(date, effectiveSelectedRange.to)) {
      return false;
    }

    return isEnd;
  };

  // Touch drag functionality - only enabled when range mode and touch drag is enabled
  React.useEffect(() => {
    if (!isRangeMode || !touchDragEnabled || !isTouch || !calendarRef.current) return;

    const calendarElement = calendarRef.current.querySelector('.rdp');
    if (!calendarElement) return;

    // Helper to get date from DOM element
    const getDateFromElement = (element: HTMLElement): Date | null => {
      const ariaLabel = element.getAttribute('aria-label');
      const nameAttr = element.getAttribute('name');
      const dataDate = element.getAttribute('data-date');

      if (ariaLabel) {
        const dateMatch = ariaLabel.match(/(?:Choose\s+)?\w+,\s+(\w+)\s+(\d+),?\s+(\d{4})/i);
        if (dateMatch) {
          const [, monthName, day, year] = dateMatch;
          try {
            const tempDate = new Date(`${monthName} 1, ${year}`);
            if (!isNaN(tempDate.getTime())) {
              const monthIndex = tempDate.getMonth();
              return new Date(parseInt(year), monthIndex, parseInt(day));
            }
          } catch {
            // Ignore parsing errors
          }
        }
      }

      if (nameAttr && nameAttr.startsWith('day-')) {
        const isoDateStr = nameAttr.replace('day-', '');
        const parsed = new Date(isoDateStr);
        if (!isNaN(parsed.getTime())) return parsed;
      }

      if (dataDate) {
        const parsed = new Date(dataDate);
        if (!isNaN(parsed.getTime())) return parsed;
      }

      return null;
    };

    // Helper to find day button from touch target
    const findDayButton = (target: EventTarget | null): HTMLElement | null => {
      if (!target) return null;
      let element = target as HTMLElement;

      while (element && element !== calendarElement) {
        if (element.classList.contains('rdp-day') && element.tagName === 'BUTTON') {
          return element;
        }
        element = element.parentElement as HTMLElement;
      }

      return null;
    };

    let touchStartDate: Date | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const button = findDayButton(e.target);
      if (!button || button.classList.contains('day-disabled') || button.hasAttribute('disabled')) {
        return;
      }

      const date = getDateFromElement(button);
      if (!date) return;

      touchStartDate = date;
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

      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      const button = findDayButton(elementUnderTouch);

      if (button) {
        const date = getDateFromElement(button);
        if (date) {
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
      if (!touch) {
        setIsDragging(false);
        setDragStartDate(null);
        setDragCurrentDate(null);
        return;
      }

      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      const button = findDayButton(elementUnderTouch);

      let endDate = dragCurrentDate || touchStartDate;

      if (button) {
        const date = getDateFromElement(button);
        if (date) endDate = date;
      }

      if (touchStartDate && endDate) {
        const start = startOfDay(touchStartDate);
        const end = startOfDay(endDate);
        const finalRange = start <= end ? { from: start, to: end } : { from: end, to: start };

        if (props.onSelect && typeof props.onSelect === "function") {
          const onRangeSelect = props.onSelect as (
            range: DateRange | undefined,
            selectedDay: Date,
            activeModifiers: Record<string, boolean>,
            e?: React.MouseEvent | React.KeyboardEvent
          ) => void
          onRangeSelect(
            finalRange,
            finalRange.from ?? endDate,
            {},
            undefined
          )
        }
      }

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
  }, [isRangeMode, touchDragEnabled, isTouch, dragCurrentDate, props]);

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
          border-top-left-radius: 9999px !important;
          border-bottom-left-radius: 9999px !important;
        }

        .rdp-day.day-range-preview-end:not([data-selected-single="true"]):not([data-range-start="true"]):not([data-range-end="true"]):not([data-range-middle="true"]) button {
          background-color: color-mix(in oklch, var(--primary) 50%, transparent) !important;
          color: var(--primary-foreground) !important;
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-top-right-radius: 9999px !important;
          border-bottom-right-radius: 9999px !important;
        }

        .rdp-day.day-range-preview-middle:not([data-selected-single="true"]):not([data-range-start="true"]):not([data-range-end="true"]):not([data-range-middle="true"]) button {
          background-color: color-mix(in oklch, var(--primary) 50%, transparent) !important;
          color: var(--primary-foreground) !important;
          border-radius: 0 !important;
        }
      `}</style>
      <div ref={calendarRef}>
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