"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "../primitives/WalletAvatar";
import { Callout, EmptyState, SectionLabel, Skeleton } from "../primitives/Feedback";
import {
  channelTrust,
  formatApproxDuration,
  routeHopKindLabel,
  sourceGasNote,
  toneStyle,
  type ChannelSource,
  type ChannelState,
  type RouteHopKind,
} from "./interchain";

/**
 * One leg of a planned route.
 *
 * Field names mirror `RouteHop` in `@zunialab/interchain` so a plan's hops can
 * be spread into this with only the display extras added.
 */
export interface RoutePreviewHop {
  /** Chain the hop leaves from. */
  readonly chainId: string;
  /** Human name; falls back to {@link chainId}, never to a blank. */
  readonly chainName?: string;
  readonly chainIconUrl?: string;
  /** Chain the hop arrives on, or `null` when the counterparty is unresolved. */
  readonly counterpartyChainId?: string | null;
  readonly counterpartyChainName?: string;
  readonly counterpartyChainIconUrl?: string;
  /** Channel on {@link chainId}. Empty for a swap that moves no packet. */
  readonly channelId: string;
  /** Port on {@link chainId}; `transfer` when omitted. */
  readonly port?: string;
  readonly kind?: RouteHopKind;
  /** Where the channel id came from. Mirrors `ChannelRouteSource`. */
  readonly channelSource?: ChannelSource;
  /** Confirmed open on chain. Absent or false renders as NOT verified. */
  readonly channelVerified?: boolean;
  /** Last observed channel state. Mirrors `IbcChannelState`. */
  readonly channelState?: ChannelState;
}

export interface RoutePreviewProps {
  readonly hops: readonly RoutePreviewHop[];
  /** From `RoutePlan.estimatedDurationSeconds`. Omitted rather than guessed. */
  readonly estimatedDurationSeconds?: number | null;
  /** From `RoutePlan.warnings`. Rendered verbatim. */
  readonly warnings?: readonly string[];
  /** From `RoutePlan.requiresPfm`. */
  readonly requiresPfm?: boolean;
  /** From `RoutePlan.requiresIbcHooks`. */
  readonly requiresIbcHooks?: boolean;
  /**
   * Chain the user signs on. When given, the panel states who pays for what —
   * the most common question a cross-chain send produces.
   */
  readonly gasChainName?: string;
  /** Venue running a contract mid-route, e.g. `"Osmosis"`. */
  readonly swapVenueName?: string;
  readonly loading?: boolean;
  /** Planning failed. Shown instead of a route; never alongside a partial one. */
  readonly error?: string | null;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  /** Slot under the route, e.g. a "Verify channels" control. */
  readonly footer?: ReactNode;
  /** Tighter rows for the 360px extension popup. */
  readonly compact?: boolean;
  readonly className?: string;
  /** Heading text; pass `null` to drop the heading in an already-titled panel. */
  readonly title?: string | null;
}

function chainLabel(id: string, name?: string): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : id;
}

/**
 * The ordered hops of a planned cross-chain route, with per-hop channel trust.
 *
 * The unverified state is loud on purpose. A channel id that looks right but
 * connects somewhere else does not fail: it succeeds, and mints a token the
 * destination chain has no record of. That is the one error in this flow a user
 * cannot undo, so it gets a fill, a border, a glyph and a sentence rather than
 * a grey footnote.
 */
