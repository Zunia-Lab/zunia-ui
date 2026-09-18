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
 * Slice colours — accent first, then cool companions that stay readable on
 * dark surfaces without collapsing into purple glow.
 */
export const DONUT_COLORS = [
  "var(--z-accent)",
  "#3D8BFF",
  "#2EC4B6",
  "#F4B942",
  "#A78BFA",
  "var(--z-glass-2)",
] as const;

const TAU = Math.PI * 2;

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  // Full ring: SVG arcs cannot cover a full circle in one shot.
  if (sweep >= TAU - 1e-6) {
    const mid = startAngle + Math.PI;
    const a = polar(cx, cy, r, startAngle);
    const b = polar(cx, cy, r, mid);
    const c = polar(cx, cy, r, startAngle + TAU);
    return [
      `M ${a.x} ${a.y}`,
      `A ${r} ${r} 0 1 1 ${b.x} ${b.y}`,
      `A ${r} ${r} 0 1 1 ${c.x} ${c.y}`,
    ].join(" ");
  }
  const large = sweep > Math.PI ? 1 : 0;
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 148,
  strokeWidth = 14,
  className,
}: {
  segments: { value: number; color?: string }[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  /** Ring thickness in viewBox units (viewBox is 100×100). */
  strokeWidth?: number;
  className?: string;
}) {
  const total = segments.reduce((a, s) => a + Math.max(0, s.value), 0) || 1;
  const cx = 50;
  const cy = 50;
  const r = 50 - strokeWidth / 2;
  // Small visual gap between slices when there is more than one.
  const gap = segments.length > 1 ? 0.04 : 0;
  let angle = -Math.PI / 2;

  const arcs = segments.map((segment, index) => {
    const share = Math.max(0, segment.value) / total;
    const sweep = Math.max(0, share * TAU - gap);
    const start = angle + gap / 2;
    const end = start + sweep;
    angle += share * TAU;
    return {
      d: arcPath(cx, cy, r, start, end),
      color: segment.color ?? DONUT_COLORS[index % DONUT_COLORS.length],
      key: `${index}-${share}`,
    };
  });

  return (
    <div
      className={cn(
        "relative shrink-0",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="block overflow-visible"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--z-glass-2)"
          strokeWidth={strokeWidth}
        />
        {arcs.map((arc) => (
          <path
            key={arc.key}
            d={arc.d}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
        {centerLabel ? (
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dim">
            {centerLabel}
          </span>
        ) : null}
        {centerValue ? (
          <span className="mt-0.5 text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-fg">
            {centerValue}
          </span>
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
