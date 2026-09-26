"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn, focusRing, interactiveMotion } from "../lib/cn";

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 font-semibold font-sans",
    "rounded-full",
    interactiveMotion,
    "disabled:opacity-[var(--z-disabled-opacity)] disabled:pointer-events-none disabled:shadow-none",
    "aria-busy:pointer-events-none",
    "active:scale-[0.985]",
    focusRing,
  ),
  {
    variants: {
      variant: {
        // Deeper crimson than the brand ramp, so the label stays white and readable.
        primary: cn(
          "bg-[image:var(--z-button-gradient)] text-[var(--z-button-fg)]",
          "shadow-[0_10px_22px_rgba(154,16,22,0.34)]",
          "hover:brightness-110",
          "active:brightness-95",
        ),
        secondary: cn(
          "border border-[var(--z-line-strong)] bg-[var(--z-glass)] text-fg",
          "hover:bg-[var(--z-state-hover)]",
          "active:bg-[var(--z-state-press)]",
        ),
        ghost: cn(
          "bg-transparent text-fg",
          "hover:bg-[var(--z-state-hover)]",
          "active:bg-[var(--z-state-press)]",
        ),
        danger: cn(
          "bg-transparent text-[var(--z-danger)]",
          "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--z-danger)_35%,transparent)]",
          "hover:bg-[var(--z-danger-fill)] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--z-danger)_55%,transparent)]",
          "active:bg-[color-mix(in_srgb,var(--z-danger)_18%,transparent)]",
        ),
      },
      size: {
        sm: "h-9 px-4 text-[length:var(--z-type-meta)]",
        md: "h-11 px-[22px] text-[length:var(--z-type-row)]",
        lg: "h-[46px] px-6 text-[length:var(--z-type-body)]",
        icon: "h-9 w-9 p-0 text-[14px] [&_svg]:size-[18px] [&_svg]:shrink-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant,
  size,
  className,
  asChild = false,
  loading = false,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <span className="z-spinner" aria-hidden />
          <span className="sr-only">Loading</span>
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { buttonVariants };
