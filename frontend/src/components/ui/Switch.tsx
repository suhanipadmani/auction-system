"use client";

import * as React from "react";
import { Switch as SwitchPrimitives } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";
import { ISwitchProps } from "@/types/components";


const switchRootStyles =
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10";

const switchThumbStyles =
  "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  ISwitchProps
>
(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    aria-label={props["aria-label"] || "Toggle switch"}
    className={cn(switchRootStyles, className)}
    {...props}
  >
    <SwitchPrimitives.Thumb className={cn(switchThumbStyles)} />
  </SwitchPrimitives.Root>
));

Switch.displayName = "Switch";

export { Switch };