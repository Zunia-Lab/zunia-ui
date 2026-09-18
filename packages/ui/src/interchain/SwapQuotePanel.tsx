"use client";

import { useId, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Callout, SectionLabel, Skeleton } from "../primitives/Feedback";
import { Input } from "../primitives/Input";
import { Segmented } from "../primitives/Segmented";
import {
  checkSlippage,
  priceImpactSeverity,
  priceImpactTone,
  sourceGasNote,
  toneStyle,
  type PriceImpactThresholds,
} from "./interchain";

/**
 * A priced swap, formatted for display.
 *
 * Amounts arrive as strings already scaled to their token's exponent: base
 * units are integers big enough to lose precision as a `number`, and the
 * formatting rules (locale, exponent, symbol) belong to the client that knows
 * the asset. `priceImpact` and `poolFee` are percentages and may be `null` when
 * the venue did not report them — `null` renders as "not reported", never as 0.
 */
export interface SwapQuoteView {
  readonly inputAmount: string;
  readonly inputSymbol: string;
  readonly outputAmount: string;
  readonly outputSymbol: string;
  /** Pre-formatted rate line, e.g. `"1 ATOM ≈ 8.42 OSMO"`. */
  readonly rate?: string | null;
  /** Guaranteed minimum at the current tolerance, formatted. */
  readonly minReceived?: string | null;
  /** Percentage, e.g. `0.42` for 0.42%. `null` when the venue did not say. */
  readonly priceImpact?: number | null;
  /** Percentage of the input taken by pool fees. `null` when not reported. */
  readonly poolFee?: number | null;
  /** Pools traversed, in order. Mirrors `SwapQuote.route`. */
  readonly route?: readonly { readonly poolId: string; readonly tokenOutSymbol?: string }[];
}

export interface SwapQuotePanelProps {
  /** `null` while nothing has been quoted yet. */
  readonly quote: SwapQuoteView | null;
  /**
   * Chain the user signs and pays gas on. Required: the panel's job includes
   * saying that no account is needed at the swap venue.
   */
  readonly gasChainName: string;
  /** Venue running the swap, e.g. `"Osmosis"`. */
  readonly swapVenueName?: string;
  /** Formatted source-chain fee, e.g. `"≈ 0.0021 SAFRO"`. Omitted if unknown. */
  readonly gasFeeLabel?: string | null;
  readonly slippagePercent: number;
  /** Omit to render the tolerance read-only. */
  readonly onSlippageChange?: (percent: number) => void;
  readonly slippagePresets?: readonly number[];
  readonly priceImpactThresholds?: PriceImpactThresholds;
  readonly loading?: boolean;
  /** Quoting failed. Shown instead of a quote, never alongside a stale one. */
  readonly error?: string | null;
  readonly onRetry?: () => void;
  readonly compact?: boolean;
  readonly className?: string;
  readonly title?: string | null;
  /** Slot under the panel, e.g. the confirm button. */
  readonly footer?: ReactNode;
}

const DEFAULT_PRESETS: readonly number[] = [0.5, 1, 3];

function formatPercent(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const abs = Math.abs(value);
  const digits = abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
  return `${value.toFixed(digits)}%`;
}

