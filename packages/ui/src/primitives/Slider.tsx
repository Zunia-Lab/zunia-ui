"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn, focusRing } from "../lib/cn";

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

export function Slider({ className, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex h-[34px] w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-[6px] grow rounded-full bg-[var(--z-glass-2)]">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block size-[22px] rounded-full bg-fg shadow-[0_4px_12px_var(--z-shadow)]",
          "border border-[var(--z-line)]",
          focusRing,
        )}
      />
    </SliderPrimitive.Root>
  );
}
