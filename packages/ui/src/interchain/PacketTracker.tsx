"use client";

import type { ReactNode } from "react";
import { cn, focusRing, interactiveQuiet } from "../lib/cn";
import { Button } from "../primitives/Button";
import { Callout, EmptyState, SectionLabel, Skeleton } from "../primitives/Feedback";
import { truncateAddress } from "../wallet/Display";
import {
  packetFundsSummary,
  packetStatusPresentation,
  resolveHopStatus,
  toneStyle,
  type PacketFailureKind,
  type PacketFundsSummary,
  type PacketHopStatus,
} from "./interchain";

/**
 * One hop as last observed.
 *
 * Field names mirror `RouteHopTrace` in `@zunialab/interchain` (a
 * `PacketHopTrace` plus the escalation fields), so a tracked route's hops can be
 * spread in with only the display extras added.
 */
export interface PacketTrackerHop {
  readonly chainId: string;
  readonly chainName?: string;
  readonly chainIconUrl?: string;
  readonly counterpartyChainId?: string | null;
  readonly counterpartyChainName?: string;
  readonly channelId?: string;
  readonly port?: string;
  /** Packet sequence as a decimal string; `null` before the send is indexed. */
  readonly sequence?: string | null;
  readonly sendTxHash?: string | null;
  readonly receiveTxHash?: string | null;
  readonly status: PacketHopStatus;
  /** Error acknowledgement text when `status` is `failed`. */
  readonly error?: string | null;
  /**
   * From `RouteHopTrace.stalled`. The engine decides this against a per-hop-kind
   * threshold; the tracker only renders it. Do not compute it from a clock here
   * — a swap hop and a forward hop do not take the same time.
   */
  readonly stalled?: boolean;
}

/**
 * Resolve an explorer URL for a hash.
 *
 * Returns `null` when the host has no explorer for that chain. The tracker then
 * renders the hash as plain selectable text: a link that goes nowhere is worse
 * than no link, and a made-up explorer domain is worse than both.
 */
export type TxUrlResolver = (chainId: string, txHash: string) => string | null;

export interface PacketTrackerProps {
  readonly hops: readonly PacketTrackerHop[];
  /** The tx the user signed — the only hash they recognise. */
  readonly sourceTxHash?: string | null;
  /** Chain the source tx was signed on, for {@link txUrl}. */
  readonly sourceChainId?: string;
  /**
   * From `RouteTrace.failure`. `swap-delivery-failed` is the one that needs the
   * user: the swap ran, the outbound transfer did not land, and only the
   * `local_recovery_addr` can pull the output out with `{"recover":{}}`.
   */
  readonly failure?: PacketFailureKind | null;
  /**
   * `RouteTrace.recovery.msg` is non-null, i.e. a recover message can actually
   * be built. False means the crosschain-swap contract address is not in host
   * config; the panel then says so rather than offering a dead button, because
   * that address is deployment data and must never be a constant.
   */
  readonly recoveryReady?: boolean;
  readonly onRecover?: () => void;
  readonly recoverLabel?: string;
  /** Disable the recover control with a visible reason (e.g. no signer). */
  readonly recoverDisabledReason?: string | null;
  readonly txUrl?: TxUrlResolver;
  readonly onCopyTxHash?: (txHash: string) => void;
  readonly loading?: boolean;
  /** The status read failed. Shown instead of stale hops presented as live. */
  readonly error?: string | null;
  readonly onRefresh?: () => void;
  readonly lastUpdatedAt?: number | null;
  readonly compact?: boolean;
  readonly className?: string;
  readonly title?: string | null;
  /** Slot under the hops. */
  readonly footer?: ReactNode;
}

function chainLabel(id: string, name?: string): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : id;
}

function formatClock(ms: number | null | undefined): string | null {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return null;
  try {
    return new Date(ms).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    // Some embedded runtimes ship without full ICU. A missing timestamp is
    // better than a thrown render.
    return null;
  }
}

