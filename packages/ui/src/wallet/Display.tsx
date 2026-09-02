"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn, focusRing, interactiveQuiet, interactiveSurface, amountInlineClass } from "../lib/cn";
import { Avatar } from "../primitives/WalletAvatar";
import {
  activityAmountClass,
  activityPresentation,
  type ActivityKind,
} from "./activity";
import { ValidatorLogo } from "./ValidatorLogo";
import type { ValidatorLogoInput } from "./validatorLogoResolve";

export function truncateAddress(address: string, left = 8, right = 4) {
  if (address.length <= left + right + 1) return address;
  return `${address.slice(0, left)}…${address.slice(-right)}`;
}

export function AddressChip({
  address,
  className,
  copyable,
  onCopy,
}: {
  address: string;
  className?: string;
  copyable?: boolean;
  onCopy?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[length:var(--z-type-meta)] text-fg-muted",
        copyable && interactiveQuiet,
        focusRing,
        className,
      )}
      onClick={copyable ? onCopy : undefined}
      disabled={!copyable}
    >
      {truncateAddress(address)}
      {copyable ? <span className="text-[length:var(--z-type-micro)] uppercase tracking-wider">copy</span> : null}
    </button>
  );
}

export function Amount({
  value,
  denom,
  size = "md",
  className,
}: {
  value: string;
  denom?: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "tabular-nums tracking-tight text-fg",
        size === "sm" && "text-[13.5px] font-bold",
        size === "md" && "text-[15px] font-bold",
        size === "lg" && "text-[22px] font-bold tracking-[-0.03em]",
        size === "hero" && "text-[length:var(--z-type-hero)] font-bold tracking-[-0.04em]",
        className,
      )}
    >
      {value}
      {denom ? (
        <span className="ml-1.5 align-baseline font-mono text-[0.72em] font-semibold text-fg-muted">
          {denom}
        </span>
      ) : null}
    </span>
  );
}

export function TokenLogo({
  src,
  symbol,
  size = 32,
  verified,
  className,
}: {
  src?: string;
  symbol: string;
  size?: number;
  verified?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Avatar src={src} alt={symbol} fallback={symbol} size={size} />
      {verified ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-[15px] items-center justify-center rounded-full border-2 border-surface bg-[var(--z-info)] text-[8px] text-bg">
          ✓
        </span>
      ) : null}
    </span>
  );
}

export function ChainBadge({
  name,
  iconUrl,
  className,
}: {
  name: string;
  iconUrl?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--z-line)] bg-surface py-1.5 pl-1.5 pr-2.5 text-[length:var(--z-type-row)] font-medium",
        className,
      )}
    >
      <Avatar src={iconUrl} fallback={name} size={20} />
      {name}
    </span>
  );
}

