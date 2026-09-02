"use client";

import { cn, focusRing, interactiveMotion } from "../lib/cn";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"] as const;

export function NumericKeypad({
  onDigit,
  onBackspace,
  onSubmit,
  disabled,
  className,
}: {
  onDigit: (digit: string) => void;
  onBackspace?: () => void;
  onSubmit?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-3 gap-2", className)}
      role="group"
      aria-label="Numeric keypad"
    >
      {KEYS.map((key, i) => {
        if (key === "") {
          return <span key={`pad-${i}`} aria-hidden />;
        }
        const isBack = key === "⌫";
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            aria-label={isBack ? "Backspace" : key}
            className={cn(
              "flex h-12 items-center justify-center rounded-[14px] border border-[var(--z-line)]",
              "bg-[var(--z-glass)] font-mono text-[16px] text-fg",
              interactiveMotion,
              "hover:border-[var(--z-line-strong)] hover:bg-[var(--z-state-hover)]",
              "active:scale-[0.97] active:bg-[var(--z-state-press)]",
              "disabled:opacity-[var(--z-disabled-opacity)]",
              focusRing,
            )}
            onClick={() => {
              if (isBack) onBackspace?.();
              else onDigit(key);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit?.();
            }}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
