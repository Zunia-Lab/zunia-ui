"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn, focusRing } from "../lib/cn";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-[26px] w-[46px] shrink-0 rounded-full border border-[var(--z-line)]",
        "bg-transparent data-[state=checked]:bg-accent data-[state=checked]:border-accent",
        "transition-colors duration-[var(--z-duration-base)]",
        "disabled:opacity-[var(--z-disabled-opacity)]",
        focusRing,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 translate-x-[3px] rounded-full bg-[var(--z-glass-2)]",
          "transition-transform duration-[var(--z-duration-base)] ease-[var(--z-ease)]",
          "data-[state=checked]:translate-x-[21px] data-[state=checked]:bg-accent-fg",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
