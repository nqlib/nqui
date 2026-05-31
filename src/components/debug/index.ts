/**
 * Debug Tools
 *
 * A collection of developer tools for debugging and inspecting React applications.
 * Designed to be easily extracted into a separate package.
 *
 * @packageDocumentation
 */

// Note: CSS is NOT auto-imported here to avoid issues in showcase app
// For showcase app: Import CSS in main.tsx or App.tsx
// For consuming apps: Import 'nqui/debug.css' explicitly

export { DebugPanel } from "./debug-panel"
export { Magnifier } from "./magnifier"
export { Crosshair } from "./crosshair"
export { UITester } from "./ui-tester"
export type { DebugPanelProps } from "./debug-panel"
export type { MagnifierProps } from "./magnifier"
export type { CrosshairProps } from "./crosshair"
export type { UITesterProps } from "./ui-tester"

