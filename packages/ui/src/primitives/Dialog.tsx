"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-[var(--z-overlay)]",
        "data-[state=open]:animate-[z-rise_var(--z-duration-base)_var(--z-ease)]",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(400px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2",
          "rounded-[18px] bg-surface p-[18px]",
          "shadow-[0_24px_48px_var(--z-shadow)]",
          focusRing,
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-[length:var(--z-type-heading)] font-medium tracking-tight text-fg", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-2 text-[length:var(--z-type-body)] leading-relaxed text-fg-muted", className)}
      {...props}
    />
  );
}

/** Bottom sheet for mobile / extension dense flows. */
export function SheetContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-auto",
          "rounded-t-[var(--z-radius-sheet)] border border-[var(--z-line-strong)] border-b-0",
          "bg-surface p-4 pb-8 shadow-[0_24px_48px_var(--z-shadow)]",
          className,
        )}
        {...props}
      >
        <div
          className="mx-auto mb-4 h-1 w-11 rounded-full bg-[var(--z-glass-2)]"
          aria-hidden
        />
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
