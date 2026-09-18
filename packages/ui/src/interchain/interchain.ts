/**
 * Shared vocabulary for cross-chain UI: route hops, packet lifecycle, swap
 * quotes.
 *
 * Every string union here mirrors `@zunialab/interchain` name for name, so a
 * client can hand an engine value straight to a component prop with no mapping
 * table. `@zunialab/ui` deliberately does not depend on the engine — this is a
 * presentation package and pulling a chain client into it would drag an LCD
 * transport into the marketing site's bundle. The price of that choice is that
 * these unions are kept identical by hand, so each one names its counterpart.
 *
 * Nothing here fetches, polls or derives chain state. Callers pass in what they
 * observed; these helpers only decide what it should look like and what it
 * should say. That split is why a failed read can never be rendered as a
 * confident zero: there is no value for this module to invent.
 */

/* -------------------------------------------------------------------------- *
 * Tone
 * -------------------------------------------------------------------------- */

/**
 * Status colour roles, same five words the `Callout` tone prop uses so one tone
 * name means one thing anywhere in the kit.
 */
export type InterchainTone = "neutral" | "info" | "success" | "warning" | "danger";

/** Resolved CSS custom properties for one tone. */
export interface ToneStyle {
  /** Glyph / label colour. */
  readonly fg: string;
  /** Soft fill behind a badge. */
  readonly bg: string;
  /** Badge ring. */
  readonly border: string;
}

const TONE_STYLES: Readonly<Record<InterchainTone, ToneStyle>> = {
  neutral: {
    fg: "var(--z-fg-muted)",
    bg: "var(--z-glass-2)",
    border: "var(--z-line)",
  },
  info: {
    fg: "var(--z-info)",
    bg: "var(--z-info-fill)",
    border: "var(--z-info-line)",
  },
  success: {
    fg: "var(--z-success)",
    bg: "var(--z-success-fill)",
    border: "var(--z-success-line)",
  },
  warning: {
    fg: "var(--z-warning)",
    bg: "var(--z-warning-fill)",
    border: "var(--z-warning-line)",
  },
  danger: {
    fg: "var(--z-danger)",
    bg: "var(--z-danger-fill)",
    border: "var(--z-danger-line)",
  },
};

/**
 * Colours for a tone. Each pair is one the `@zunialab/tokens` contrast gate
 * already certifies (status hue on its own fill over surface), so a component
 * using this cannot quietly introduce a failing pair.
 */
export function toneStyle(tone: InterchainTone): ToneStyle {
  return TONE_STYLES[tone];
}

/* -------------------------------------------------------------------------- *
 * Channels and routes
 * -------------------------------------------------------------------------- */

/** Mirrors `ChannelRouteSource` in `@zunialab/interchain`. */
export type ChannelSource = "discovered" | "manual" | "seed";

/** Mirrors `IbcChannelState` in `@zunialab/interchain`. */
export type ChannelState = "open" | "closed" | "init" | "tryopen" | "unknown";

/** Mirrors `RouteHopKind` in `@zunialab/interchain`. */
export type RouteHopKind = "transfer" | "forward" | "swap";

/**
 * How much the UI may claim about a channel.
 *
 * - `verified` — confirmed open on chain during this session.
 * - `unverified` — we have an id and nothing has confirmed it. Loud.
 * - `closed` — the chain reported a state other than `open`. Loud, and the hop
 *   cannot be used.
 */
export type ChannelTrustLevel = "verified" | "unverified" | "closed";

export interface ChannelTrust {
  readonly level: ChannelTrustLevel;
  /** Badge text. */
  readonly label: string;
  /** One sentence naming the failure mode, shown next to the hop. */
  readonly detail: string;
  readonly tone: InterchainTone;
  /**
   * True when the hop must be visually obvious rather than merely annotated.
   * Sending over the wrong channel mints a token the destination chain does not
   * recognise, and that is not recoverable by retrying.
   */
  readonly loud: boolean;
  /** Where the id came from, as a short label. Orthogonal to {@link level}. */
  readonly sourceLabel: string;
}

