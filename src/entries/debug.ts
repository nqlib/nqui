/**
 * Debug Components Entry Point
 * Export debug tools separately to allow tree-shaking
 * Import from "@nqlib/nqui/debug" to use
 */

export { DebugPanel } from "../components/debug/debug-panel"
export type { DebugPanelProps } from "../components/debug/debug-panel"

export { Magnifier } from "../components/debug/magnifier"
export type { MagnifierProps } from "../components/debug/magnifier"

export { Crosshair } from "../components/debug/crosshair"
export type { CrosshairProps } from "../components/debug/crosshair"

export { UITester } from "../components/debug/ui-tester"
export type { UITesterProps } from "../components/debug/ui-tester"
