import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ 
  className, 
  label, 
  error, 
  ...props 
}: React.ComponentProps<"textarea"> & { label?: string; error?: string }) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-base transition-all outline-none placeholder:text-muted-foreground/40 ring-[1.5px] ring-white/10 focus-visible:border-white/50 focus-visible:ring-4 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm shadow-inner resize-none",
          error && "border-destructive ring-destructive/20",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-destructive/90 mt-1.5 ml-1">{error}</p>
      )}
    </div>
  )
}

export { Textarea }
