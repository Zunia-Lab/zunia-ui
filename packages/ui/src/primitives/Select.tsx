"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { cn, focusRing, interactiveMotion } from "../lib/cn";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "inline-flex h-11 w-full items-center justify-between gap-2 rounded-[12px]",
        "border border-[var(--z-line)] bg-[var(--z-glass)] px-3 font-mono text-[length:var(--z-type-row)] text-fg",
        "disabled:opacity-[var(--z-disabled-opacity)]",
        focusRing,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-[15px] leading-none text-fg-dim">
        ▾
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "z-50 overflow-hidden rounded-[14px] border border-[var(--z-line)] bg-surface",
          "shadow-[0_16px_34px_var(--z-shadow)]",
          className,
        )}
        position="popper"
        sideOffset={6}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-[10px] px-3 py-2",
        "font-mono text-[length:var(--z-type-row)] text-fg outline-none",
        interactiveMotion,
        "data-[highlighted]:bg-[var(--z-state-hover)] data-[highlighted]:text-fg",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--z-disabled-opacity)]",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
