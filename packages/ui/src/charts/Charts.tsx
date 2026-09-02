"use client";

import { cn } from "../lib/cn";

export function Sparkline({
  points,
  className,
  negative,
}: {
  points: number[];
  className?: string;
  negative?: boolean;
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * 100;
      const y = 24 - ((p - min) / range) * 20 - 2;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className={cn("block h-6 w-full", className)}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={negative ? "var(--z-danger)" : "var(--z-fg)"}
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function AreaChart({
  points,
  className,
  labels,
}: {
  points: number[];
  className?: string;
  labels?: string[];
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * 300;
    const y = 150 - ((p - min) / range) * 120 - 10;
    return { x, y };
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ");
  const area = `${line} L300 150 L0 150 Z`;
  const last = coords[coords.length - 1];
  return (
    <div className={cn("w-full", className)}>
      <svg viewBox="0 0 300 150" preserveAspectRatio="none" className="block h-[150px] w-full" aria-hidden>
        <defs>
          <linearGradient id="z-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--z-accent)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--z-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#z-area-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--z-info)"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {last ? <circle cx={last.x} cy={last.y} r="4" fill="var(--z-info)" /> : null}
      </svg>
      {labels ? (
        <div className="mt-2 flex justify-between font-mono text-[length:var(--z-type-micro)] text-fg-dim">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Slice colours in order, from the mocks: cobalt, bright cobalt, soft cobalt,
 * then neutral glass for the long tail.
 */
export const DONUT_COLORS = [
  "var(--z-accent)",
  "#3874FF",
  "var(--z-info)",
  "var(--z-glass-2)",
] as const;

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 116,
  className,
}: {
  segments: { value: number; color?: string }[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  className?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  const stops = segments.map((s, i) => {
    const start = (acc / total) * 100;
    acc += s.value;
    const end = (acc / total) * 100;
    return `${s.color ?? DONUT_COLORS[i % DONUT_COLORS.length]} ${start}% ${end}%`;
  });
  return (
    <div
      className={cn("relative flex items-center justify-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${stops.join(", ")})`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full bg-surface"
        style={{ width: size * 0.64, height: size * 0.64 }}
      >
        {centerLabel ? (
          <span className="font-mono text-[length:var(--z-type-micro)] uppercase tracking-wider text-fg-muted">
            {centerLabel}
          </span>
        ) : null}
        {centerValue ? (
          <span className="mt-1 text-[length:var(--z-type-heading)] font-medium text-fg">{centerValue}</span>
        ) : null}
      </div>
    </div>
  );
}

export function TallyBar({
  yes,
  no,
  veto,
  className,
}: {
  yes: number;
  no: number;
  veto: number;
  className?: string;
}) {
  const total = yes + no + veto || 1;
  return (
    <div
      className={cn("flex h-2 w-full overflow-hidden rounded-full bg-[var(--z-glass-2)]", className)}
    >
      <span className="h-full bg-fg" style={{ width: `${(yes / total) * 100}%` }} />
      <span
        className="h-full bg-[var(--z-danger)]"
        style={{ width: `${(no / total) * 100}%` }}
      />
      <span
        className="h-full bg-[var(--z-glass-2)]"
        style={{ width: `${(veto / total) * 100}%` }}
      />
    </div>
  );
}

export function BarRow({
  label,
  value,
  pct,
  className,
}: {
  label: string;
  value: string;
  pct: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="w-[52px] font-mono text-[length:var(--z-type-meta)] text-fg-muted">{label}</span>
      <span className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--z-glass-2)]">
        <span
          className="block h-full rounded-full bg-fg"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </span>
      <span className="w-[52px] text-right font-mono text-[length:var(--z-type-meta)] tabular-nums text-fg">
        {value}
      </span>
    </div>
  );
}
