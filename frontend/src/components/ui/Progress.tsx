"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  showBlur?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, className, indicatorClassName, showBlur = true }, ref) => {
    // Ensure value is between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5",
          className
        )}
      >
        <div
          className={cn(
            "h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out",
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - clampedValue}%)` }}
        >
            {showBlur && (
                <div className="absolute inset-0 blur-md opacity-50 bg-inherit" />
            )}
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