function TxRef({
  label,
  chainId,
  txHash,
  txUrl,
  onCopyTxHash,
}: {
  label: string;
  chainId: string;
  txHash: string;
  txUrl?: TxUrlResolver;
  onCopyTxHash?: (txHash: string) => void;
}) {
  const href = txUrl?.(chainId, txHash) ?? null;
  const short = truncateAddress(txHash, 6, 6);

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-dim">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "truncate font-mono text-[length:var(--z-type-micro)] text-fg underline underline-offset-2",
            interactiveQuiet,
            focusRing,
          )}
          aria-label={`${label} transaction ${txHash} on ${chainId}, opens in a new tab`}
        >
          {short}
        </a>
      ) : (
        // No explorer configured for this chain. Show the hash and let the user
        // take it somewhere themselves rather than inventing a domain.
        <span
          className="truncate font-mono text-[length:var(--z-type-micro)] text-fg-muted"
          title={txHash}
        >
          {short}
        </span>
      )}
      {onCopyTxHash ? (
        <button
          type="button"
          onClick={() => onCopyTxHash(txHash)}
          className={cn(
            "font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider",
            interactiveQuiet,
            focusRing,
          )}
          aria-label={`Copy ${label} transaction hash`}
        >
          copy
        </button>
      ) : null}
    </span>
  );
}

/**
 * Hop-by-hop live status for a cross-chain transfer.
 *
 * The header is a {@link PacketFundsSummary}, not a percentage. A progress bar
 * cannot say the difference between "moving", "stuck but safe", "failed and
 * refunded" and "recoverable, and nothing will happen until you claim it" — and
 * the user's next action differs in every one of those. All three products used
 * to render a hardcoded bar here, which said "almost there" while funds sat in
 * a contract waiting for a recover call.
 *
 * Every judgement about the chain is made by `@zunialab/interchain` and passed
 * in: `hop.status` and `hop.stalled` from `RouteHopTrace`, `failure` and
 * `recoveryReady` from `RouteTrace`. This component decides only what those
 * facts should look like and what they should say.
 */
