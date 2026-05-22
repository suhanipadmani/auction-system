import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-black leading-none text-white/70 uppercase tracking-widest peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-destructive font-bold">*</span>}
  </label>
))
Label.displayName = "Label"

export { Label }
