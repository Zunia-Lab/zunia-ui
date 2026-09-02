"use client";

import type { ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";
import { Button } from "../primitives/Button";
import { KeyValueRow, Progress, SectionLabel } from "../primitives/Feedback";
import { Callout } from "../primitives/Feedback";

export function MnemonicGrid({
  words,
  columns = 3,
  className,
  revealed = true,
  compact = false,
}: {
  words: string[];
  columns?: 3 | 4;
  className?: string;
  /** When false, words are masked. */
  revealed?: boolean;
  /** Slightly tighter cells for popup density. */
  compact?: boolean;
}) {
  return (
    <ol
      className={cn(
        "grid w-full min-w-0",
        compact ? "gap-1.5" : "gap-2",
        columns === 3 ? "grid-cols-3" : "grid-cols-4",
        className,
      )}
    >
      {words.map((word, i) => (
        <li
          key={`${i}-${word}`}
          className={cn(
            "flex min-w-0 items-center border border-[var(--z-line)] bg-[var(--z-glass)]",
            compact
              ? "gap-1.5 rounded-[10px] px-2 py-2"
              : "gap-2 rounded-[12px] px-2.5 py-2.5",
          )}
        >
          <span
            className={cn(
              "shrink-0 font-mono text-fg-faint",
              compact ? "text-[9px]" : "text-[9px]",
            )}
          >
            {i + 1}
          </span>
          <span
            className={cn(
              "min-w-0 truncate font-mono text-fg",
              compact ? "text-[11.5px] leading-snug" : "text-[12px]",
              !revealed && "select-none tracking-wide text-fg-dim",
            )}
          >
            {revealed ? word : "••••"}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function SeedVerifier({
  options,
  selected,
  onSelect,
  className,
}: {
  options: string[];
  selected?: string;
  onSelect: (word: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {options.map((word) => {
        const isSelected = selected === word;
        return (
          <button
            key={word}
            type="button"
            data-selected={isSelected || undefined}
            onClick={() => onSelect(word)}
            className={cn(
              "h-[42px] rounded-[12px] border font-mono text-[12px] transition-colors",
              isSelected
                ? "border-fg bg-[var(--z-state-selected)] text-fg shadow-[inset_2px_0_0_var(--z-accent)]"
                : "border-[var(--z-line)] text-fg-muted hover:bg-[var(--z-state-hover)]",
              focusRing,
            )}
          >
            {word}
          </button>
        );
      })}
    </div>
  );
}

export function PasscodeDots({
  length = 6,
  filled = 0,
  className,
}: {
  length?: number;
  filled?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center gap-3", className)} aria-label="Passcode">
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-[13px] rounded-full border border-[var(--z-line-strong)]",
            i < filled && "border-fg bg-fg",
          )}
        />
      ))}
    </div>
  );
}

export function QrFrame({
  size = 200,
  children,
  className,
}: {
  size?: number;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex items-center justify-center rounded-[18px] border border-[var(--z-line)] bg-bg p-3",
        className,
      )}
      style={{ width: size + 24, height: size + 24 }}
    >
      <div
        className="flex items-center justify-center bg-fg text-bg"
        style={{ width: size, height: size }}
      >
        {children ?? (
          <span className="font-mono text-[11px] opacity-60">QR</span>
        )}
      </div>
    </div>
  );
}

export function MessageDecodeList({
  messages,
  className,
}: {
  messages: { type: string; summary: string }[];
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col gap-2", className)}>
      {messages.map((m, i) => (
        <li
          key={`${m.type}-${i}`}
          className="rounded-[12px] border border-[var(--z-line)] bg-[var(--z-glass)] px-3 py-2.5"
        >
          <div className="font-mono text-[9.5px] text-fg-dim">
            {i + 1}. {m.type}
          </div>
          <div className="mt-1 text-[12.5px] text-fg">{m.summary}</div>
        </li>
      ))}
    </ol>
  );
}

export function FeeSummary({
  rows,
  className,
}: {
  rows: { label: string; value: string; accent?: boolean }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {rows.map((r) => (
        <KeyValueRow key={r.label} label={r.label} value={r.value} accent={r.accent} />
      ))}
    </div>
  );
}

export function SigningRequest({
  dapp,
  messages,
  fees,
  onReject,
  onApprove,
  className,
}: {
  dapp: string;
  messages: { type: string; summary: string }[];
  fees: { label: string; value: string }[];
  onReject?: () => void;
  onApprove?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <SectionLabel>Signing request</SectionLabel>
      <div className="text-[15px] font-medium text-fg">{dapp}</div>
      <MessageDecodeList messages={messages} />
      <FeeSummary rows={fees} />
      <Callout tone="info">Simulation returned no errors.</Callout>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onReject}>
          Reject
        </Button>
        <Button className="flex-[1.4]" onClick={onApprove}>
          Approve
        </Button>
      </div>
    </div>
  );
}

export function IbcRouteDiagram({
  from,
  to,
  channel,
  className,
}: {
  from: string;
  to: string;
  channel: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[14px] border border-[var(--z-line)] p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-[var(--z-line)] px-3 py-1.5 font-mono text-[11px]">
          {from}
        </span>
        <span className="h-px flex-1 bg-[var(--z-line-strong)]" />
        <span className="size-2 rounded-full bg-fg" />
        <span className="h-px flex-1 bg-[var(--z-line-strong)]" />
        <span className="rounded-full border border-[var(--z-line)] px-3 py-1.5 font-mono text-[11px]">
          {to}
        </span>
      </div>
      <div className="mt-3 text-center font-mono text-[10px] text-fg-muted">{channel}</div>
    </div>
  );
}

