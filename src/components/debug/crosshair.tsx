"use client"

import * as React from "react"

export interface CrosshairProps {
  enabled: boolean
}

export function Crosshair({ enabled }: CrosshairProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    if (!enabled) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      {/* Horizontal line */}
      <div
        className="fixed pointer-events-none z-[var(--z-debug)]"
        style={{
          left: 0,
          top: `${position.y}px`,
          width: '100vw',
          height: '1px',
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          boxShadow: '0 0 2px rgba(255, 0, 0, 0.8)',
        }}
      />
      {/* Vertical line */}
      <div
        className="fixed pointer-events-none z-[var(--z-debug)]"
        style={{
          left: `${position.x}px`,
          top: 0,
          width: '1px',
          height: '100vh',
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          boxShadow: '0 0 2px rgba(255, 0, 0, 0.8)',
        }}
      />
    </>
  )
}