const SOURCE_LABELS: Readonly<Record<ChannelSource, string>> = {
  manual: "You entered this",
  discovered: "Discovered on chain",
  seed: "Shipped default",
};

const UNVERIFIED_DETAIL: Readonly<Record<ChannelSource, string>> = {
  manual:
    "You typed this channel id and nothing has confirmed it links these two chains. The wrong channel mints a token the destination will not recognise.",
  discovered:
    "Read from the source chain's channel list but not re-checked since. Confirm it before signing.",
  seed:
    "A default shipped with the app, not confirmed on chain in this session. Confirm it before signing.",
};

export interface ChannelTrustInput {
  /** Confirmed open on chain. Absent or false means NOT confirmed. */
  readonly verified?: boolean;
  /** Where the channel id came from. Defaults to `discovered`. */
  readonly source?: ChannelSource;
  /** Last observed channel state, when the chain was asked. */
  readonly state?: ChannelState;
}

/**
 * Decide what may be claimed about one channel.
 *
 * `verified` is never inferred from the id looking plausible or from the route
 * having been used before: only an explicit `verified: true` from a chain check
 * earns the quiet badge. Everything else is loud.
 */
export function channelTrust(input: ChannelTrustInput): ChannelTrust {
  const source: ChannelSource = input.source ?? "discovered";
  const sourceLabel = SOURCE_LABELS[source];

  // A known-but-not-open state is the strongest signal we have, and it beats a
  // stale `verified` flag: the channel was open when we checked and is not now.
  if (input.state && input.state !== "open" && input.state !== "unknown") {
    return {
      level: "closed",
      label: "Channel not open",
      detail: `The chain reports this channel as ${input.state}, not open. A packet sent over it cannot be delivered.`,
      tone: "danger",
      loud: true,
      sourceLabel,
    };
  }

  if (input.verified === true) {
    return {
      level: "verified",
      label: "Verified",
      detail: "Confirmed open on chain, with a matching counterparty.",
      tone: "success",
      loud: false,
      sourceLabel,
    };
  }

  return {
    level: "unverified",
    label: "Not verified",
    detail: UNVERIFIED_DETAIL[source],
    tone: "warning",
    loud: true,
    sourceLabel,
  };
}

/** Short label for the hop kind, shown on the connector between two chains. */
export function routeHopKindLabel(kind: RouteHopKind): string {
  switch (kind) {
    case "transfer":
      return "IBC transfer";
    case "forward":
      return "Forwarded (PFM)";
    case "swap":
      return "Swap";
  }
}

/* -------------------------------------------------------------------------- *
 * Durations and fee copy
 * -------------------------------------------------------------------------- */

/**
 * Compact duration for an "arrives in about…" line.
 *
 * Returns `null` rather than a zero when the estimate is missing or nonsense,
 * because "0s" reads as an answer and the absence of an estimate is not one.
 */
export function formatApproxDuration(
  seconds: number | null | undefined,
): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  if (seconds < 90) return `${Math.round(seconds)}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export interface SourceGasNoteOptions {
  /**
   * Venue whose contract runs inside packet processing, e.g. `"Osmosis"`. When
   * given, the note says outright that no account or gas is needed there —
   * this is the single most common support question on a cross-chain swap.
   */
  readonly venueName?: string;
}

/**
 * The one sentence all three clients must say about who pays for what.
 *
 * Protocol fact, not marketing: the user signs one `MsgTransfer` on the source
 * chain and pays gas only there, in that chain's token. Later hops and any
 * contract call are executed by relayers inside packet processing.
 */
export function sourceGasNote(
  chainName: string,
  options?: SourceGasNoteOptions,
): string {
  const base = `You pay gas only on ${chainName}, in ${chainName}'s own token. The later hops are carried by relayers, who pay for them.`;
  if (!options?.venueName) return base;
  return `${base} You do not need a ${options.venueName} account or ${options.venueName} gas — the swap runs inside packet processing.`;
}

/* -------------------------------------------------------------------------- *
 * Packet lifecycle
 * -------------------------------------------------------------------------- */