function QuoteRow({
  label,
  value,
  hint,
  valueStyle,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  hint?: string | null;
  valueStyle?: React.CSSProperties;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="font-mono text-[length:var(--z-type-meta)] text-fg-muted">
        {label}
      </span>
      <span className="min-w-0 text-right">
        <span
          className={cn(
            "block font-mono text-[length:var(--z-type-meta)] tabular-nums text-fg",
            valueClassName,
          )}
          style={valueStyle}
        >
          {value}
        </span>
        {hint ? (
          <span className="mt-0.5 block font-mono text-[length:var(--z-type-micro)] text-fg-dim">
            {hint}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/**
 * Rate, minimum received, price impact, pool fee, slippage, and who pays gas.
 *
 * Two things here are load-bearing rather than decorative. Price impact above
 * the threshold is rendered as a filled, bordered, captioned block, because it
 * is the number that decides whether a swap is a good idea and a muted grey row
 * is how it gets skipped. And the gas line is always present, because "do I
 * need OSMO for this?" is the question this flow generates, and the answer is
 * no: the contract call happens inside packet processing and a relayer pays.
 */
export function SwapQuotePanel({
  quote,
  gasChainName,
  swapVenueName,
  gasFeeLabel,
  slippagePercent,
  onSlippageChange,
  slippagePresets = DEFAULT_PRESETS,
  priceImpactThresholds,
  loading = false,
  error,
  onRetry,
  compact = false,
  className,
  title = "Quote",
  footer,
}: SwapQuotePanelProps) {
  const customId = useId();
  const slippage = checkSlippage(slippagePercent);
  const slippageTone = toneStyle(slippage.tone);

  const impact = quote?.priceImpact ?? null;
  const severity = priceImpactSeverity(impact, priceImpactThresholds);
  const impactTone = toneStyle(priceImpactTone(severity));
  const impactText = formatPercent(impact);
  const feeText = formatPercent(quote?.poolFee ?? null);

  const presetValue = slippagePresets.includes(slippagePercent)
    ? String(slippagePercent)
    : "custom";

  const slippageControl = (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="mb-1 font-mono text-[length:var(--z-type-micro)] uppercase tracking-[0.14em] text-fg-muted">
        Slippage tolerance
      </legend>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Segmented
          size="sm"
          value={presetValue}
          onChange={(next) => {
            if (next === "custom") return;
            onSlippageChange?.(Number(next));
          }}
          options={[
            ...slippagePresets.map((p) => ({ value: String(p), label: `${p}%` })),
            { value: "custom", label: "Custom" },
          ]}
        />
        <span className="min-w-0 flex-1 basis-[120px]">
          <label htmlFor={customId} className="sr-only">
            Custom slippage tolerance, percent
          </label>
          <Input
            id={customId}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.1}
            value={String(slippagePercent)}
            disabled={!onSlippageChange}
            state={slippage.ok ? "default" : "error"}
            aria-describedby={slippage.message ? `${customId}-msg` : undefined}
            onChange={(e) => {
              const next = Number(e.currentTarget.value);
              // Reject NaN here rather than downstream: the contract reads this
              // as a 0-100 percentage and an empty field must not become 0%.
              if (Number.isFinite(next)) onSlippageChange?.(next);
            }}
            trailing="%"
            className="h-9 py-0"
          />
        </span>
      </div>
      {slippage.message ? (
        <p
          id={`${customId}-msg`}
          className="m-0 text-[length:var(--z-type-micro)] leading-relaxed"
          style={{ color: slippageTone.fg }}
        >
          {slippage.message}
        </p>
      ) : null}
    </fieldset>
  );

  const gasBlock = (
    <div className="rounded-[14px] bg-[var(--z-glass)] p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
          Network fee
        </span>
        <span className="font-mono text-[length:var(--z-type-meta)] tabular-nums text-fg">
          {gasFeeLabel ?? "estimated at signing"}
        </span>
      </div>
      <p className="m-0 mt-1.5 text-[length:var(--z-type-meta)] leading-relaxed text-fg-muted">
        {sourceGasNote(gasChainName, { venueName: swapVenueName })}
      </p>
    </div>
  );

  if (error) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {title ? <SectionLabel>{title}</SectionLabel> : null}
        <Callout tone="danger" title="Could not price this swap">
          {error}
          {onRetry ? (
            <>
              {" "}
              <button
                type="button"
                onClick={onRetry}
                className="underline underline-offset-2 outline-none focus-visible:shadow-[0_0_0_1px_var(--z-focus-ring)]"
              >
                Try again
              </button>
            </>
          ) : null}
        </Callout>
        {slippageControl}
        {gasBlock}
        {footer}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}

      {loading || !quote ? (
        <div
          className="flex flex-col gap-2.5 rounded-[14px] border border-[var(--z-line)] p-3"
          aria-busy={loading || undefined}
        >
          {loading ? <span className="sr-only">Pricing swap</span> : null}
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-2 w-24" />
              </div>
            ))
          ) : (
            <p className="m-0 text-[length:var(--z-type-meta)] leading-relaxed text-fg-muted">
              Enter an amount to get a quote. Nothing is priced until the venue
              answers.
            </p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-2.5 rounded-[14px] border border-[var(--z-line)] bg-[var(--z-glass)]",
            compact ? "p-2.5" : "p-3",
          )}
        >
          <div className="flex min-w-0 items-baseline justify-between gap-3">
            <span className="truncate font-mono text-[length:var(--z-type-meta)] text-fg-muted">
              {quote.inputAmount} {quote.inputSymbol}
            </span>
            <span className="shrink-0 text-fg-dim" aria-hidden>
              →
            </span>
            <span className="truncate text-right text-[length:var(--z-type-row)] font-medium tabular-nums text-fg">
              {quote.outputAmount} {quote.outputSymbol}
            </span>
          </div>

          {quote.rate ? <QuoteRow label="Rate" value={quote.rate} /> : null}

          <QuoteRow
            label="Minimum received"
            value={
              quote.minReceived
                ? `${quote.minReceived} ${quote.outputSymbol}`
                : "not available"
            }
            hint={
              quote.minReceived
                ? `at ${slippagePercent}% slippage`
                : "the venue did not return a floor"
            }
            valueClassName={quote.minReceived ? undefined : "text-fg-dim"}
          />

          <QuoteRow
            label="Pool fee"
            value={feeText ?? "not reported"}
            valueClassName={feeText ? undefined : "text-fg-dim"}
          />

          {/* Price impact is the number that decides whether this trade is sane,
              so above the threshold it stops being a row and becomes a block. */}
          {severity === "low" ? (
            <QuoteRow
              label="Price impact"
              value={impactText ?? "not reported"}
              valueClassName={impactText ? undefined : "text-fg-dim"}
            />
          ) : (
            <div
              className="rounded-[12px] border p-2.5"
              style={{ background: impactTone.bg, borderColor: impactTone.border }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider"
                  style={{ color: impactTone.fg }}
                >
                  {severity === "high" ? "High price impact" : "Price impact"}
                </span>
                <span
                  className="font-mono text-[length:var(--z-type-row)] font-bold tabular-nums"
                  style={{ color: impactTone.fg }}
                >
                  {impactText}
                </span>
              </div>
              <p className="m-0 mt-1 text-[length:var(--z-type-micro)] leading-relaxed text-fg-muted">
                {severity === "high"
                  ? "This trade moves the pool a long way against you. The pool is thin for this size — try a smaller amount or a different route."
                  : "This trade moves the pool against you by more than a normal amount. Check the minimum received before signing."}
              </p>
            </div>
          )}

          {quote.route && quote.route.length > 0 ? (
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 border-t border-[var(--z-line)] pt-2.5">
              <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
                Pools
              </span>
              {quote.route.map((leg, i) => (
                <code
                  key={`${leg.poolId}-${i}`}
                  className="rounded-[6px] bg-[var(--z-glass-2)] px-1.5 py-0.5 font-mono text-[length:var(--z-type-micro)] text-fg-muted"
                >
                  #{leg.poolId}
                  {leg.tokenOutSymbol ? ` → ${leg.tokenOutSymbol}` : ""}
                </code>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {slippageControl}
      {gasBlock}
      {footer}
    </div>
  );
}
