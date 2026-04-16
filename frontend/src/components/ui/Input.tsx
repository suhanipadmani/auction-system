import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ 
  className, 
  type, 
  label, 
  error, 
  icon, 
  rightElement,
  ...props 
}: React.ComponentProps<"input"> & { 
  label?: string; 
  error?: string; 
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <InputPrimitive
          type={type}
          data-slot="input"
          className={cn(
            "h-12 w-full min-w-0 rounded-2xl border border-border bg-background/50 px-4 py-2 text-base transition-all outline-none placeholder:text-muted-foreground/40 ring-[1.5px] ring-white/10 focus-visible:border-white/50 focus-visible:ring-4 focus-visible:ring-white/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm shadow-inner [color-scheme:dark]",

            icon && "pl-11",
            rightElement && "pr-12",
            error && "border-destructive ring-destructive/20",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-destructive/90 mt-1.5 ml-1">{error}</p>
      )}
    </div>
  )
}

export { Input }