/**
 * Lifecycle of one hop.
 *
 * Everything except `stalled` mirrors `PacketStatus` in `@zunialab/interchain`.
 * `stalled` is a display state folded in by {@link resolveHopStatus} from the
 * engine's `RouteHopTrace.stalled` flag: the chain has no such state, and a
 * client must not report it as one.
 */
export type PacketHopStatus =
  | "pending"
  | "relayed"
  | "received"
  | "acknowledged"
  | "timeout"
  | "failed"
  | "stalled"
  | "unknown";

/**
 * Why a transfer stopped. Mirrors `PacketFailureKind` in
 * `@zunialab/interchain`; comes straight off `RouteTrace.failure`.
 *
 * Separate from {@link PacketHopStatus} because the status says where the packet
 * is and this says what the user must do.
 */
export type PacketFailureKind =
  | "timeout"
  | "ack-error"
  | "stalled"
  | "swap-delivery-failed";

export interface PacketStatusPresentation {
  readonly status: PacketHopStatus;
  readonly label: string;
  /** One sentence saying where the funds are and whether anything is wrong. */
  readonly detail: string;
  readonly tone: InterchainTone;
  readonly glyph: string;
  /** No further polling will change this hop. */
  readonly terminal: boolean;
  /** The packet is making progress right now. */
  readonly moving: boolean;
}

const PACKET_STATUS: Readonly<
  Record<PacketHopStatus, Omit<PacketStatusPresentation, "status">>
> = {
  pending: {
    label: "Pending",
    detail: "Sent from the source chain. No relayer has picked it up yet.",
    tone: "info",
    glyph: "\u25d4",
    terminal: false,
    moving: true,
  },
  relayed: {
    label: "Relayed",
    detail: "A relayer submitted it on the destination chain.",
    tone: "info",
    glyph: "\u25d1",
    terminal: false,
    moving: true,
  },
  received: {
    label: "Received",
    detail: "The destination chain wrote the receipt. The funds have landed.",
    tone: "success",
    glyph: "\u25d5",
    terminal: false,
    moving: true,
  },
  acknowledged: {
    label: "Acknowledged",
    detail: "The acknowledgement came back to the source chain. This hop is done.",
    tone: "success",
    glyph: "\u25cf",
    terminal: true,
    moving: false,
  },
  timeout: {
    label: "Timed out",
    detail:
      "The packet expired before a relayer delivered it, and the escrow refunded the source chain.",
    tone: "warning",
    glyph: "\u27f2",
    terminal: true,
    moving: false,
  },
  failed: {
    label: "Failed",
    detail:
      "The destination chain rejected the packet, and the escrow returned the funds on the source chain.",
    tone: "danger",
    glyph: "\u2715",
    terminal: true,
    moving: false,
  },
  stalled: {
    label: "Stalled",
    detail:
      "No relayer has moved this for a while. The funds sit in the channel escrow \u2014 not lost, and still deliverable.",
    tone: "warning",
    glyph: "\u25d4",
    terminal: false,
    moving: false,
  },
  unknown: {
    label: "Unknown",
    detail:
      "No endpoint could answer for this hop. That is not a failure \u2014 it means we do not know yet.",
    tone: "neutral",
    glyph: "?",
    terminal: false,
    moving: false,
  },
};

export function packetStatusPresentation(
  status: PacketHopStatus,
): PacketStatusPresentation {
  const row = PACKET_STATUS[status] ?? PACKET_STATUS.unknown;
  return { status: status in PACKET_STATUS ? status : "unknown", ...row };
}

/** Every status, in lifecycle order. Useful for legends and fixtures. */
export const PACKET_HOP_STATUSES = Object.keys(
  PACKET_STATUS,
) as readonly PacketHopStatus[];

/**
 * Fold the engine's `stalled` flag into the display status.
 *
 * Deliberately not a timer. `@zunialab/interchain` already decides this, in
 * `isHopStalled`, against a per-hop-kind threshold (four times the expected
 * duration, floored at five minutes) — a flat clock in the UI would disagree
 * with the engine on the same trace and be wrong more often, since a swap hop
 * and a forward hop do not take the same time. Pass `RouteHopTrace.stalled`
 * through and let the engine own the heuristic.
 *
 * Only in-flight hops can stall, matching the engine's own gate: `received`
 * means the funds landed, and a late acknowledgement is not something the user
 * can act on.
 */
