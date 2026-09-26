"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";
import { TokenLogo } from "./Display";

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
  verified = false,
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
  /** Official cosmos/chain-registry membership. */
  verified?: boolean;
  selected?: boolean;
  onToggle: () => void;
  /** `check` suits a one-off pick, `switch` suits a persistent on/off list. */
  control?: "check" | "switch";
  className?: string;
}) {
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
      <TokenLogo
        src={iconUrl}
        symbol={name}
        size={36}
        verified={verified}
        verifiedLabel="Listed in the Cosmos chain registry"
        className={cn(
          selected && "shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--z-accent)_70%,transparent)] rounded-full",
        )}
      />

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

function FieldIconSearch() {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden className="block">
      <circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M10.35 10.35 14 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FieldIconClear() {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden>
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Search field with a leading glyph, sized for popup lists. */
export function SearchField({
  value,
  onValueChange,
  placeholder,
  className,
  "aria-label": ariaLabel,
  inputRef,
  onKeyDown,
  compact,
  ...inputProps
}: Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "className"
> & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  /** Shorter row for tight filter bars. */
  compact?: boolean;
}) {
  const localRef = useRef<HTMLInputElement | null>(null);
  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof inputRef === "function") inputRef(node);
    else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
  };
  return (
    <div className={cn("relative flex min-w-0", className)}>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center text-fg-dim",
          compact ? "w-8" : "w-10",
        )}
      >
        <FieldIconSearch />
      </span>
      <input
        {...inputProps}
        ref={setRefs}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented && e.key === "Escape" && value) {
            e.preventDefault();
            onValueChange("");
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full appearance-none border border-[var(--z-line)] bg-[var(--z-glass)] py-0",
          compact ? "h-8 rounded-full pl-8" : "h-11 rounded-[var(--z-radius-lg)] pl-10",
          value ? (compact ? "pr-8" : "pr-10") : "pr-3.5",
          "font-mono text-[length:var(--z-type-row)] leading-none text-fg placeholder:text-fg-dim",
          "transition-[border-color,box-shadow] duration-[var(--z-duration-base)]",
          "focus-visible:border-[color-mix(in_srgb,var(--z-accent)_55%,var(--z-line))]",
          "[&::-webkit-search-cancel-button]:appearance-none",
          focusRing,
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onValueChange("");
            localRef.current?.focus();
          }}
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-center text-fg-dim",
            compact ? "w-8" : "w-10",
            "transition-colors duration-[var(--z-duration-base)] hover:text-fg",
            focusRing,
          )}
        >
          <span className="flex size-7 items-center justify-center rounded-full hover:bg-[var(--z-state-hover)]">
            <FieldIconClear />
          </span>
        </button>
      ) : null}
    </div>
  );
}
