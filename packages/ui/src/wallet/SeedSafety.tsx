"use client";

import { useId } from "react";
import { cn, focusRing } from "../lib/cn";
import { Callout } from "../primitives/Feedback";
import {
  SEED_ACK_KEYS,
  SEED_SAFETY,
  seedAckLabel,
  type SeedAckKey,
} from "./seedSafetyCopy";

export function SeedSafetyCallout({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Callout tone="warning" title={SEED_SAFETY.title} className={cn("w-full", className)}>
      <p>{SEED_SAFETY.summary}</p>
      {!compact ? (
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {SEED_SAFETY.bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </Callout>
  );
}

export function SeedSafetyAcks({
  value,
  onChange,
  className,
}: {
  value: Record<SeedAckKey, boolean>;
  onChange: (next: Record<SeedAckKey, boolean>) => void;
  className?: string;
}) {
  const baseId = useId();
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {SEED_ACK_KEYS.map((key) => {
        const id = `${baseId}-${key}`;
        return (
          <label
            key={key}
            htmlFor={id}
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-[12px] border border-[var(--z-line)] px-3 py-2.5",
              "bg-[image:var(--z-surface-gradient)]",
              "text-[12px] leading-snug text-fg",
              "transition-[border-color,background-color] duration-[var(--z-duration-base)]",
              "hover:border-[var(--z-line-strong)] hover:bg-[var(--z-state-hover)]",
              value[key] &&
                "border-[color-mix(in_srgb,var(--z-accent)_42%,var(--z-line))] bg-[var(--z-state-selected)]",
            )}
          >
            <input
              id={id}
              type="checkbox"
              checked={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
              className={cn(
                "mt-0.5 size-[16px] shrink-0 rounded-[5px] border border-[var(--z-line)]",
                "accent-[var(--z-accent)]",
                focusRing,
              )}
            />
            <span className="text-fg-muted">{seedAckLabel(key)}</span>
          </label>
        );
      })}
    </div>
  );
}

export function allSeedAcksAccepted(value: Record<SeedAckKey, boolean>): boolean {
  return SEED_ACK_KEYS.every((key) => value[key]);
}

export function emptySeedAcks(): Record<SeedAckKey, boolean> {
  return { understand: false, backup: false };
}
