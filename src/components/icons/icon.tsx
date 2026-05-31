import * as React from "react"

import { cn } from "@/lib/utils"

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string
  strokeWidth?: number | string
}

export function createIcon(
  displayName: string,
  children: React.ReactNode,
  options?: { defaultSize?: number },
) {
  const Icon = ({
    className,
    size = options?.defaultSize ?? 16,
    strokeWidth = 2,
    ...props
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
  Icon.displayName = displayName
  return Icon
}
