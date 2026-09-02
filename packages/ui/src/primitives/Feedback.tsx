"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import type { HTMLAttributes, ReactNode } from "react";
import { cn, interactiveSurface } from "../lib/cn";

export function Progress({
  value = 0,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      value={value}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--z-glass-2)]",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-accent transition-[width] duration-[var(--z-duration-slow)]"
        style={{ width: `${value ?? 0}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("z-spinner inline-block", className)} aria-hidden />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("z-skeleton h-2.5 w-full", className)} aria-hidden />;
}

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        "shrink-0 bg-[var(--z-line)]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  children: ReactNode;
}) {
  return (
    <ScrollAreaPrimitive.Root className={cn("overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex touch-none select-none p-0.5 transition-colors"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-[var(--z-glass-2)]" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "accent" | "danger" | "success" | "warning";
}

export function Pill({ className, tone = "neutral", ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider",
        tone === "neutral" && "bg-[var(--z-glass)] text-fg-muted",
        tone === "accent" && "bg-accent text-accent-fg",
        tone === "danger" &&
          "bg-[var(--z-danger-fill)] text-[var(--z-danger)]",
        tone === "success" &&
          "bg-[var(--z-success-fill)] text-[var(--z-success)]",
        tone === "warning" &&
          "bg-[var(--z-warning-fill)] text-[var(--z-warning)]",
        className,
      )}
      {...props}
    />
  );
}

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "info" | "danger" | "warning" | "neutral";
  title?: string;
}

function CalloutIcon({ tone }: { tone: NonNullable<CalloutProps["tone"]> }) {
  const stroke =
    tone === "danger"
      ? "var(--z-danger)"
      : tone === "warning"
        ? "var(--z-warning)"
        : "currentColor";

  if (tone === "warning" || tone === "danger") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="mt-0.5 shrink-0"
      >
        <path
          d="M8 1.75 14.25 13.5H1.75L8 1.75Z"
          stroke={stroke}
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <path
          d="M8 6.2v3.1"
          stroke={stroke}
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11.15" r="0.7" fill={stroke} />
      </svg>
    );
  }

  return (
    <span
      className={cn(
        "mt-1 size-1.5 shrink-0 rounded-full",
        tone === "info" ? "bg-[var(--z-accent)]" : "bg-fg-dim",
      )}
      aria-hidden
    />
  );
}

export function Callout({
  className,
  tone = "info",
  title,
  children,
  ...props
}: CalloutProps) {
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "status" : undefined}
      className={cn(
        "flex gap-2.5 rounded-[14px] p-3",
        tone === "info" && "bg-[image:var(--z-hero-soft-gradient)]",
        tone === "danger" && "bg-[var(--z-danger-fill)]",
        tone === "warning" && "bg-[var(--z-warning-fill)]",
        tone === "neutral" && "bg-[var(--z-glass)]",
        className,
      )}
      {...props}
    >
      <CalloutIcon tone={tone} />
      <div className="min-w-0 flex-1">
        {title ? (
          <div
            className={cn(
              "text-[length:var(--z-type-row)] font-medium leading-snug",
              tone === "warning" && "text-[var(--z-warning-fg)]",
              tone === "danger" && "text-[var(--z-danger-fg)]",
              (tone === "info" || tone === "neutral") && "text-fg",
            )}
          >
            {title}
          </div>
        ) : null}
        <div
          className={cn(
            "text-[length:var(--z-type-body)] leading-relaxed",
            title ? "mt-1" : null,
            tone === "warning" && "text-[color-mix(in_srgb,var(--z-warning-fg)_82%,transparent)]",
            tone === "danger" && "text-[var(--z-danger-fg)]",
            (tone === "info" || tone === "neutral") && "text-fg-muted",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * `glass` is the default card wash from the mocks; `hero` is the elevated
 * cobalt→violet panel used for claimable rewards, in-flight transfers and
 * staking summaries; `solid` keeps an opaque surface for dialogs.
 */
export type CardTone = "glass" | "raised" | "hero" | "solid";

const CARD_TONES: Record<CardTone, string> = {
  glass: "bg-[image:var(--z-surface-gradient)]",
  raised: "bg-[image:var(--z-surface-raised-gradient)]",
  hero: "bg-[image:var(--z-hero-gradient)]",
  solid: "bg-surface",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

export function Card({ className, tone = "glass", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-[var(--z-line)] p-[var(--z-card-pad)] shadow-[var(--z-card-shadow)]",
        CARD_TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Stat({
  label,
  value,
  delta,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-[0.14em] text-fg-strong">
        {label}
      </span>
      <span className="text-[length:var(--z-type-stat)] font-bold tracking-[-0.03em] tabular-nums text-fg">
        {value}
      </span>
      {delta ? (
        <span className="font-mono text-[length:var(--z-type-meta)] text-fg-dim">{delta}</span>
      ) : null}
    </div>
  );
}

export function KeyValueRow({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 font-mono text-[length:var(--z-type-meta)]",
        className,
      )}
    >
      <span className="text-fg-muted">{label}</span>
      <span className={cn("tabular-nums text-fg", accent && "text-fg")}>{value}</span>
    </div>
  );
}

export function ListRow({
  className,
  selected,
  ...props
}: HTMLAttributes<HTMLDivElement> & { selected?: boolean }) {
  return (
    <div
      data-selected={selected || undefined}
      className={cn(
        "flex items-center gap-3 px-5 py-3",
        interactiveSurface,
        selected &&
          "bg-[var(--z-state-selected)] shadow-[inset_2px_0_0_var(--z-accent)]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono text-[length:var(--z-type-micro)] uppercase tracking-[0.14em] text-fg-strong",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Optional call to action rendered under the copy. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-8 text-center", className)}>
      <div className="flex size-11 items-center justify-center rounded-[14px] bg-[var(--z-glass)] text-fg-dim [&_svg]:size-[20px]">
        {icon ?? (
          <span className="text-[18px] leading-none" aria-hidden>
            ◇
          </span>
        )}
      </div>
      <div className="mt-3 text-[length:var(--z-type-heading)] font-medium text-fg">{title}</div>
      {description ? (
        <div className="mt-1.5 max-w-[320px] text-[length:var(--z-type-body)] leading-relaxed text-fg-muted">
          {description}
        </div>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded-[6px] bg-[var(--z-glass-2)]",
        "px-1.5 py-0.5 font-mono text-[length:var(--z-type-micro)] text-fg-dim",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function Text({
  variant = "body",
  className,
  as: Comp = "p",
  ...props
}: HTMLAttributes<HTMLElement> & {
  variant?: "display" | "title" | "heading" | "body" | "label" | "caption" | "mono" | "labelCaps";
  as?: "p" | "span" | "h1" | "h2" | "h3" | "div";
}) {
  return (
    <Comp
      className={cn(
        variant === "display" &&
          "m-0 text-[length:var(--z-type-hero)] font-medium leading-[1.05] tracking-[-0.04em] text-fg",
        variant === "title" &&
          "m-0 text-[length:var(--z-type-stat)] font-medium leading-tight tracking-[-0.025em] text-fg",
        variant === "heading" &&
          "m-0 text-[length:var(--z-type-heading)] font-medium leading-snug tracking-tight text-fg",
        variant === "body" &&
          "m-0 text-[length:var(--z-type-body)] leading-relaxed text-fg-muted",
        variant === "label" &&
          "m-0 text-[length:var(--z-type-row)] font-medium text-fg",
        variant === "caption" &&
          "m-0 text-[length:var(--z-type-meta)] text-fg-dim",
        variant === "mono" &&
          "m-0 font-mono text-[length:var(--z-type-meta)] tabular-nums text-fg-muted",
        variant === "labelCaps" &&
          "m-0 font-mono text-[length:var(--z-type-micro)] uppercase tracking-[0.14em] text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}
