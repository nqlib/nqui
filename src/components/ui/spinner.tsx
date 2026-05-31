import * as React from "react"

import { cn } from "@/lib/utils"

const C = 2 * Math.PI * 100

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId().replace(/:/g, "")

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("relative inline-flex size-4 shrink-0 items-center justify-center", className)}
      {...props}
    >
      <div className="nqui-spinner-rotate absolute inset-0 flex items-center justify-center">
        <svg
          className="size-full overflow-visible"
          viewBox="0 0 220 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id={`nqui-spinner-g1-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop
                offset="100%"
                stopColor="color-mix(in oklch, var(--primary) 35%, white)"
              />
            </linearGradient>
            <linearGradient id={`nqui-spinner-g2-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor="color-mix(in oklch, var(--primary) 65%, white)"
              />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          <g className="nqui-spinner-arc-first">
            <circle
              cx="110"
              cy="110"
              r="100"
              stroke={`url(#nqui-spinner-g1-${id})`}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${C} ${C}`}
              strokeDashoffset={0}
            />
          </g>
          <g className="nqui-spinner-arc-second" transform="rotate(-14 110 110)">
            <circle
              cx="110"
              cy="110"
              r="100"
              stroke={`url(#nqui-spinner-g2-${id})`}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${C} ${C}`}
              strokeDashoffset={0}
            />
          </g>
        </svg>
      </div>
    </div>
  )
}

export { Spinner }