export function RoutePreview({
  hops,
  estimatedDurationSeconds,
  warnings,
  requiresPfm,
  requiresIbcHooks,
  gasChainName,
  swapVenueName,
  loading = false,
  error,
  onRetry,
  retryLabel = "Try again",
  emptyTitle = "No route yet",
  emptyDescription = "Pick a destination chain and an amount to plan a route.",
  footer,
  compact = false,
  className,
  title = "Route",
}: RoutePreviewProps) {
  if (error) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {title ? <SectionLabel>{title}</SectionLabel> : null}
        <Callout tone="danger" title="Could not plan this route">
          {error}
          {onRetry ? (
            <>
              {" "}
              <button
                type="button"
                onClick={onRetry}
                className="underline underline-offset-2 outline-none focus-visible:shadow-[0_0_0_1px_var(--z-focus-ring)]"
              >
                {retryLabel}
              </button>
            </>
          ) : null}
        </Callout>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-3", className)} aria-busy="true">
        {title ? <SectionLabel>{title}</SectionLabel> : null}
        <span className="sr-only">Planning route</span>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-[14px] border border-[var(--z-line)] p-3"
          >
            <Skeleton className="size-7 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-2.5 w-1/2" />
              <Skeleton className="h-2 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hops.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {title ? <SectionLabel>{title}</SectionLabel> : null}
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  const trusts = hops.map((hop) =>
    channelTrust({
      verified: hop.channelVerified,
      source: hop.channelSource,
      state: hop.channelState,
    }),
  );
  const loudCount = trusts.filter((t) => t.loud).length;
  const duration = formatApproxDuration(estimatedDurationSeconds);
  const first = hops[0];
  const last = hops[hops.length - 1];

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {title || duration ? (
        <div className="flex items-center justify-between gap-3">
          {title ? <SectionLabel>{title}</SectionLabel> : <span />}
          {duration ? (
            <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
              ≈ {duration}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Endpoints first: most users only want to know where it starts and ends. */}
      {first && last ? (
        <div className="flex items-center gap-2 rounded-[14px] bg-[var(--z-glass)] px-3 py-2.5">
          <Avatar
            src={first.chainIconUrl}
            fallback={chainLabel(first.chainId, first.chainName)}
            size={20}
          />
          <span className="min-w-0 flex-1 truncate text-[length:var(--z-type-row)] font-medium text-fg">
            {chainLabel(first.chainId, first.chainName)}
          </span>
          <span className="shrink-0 font-mono text-[length:var(--z-type-meta)] text-fg-dim" aria-hidden>
            →
          </span>
          <span className="min-w-0 flex-1 truncate text-right text-[length:var(--z-type-row)] font-medium text-fg">
            {chainLabel(
              last.counterpartyChainId ?? last.chainId,
              last.counterpartyChainName,
            )}
          </span>
          <Avatar
            src={last.counterpartyChainIconUrl}
            fallback={chainLabel(
              last.counterpartyChainId ?? last.chainId,
              last.counterpartyChainName,
            )}
            size={20}
          />
        </div>
      ) : null}

      {loudCount > 0 ? (
        <Callout
          tone="warning"
          title={
            loudCount === 1
              ? "1 channel on this route is not verified"
              : `${loudCount} channels on this route are not verified`
          }
        >
          Sending over the wrong channel does not fail — it delivers a token the
          destination chain does not recognise, and that cannot be undone by
          retrying. Verify each highlighted hop before you sign.
        </Callout>
      ) : null}

      <ol className="flex min-w-0 flex-col gap-2">
        {hops.map((hop, i) => {
          const trust = trusts[i]!;
          const tone = toneStyle(trust.tone);
          const kind = hop.kind ?? "transfer";
          const port = hop.port ?? "transfer";
          const from = chainLabel(hop.chainId, hop.chainName);
          const to = chainLabel(
            hop.counterpartyChainId ?? "Unresolved chain",
            hop.counterpartyChainName,
          );

          return (
            <li
              key={`${hop.chainId}-${hop.channelId}-${i}`}
              className={cn(
                "min-w-0 rounded-[14px] border",
                compact ? "p-2.5" : "p-3",
                trust.loud
                  ? "border-[color:var(--loud-border)] bg-[color:var(--loud-bg)]"
                  : "border-[var(--z-line)] bg-[var(--z-glass)]",
              )}
              style={
                trust.loud
                  ? ({
                      "--loud-border": tone.border,
                      "--loud-bg": tone.bg,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border font-mono text-[9px] leading-none"
                  style={{
                    color: tone.fg,
                    background: tone.bg,
                    borderColor: tone.border,
                  }}
                  aria-hidden
                >
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                    <Avatar src={hop.chainIconUrl} fallback={from} size={16} />
                    <span className="truncate text-[length:var(--z-type-row)] font-medium text-fg">
                      {from}
                    </span>
                    <span className="font-mono text-[length:var(--z-type-meta)] text-fg-dim" aria-hidden>
                      →
                    </span>
                    <Avatar
                      src={hop.counterpartyChainIconUrl}
                      fallback={to}
                      size={16}
                    />
                    <span
                      className={cn(
                        "truncate text-[length:var(--z-type-row)] font-medium",
                        hop.counterpartyChainId ? "text-fg" : "text-fg-dim italic",
                      )}
                    >
                      {hop.counterpartyChainId ? to : "Counterparty unresolved"}
                    </span>
                  </div>

                  <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
                      {routeHopKindLabel(kind)}
                    </span>
                    {hop.channelId ? (
                      <code className="rounded-[6px] bg-[var(--z-glass-2)] px-1.5 py-0.5 font-mono text-[length:var(--z-type-micro)] text-fg">
                        {port}/{hop.channelId}
                      </code>
                    ) : (
                      <span className="font-mono text-[length:var(--z-type-micro)] text-fg-dim">
                        no packet
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider"
                      style={{
                        color: tone.fg,
                        background: tone.bg,
                        borderColor: tone.border,
                      }}
                    >
                      <span aria-hidden>
                        {trust.level === "verified" ? "✓" : "!"}
                      </span>
                      {trust.label}
                    </span>
                    <span className="font-mono text-[length:var(--z-type-micro)] text-fg-dim">
                      {trust.sourceLabel}
                    </span>
                  </div>

                  {trust.loud ? (
                    <p className="mt-1.5 m-0 text-[length:var(--z-type-meta)] leading-relaxed text-fg-muted">
                      {trust.detail}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {requiresPfm || requiresIbcHooks ? (
        <div className="flex flex-wrap gap-1.5">
          {requiresPfm ? (
            <span className="rounded-full bg-[var(--z-glass-2)] px-2 py-1 font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
              Packet forward
            </span>
          ) : null}
          {requiresIbcHooks ? (
            <span className="rounded-full bg-[var(--z-glass-2)] px-2 py-1 font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
              Contract call on arrival
            </span>
          ) : null}
        </div>
      ) : null}

      {warnings && warnings.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {warnings.map((w) => (
            <li
              key={w}
              className="flex gap-2 text-[length:var(--z-type-meta)] leading-relaxed text-fg-muted"
            >
              <span
                className="mt-[7px] size-1 shrink-0 rounded-full bg-[var(--z-warning)]"
                aria-hidden
              />
              {w}
            </li>
          ))}
        </ul>
      ) : null}

      {gasChainName ? (
        <p className="m-0 text-[length:var(--z-type-meta)] leading-relaxed text-fg-muted">
          {sourceGasNote(gasChainName, { venueName: swapVenueName })}
        </p>
      ) : null}

      {footer}
    </div>
  );
}
