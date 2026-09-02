"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useId, type HTMLAttributes, type ReactNode, type TableHTMLAttributes } from "react";
import { cn, focusRing } from "../lib/cn";

export const RadioGroup = RadioGroupPrimitive.Root;

export function RadioGroupItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "size-[18px] rounded-full border border-[var(--z-line-strong)]",
        "data-[state=checked]:border-accent",
        focusRing,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="relative flex size-full items-center justify-center after:block after:size-2 after:rounded-full after:bg-accent" />
    </RadioGroupPrimitive.Item>
  );
}

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full border-collapse text-left text-[12px]", className)}
      {...props}
    />
  );
}

export function Th({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-[var(--z-glass-2)] px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-[var(--z-glass-2)] px-5 py-3 align-middle",
        className,
      )}
      {...props}
    />
  );
}

export function Toast({
  title,
  meta,
  className,
}: {
  title: string;
  meta?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2.5 rounded-[14px] border border-[var(--z-line-strong)] bg-surface px-3 py-3",
        "shadow-[0_16px_34px_var(--z-shadow)]",
        className,
      )}
    >
      <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[8px] bg-accent text-[12px] text-accent-fg">
        ✓
      </span>
      <span className="flex-1 text-[12px] font-medium text-fg">{title}</span>
      {meta ? (
        <span className="font-mono text-[10px] text-fg-dim">{meta}</span>
      ) : null}
    </div>
  );
}

export function Mark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gapId = `zunia-mark-gap-${uid}`;
  return (
    <svg
      viewBox="0 0 96 120"
      width={size}
      height={(size * 120) / 96}
      className={cn("block", className)}
      aria-hidden
    >
      <defs>
        <mask id={gapId} maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="120">
          <rect width="96" height="120" fill="#fff" />
          <path
            d="M26 20 L70 46 L26 72"
            fill="none"
            stroke="#000"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <g mask={`url(#${gapId})`}>
        <path
          d="M26 48 L70 74 L26 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M26 20 L70 46 L26 72"
        fill="none"
        stroke="currentColor"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Surface({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--z-radius-lg)] border border-[var(--z-line)] bg-surface p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