export function ChainStack({
  icons,
  extra,
  size = 32,
  className,
}: {
  icons: { src?: string; alt: string }[];
  extra?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      {icons.map((icon, i) => (
        <span
          key={`${icon.alt}-${i}`}
          className="rounded-full border-2 border-surface"
          style={{ marginLeft: i === 0 ? 0 : -10 }}
        >
          <Avatar src={icon.src} alt={icon.alt} fallback={icon.alt} size={size} />
        </span>
      ))}
      {extra ? (
        <span
          className="flex items-center justify-center rounded-full border-2 border-surface bg-[var(--z-glass-2)] font-mono text-[9.5px] text-fg-muted"
          style={{ width: size, height: size, marginLeft: -10 }}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  );
}

export function AssetRow({
  symbol,
  chain,
  balance,
  value,
  iconUrl,
  selected,
  onClick,
  className,
}: {
  symbol: string;
  chain?: string;
  balance: string;
  value: string;
  iconUrl?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      data-selected={selected || undefined}
      className={cn(
        "flex items-center gap-3 px-5 py-3",
        onClick && cn("cursor-pointer", interactiveSurface),
        selected &&
          "bg-[var(--z-state-selected)] shadow-[inset_2px_0_0_var(--z-accent)]",
        className,
      )}
    >
      <TokenLogo src={iconUrl} symbol={symbol} size={32} />
      <span className="min-w-0 flex-[2]">
        <span className="block text-[length:var(--z-type-row)] font-medium text-fg">{symbol}</span>
        {chain ? (
          <span className="mt-0.5 block font-mono text-[length:var(--z-type-meta)] text-fg-muted">
            {chain}
          </span>
        ) : null}
      </span>
      <span className="flex-1 text-right font-mono text-[length:var(--z-type-row)] tabular-nums text-fg">
        {balance}
      </span>
      <span className="flex-1 text-right text-[length:var(--z-type-row)] font-medium tabular-nums text-fg">
        {value}
      </span>
    </div>
  );
}

export function ValidatorRow({
  name,
  commission,
  apr,
  staked,
  jailed,
  logo,
  className,
}: {
  name: string;
  commission: string;
  apr: string;
  staked?: string;
  jailed?: boolean;
  logo?: ValidatorLogoInput;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3", className)}>
      {logo ? (
        <ValidatorLogo
          {...logo}
          moniker={name}
          size={30}
        />
      ) : (
        <Avatar fallback={name} size={30} />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[length:var(--z-type-row)] font-medium text-fg">{name}</span>
        <span
          className={cn(
            "mt-0.5 block font-mono text-[length:var(--z-type-meta)]",
            jailed ? "text-[var(--z-danger)]" : "text-fg-muted",
          )}
        >
          {jailed ? "JAILED" : `comm ${commission}`}
        </span>
      </span>
      <span className="font-mono text-[length:var(--z-type-row)] tabular-nums text-fg">{apr}</span>
      {staked ? (
        <span className="font-mono text-[length:var(--z-type-meta)] tabular-nums text-fg-muted">
          {staked}
        </span>
      ) : null}
    </div>
  );
}

export function ActivityRow({
  title,
  subtitle,
  amount,
  status,
  kind,
  icon,
  className,
}: {
  title: string;
  subtitle: string;
  amount?: string;
  status?: "confirmed" | "pending" | "failed";
  /** Structured history kind drives badge colour + default glyph. */
  kind?: ActivityKind | string;
  icon?: ReactNode;
  className?: string;
}) {
  const success = status !== "failed";
  const presentation = activityPresentation(kind, success);
  const amountClass = activityAmountClass(kind, success, amount);

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3", className)}>
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full border text-[15px] font-semibold leading-none"
        style={{
          color: presentation.fg,
          background: presentation.bg,
          borderColor: presentation.border,
        }}
        aria-hidden
      >
        {icon ?? presentation.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[length:var(--z-type-row)] font-medium text-fg">{title}</span>
        <span className="mt-0.5 block font-mono text-[length:var(--z-type-meta)] text-fg-muted">
          {subtitle}
        </span>
      </span>
      <span className="text-right">
        {amount ? (
          <span
            className={cn(
              amountInlineClass,
              "block",
              amountClass,
            )}
          >
            {amount}
          </span>
        ) : null}
        {status ? (
          <span
            className={cn(
              "mt-0.5 block font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider",
              status === "failed" && "text-[var(--z-danger)]",
              status === "pending" && "text-fg-dim",
              status === "confirmed" && "text-fg-muted",
            )}
          >
            {status}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function NotificationRow({
  title,
  meta,
  unread,
  className,
}: {
  title: string;
  meta: string;
  unread?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[14px] px-3 py-3",
        unread
          ? "bg-[image:var(--z-hero-soft-gradient)]"
          : "bg-[var(--z-glass)]",
        className,
      )}
    >
      <span className="mt-0.5 flex size-9 items-center justify-center rounded-[10px] bg-[var(--z-glass-2)] text-[length:var(--z-type-row)]">
        ●
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[length:var(--z-type-row)] font-medium text-fg">{title}</span>
        <span className="mt-1 block font-mono text-[length:var(--z-type-meta)] text-fg-muted">{meta}</span>
      </span>
      {unread ? (
        <span className="mt-1 size-1.5 rounded-full bg-fg" aria-label="Unread" />
      ) : null}
    </div>
  );
}

export function WalletChip({
  name,
  seed,
  avatarUrl,
  onClick,
  className,
}: {
  name: string;
  /** Prefer wallet address for a stable orb across platforms. */
  seed?: string;
  avatarUrl?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--z-line)] bg-[var(--z-glass)] py-1 pl-1 pr-2.5",
        "text-[length:var(--z-type-row)] font-medium text-fg",
        interactiveSurface,
        "hover:border-[var(--z-line-strong)]",
        focusRing,
        className,
      )}
    >
      <Avatar src={avatarUrl} seed={seed} fallback={name} size={22} />
      {name}
      <span className="text-[14px] leading-none text-fg-dim" aria-hidden>
        ▾
      </span>
    </button>
  );
}

export function NetworkChip({
  name,
  count,
  onClick,
  className,
}: {
  name: string;
  count?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--z-line)] px-2.5 py-1.5",
        "font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted",
        interactiveSurface,
        "hover:border-[var(--z-line-strong)] hover:text-fg",
        focusRing,
        className,
      )}
    >
      {name}
      {count !== undefined ? (
        <span className="rounded-full bg-[var(--z-glass-2)] px-1.5 py-0.5 text-[length:var(--z-type-micro)]">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function ConnectedBanner({
  domain,
  onManage,
  className,
}: {
  domain: string;
  onManage?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-y border-[var(--z-line)] bg-[var(--z-state-selected)] px-3 py-2",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-[var(--z-success)]" aria-hidden />
      <span className="flex-1 truncate font-mono text-[length:var(--z-type-meta)] text-fg">{domain}</span>
      {onManage ? (
        <button
          type="button"
          onClick={onManage}
          className={cn("font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted", focusRing)}
        >
          Manage
        </button>
      ) : null}
    </div>
  );
}