export function PacketTracker({
  hops,
  sourceTxHash,
  sourceChainId,
  failure,
  recoveryReady = false,
  onRecover,
  recoverLabel = "Recover funds",
  recoverDisabledReason,
  txUrl,
  onCopyTxHash,
  loading = false,
  error,
  onRefresh,
  lastUpdatedAt,
  compact = false,
  className,
  title = "Transfer status",
  footer,
}: PacketTrackerProps) {
  if (error) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {title ? <SectionLabel>{title}</SectionLabel> : null}
        <Callout tone="danger" title="Could not read the transfer status">
          {error} The transfer itself is unaffected by this — only our view of it.
        </Callout>
        {onRefresh ? (
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            Check again
          </Button>
        ) : null}
      </div>
    );
  }

  if (loading && hops.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)} aria-busy="true">
        {title ? <SectionLabel>{title}</SectionLabel> : null}
        <span className="sr-only">Reading transfer status</span>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-[14px] border border-[var(--z-line)] p-3"
          >
            <Skeleton className="size-7 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-2.5 w-2/3" />
              <Skeleton className="h-2 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const resolved = hops.map((hop) => ({
    hop,
    status: resolveHopStatus(hop.status, hop.stalled),
  }));

  const summary: PacketFundsSummary = packetFundsSummary(
    resolved.map((r) => ({ status: r.status })),
    { failure, recoveryReady },
  );
  const summaryTone = toneStyle(summary.tone);
  const clock = formatClock(lastUpdatedAt);

  if (hops.length === 0 && !summary.actionRequired) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {title ? <SectionLabel>{title}</SectionLabel> : null}
        <EmptyState
          title={summary.title}
          description={summary.detail}
          action={
            onRefresh ? (
              <Button variant="secondary" size="sm" onClick={onRefresh}>
                Check again
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {title || clock ? (
        <div className="flex items-center justify-between gap-3">
          {title ? <SectionLabel>{title}</SectionLabel> : <span />}
          {clock ? (
            <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-dim">
              read {clock}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* One headline that names where the funds are and whose move it is. */}
      <div
        role="status"
        aria-live="polite"
        className="flex min-w-0 gap-2.5 rounded-[14px] border p-3"
        style={{ background: summaryTone.bg, borderColor: summaryTone.border }}
      >
        <span
          className="mt-0.5 size-2 shrink-0 rounded-full"
          style={{ background: summaryTone.fg }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div
            className="text-[length:var(--z-type-row)] font-medium"
            style={{ color: summaryTone.fg }}
          >
            {summary.title}
          </div>
          <p className="m-0 mt-1 text-[length:var(--z-type-meta)] leading-relaxed text-fg-muted">
            {summary.detail}
          </p>
          {summary.actionRequired ? (
            <div className="mt-2.5 flex flex-col gap-1.5">
              <Button
                size="sm"
                onClick={onRecover}
                disabled={
                  !onRecover || !recoveryReady || Boolean(recoverDisabledReason)
                }
              >
                {recoverLabel}
              </Button>
              {recoverDisabledReason ? (
                <span className="font-mono text-[length:var(--z-type-micro)] text-fg-muted">
                  {recoverDisabledReason}
                </span>
              ) : null}
              {!recoverDisabledReason && !recoveryReady ? (
                <span className="font-mono text-[length:var(--z-type-micro)] text-fg-muted">
                  No crosschain-swap contract is configured, so the recover call
                  cannot be built.
                </span>
              ) : null}
              {!recoverDisabledReason && recoveryReady && !onRecover ? (
                <span className="font-mono text-[length:var(--z-type-micro)] text-fg-muted">
                  Recovery is not wired up in this build.
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {sourceTxHash ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[14px] bg-[var(--z-glass)] px-3 py-2">
          <TxRef
            label="Signed"
            chainId={sourceChainId ?? hops[0]?.chainId ?? ""}
            txHash={sourceTxHash}
            txUrl={txUrl}
            onCopyTxHash={onCopyTxHash}
          />
        </div>
      ) : null}

      <ol className="flex min-w-0 flex-col gap-2">
        {resolved.map(({ hop, status }, i) => {
          const presentation = packetStatusPresentation(status);
          const tone = toneStyle(presentation.tone);
          const from = chainLabel(hop.chainId, hop.chainName);
          const to = hop.counterpartyChainId
            ? chainLabel(hop.counterpartyChainId, hop.counterpartyChainName)
            : null;

          return (
            <li
              key={`${hop.chainId}-${hop.channelId ?? "nochannel"}-${i}`}
              className={cn(
                "min-w-0 rounded-[14px] border border-[var(--z-line)] bg-[var(--z-glass)]",
                compact ? "p-2.5" : "p-3",
              )}
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border text-[11px] leading-none"
                  style={{
                    color: tone.fg,
                    background: tone.bg,
                    borderColor: tone.border,
                  }}
                  aria-hidden
                >
                  {presentation.glyph}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1">
                    <span className="truncate text-[length:var(--z-type-row)] font-medium text-fg">
                      {to ? `${from} → ${to}` : from}
                    </span>
                    {/* Text label, not colour alone: the state has to survive a
                        monochrome or high-contrast rendering. */}
                    <span
                      className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider"
                      style={{ color: tone.fg }}
                    >
                      {presentation.label}
                    </span>
                  </div>

                  <p className="m-0 mt-1 text-[length:var(--z-type-meta)] leading-relaxed text-fg-muted">
                    {presentation.detail}
                  </p>

                  {hop.error ? (
                    <p className="m-0 mt-1 font-mono text-[length:var(--z-type-micro)] leading-relaxed text-[var(--z-danger-fg)]">
                      {hop.error}
                    </p>
                  ) : null}

                  <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    {hop.channelId ? (
                      <code className="rounded-[6px] bg-[var(--z-glass-2)] px-1.5 py-0.5 font-mono text-[length:var(--z-type-micro)] text-fg-muted">
                        {hop.port ?? "transfer"}/{hop.channelId}
                      </code>
                    ) : null}
                    {hop.sequence ? (
                      <span className="font-mono text-[length:var(--z-type-micro)] text-fg-dim">
                        seq {hop.sequence}
                      </span>
                    ) : null}
                    {hop.sendTxHash ? (
                      <TxRef
                        label="send"
                        chainId={hop.chainId}
                        txHash={hop.sendTxHash}
                        txUrl={txUrl}
                        onCopyTxHash={onCopyTxHash}
                      />
                    ) : null}
                    {hop.receiveTxHash && hop.counterpartyChainId ? (
                      <TxRef
                        label="recv"
                        chainId={hop.counterpartyChainId}
                        txHash={hop.receiveTxHash}
                        txUrl={txUrl}
                        onCopyTxHash={onCopyTxHash}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {onRefresh ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          loading={loading}
          className="self-start"
        >
          Check again
        </Button>
      ) : null}

      {footer}
    </div>
  );
}
