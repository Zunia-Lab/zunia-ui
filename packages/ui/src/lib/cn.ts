import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Soft focus: 1px cobalt wash, no offset halo. */
export const focusRing =
  "outline-none focus-visible:shadow-[0_0_0_1px_var(--z-focus-ring)] focus-visible:ring-0";

/**
 * Shared motion for interactive controls. Snappy ease, respects reduced motion
 * via CSS vars going to 0ms.
 */
export const interactiveMotion =
  "transition-[background-color,border-color,color,box-shadow,filter,transform,opacity] duration-[var(--z-duration-fast)] ease-[var(--z-ease)]";

/**
 * Soft fill hover/press for rows, menu items, ghost chips, and list tiles.
 */
export const interactiveSurface = cn(
  interactiveMotion,
  "hover:bg-[var(--z-state-hover)] active:bg-[var(--z-state-press)]",
);

/**
 * Bordered surfaces (cards, secondary buttons, chips): fill + edge lift.
 */
export const interactiveBordered = cn(
  interactiveSurface,
  "hover:border-[var(--z-line-strong)] active:border-[var(--z-line-strong)]",
);

/**
 * Muted text / icon chrome that should brighten on hover.
 */
export const interactiveQuiet = cn(
  interactiveMotion,
  "text-fg-muted hover:text-fg hover:bg-[var(--z-state-hover)] active:bg-[var(--z-state-press)]",
);

/** Primary balance / fiat — high contrast, easy to scan. */
export const amountPrimaryClass =
  "font-sans text-[15px] font-bold leading-none tracking-[-0.03em] tabular-nums text-fg";

/** Secondary line under a primary amount (token qty, symbol). */
export const amountSecondaryClass =
  "mt-1 block font-mono text-[11px] font-semibold leading-none tabular-nums text-fg-muted";

/** Compact inline amount (activity, nested token lines). */
export const amountInlineClass =
  "font-sans text-[13.5px] font-bold tabular-nums tracking-[-0.02em] text-fg";

/** Hero portfolio / home total. */
export const amountHeroClass =
  "font-sans font-bold tabular-nums tracking-[-0.04em] text-fg";
