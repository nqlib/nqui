"use client"

import {
  IconChevronDown,
  IconChevronUp,
  IconCode,
  IconEye,
  IconFile,
  IconKeyboard,
  IconLayout,
  IconPalette,
  IconSettings,
  IconX,
} from "@/components/icons"
import * as React from "react"
// Import all dependencies from the centralized file
import { Keys, shouldIgnoreKeyboardShortcut } from "@/lib/keyboard"
import { Button, Switch, Label, Slider, cn, Tabs, TabsList, TabsTrigger, TabsContent, Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./dependencies"
import { Magnifier } from "./magnifier"
import { Crosshair } from "./crosshair"
import { UITester } from "./ui-tester"
import { buildLegacyDebugCss, createHitAreaDebugController } from "./debug-features"
import type { HitAreaDebugController } from "./debug-features"

export interface DebugPanelProps {
  className?: string
}

export function DebugPanel({ className }: DebugPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showBorders, setShowBorders] = React.useState(false)
  const [showShadows, setShowShadows] = React.useState(false)
  const [showGrid, setShowGrid] = React.useState(false)
  const [showHitAreas, setShowHitAreas] = React.useState(false)
  const [magnifierEnabled, setMagnifierEnabled] = React.useState(false)
  const [magnifierZoom, setMagnifierZoom] = React.useState(3)
  const [showCrosshair, setShowCrosshair] = React.useState(false)
  const [showElementHighlight, setShowElementHighlight] = React.useState(false)
  const [isSnapshotMode, setIsSnapshotMode] = React.useState(false)
  // Unified lock mechanism - shared across magnifier, element highlight, and UI tester preview
  const [lockedElement, setLockedElement] = React.useState<HTMLElement | null>(null)
  const lockedElementRef = React.useRef<HTMLElement | null>(null)
  const [measurePoints, setMeasurePoints] = React.useState<Array<{ x: number; y: number }>>([])
  const [isMeasuring, setIsMeasuring] = React.useState(false)
  const [pickedColor, setPickedColor] = React.useState<string | null>(null)
  const [currentElement, setCurrentElement] = React.useState<HTMLElement | null>(null)
  const [uiTesterEnabled, setUiTesterEnabled] = React.useState(false)
  const [uiTesterSelectedElement, setUiTesterSelectedElement] = React.useState<HTMLElement | null>(null)

  // Track selected element changes
  React.useEffect(() => {
    // Element selection tracking
  }, [uiTesterSelectedElement])
  const [uiTesterHoveredElement, setUiTesterHoveredElement] = React.useState<HTMLElement | null>(null)
  const [showOtherTools, setShowOtherTools] = React.useState(false) // For expand/collapse when magnifier is enabled
  const [activeTab, setActiveTab] = React.useState("tools")
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync UI tester selected element with magnifier's current element when magnifier is enabled
  React.useEffect(() => {
    if (magnifierEnabled && uiTesterEnabled && currentElement) {
      setUiTesterSelectedElement(currentElement)
    }
  }, [magnifierEnabled, uiTesterEnabled, currentElement])

  // Auto-switch to Inspector tab when magnifier or UI tester is enabled
  React.useEffect(() => {
    if (magnifierEnabled || uiTesterEnabled) {
      setActiveTab("inspector")
    }
  }, [magnifierEnabled, uiTesterEnabled])


  // Auto-expand other tools section when any tool is enabled (if magnifier is also enabled)
  React.useEffect(() => {
    if (
      magnifierEnabled &&
      (showBorders ||
        showShadows ||
        showGrid ||
        showHitAreas ||
        showCrosshair ||
        isMeasuring ||
        uiTesterEnabled)
    ) {
      // Clear any pending collapse timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      setShowOtherTools(true)
    }
  }, [
    magnifierEnabled,
    showBorders,
    showShadows,
    showGrid,
    showHitAreas,
    showCrosshair,
    isMeasuring,
    uiTesterEnabled,
  ])

  // Clean up hover timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const handleOtherToolsMouseEnter = () => {
    if (!magnifierEnabled) return

    // Clear any pending collapse timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    // Set expand timeout
    hoverTimeoutRef.current = setTimeout(() => {
      setShowOtherTools(true)
      hoverTimeoutRef.current = null
    }, 200)
  }

  const handleOtherToolsMouseLeave = () => {
    if (!magnifierEnabled) return

    // Clear any pending expand timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    // Set collapse timeout
    hoverTimeoutRef.current = setTimeout(() => {
      setShowOtherTools(false)
      hoverTimeoutRef.current = null
    }, 200)
  }

  type ElementInfo = {
    tag: string
    classes: string[]
    styles: {
      border?: string
      boxShadow?: string
      borderRadius?: string
      padding?: string
      margin?: string
      backgroundColor?: string
      color?: string
    }
    dimensions: {
      width: number
      height: number
      top: number
      left: number
    }
  }

  const [elementInfo, setElementInfo] = React.useState<ElementInfo | null>(null)
  const [snapshotInfo, setSnapshotInfo] = React.useState<ElementInfo | null>(null)

  // Draggable button position state - initialize with safe SSR default
  const [buttonPosition, setButtonPosition] = React.useState(() => {
    // Always return a safe default for SSR (centered horizontally)
    // Using a reasonable default that works for most screens
    return { x: 960, y: 20 } // Approximate center for 1920px width
  })

  // Load button position from localStorage after mount (client-only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nqui-debug-button-position")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Validate position is within viewport bounds
          const validatedX = Math.max(20, Math.min(window.innerWidth - 20, parsed.x))
          const validatedY = Math.max(16, Math.min(window.innerHeight - 20, parsed.y))
          setButtonPosition({ x: validatedX, y: validatedY })
        } catch {
          // Fallback to default center top
          setButtonPosition({ x: window.innerWidth / 2, y: 20 })
        }
      } else {
        // No saved position, use default center top
        setButtonPosition({ x: window.innerWidth / 2, y: 20 })
      }
    }
  }, [])

  const [isDragging, setIsDragging] = React.useState(false)
  const [isDraggingPanel, setIsDraggingPanel] = React.useState(false)
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null)
  const [panelDragStart, setPanelDragStart] = React.useState<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)
  const [hasMoved, setHasMoved] = React.useState(false)
  const [panelHasMoved, setPanelHasMoved] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  // Panel position state (separate from button position) - initialize with safe SSR default
  const [panelPosition, setPanelPosition] = React.useState<{ x: number; y: number } | null>(null)

  // Load panel position from localStorage after mount (client-only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nqui-debug-panel-position")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPanelPosition(parsed)
        } catch {
          // Fallback to null
        }
      }
    }
  }, [])

  // Save button position to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nqui-debug-button-position", JSON.stringify(buttonPosition))
    }
  }, [buttonPosition])

  // Save panel position to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined" && panelPosition) {
      localStorage.setItem("nqui-debug-panel-position", JSON.stringify(panelPosition))
    }
  }, [panelPosition])

  // Constrain button position on window resize
  React.useEffect(() => {
    const handleResize = () => {
      const buttonSize = 40
      const minX = buttonSize / 2
      const maxX = window.innerWidth - buttonSize / 2
      const minY = buttonSize / 2
      const maxY = window.innerHeight - buttonSize / 2

      setButtonPosition((prev) => ({
        x: Math.max(minX, Math.min(maxX, prev.x)),
        y: Math.max(minY, Math.min(maxY, prev.y)),
      }))

      // Constrain panel position
      if (panelPosition) {
        const panelWidth = 320 // w-80 = 20rem = 320px
        const panelHeight = 400 // approximate
        const minPanelX = panelWidth / 2
        const maxPanelX = window.innerWidth - panelWidth / 2
        const minPanelY = 0
        const maxPanelY = window.innerHeight - panelHeight

        setPanelPosition((prev) => prev ? {
          x: Math.max(minPanelX, Math.min(maxPanelX, prev.x)),
          y: Math.max(minPanelY, Math.min(maxPanelY, prev.y)),
        } : null)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [panelPosition])

  // Close panel when clicking outside
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const panel = document.querySelector('[data-debug-panel]')
      const button = buttonRef.current

      if (
        panel &&
        !panel.contains(target) &&
        button &&
        !button.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Update element info when current element changes (for magnifier) or uiTester hover/selected (for UI tester)
  // Use locked element if available, otherwise use current element
  React.useEffect(() => {
    // Priority: lockedElement > currentElement (magnifier) > uiTesterHoveredElement > uiTesterSelectedElement
    const element = lockedElement || (magnifierEnabled
      ? currentElement
      : (uiTesterHoveredElement || uiTesterSelectedElement))
    if (!element || isSnapshotMode) {
      if (!element && !isSnapshotMode) {
        setElementInfo(null)
      }
      return
    }

    const computed = window.getComputedStyle(element)
    const rect = element.getBoundingClientRect()

    setElementInfo({
      tag: element.tagName.toLowerCase(),
      classes: Array.from(element.classList),
      styles: {
        border: computed.border || computed.borderWidth
          ? `${computed.borderWidth} ${computed.borderStyle} ${computed.borderColor}`
          : undefined,
        boxShadow: computed.boxShadow !== "none" ? computed.boxShadow : undefined,
        borderRadius: computed.borderRadius,
        padding: computed.padding,
        margin: computed.margin,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
      },
      dimensions: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      },
    })
  }, [currentElement, uiTesterSelectedElement, uiTesterHoveredElement, magnifierEnabled, isSnapshotMode, lockedElement])

  // Handle unified lock toggle (replaces snapshot mode functionality)
  const handleLockToggle = React.useCallback(() => {
    if (lockedElement) {
      // Unlock - clear lock
      setLockedElement(null)
      lockedElementRef.current = null
      setIsSnapshotMode(false)
      setSnapshotInfo(null)
    } else {
      // Lock - use current element from magnifier, UI tester, or element highlight
      // Priority: currentElement (magnifier) > uiTesterHoveredElement > uiTesterSelectedElement
      const elementToLock = magnifierEnabled
        ? currentElement
        : (uiTesterHoveredElement || uiTesterSelectedElement)

      if (elementToLock) {
        setLockedElement(elementToLock)
        lockedElementRef.current = elementToLock

        // Also enter snapshot mode to capture element info
        if (elementInfo) {
          setSnapshotInfo(elementInfo)
          setIsSnapshotMode(true)
        }
      }
    }
  }, [lockedElement, magnifierEnabled, currentElement, uiTesterHoveredElement, uiTesterSelectedElement, elementInfo])


  // Keyboard shortcuts: Space for lock/unlock, Esc to close panel
  React.useEffect(() => {
    if (!magnifierEnabled && !uiTesterEnabled && !isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space: Toggle lock (when magnifier or UI tester is enabled)
      if (e.key === Keys.Space && (magnifierEnabled || uiTesterEnabled)) {
        if (shouldIgnoreKeyboardShortcut(e.target)) return

        e.preventDefault()
        handleLockToggle()
      }

      // Esc: Close panel
      if (e.key === Keys.Escape && isOpen) {
        if (shouldIgnoreKeyboardShortcut(e.target)) return
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [magnifierEnabled, uiTesterEnabled, isOpen, handleLockToggle])

  // Handle measure tool clicks
  React.useEffect(() => {
    if (!isMeasuring) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Don't trigger if clicking on debug panel or button
      if (target.closest('[data-debug-panel]') || target.closest('button[title="Debug Tools"]')) {
        return
      }

      if (measurePoints.length < 2) {
        setMeasurePoints([...measurePoints, { x: e.clientX, y: e.clientY }])
      } else {
        // Reset and start new measurement
        setMeasurePoints([{ x: e.clientX, y: e.clientY }])
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [isMeasuring, measurePoints])

  // Handle color picker (Alt+Click to pick color from element)
  React.useEffect(() => {
    if (!magnifierEnabled || !currentElement) {
      return
    }

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Don't trigger if clicking on debug panel or button
      if (target.closest('[data-debug-panel]') || target.closest('button[title="Debug Tools"]')) {
        return
      }

      // Check if user is holding Alt key to pick color
      if (e.altKey && currentElement) {
        e.preventDefault()
        const computed = window.getComputedStyle(currentElement)
        const bgColor = computed.backgroundColor
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          setPickedColor(bgColor)
        }
      }
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [magnifierEnabled, currentElement])

  // Handle button dragging
  React.useEffect(() => {
    if (!isDragging || !dragStart) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - dragStart.x)
      const deltaY = Math.abs(e.clientY - dragStart.y)

      // Consider it a drag if moved more than 5px
      if (deltaX > 5 || deltaY > 5) {
        setHasMoved(true)
      }

      if (hasMoved || deltaX > 5 || deltaY > 5) {
        const buttonSize = 40 // Approximate button size
        const minX = buttonSize / 2
        const maxX = window.innerWidth - buttonSize / 2
        const minY = buttonSize / 2
        const maxY = window.innerHeight - buttonSize / 2

        setButtonPosition({
          x: Math.max(minX, Math.min(maxX, e.clientX)),
          y: Math.max(minY, Math.min(maxY, e.clientY)),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragStart(null)
      // Reset hasMoved after a short delay to allow click handler to check it
      setTimeout(() => setHasMoved(false), 100)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart, hasMoved])

  // Handle panel dragging
  React.useEffect(() => {
    if (!isDraggingPanel || !panelDragStart || !panelRef.current) return

    let rafId: number | null = null
    let pendingUpdate: { x: number; y: number } | null = null

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - panelDragStart.x)
      const deltaY = Math.abs(e.clientY - panelDragStart.y)

      // Consider it a drag if moved more than 5px
      if (deltaX > 5 || deltaY > 5) {
        setPanelHasMoved(true)
      }

      if (panelHasMoved || deltaX > 5 || deltaY > 5) {
        const panelWidth = 320 // w-80 = 20rem = 320px
        const panelHeight = 400 // approximate
        const minX = panelWidth / 2
        const maxX = window.innerWidth - panelWidth / 2
        const minY = 0
        const maxY = window.innerHeight - panelHeight

        // Calculate new position: cursor position minus offset (offset is from center)
        const newX = e.clientX - panelDragStart.offsetX
        const newY = e.clientY - panelDragStart.offsetY

        // Store pending update and batch via requestAnimationFrame for smooth performance
        pendingUpdate = {
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
        }

        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            if (pendingUpdate) {
              setPanelPosition(pendingUpdate)
              pendingUpdate = null
            }
            rafId = null
          })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDraggingPanel(false)
      setPanelDragStart(null)
      setTimeout(() => setPanelHasMoved(false), 100)
      // Apply any pending update immediately on mouse up
      if (pendingUpdate) {
        setPanelPosition(pendingUpdate)
        pendingUpdate = null
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isDraggingPanel, panelDragStart, panelHasMoved])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragStart({ x: e.clientX, y: e.clientY })
    setIsDragging(true)
    setHasMoved(false)
  }

  const handleClick = (_e: React.MouseEvent) => {
    // Only open if it wasn't a drag
    if (!hasMoved) {
      setIsOpen(true)
      // Initialize panel position if not set
      if (!panelPosition) {
        setPanelPosition({
          x: Math.max(160, Math.min(window.innerWidth - 160, buttonPosition.x)),
          y: Math.max(16, Math.min(window.innerHeight - 400, buttonPosition.y + 50)),
        })
      }
    }
  }

  const handlePanelMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return
    e.preventDefault()
    e.stopPropagation()

    // Calculate offset from panel's center (since panel uses translate(-50%, 0))
    // The panel's center is at panelPosition.x, so offset is relative to center
    const currentX = panelPosition?.x ?? (Math.max(160, Math.min(window.innerWidth - 160, buttonPosition.x)))
    const currentY = panelPosition?.y ?? (Math.max(16, Math.min(window.innerHeight - 400, buttonPosition.y + 50)))
    const offsetX = e.clientX - currentX  // Offset from center
    const offsetY = e.clientY - currentY  // Offset from top

    setPanelDragStart({
      x: e.clientX,
      y: e.clientY,
      offsetX,
      offsetY
    })
    setIsDraggingPanel(true)
    setPanelHasMoved(false)
  }

  const hitAreaControllerRef = React.useRef<HitAreaDebugController | null>(null)

  React.useEffect(() => {
    if (!showHitAreas) {
      hitAreaControllerRef.current?.unmount()
      hitAreaControllerRef.current = null
      return
    }
    const c = createHitAreaDebugController()
    hitAreaControllerRef.current = c
    c.mount()
    return () => {
      c.unmount()
      hitAreaControllerRef.current = null
    }
  }, [showHitAreas])

  // Apply legacy debug styles to document (borders / shadows / 8px pixel grid)
  React.useEffect(() => {
    const styleId = "debug-styles"
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    const css = buildLegacyDebugCss({
      borders: showBorders,
      shadows: showShadows,
      pixelGrid: showGrid,
    })

    styleElement.textContent = css

    return () => {
      if (styleElement && !showBorders && !showShadows && !showGrid) {
        styleElement.textContent = ""
      }
    }
  }, [showBorders, showShadows, showGrid])


  return (
    <>
      {/* Floating Toggle Button - Draggable */}
      {!isOpen && (
        <Button
          ref={buttonRef}
          variant="outline"
          size="icon"
          className={cn(
            "fixed z-[var(--z-debug)] rounded-full shadow-lg cursor-move",
            "bg-background/80 backdrop-blur-sm border-2",
            "hover:bg-background/90 transition-colors",
            isDragging && "ring-2 ring-primary ring-offset-2",
            className
          )}
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            transform: "translate(-50%, 0)", // Center horizontally on the x position
          }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          title="Debug Tools"
        >
          <IconSettings className="h-5 w-5" />
        </Button>
      )}

      {/* Debug Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          data-debug-panel
          className={cn(
            "fixed z-[var(--z-debug)] w-80 rounded-lg shadow-xl p-4",
            "nqui-debug-panel",
            isDraggingPanel && "ring-2 ring-primary ring-offset-2",
            className
          )}
          style={{
            left: panelPosition
              ? `${panelPosition.x}px`
              : `${Math.max(160, Math.min(window.innerWidth - 160, buttonPosition.x))}px`,
            top: panelPosition
              ? `${panelPosition.y}px`
              : `${Math.max(16, Math.min(window.innerHeight - 400, buttonPosition.y + 50))}px`,
            transform: panelPosition ? "translate(-50%, 0)" : "translate(-50%, 0)", // Center horizontally
          }}
        >
          {/* Draggable Header */}
          <div
            className="flex items-center justify-between mb-4 cursor-move select-none"
            onMouseDown={handlePanelMouseDown}
          >
            <div className="flex items-center gap-2">
              <IconSettings className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Debug Tools</h3>
            </div>
            <div className="flex items-center gap-1">
<IconLayout
                className="h-4 w-4 text-muted-foreground"
                aria-label="Drag to move panel"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent drag when clicking close button
                  setIsOpen(false);
                }}
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4 [&]:!inline-flex [&]:!h-9 [&]:!p-1"
            >
              <TabsTrigger value="tools" className="flex-1">Tools</TabsTrigger>
              <TabsTrigger value="inspector" className="flex-1">Inspector</TabsTrigger>
            </TabsList>

            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-4 mt-0">
            {/* Magnifier Toggle - Always visible */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
<IconLayout
                    className={cn(
                      "h-4 w-4",
                      magnifierEnabled ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <Label htmlFor="magnifier" className="text-sm cursor-pointer">
                    Magnifier
                  </Label>
                </div>
                <Switch
                  id="magnifier"
                  checked={magnifierEnabled}
                  onCheckedChange={setMagnifierEnabled}
                />
              </div>

            </div>

            {/* UI Tester Toggle - Always visible */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
<IconPalette
                  className={cn(
                    "h-4 w-4",
                    uiTesterEnabled ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <Label htmlFor="ui-tester" className="text-sm cursor-pointer">
                  UI Tester
                </Label>
              </div>
              <Switch
                id="ui-tester"
                checked={uiTesterEnabled}
                onCheckedChange={(checked) => {
                  setUiTesterEnabled(checked)
                  if (!checked) {
                    setUiTesterSelectedElement(null)
                  }
                }}
              />
            </div>

            {/* Other Tools Section - Always collapsible */}
            <div
              className="pt-2 border-t border-border"
              onMouseEnter={handleOtherToolsMouseEnter}
              onMouseLeave={handleOtherToolsMouseLeave}
            >
              <div className="flex items-center justify-between w-full text-sm text-muted-foreground cursor-pointer"
                onClick={() => setShowOtherTools(!showOtherTools)}
              >
                <span>Other Tools</span>
                {showOtherTools ? (
                  <IconChevronUp className="h-4 w-4" />
                ) : (
                  <IconChevronDown className="h-4 w-4" />
                )}
              </div>
              {showOtherTools && (
                <div className="space-y-3 mt-3">
                  {/* Hit-area debug (Bazza utilities) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {showHitAreas ? (
                        <IconEye className="h-4 w-4 text-primary" />
                      ) : (
                        <IconX
                          className="h-4 w-4 text-muted-foreground opacity-50"
                        />
                      )}
                      <Label htmlFor="show-hit-areas" className="text-sm cursor-pointer">
                        Hit areas
                      </Label>
                    </div>
                    <Switch
                      id="show-hit-areas"
                      checked={showHitAreas}
                      onCheckedChange={setShowHitAreas}
                    />
                  </div>

                  {/* Show Borders Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {showBorders ? (
                        <IconEye className="h-4 w-4 text-primary" />
                      ) : (
                        <IconX className="h-4 w-4 text-muted-foreground opacity-50" />
                      )}
                      <Label htmlFor="show-borders" className="text-sm cursor-pointer">
                        Show Borders
                      </Label>
                    </div>
                    <Switch
                      id="show-borders"
                      checked={showBorders}
                      onCheckedChange={setShowBorders}
                    />
                  </div>

                  {/* Show Shadows Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {showShadows ? (
                        <IconEye className="h-4 w-4 text-primary" />
                      ) : (
                        <IconX className="h-4 w-4 text-muted-foreground opacity-50" />
                      )}
                      <Label htmlFor="show-shadows" className="text-sm cursor-pointer">
                        Show Shadows
                      </Label>
                    </div>
                    <Switch
                      id="show-shadows"
                      checked={showShadows}
                      onCheckedChange={setShowShadows}
                    />
                  </div>

                  {/* Show Grid Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
<IconLayout
                        className={cn(
                          "h-4 w-4",
                          showGrid ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <Label htmlFor="show-grid" className="text-sm cursor-pointer">
                        8px pixel grid
                      </Label>
                    </div>
                    <Switch
                      id="show-grid"
                      checked={showGrid}
                      onCheckedChange={setShowGrid}
                    />
                  </div>

                  {/* Crosshair Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCode
                        size={16}
                        className={cn(
                          "h-4 w-4",
                          showCrosshair ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <Label htmlFor="show-crosshair" className="text-sm cursor-pointer">
                        Crosshair
                      </Label>
                    </div>
                    <Switch
                      id="show-crosshair"
                      checked={showCrosshair}
                      onCheckedChange={setShowCrosshair}
                    />
                  </div>

                  {/* Measure Tool Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconFile
                        size={16}
                        className={cn(
                          "h-4 w-4",
                          isMeasuring ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <Label htmlFor="measure-tool" className="text-sm cursor-pointer">
                        Measure Tool
                      </Label>
                    </div>
                    <Switch
                      id="measure-tool"
                      checked={isMeasuring}
                      onCheckedChange={(checked) => {
                        setIsMeasuring(checked)
                        if (!checked) {
                          setMeasurePoints([])
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Measure Tool Display */}
            {isMeasuring && measurePoints.length > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="text-xs font-semibold text-foreground mb-2">
                  Measurement
                </div>
                {measurePoints.length === 1 && (
                  <div className="text-xs text-muted-foreground">
                    Click again to set end point
                  </div>
                )}
                {measurePoints.length === 2 && (
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-foreground">
                      Distance: {Math.round(
                        Math.sqrt(
                          Math.pow(measurePoints[1].x - measurePoints[0].x, 2) +
                          Math.pow(measurePoints[1].y - measurePoints[0].y, 2)
                        )
                      )}px
                    </div>
                    <div className="font-mono text-foreground">
                      X: {Math.round(Math.abs(measurePoints[1].x - measurePoints[0].x))}px
                    </div>
                    <div className="font-mono text-foreground">
                      Y: {Math.round(Math.abs(measurePoints[1].y - measurePoints[0].y))}px
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => setMeasurePoints([])}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Color Picker Display */}
            {pickedColor && (
              <div className="pt-2 border-t border-border">
                <div className="text-xs font-semibold text-foreground mb-2">
                  Picked Color
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: pickedColor }}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="font-mono text-xs text-foreground">{pickedColor}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(pickedColor)
                        } catch (err) {
                          console.error('Failed to copy color:', err)
                        }
                      }}
                    >
                      <IconCode className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setShowBorders(false)
                    setShowShadows(false)
                    setShowGrid(false)
                    setMagnifierEnabled(false)
                    setShowCrosshair(false)
                    setShowElementHighlight(false)
                    setIsMeasuring(false)
                    setMeasurePoints([])
                    setPickedColor(null)
                    setUiTesterEnabled(false)
                    setUiTesterSelectedElement(null)
                  }}
                >
                  Reset All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setShowBorders(true)
                    setShowShadows(true)
                    setShowGrid(false)
                    setMagnifierEnabled(true)
                  }}
                >
                  Inspect Mode
                </Button>
              </div>
            </div>

            {/* Keyboard Shortcuts Display */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <IconKeyboard className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs font-semibold text-foreground">Shortcuts</div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {magnifierEnabled && (
                  <div className="flex items-center justify-between">
                    <span>Space</span>
                    <span className="text-foreground">Toggle snapshot</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Esc</span>
                  <span className="text-foreground">Close panel</span>
                </div>
              </div>
            </div>
            </TabsContent>

            {/* Inspector Tab */}
            <TabsContent value="inspector" className="space-y-4 mt-0">
              {/* Element Highlight Toggle - works for both Magnifier and UI Tester */}
              {(magnifierEnabled || uiTesterEnabled) && (
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
<IconLayout
                      className={cn(
                        "h-4 w-4",
                        showElementHighlight ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <Label htmlFor="show-highlight" className="text-sm cursor-pointer">
                      Element Highlight
                    </Label>
                  </div>
                  <Switch
                    id="show-highlight"
                    checked={showElementHighlight}
                    onCheckedChange={setShowElementHighlight}
                  />
                </div>
              )}

              {/* Magnifier Intensity Control - shown when magnifier is enabled */}
              {magnifierEnabled && (
                <div className="space-y-2 pb-2 border-b border-border">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="magnifier-zoom" className="text-sm text-muted-foreground">
                      Magnifier Intensity
                    </Label>
                    <span className="text-xs font-mono text-foreground">{magnifierZoom}x</span>
                  </div>
                  <Slider
                    id="magnifier-zoom"
                    min={1}
                    max={10}
                    step={0.5}
                    value={[magnifierZoom]}
                    onValueChange={(value) => setMagnifierZoom(value[0])}
                    className="w-full"
                  />
                </div>
              )}

              {/* Element Information Section - shown when magnifier or UI tester is enabled AND element highlight is active */}
              {(magnifierEnabled || uiTesterEnabled) && showElementHighlight && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-foreground">
                        Element Details
                      </div>
                      {(isSnapshotMode ? snapshotInfo : elementInfo) && (
                        <div className="text-xs text-muted-foreground">
                          Tag: <span className="font-mono text-foreground">{(isSnapshotMode ? snapshotInfo : elementInfo)!.tag}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {lockedElement && (
                        <div className="flex items-center gap-1 text-xs">
                          <IconFile className="h-3 w-3 text-primary" />
                          <span className="text-primary font-medium">Locked</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={handleLockToggle}
                        disabled={!elementInfo && !lockedElement}
                        title={lockedElement ? "Unlock element (Space)" : "Lock element (Space)"}
                      >
                        <IconFile className="h-3 w-3 mr-1" />
                        {lockedElement ? "Unlock" : "Lock"}
                      </Button>
                    </div>
                  </div>
                  {(isSnapshotMode ? snapshotInfo : elementInfo) ? (
                    <div className="space-y-3 text-xs max-h-[400px] overflow-y-auto">
                      {/* Lock mode hint */}
                      {lockedElement && (
                        <div className="text-xs text-muted-foreground italic mb-2 p-2 bg-muted rounded">
                          Element is locked. Press Space to unlock.
                        </div>
                      )}

                      {/* Dimensions and Classes in 2 columns */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Dimensions */}
                        <div>
                          <div className="text-muted-foreground font-medium mb-1">Dimensions</div>
                          <div className="font-mono text-xs space-y-0.5 text-foreground">
                            <div>W: {Math.round((isSnapshotMode ? snapshotInfo : elementInfo)!.dimensions.width)}px</div>
                            <div>H: {Math.round((isSnapshotMode ? snapshotInfo : elementInfo)!.dimensions.height)}px</div>
                            <div>X: {Math.round((isSnapshotMode ? snapshotInfo : elementInfo)!.dimensions.left)}px</div>
                            <div>Y: {Math.round((isSnapshotMode ? snapshotInfo : elementInfo)!.dimensions.top)}px</div>
                          </div>
                        </div>

                        {/* Classes */}
                        {(isSnapshotMode ? snapshotInfo : elementInfo)!.classes.length > 0 ? (
                          <div>
                            <div className="text-muted-foreground font-medium mb-1">Classes</div>
                            <div className="font-mono text-xs space-y-0.5 max-h-20 overflow-y-auto">
                              {(isSnapshotMode ? snapshotInfo : elementInfo)!.classes.slice(0, 10).map((cls, i) => (
                                <div key={i} className="text-foreground">
                                  .{cls}
                                </div>
                              ))}
                              {(isSnapshotMode ? snapshotInfo : elementInfo)!.classes.length > 10 && (
                                <div className="text-muted-foreground">
                                  +{(isSnapshotMode ? snapshotInfo : elementInfo)!.classes.length - 10} more
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-muted-foreground font-medium mb-1">Classes</div>
                            <div className="text-xs text-muted-foreground italic">No classes</div>
                          </div>
                        )}
                      </div>

                      {/* Styles */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-muted-foreground font-medium">Styles</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 text-xs"
                            onClick={async () => {
                              const info = isSnapshotMode ? snapshotInfo : elementInfo
                              if (!info) return

                              const cssText = Object.entries(info.styles)
                                .filter(([_, value]) => value !== undefined)
                                .map(([key, value]) => {
                                  const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
                                  return `  ${cssKey}: ${value};`
                                })
                                .join('\n')

                              const fullCss = `.${info.tag} {\n${cssText}\n}`

                              try {
                                await navigator.clipboard.writeText(fullCss)
                              } catch (err) {
                                console.error('Failed to copy CSS:', err)
                              }
                            }}
                          >
                            <IconCode className="h-3 w-3 mr-1" />
                            Copy CSS
                          </Button>
                        </div>
                        <TooltipProvider>
                          <div className="font-mono text-xs space-y-0.5 text-foreground">
                            {(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.border && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">border:</span>{" "}
                                <span className="text-foreground">{(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.border}</span>
                              </div>
                            )}
                            {(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.boxShadow && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">shadow:</span>{" "}
                                <span className="text-foreground truncate">
                                  {(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.boxShadow}
                                </span>
                              </div>
                            )}
                            {(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.borderRadius && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">radius:</span>{" "}
                                <span className="text-foreground">{(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.borderRadius}</span>
                              </div>
                            )}
                            {(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.padding && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">padding:</span>{" "}
                                <span className="text-foreground">{(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.padding}</span>
                              </div>
                            )}
                            {(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.margin && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">margin:</span>{" "}
                                <span className="text-foreground">{(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.margin}</span>
                              </div>
                            )}
                            {(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.backgroundColor && (() => {
                              const bgColor = (isSnapshotMode ? snapshotInfo : elementInfo)!.styles.backgroundColor
                              return (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-foreground">bg:</span>{" "}
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className="h-3 w-3 rounded border border-border flex-shrink-0"
                                          style={{ backgroundColor: bgColor || 'transparent' }}
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent className="z-[var(--z-debug)]">
                                        <div className="font-mono text-xs">{bgColor}</div>
                                      </TooltipContent>
                                    </Tooltip>
                                    <span className="text-foreground truncate">{bgColor}</span>
                                  </div>
                                </div>
                              )
                            })()}
                            {(isSnapshotMode ? snapshotInfo : elementInfo)!.styles.color && (() => {
                              const textColor = (isSnapshotMode ? snapshotInfo : elementInfo)!.styles.color
                              return (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-foreground">color:</span>{" "}
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className="h-3 w-3 rounded border border-border flex-shrink-0"
                                          style={{ backgroundColor: textColor || 'transparent' }}
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent className="z-[var(--z-debug)]">
                                        <div className="font-mono text-xs">{textColor}</div>
                                      </TooltipContent>
                                    </Tooltip>
                                    <span className="text-foreground truncate">{textColor}</span>
                                  </div>
                                </div>
                              )
                            })()}
                          </div>
                        </TooltipProvider>
                      </div>

                      {/* Element Tree Navigator */}
                      {(() => {
                        // Priority: lockedElement > currentElement (magnifier) > uiTesterHoveredElement > uiTesterSelectedElement
                        const element = lockedElement || (magnifierEnabled
                          ? currentElement
                          : (uiTesterHoveredElement || uiTesterSelectedElement))
                        if (!element) return null

                        return (
                          <div>
                            <div className="text-muted-foreground font-medium mb-1">Element Path</div>
                            <div className="font-mono text-xs space-y-0.5 max-h-20 overflow-y-auto">
                              {(() => {

                              const path: string[] = []
                              let current: HTMLElement | null = element

                              while (current && current !== document.body) {
                                const tag = current.tagName.toLowerCase()
                                const id = current.id ? `#${current.id}` : ''
                                const classes = current.className && typeof current.className === 'string'
                                  ? `.${current.className.split(' ').filter(Boolean).join('.')}`
                                  : ''
                                path.unshift(`${tag}${id}${classes}`)
                                current = current.parentElement
                              }

                                return path.map((segment, i) => (
                                  <div key={i} className="text-foreground">
                                    {i > 0 && <span className="text-muted-foreground"> → </span>}
                                    {segment}
                                  </div>
                                ))
                              })()}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      {isSnapshotMode ? "No snapshot captured" : "Hover over an element to see details"}
                    </div>
                  )}
                </div>
              )}

              {/* UI Tester Section */}
              {uiTesterEnabled && (
                <div>
                  <UITester
                    enabled={uiTesterEnabled}
                    selectedElement={uiTesterSelectedElement}
                    onElementSelect={setUiTesterSelectedElement}
                    onElementHover={setUiTesterHoveredElement}
                    lockedElement={lockedElement}
                    setLockedElement={setLockedElement}
                    lockedElementRef={lockedElementRef}
                  />
                </div>
              )}

              {/* Empty state when neither magnifier nor UI tester is enabled */}
              {!magnifierEnabled && !uiTesterEnabled && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <p>Enable Magnifier or UI Tester to see inspection tools</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Magnifier Component */}
      <Magnifier
        enabled={magnifierEnabled}
        zoom={magnifierZoom}
        size={200}
        lockedElement={lockedElement}
        onElementChange={setCurrentElement}
      />

      {/* Crosshair Component */}
      <Crosshair enabled={showCrosshair} />

      {/* Element Highlight Overlay - works for both Magnifier and UI Tester */}
      {showElementHighlight && (() => {
        // Priority: lockedElement > currentElement (magnifier) > uiTesterHoveredElement > uiTesterSelectedElement
        const element = lockedElement || (magnifierEnabled
          ? currentElement
          : (uiTesterHoveredElement || uiTesterSelectedElement))
        if (!element || typeof document === 'undefined') return null

        // Use getBoundingClientRect to get current position
        const rect = element.getBoundingClientRect()
        return (
          <div
            key={`highlight-${element.tagName}-${rect.left}-${rect.top}`}
            className="fixed pointer-events-none z-[var(--z-debug)] border-2 border-primary transition-all duration-[var(--duration-micro)]"
            style={{
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.1)',
            }}
          />
        )
      })()}

      {/* Measure Tool Overlay */}
      {isMeasuring && measurePoints.length > 0 && (
        <>
          {measurePoints.map((point, i) => (
            <div
              key={i}
              className="fixed pointer-events-none z-[var(--z-debug)]"
              style={{
                left: `${point.x - 4}px`,
                top: `${point.y - 4}px`,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                border: '2px solid white',
                boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
              }}
            />
          ))}
          {measurePoints.length === 2 && (
            <>
              {/* Line between points */}
              <div
                className="fixed pointer-events-none z-[var(--z-debug)]"
                style={{
                  left: `${Math.min(measurePoints[0].x, measurePoints[1].x)}px`,
                  top: `${Math.min(measurePoints[0].y, measurePoints[1].y)}px`,
                  width: `${Math.abs(measurePoints[1].x - measurePoints[0].x)}px`,
                  height: `${Math.abs(measurePoints[1].y - measurePoints[0].y)}px`,
                  border: '1px dashed rgba(255, 0, 0, 0.6)',
                  pointerEvents: 'none',
                }}
              />
              {/* Distance label */}
              <div
                className="fixed pointer-events-none z-[var(--z-debug)] bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono"
                style={{
                  left: `${(measurePoints[0].x + measurePoints[1].x) / 2}px`,
                  top: `${(measurePoints[0].y + measurePoints[1].y) / 2 - 20}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {Math.round(
                  Math.sqrt(
                    Math.pow(measurePoints[1].x - measurePoints[0].x, 2) +
                    Math.pow(measurePoints[1].y - measurePoints[0].y, 2)
                  )
                )}px
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

