/**
 * Shared activity presentation: one kind → icon glyph, color tone, and amount
 * sign colour. Used by the extension, dashboard, and any React surface that
 * renders wallet history.
 */

export type ActivityKind =
  | "sent"
  | "received"
  | "ibc"
  | "swap"
  | "staking"
  | "claim"
  | "governance"
  | "other";

export type ActivityTone =
  | "send"
  | "receive"
  | "ibc"
  | "swap"
  | "stake"
  | "claim"
  | "vote"
  | "muted"
  | "danger";

export interface ActivityPresentation {
  kind: ActivityKind;
  /** Short label for filters / legends. */
  label: string;
  /** Compact glyph used inside the circular badge. */
  icon: string;
  tone: ActivityTone;
  /** Tailwind-friendly CSS variable for the glyph / amount. */
  fg: string;
  /** Soft fill behind the badge. */
  bg: string;
  /** Badge ring. */
  border: string;
}

const TABLE: Record<ActivityKind, Omit<ActivityPresentation, "kind">> = {
  sent: {
    label: "Send",
    icon: "↑",
    tone: "send",
    fg: "var(--z-danger)",
    bg: "var(--z-danger-fill)",
    border: "color-mix(in srgb, var(--z-danger) 40%, transparent)",
  },
  received: {
    label: "Receive",
    icon: "↓",
    tone: "receive",
    fg: "var(--z-success)",
    bg: "var(--z-success-fill, color-mix(in srgb, var(--z-success) 16%, transparent))",
    border: "color-mix(in srgb, var(--z-success) 40%, transparent)",
  },
  ibc: {
    label: "IBC",
    icon: "⇄",
    tone: "ibc",
    fg: "var(--z-info)",
    bg: "var(--z-info-fill, color-mix(in srgb, var(--z-info) 16%, transparent))",
    border: "color-mix(in srgb, var(--z-info) 40%, transparent)",
  },
  swap: {
    label: "Swap",
    icon: "⇅",
    tone: "swap",
    fg: "var(--z-accent)",
    bg: "color-mix(in srgb, var(--z-accent) 18%, transparent)",
    border: "color-mix(in srgb, var(--z-accent) 45%, transparent)",
  },
  staking: {
    label: "Stake",
    icon: "◆",
    tone: "stake",
    fg: "var(--z-info)",
    bg: "var(--z-info-fill, color-mix(in srgb, var(--z-info) 16%, transparent))",
    border: "color-mix(in srgb, var(--z-info) 40%, transparent)",
  },
  claim: {
    label: "Claim",
    icon: "✦",
    tone: "claim",
    fg: "var(--z-success)",
    bg: "var(--z-success-fill, color-mix(in srgb, var(--z-success) 16%, transparent))",
    border: "color-mix(in srgb, var(--z-success) 40%, transparent)",
  },
  governance: {
    label: "Vote",
    icon: "✓",
    tone: "vote",
    fg: "var(--z-info)",
    bg: "var(--z-info-fill, color-mix(in srgb, var(--z-info) 16%, transparent))",
    border: "color-mix(in srgb, var(--z-info) 40%, transparent)",
  },
  other: {
    label: "Other",
    icon: "·",
    tone: "muted",
    fg: "var(--z-fg-muted)",
    bg: "var(--z-glass-2)",
    border: "var(--z-line)",
  },
};

const FAILED: Omit<ActivityPresentation, "kind"> = {
  label: "Failed",
  icon: "✕",
  tone: "danger",
  fg: "var(--z-danger)",
  bg: "var(--z-danger-fill)",
  border: "color-mix(in srgb, var(--z-danger) 45%, transparent)",
};

/** Resolve icon + colours for a history row. Failed txs always use danger. */
export function activityPresentation(
  kind: ActivityKind | string | undefined,
  success = true,
): ActivityPresentation {
  const key = (kind && kind in TABLE ? kind : "other") as ActivityKind;
  if (!success) return { kind: key, ...FAILED };
  return { kind: key, ...TABLE[key] };
}

/**
 * Best-effort kind from free-form indexer / API copy when the backend does not
 * send a structured kind.
 */
export function inferActivityKind(summary: string): ActivityKind {
  const hay = summary.toLowerCase();
  if (/fail|revert|error/.test(hay)) return "other";
  if (/swap|trade|pool/.test(hay)) return "swap";
  if (/ibc|channel-/.test(hay)) return "ibc";
  if (/claim|reward/.test(hay)) return "claim";
  if (/vote|proposal|govern/.test(hay)) return "governance";
  if (/undelegat|unbond/.test(hay)) return "staking";
  if (/delegat|redelegat|stake/.test(hay)) return "staking";
  if (/receive|inbound|deposit/.test(hay)) return "received";
  if (/send|transfer|withdraw/.test(hay)) return "sent";
  return "other";
}

/** Amount colour: inbound success green, outbound muted, failed danger. */
export function activityAmountClass(
  kind: ActivityKind | string | undefined,
  success = true,
  amount?: string | null,
): string {
  if (!success) return "text-[var(--z-danger)]";
  if (!amount) return "text-fg";
  const negative = amount.trim().startsWith("-");
  const key = (kind && kind in TABLE ? kind : "other") as ActivityKind;
  if (key === "received" || key === "claim") return "text-[var(--z-success)]";
  if (key === "sent" || key === "ibc" || negative) return "text-fg";
  if (key === "swap") return "text-[var(--z-accent)]";
  return "text-fg";
}

export const ACTIVITY_KINDS = Object.keys(TABLE) as ActivityKind[];
