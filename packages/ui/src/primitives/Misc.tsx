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

const TOAST_TONES = {
  success: { icon: "✓", badge: "bg-[var(--z-button)] text-[var(--z-button-fg)]" },
  danger: { icon: "!", badge: "bg-[var(--z-danger-fill)] text-[var(--z-danger)]" },
  warning: { icon: "!", badge: "bg-[var(--z-warning-fill)] text-[var(--z-warning)]" },
  neutral: { icon: "i", badge: "bg-[var(--z-glass-2)] text-fg-muted" },
} as const;

export function Toast({
  title,
  meta,
  detail,
  tone = "success",
  className,
}: {
  title: string;
  meta?: string;
  /** Second line, for a short note that should not stay on the page. */
  detail?: string;
  tone?: keyof typeof TOAST_TONES;
  className?: string;
}) {
  const look = TOAST_TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-2.5 rounded-[14px] border border-[var(--z-line-strong)] bg-[var(--z-surface-raised)] px-3 py-3",
        "shadow-[0_16px_34px_var(--z-shadow)]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-[26px] shrink-0 items-center justify-center rounded-[8px] text-[12px] font-semibold",
          look.badge,
        )}
      >
        {look.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="text-[12px] font-medium text-fg">{title}</span>
          {meta ? (
            <span className="font-mono text-[10px] text-fg-dim">{meta}</span>
          ) : null}
        </span>
        {detail ? (
          <span className="mt-0.5 block text-[11px] leading-snug text-fg-muted">
            {detail}
          </span>
        ) : null}
      </span>
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
