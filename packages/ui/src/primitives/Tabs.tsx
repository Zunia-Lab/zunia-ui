"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn, focusRing } from "../lib/cn";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex gap-[18px] border-b border-[var(--z-glass-2)] font-medium text-[length:var(--z-type-row)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "pb-2.5 text-fg-dim transition-colors",
        "data-[state=active]:text-fg data-[state=active]:border-b-[1.5px] data-[state=active]:border-fg data-[state=active]:-mb-px",
        focusRing,
        className,
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