export function SwapPair({
  fromLabel,
  fromValue,
  toLabel,
  toValue,
  onFlip,
  className,
}: {
  fromLabel: string;
  fromValue: ReactNode;
  toLabel: string;
  toValue: ReactNode;
  onFlip?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      <div className="rounded-[18px] border border-[var(--z-line)] bg-[var(--z-glass)] p-4">
        <SectionLabel>{fromLabel}</SectionLabel>
        <div className="mt-2">{fromValue}</div>
      </div>
      <button
        type="button"
        onClick={onFlip}
        className={cn(
          "absolute left-1/2 top-1/2 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
          "rounded-full border border-[var(--z-line-strong)] bg-surface text-fg",
          focusRing,
        )}
        aria-label="Flip pair"
      >
        ↕
      </button>
      <div className="rounded-[18px] border border-[var(--z-line)] bg-[var(--z-glass)] p-4">
        <SectionLabel>{toLabel}</SectionLabel>
        <div className="mt-2">{toValue}</div>
      </div>
    </div>
  );
}

export function VoteGrid({
  value,
  onChange,
  className,
}: {
  value?: "yes" | "no" | "veto" | "abstain";
  onChange: (v: "yes" | "no" | "veto" | "abstain") => void;
  className?: string;
}) {
  const opts = [
    { id: "yes" as const, label: "Yes" },
    { id: "no" as const, label: "No" },
    { id: "veto" as const, label: "No with veto" },
    { id: "abstain" as const, label: "Abstain" },
  ];
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {opts.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            data-selected={selected || undefined}
            onClick={() => onChange(o.id)}
            className={cn(
              "h-[42px] rounded-[14px] border text-[13px] font-medium transition-colors",
              selected
                ? "border-fg bg-[var(--z-state-selected)] shadow-[inset_2px_0_0_var(--z-accent)]"
                : "border-[var(--z-line)] text-fg-muted hover:bg-[var(--z-state-hover)]",
              focusRing,
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProposalCard({
  id,
  status,
  title,
  yesPct,
  className,
}: {
  id: string;
  status: string;
  title: string;
  yesPct: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[14px] bg-[image:var(--z-surface-gradient)] p-4", className)}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[length:var(--z-type-meta)] text-fg-muted">{id}</span>
        <span className="rounded-full bg-[var(--z-glass-2)] px-2 py-0.5 font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
          {status}
        </span>
      </div>
      <div className="mt-2 text-[length:var(--z-type-heading)] font-medium text-fg">{title}</div>
      <div className="mt-3">
        <Progress value={yesPct} />
      </div>
    </div>
  );
}

export function ProgressTracker({
  title,
  step,
  total,
  steps,
  className,
}: {
  title: string;
  step: number;
  total: number;
  steps: { label: string; state: "done" | "current" | "pending" }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between font-mono text-[10.5px] text-fg-muted">
        <span>{title}</span>
        <span>
          {step}/{total}
        </span>
      </div>
      <Progress value={(step / total) * 100} />
      <ul className="flex flex-col gap-2.5 font-mono text-[10.5px]">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-[15px] items-center justify-center rounded-full text-[9px]",
                s.state === "done" && "bg-fg text-bg",
                s.state === "current" && "border-2 border-fg",
                s.state === "pending" && "border-2 border-[var(--z-line-strong)] text-fg-dim",
              )}
            >
              {s.state === "done" ? "✓" : ""}
            </span>
            <span className={s.state === "pending" ? "text-fg-dim" : "text-fg"}>
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StakeSummary({
  staked,
  apr,
  claimable,
  className,
}: {
  staked: string;
  apr: string;
  claimable: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-3 rounded-[14px] bg-[image:var(--z-surface-gradient)] p-4",
        className,
      )}
    >
      <div>
        <SectionLabel>Staked</SectionLabel>
        <div className="mt-1 text-[16px] font-medium tabular-nums">{staked}</div>
      </div>
      <div>
        <SectionLabel>APR</SectionLabel>
        <div className="mt-1 text-[16px] font-medium tabular-nums">{apr}</div>
      </div>
      <div>
        <SectionLabel>Claimable</SectionLabel>
        <div className="mt-1 text-[16px] font-medium tabular-nums">{claimable}</div>
      </div>
    </div>
  );
}

export function MissionRow({
  title,
  xp,
  done,
  className,
}: {
  title: string;
  xp: string;
  done?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 py-2.5", className)}>
      <span
        className={cn(
          "flex size-[30px] items-center justify-center rounded-[10px] text-[12px]",
          done
            ? "bg-fg text-bg"
            : "bg-[var(--z-glass-2)] text-fg-muted",
        )}
      >
        {done ? "✓" : "○"}
      </span>
      <span className="flex-1 text-[13px] font-medium text-fg">{title}</span>
      <span className="font-mono text-[10px] text-fg-muted">{xp}</span>
    </div>
  );
}

export function DappRow({
  name,
  meta,
  iconUrl,
  connected,
  className,
}: {
  name: string;
  meta: string;
  iconUrl?: string;
  connected?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 py-2.5", className)}>
      <span className="flex size-[30px] items-center justify-center overflow-hidden rounded-full bg-[var(--z-glass-2)]">
        {iconUrl ? <img src={iconUrl} alt="" className="size-full object-cover" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-fg">{name}</span>
        <span className="mt-0.5 block font-mono text-[10px] text-fg-muted">{meta}</span>
      </span>
      {connected ? (
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--z-success)]">
          <span className="size-1.5 rounded-full bg-[var(--z-success)]" />
          connected
        </span>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">
          Open
        </span>
      )}
    </div>
  );
}
