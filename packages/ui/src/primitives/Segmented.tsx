"use client";

import { cn, focusRing, interactiveMotion } from "../lib/cn";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex gap-0.5 rounded-full bg-[var(--z-glass)] p-[3px]",
        className,
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            data-selected={selected || undefined}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-full font-mono uppercase tracking-wider",
              interactiveMotion,
              "active:scale-[0.98]",
              size === "sm"
                ? "px-3 py-1.5 text-[length:var(--z-type-micro)]"
                : "px-4 py-2 text-[length:var(--z-type-meta)]",
              selected
                ? "bg-accent text-[var(--z-accent-fg)] shadow-[0_1px_0_color-mix(in_srgb,var(--z-accent-fg)_20%,transparent)_inset]"
                : "text-fg-muted hover:bg-[var(--z-state-hover)] hover:text-fg active:bg-[var(--z-state-press)]",
              focusRing,
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
