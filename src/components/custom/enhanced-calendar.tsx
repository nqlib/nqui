import * as React from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { startOfDay, isSameDay, isAfter, isBefore } from "date-fns";
import { Calendar as CoreCalendar } from "@/components/ui/calendar";
import { ensureEnhancedCalendarStyles } from "./enhanced-calendar.styles";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Enable touch drag functionality for range selection on touch devices
   * Only works when mode="range"
   */
  touchDragEnabled?: boolean;
};

const DRAG_THRESHOLD_PX = 4
const HIT_INSET_PX = 4

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
  return iso ? parseIsoDate(iso) : null
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

function isTouchPointer(pointerType: string) {
  return pointerType === "touch" || pointerType === "pen"
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
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const rangeRef = React.useRef<{ from?: Date; to?: Date } | null>(null);
  const onSelectRef = React.useRef<RangeOnSelect | undefined>(undefined);
  const dragCurrentRef = React.useRef<Date | null>(null);
  const isDraggingRef = React.useRef(false);
  const onDayMouseEnterRef = React.useRef(props.onDayMouseEnter);
  const onDayMouseLeaveRef = React.useRef(props.onDayMouseLeave);

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
  onDayMouseEnterRef.current = props.onDayMouseEnter;
  onDayMouseLeaveRef.current = props.onDayMouseLeave;
  isDraggingRef.current = isDragging;
  const rangeComplete = isCompleteRange(selectedRange);

  const isSameDateRange = Boolean(
    selectedRange?.from && selectedRange?.to && isSameDay(selectedRange.from, selectedRange.to)
  );
  const effectiveSelectedRange = React.useMemo(() => {
    if (isSameDateRange && selectedRange?.from) {
      return { from: selectedRange.from, to: undefined as Date | undefined };
    }
    return selectedRange;
  }, [isSameDateRange, selectedRange]);

  const dragRange = React.useMemo(() => {
    if (!isDragging || !dragStartDate || !dragCurrentDate) return null;

    const start = startOfDay(dragStartDate);
    const end = startOfDay(dragCurrentDate);

    return start <= end ? { from: start, to: end } : { from: end, to: start };
  }, [isDragging, dragStartDate, dragCurrentDate]);

  const displayedStartDate = React.useMemo(() => {
    if (isDragging && dragRange) {
      return dragRange.from;
    }

    if (!effectiveSelectedRange?.from && effectiveSelectedRange?.to && hoveredDate && !isSameDay(hoveredDate, effectiveSelectedRange.to)) {
      return hoveredDate;
    }

    if (effectiveSelectedRange?.from && !effectiveSelectedRange?.to && hoveredDate && isBefore(hoveredDate, effectiveSelectedRange.from) && !isSameDay(hoveredDate, effectiveSelectedRange.from)) {
      return hoveredDate;
    }

    if (effectiveSelectedRange?.from && !effectiveSelectedRange?.to && hoveredDate && isAfter(hoveredDate, effectiveSelectedRange.from) && !isSameDay(hoveredDate, effectiveSelectedRange.from)) {
      return startOfDay(effectiveSelectedRange.from);
    }

    return effectiveSelectedRange?.from ? startOfDay(effectiveSelectedRange.from) : undefined;
  }, [isDragging, dragRange, effectiveSelectedRange, hoveredDate]);

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
  }, [isDragging, dragRange, effectiveSelectedRange, hoveredDate]);

  const isPreviewStartDate = React.useCallback((date: Date) => {
    if (!displayedStartDate || !displayedEndDate) return false;
    if (isSameDay(displayedStartDate, displayedEndDate)) return false;

    const isStart = isSameDay(date, displayedStartDate) && isBefore(date, displayedEndDate);
    if (!isStart) return false;

    if (!isDragging && effectiveSelectedRange?.from && effectiveSelectedRange?.to && isSameDay(date, effectiveSelectedRange.from)) {
      return false;
    }

    return true;
  }, [displayedStartDate, displayedEndDate, isDragging, effectiveSelectedRange]);

  const isPreviewMiddleDate = React.useCallback((date: Date) => {
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
  }, [displayedStartDate, displayedEndDate, isDragging, effectiveSelectedRange]);

  const isPreviewEndDate = React.useCallback((date: Date) => {
    if (!displayedEndDate || !displayedStartDate) return false;
    if (isSameDay(displayedStartDate, displayedEndDate)) return false;

    const isEnd = isSameDay(date, displayedEndDate) && isAfter(date, displayedStartDate);
    if (!isEnd) return false;

    if (!isDragging && effectiveSelectedRange?.from && effectiveSelectedRange?.to && isSameDay(date, effectiveSelectedRange.to)) {
      return false;
    }

    return true;
  }, [displayedStartDate, displayedEndDate, isDragging, effectiveSelectedRange]);

  const userModifiers = props.modifiers;
  const userModifiersClassNames = props.modifiersClassNames;

  const baseModifiers = React.useMemo(
    () => ({
      ...(userModifiers || {}),
      "range-preview-start": isPreviewStartDate,
      "range-preview-middle": isPreviewMiddleDate,
      "range-preview-end": isPreviewEndDate,
    }),
    [userModifiers, isPreviewStartDate, isPreviewMiddleDate, isPreviewEndDate]
  );

  const enhancedModifiersClassNames = React.useMemo(
    () => ({
      ...(userModifiersClassNames || {}),
      "range-preview-start": "day-range-preview-start",
      "range-preview-middle": "day-range-preview-middle",
      "range-preview-end": "day-range-preview-end",
    }),
    [userModifiersClassNames]
  );

  React.useLayoutEffect(() => {
    ensureEnhancedCalendarStyles();
  }, []);

  // Resize a completed range from its endpoints. Touch/pen can also paint a
  // new range from any day when touchDragEnabled. Click without moving still
  // falls through to DayPicker (reset / new range).
  React.useEffect(() => {
    if (!isRangeMode) return
    const root = calendarRef.current
    if (!root) return

    type Gesture = {
      pointerId: number
      startX: number
      startY: number
      anchor: Date
      mode: "resize" | "paint"
      armed: boolean
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
      const rect = button.getBoundingClientRect()
      if (rect.width > HIT_INSET_PX * 2 && rect.height > HIT_INSET_PX * 2) {
        const inside =
          event.clientX >= rect.left + HIT_INSET_PX &&
          event.clientX <= rect.right - HIT_INSET_PX &&
          event.clientY >= rect.top + HIT_INSET_PX &&
          event.clientY <= rect.bottom - HIT_INSET_PX
        if (!inside && gesture?.lastDay) {
          return gesture.lastDay
        }
      }
      return date
    }

    const arm = (event: PointerEvent, next: Gesture) => {
      next.armed = true
      dragCurrentRef.current = next.lastDay ?? next.anchor
      setIsDragging(true)
      setDragStartDate(next.anchor)
      setDragCurrentDate(next.lastDay ?? next.anchor)
      setHoveredDate(undefined)
      root.setAttribute("data-range-resizing", "")
      try {
        root.setPointerCapture(event.pointerId)
      } catch {
        // jsdom / older browsers
      }
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
      const button = findDayButton(root, event.target)
      if (!button || button.hasAttribute("disabled") || button.classList.contains("day-disabled")) {
        return
      }

      const complete = isCompleteRange(rangeRef.current)
      const kind = endpointKind(button)

      if (complete && kind) {
        const range = rangeRef.current
        const anchor = kind === "from" ? range?.to : range?.from
        if (!anchor) return
        gesture = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          anchor: startOfDay(anchor),
          mode: "resize",
          armed: false,
          lastDay: null,
        }
        document.addEventListener("pointermove", onPointerMove)
        document.addEventListener("pointerup", onPointerUp)
        document.addEventListener("pointercancel", onPointerUp)
        return
      }

      if (!touchDragEnabled || !isTouchPointer(event.pointerType)) return
      const date = getDateFromDayButton(button)
      if (!date) return
      event.preventDefault()
      const start = startOfDay(date)
      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        anchor: start,
        mode: "paint",
        armed: true,
        lastDay: start,
      }
      arm(event, gesture)
      document.addEventListener("pointermove", onPointerMove)
      document.addEventListener("pointerup", onPointerUp)
      document.addEventListener("pointercancel", onPointerUp)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return
      if (!gesture.armed) {
        const dx = event.clientX - gesture.startX
        const dy = event.clientY - gesture.startY
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
        event.preventDefault()
        arm(event, gesture)
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
      const didDrag = gesture.armed
      const anchor = gesture.anchor
      const current = dragCurrentRef.current ?? anchor
      finish()

      if (!didDrag) return

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
  }, [isRangeMode, touchDragEnabled])

  const onDayMouseEnter = React.useCallback(
    (
      date: Date,
      modifiers: Parameters<NonNullable<EnhancedCalendarProps["onDayMouseEnter"]>>[1],
      e: Parameters<NonNullable<EnhancedCalendarProps["onDayMouseEnter"]>>[2]
    ) => {
      if (isRangeMode && !isDraggingRef.current) {
        setHoveredDate(date);
      }
      onDayMouseEnterRef.current?.(date, modifiers, e);
    },
    [isRangeMode]
  );

  const onDayMouseLeave = React.useCallback(
    (
      date: Date,
      modifiers: Parameters<NonNullable<EnhancedCalendarProps["onDayMouseLeave"]>>[1],
      e: Parameters<NonNullable<EnhancedCalendarProps["onDayMouseLeave"]>>[2]
    ) => {
      if (isRangeMode && !isDraggingRef.current) {
        setHoveredDate(undefined);
      }
      onDayMouseLeaveRef.current?.(date, modifiers, e);
    },
    [isRangeMode]
  );

  return (
    <div
      ref={calendarRef}
      className="nqui-enhanced-calendar"
      {...(rangeComplete ? { "data-range-complete": "" } : {})}
      {...(touchDragEnabled ? { "data-touch-drag": "" } : {})}
    >
      <CoreCalendar
        {...props}
        modifiers={baseModifiers}
        modifiersClassNames={enhancedModifiersClassNames}
        onDayMouseEnter={onDayMouseEnter}
        onDayMouseLeave={onDayMouseLeave}
      />
    </div>
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";
