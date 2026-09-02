"use client";

import { useId, type ReactNode } from "react";
import { cn } from "../lib/cn";
import {
  resolveAvatarStyle,
  type AvatarMotif,
  type AvatarPalette,
} from "../lib/walletAvatar";

export function Avatar({
  src,
  alt,
  fallback,
  seed,
  size = 32,
  className,
  onLoad,
  onError,
}: {
  src?: string;
  alt?: string;
  /** Used as orb seed when `seed` is omitted, and for accessibility label. */
  fallback?: string;
  /** Deterministic orb seed (prefer wallet address). */
  seed?: string;
  size?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  const orbSeed = seed ?? fallback ?? alt ?? "zunia";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
      role={src ? undefined : "img"}
      aria-label={src ? undefined : alt ?? fallback ?? "Wallet avatar"}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          className="size-full object-cover"
          onLoad={onLoad}
          onError={onError}
        />
      ) : (
        <WalletOrb seed={orbSeed} size={size} />
      )}
    </span>
  );
}

/** Standalone 3D orb — use when you only need the geometric mark. */
export function WalletOrb({
  seed,
  size = 32,
  className,
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const { palette, motif, rotate } = resolveAvatarStyle(seed);
  const gid = `zorb-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("block", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${gid}-ball`} cx="34%" cy="28%" r="70%">
          <stop offset="0%" stopColor={palette.light} />
          <stop offset="48%" stopColor={palette.mid} />
          <stop offset="100%" stopColor={palette.dark} />
        </radialGradient>
        <radialGradient id={`${gid}-shine`} cx="30%" cy="26%" r="42%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="30" fill={`url(#${gid}-ball)`} />
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke={`url(#${gid}-rim)`}
        strokeWidth="1.25"
        opacity="0.9"
      />

      <g transform={`rotate(${rotate} 32 32)`}>{motifNode(motif, palette, gid)}</g>

      <circle cx="32" cy="32" r="30" fill={`url(#${gid}-shine)`} />
      <ellipse
        cx="22"
        cy="18"
        rx="10"
        ry="6"
        fill="#ffffff"
        opacity="0.22"
      />
    </svg>
  );
}

function motifNode(
  motif: AvatarMotif,
  palette: AvatarPalette,
  gid: string,
): ReactNode {
  switch (motif) {
    case "ring":
      return (
        <circle
          cx="32"
          cy="32"
          r="18"
          fill="none"
          stroke={palette.accent}
          strokeWidth="5"
          opacity="0.55"
        />
      );
    case "crescent":
      return (
        <path
          d="M42 14a20 20 0 1 0 0 36 16 16 0 1 1 0-36z"
          fill={palette.accent}
          opacity="0.42"
        />
      );
    case "shard":
      return (
        <path
          d="M32 10 L48 36 L32 54 L16 36 Z"
          fill={palette.accent}
          opacity="0.38"
        />
      );
    case "core":
      return (
        <>
          <circle cx="32" cy="32" r="11" fill={palette.accent} opacity="0.5" />
          <circle
            cx="32"
            cy="32"
            r="11"
            fill={`url(#${gid}-shine)`}
            opacity="0.85"
          />
        </>
      );
  }
}
