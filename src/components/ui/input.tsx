import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldFocusClasses } from "@/lib/focus-styles"
import { inputFieldShellBase, inputFieldSingleRowHeight } from "@/components/ui/input-shared"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          fieldFocusClasses,
          inputFieldShellBase,
          inputFieldSingleRowHeight,
          type === "number" &&
            "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
