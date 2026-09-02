"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn, focusRing } from "../lib/cn";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const box = (
    <CheckboxPrimitive.Root
      id={id}
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded-[6px]",
        "border border-[var(--z-line)] bg-transparent",
        "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
        "disabled:opacity-[var(--z-disabled-opacity)]",
        focusRing,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-accent-fg text-[11px] leading-none">
        ✓
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
  if (!label) return box;
  return (
    <label className="inline-flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-snug text-fg">
      {box}
      <span>{label}</span>
    </label>
  );
}