export function resolveHopStatus(
  status: PacketHopStatus,
  stalled?: boolean,
): PacketHopStatus {
  if (stalled !== true) return status;
  if (status === "pending" || status === "relayed" || status === "unknown") {
    return "stalled";
  }
  return status;
}

/**
 * Where the money is, in the user's terms.
 *
 * These six outcomes exist because the user's next action differs in each:
 * wait, wait but check back, nothing (it arrived), nothing (it came back),
 * claim it, or retry the read. Collapsing any two of them is what made the old
 * hardcoded progress bars dishonest.
 */
export type PacketFundsState =
  | "in-flight"
  | "arrived"
  | "stalled"
  | "returned"
  | "recoverable"
  | "unknown";

export interface PacketFundsSummary {
  readonly state: PacketFundsState;
  readonly title: string;
  readonly detail: string;
  readonly tone: InterchainTone;
  /** The user must do something; nothing will resolve this on its own. */
  readonly actionRequired: boolean;
}

export interface PacketFundsOptions {
  /**
   * From `RouteTrace.failure`. When set it decides the outcome, because the
   * engine looked at acknowledgements and refunds and the hop statuses alone
   * cannot tell a swap-delivery failure from an ordinary rejection.
   */
  readonly failure?: PacketFailureKind | null;
  /**
   * A recover message could actually be built — `RouteTrace.recovery.msg` is
   * non-null. False means the crosschain-swap contract address or the recovery
   * address is missing from host config, and the panel says so instead of
   * offering a button that cannot work.
   */
  readonly recoveryReady?: boolean;
}

const RECOVERY_READY_DETAIL =
  "The swap ran but the final delivery failed, so the contract is holding the output for your recovery address. Nothing is lost and nothing is moving: claim it.";

const RECOVERY_BLOCKED_DETAIL =
  "The swap ran but the final delivery failed, so the contract is holding the output for your recovery address. The funds are safe, but this build has no crosschain-swap contract address configured, so it cannot build the recover call. That is a configuration gap, not a chain failure.";

/**
 * Aggregate {@link PacketFundsSummary} for a whole route.
 *
 * Prefers `options.failure` from the engine's `RouteTrace`; falls back to the
 * hop statuses so a caller holding only a plain `PacketTrace` still gets an
 * honest headline.
 */
export function packetFundsSummary(
  hops: readonly { readonly status: PacketHopStatus }[],
  options?: PacketFundsOptions,
): PacketFundsSummary {
  // Recovery outranks everything: it is the only outcome that stops without the
  // user, so it must not be buried under an earlier hop's happy status.
  if (options?.failure === "swap-delivery-failed") {
    return {
      state: "recoverable",
      title: "Recoverable \u2014 action needed",
      detail: options.recoveryReady
        ? RECOVERY_READY_DETAIL
        : RECOVERY_BLOCKED_DETAIL,
      tone: options.recoveryReady ? "warning" : "danger",
      actionRequired: true,
    };
  }

  if (options?.failure === "ack-error") {
    return FUNDS_REJECTED;
  }
  if (options?.failure === "timeout") {
    return FUNDS_TIMED_OUT;
  }
  if (options?.failure === "stalled") {
    return FUNDS_STALLED;
  }

  if (hops.length === 0) {
    return {
      state: "unknown",
      title: "Nothing to track yet",
      detail: "No hop has been observed. That is not a failure.",
      tone: "neutral",
      actionRequired: false,
    };
  }

  const statuses = hops.map((h) => h.status);

  if (statuses.includes("failed")) return FUNDS_REJECTED;
  if (statuses.includes("timeout")) return FUNDS_TIMED_OUT;
  if (statuses.includes("stalled")) return FUNDS_STALLED;

  if (statuses.every((s) => s === "acknowledged")) {
    return {
      state: "arrived",
      title: "Arrived",
      detail: "Every hop completed. The funds are on the destination chain.",
      tone: "success",
      actionRequired: false,
    };
  }

  if (statuses.some((s) => s === "pending" || s === "relayed" || s === "received")) {
    return {
      state: "in-flight",
      title: "Moving",
      detail: "The transfer is on its way. Nothing to do but wait.",
      tone: "info",
      actionRequired: false,
    };
  }

  return {
    state: "unknown",
    title: "Status unknown",
    detail:
      "No endpoint could answer for this transfer. That is not a failure \u2014 try again in a moment.",
    tone: "neutral",
    actionRequired: false,
  };
}

