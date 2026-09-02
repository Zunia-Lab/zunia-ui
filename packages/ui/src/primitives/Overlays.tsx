"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn, focusRing, interactiveMotion } from "../lib/cn";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={6}
        className={cn(
          "z-50 rounded-[10px] border border-[var(--z-line)] bg-surface px-2.5 py-1.5",
          "font-mono text-[10px] text-fg shadow-[0_8px_24px_var(--z-shadow)]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={8}
        className={cn(
          "z-50 w-64 rounded-[14px] border border-[var(--z-line)] bg-surface p-3",
          "shadow-[0_16px_34px_var(--z-shadow)]",
          focusRing,
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={6}
        className={cn(
          "z-50 min-w-[180px] overflow-hidden rounded-[14px] border border-[var(--z-line)] bg-surface p-1",
          "shadow-[0_16px_34px_var(--z-shadow)]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] outline-none",
        interactiveMotion,
        "data-[highlighted]:bg-[var(--z-state-hover)] data-[highlighted]:text-fg",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--z-disabled-opacity)]",
        className,
      )}
      {...props}
    />
  );
}
