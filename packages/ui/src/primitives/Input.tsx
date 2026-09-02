"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { InputHTMLAttributes } from "react";
import { forwardRef, useId, useState } from "react";
import { cn } from "../lib/cn";

const inputVariants = cva(
  cn(
    "w-full box-border font-mono text-[length:var(--z-type-row)] text-fg bg-[var(--z-glass)]",
    "border border-[var(--z-line)] rounded-[12px] px-[13px] py-3",
    "placeholder:text-fg-dim transition-[border-color,box-shadow,background] duration-[var(--z-duration-base)]",
    "disabled:opacity-[var(--z-disabled-opacity)] disabled:pointer-events-none",
    "aria-[invalid=true]:border-[var(--z-danger-line)] aria-[invalid=true]:bg-[var(--z-danger-fill)]",
    "outline-none focus-visible:border-[color-mix(in_srgb,var(--z-accent)_55%,var(--z-line))]",
    "focus-visible:shadow-[0_0_0_1px_var(--z-focus-ring)]",
    "focus-visible:ring-0",
  ),
  {
    variants: {
      state: {
        default: "",
        valid: "border-[color-mix(in_srgb,var(--z-fg)_45%,transparent)]",
        error: "border-[var(--z-danger-line)] bg-[var(--z-danger-fill)]",
      },
    },
    defaultVariants: { state: "default" },
  },
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  trailing?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { className, label, hint, trailing, state, id, ...rest },
    ref,
  ) {
    const generatedId = useId();
    // An explicit htmlFor keeps `trailing` (reveal toggles, unit suffixes) and
    // the hint out of the field's accessible name.
    const inputId = id ?? rest.name ?? generatedId;
    return (
      <div className="flex flex-col gap-2">
        {label ? (
          <label
            htmlFor={inputId}
            className="font-mono text-[length:var(--z-type-micro)] tracking-[0.14em] uppercase text-fg-muted"
          >
            {label}
          </label>
        ) : null}
        <span className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={cn(inputVariants({ state }), trailing && "pr-20", className)}
            aria-invalid={state === "error" || undefined}
            {...rest}
          />
          {trailing ? (
            <span className="absolute right-3 font-mono text-[length:var(--z-type-micro)] tracking-wider text-fg-muted">
              {trailing}
            </span>
          ) : null}
        </span>
        {hint ? (
          <span
            className={cn(
              "font-mono text-[length:var(--z-type-meta)]",
              state === "error" ? "text-[var(--z-danger)]" : "text-fg-dim",
            )}
          >
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  /** Show the built-in SHOW / HIDE toggle. */
  revealable?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ revealable = true, trailing, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        trailing={
          trailing ??
          (revealable ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible((v) => !v)}
              className={cn(
                "font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted",
                "transition-colors duration-[var(--z-duration-base)] hover:text-fg",
              )}
            >
              {visible ? "Hide" : "Show"}
            </button>
          ) : undefined)
        }
        {...props}
      />
    );
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, label, ...rest }, ref) {
    return (
      <label className="flex flex-col gap-2">
        {label ? (
          <span className="font-mono text-[length:var(--z-type-micro)] tracking-[0.14em] uppercase text-fg-muted">
            {label}
          </span>
        ) : null}
        <textarea
          ref={ref}
          className={cn(
            inputVariants(),
            "min-h-[88px] resize-y font-sans text-[length:var(--z-type-row)]",
            className,
          )}
          {...rest}
        />
      </label>
    );
  },
);
