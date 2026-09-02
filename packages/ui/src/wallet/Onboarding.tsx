"use client";

import { useState, type ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";

/** Thin progress rail + "Step 2 of 4 · Verify" caption. */
export function StepProgress({
  current,
  total,
  label,
  className,
}: {
  /** 1-based. */
  current: number;
  total: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-1.5" role="presentation">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-[3px] flex-1 rounded-full transition-colors duration-[var(--z-duration-base)]",
              i < current
                ? "bg-accent"
                : "bg-[var(--z-glass-2)]",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dim">
        Step {current} of {total}
        {label ? ` · ${label}` : ""}
      </span>
    </div>
  );
}

/** Step title + optional supporting line, with onboarding rhythm baked in. */
export function StepHeading({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <h1 className="text-[21px] font-medium leading-[1.15] tracking-[-0.035em] text-fg">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-[12.5px] leading-[1.5] text-fg-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}

/** Selectable chain card: logo, name, denom pill, chain id, testnet tag. */
export function NetworkOptionCard({
  name,
  chainId,
  symbol,
  iconUrl,
  testnet = false,
  selected = false,
  onToggle,
  control = "check",
  className,
}: {
  name: string;
  chainId: string;
  symbol?: string;
  iconUrl?: string;
  testnet?: boolean;
  selected?: boolean;
  onToggle: () => void;
  /** `check` suits a one-off pick, `switch` suits a persistent on/off list. */
  control?: "check" | "switch";
  className?: string;
}) {
  const [iconFailed, setIconFailed] = useState(false);
  const showIcon = Boolean(iconUrl) && !iconFailed;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "group flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-[14px] px-3 py-2.5 text-left",
        "transition-[background-color,box-shadow,transform] duration-[var(--z-duration-fast)] ease-[var(--z-ease)]",
        "active:scale-[0.99]",
        selected
          ? "bg-[color-mix(in_srgb,var(--z-accent)_14%,var(--z-glass))]"
          : "bg-[image:var(--z-surface-gradient)] hover:bg-[var(--z-state-hover)] active:bg-[var(--z-state-press)]",
        focusRing,
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--z-glass-2)]",
          selected && "shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--z-accent)_70%,transparent)]",
        )}
      >
        {showIcon ? (
          <img
            src={iconUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <span className="font-mono text-[length:var(--z-type-meta)] text-fg-muted">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[length:var(--z-type-row)] font-medium tracking-[-0.01em] text-fg">
            {name}
          </span>
          {symbol ? (
            <span className="shrink-0 rounded-full border border-[var(--z-line)] px-1.5 py-[1px] font-mono text-[length:var(--z-type-micro)] uppercase tracking-[0.06em] text-fg-muted">
              {symbol}
            </span>
          ) : null}
          {testnet ? (
            <span className="shrink-0 rounded-full border border-[var(--z-warning-line)] bg-[var(--z-warning-fill)] px-1.5 py-[1px] font-mono text-[length:var(--z-type-micro)] uppercase tracking-[0.06em] text-[var(--z-warning)]">
              test
            </span>
          ) : null}
        </span>
        <span className="mt-[3px] block truncate font-mono text-[length:var(--z-type-meta)] text-fg-dim">
          {chainId}
        </span>
      </span>

      {control === "switch" ? (
        <span
          aria-hidden
          className={cn(
            "flex h-[20px] w-[34px] shrink-0 items-center rounded-full border p-[2px] transition-colors duration-[var(--z-duration-base)]",
            selected
              ? "border-transparent bg-accent"
              : "border-[var(--z-line-strong)] bg-[var(--z-glass-2)]",
          )}
        >
          <span
            className={cn(
              "size-[14px] rounded-full bg-[var(--z-accent-fg)] transition-transform duration-[var(--z-duration-base)]",
              selected
                ? "translate-x-[14px]"
                : "translate-x-0 bg-[var(--z-fg-dim)]",
            )}
          />
        </span>
      ) : (
        <span
          aria-hidden
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none transition-colors duration-[var(--z-duration-base)]",
            selected
              ? "border-transparent bg-accent text-[var(--z-accent-fg)]"
              : "border-[var(--z-line-strong)] text-transparent group-hover:border-[color-mix(in_srgb,var(--z-accent)_40%,var(--z-line))]",
          )}
        >
          ✓
        </span>
      )}
    </button>
  );
}

/** Search field with a leading glyph, sized for popup lists. */
export function SearchField({
  value,
  onValueChange,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={cn("relative flex min-w-0 items-center", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 text-[length:var(--z-type-row)] text-fg-dim"
      >
        ⌕
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full rounded-[12px] border border-[var(--z-line)] bg-[var(--z-glass)] py-2.5 pl-9 pr-3",
          "font-mono text-[length:var(--z-type-row)] text-fg placeholder:text-fg-dim",
          "transition-[border-color,box-shadow] duration-[var(--z-duration-base)]",
          "focus-visible:border-[color-mix(in_srgb,var(--z-accent)_55%,var(--z-line))]",
          "[&::-webkit-search-cancel-button]:appearance-none",
          focusRing,
        )}
      />
    </div>
  );
}