const FUNDS_REJECTED: PacketFundsSummary = {
  state: "returned",
  title: "Failed \u2014 funds returned",
  detail:
    "A hop was rejected, and the escrow released the funds back on the source chain. Nothing is stuck.",
  tone: "danger",
  actionRequired: false,
};

const FUNDS_TIMED_OUT: PacketFundsSummary = {
  state: "returned",
  title: "Timed out \u2014 funds returned",
  detail:
    "The packet expired before a relayer delivered it, and the escrow refunded the source chain. You can try again.",
  tone: "warning",
  actionRequired: false,
};

const FUNDS_STALLED: PacketFundsSummary = {
  state: "stalled",
  title: "Stuck \u2014 funds safe",
  detail:
    "A hop has not moved for a while. The funds sit in the channel escrow, still deliverable, and no action is needed yet.",
  tone: "warning",
  actionRequired: false,
};

/* -------------------------------------------------------------------------- *
 * Swap quotes
 * -------------------------------------------------------------------------- */

export type PriceImpactSeverity = "low" | "elevated" | "high";

/** Above 1% the user should see it; above 5% they should have to look at it. */
export const DEFAULT_PRICE_IMPACT_WARN = 1;
export const DEFAULT_PRICE_IMPACT_HIGH = 5;

export interface PriceImpactThresholds {
  readonly warnAt?: number;
  readonly highAt?: number;
}

export function priceImpactSeverity(
  percent: number | null | undefined,
  thresholds?: PriceImpactThresholds,
): PriceImpactSeverity {
  if (typeof percent !== "number" || !Number.isFinite(percent)) return "low";
  const warnAt = thresholds?.warnAt ?? DEFAULT_PRICE_IMPACT_WARN;
  const highAt = thresholds?.highAt ?? DEFAULT_PRICE_IMPACT_HIGH;
  if (percent >= highAt) return "high";
  if (percent >= warnAt) return "elevated";
  return "low";
}

export function priceImpactTone(severity: PriceImpactSeverity): InterchainTone {
  switch (severity) {
    case "high":
      return "danger";
    case "elevated":
      return "warning";
    case "low":
      return "neutral";
  }
}

export interface SlippageCheck {
  readonly ok: boolean;
  /** `null` when there is nothing to say. */
  readonly message: string | null;
  readonly tone: InterchainTone;
}

/**
 * Validate a slippage tolerance against what the contract actually accepts.
 *
 * Protocol fact: `slippage_percentage` on the Osmosis swaprouter is a 0-100
 * percentage — the contract divides by 100 itself. Passing `0.005` for "0.5%"
 * asks for 0.005%, and the swap reverts.
 */
export function checkSlippage(percent: number): SlippageCheck {
  if (!Number.isFinite(percent)) {
    return { ok: false, message: "Enter a slippage percentage.", tone: "danger" };
  }
  if (percent < 0 || percent > 100) {
    return {
      ok: false,
      message:
        "Slippage must be between 0 and 100. The contract reads this as a percentage, not a fraction.",
      tone: "danger",
    };
  }
  if (percent === 0) {
    return {
      ok: true,
      message: "0% leaves no room for the pool to move; most swaps will revert.",
      tone: "warning",
    };
  }
  if (percent >= 20) {
    return {
      ok: true,
      message: "Above 20% you can lose most of the trade to a bad price.",
      tone: "danger",
    };
  }
  if (percent >= 5) {
    return {
      ok: true,
      message: "Above 5% is unusual outside a thin pool.",
      tone: "warning",
    };
  }
  return { ok: true, message: null, tone: "neutral" };
}
