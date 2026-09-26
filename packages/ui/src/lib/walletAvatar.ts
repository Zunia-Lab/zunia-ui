/**
 * Deterministic non-human wallet orb.
 * Same seed → same colors / motif on every platform.
 */

export type AvatarPalette = {
  light: string;
  mid: string;
  dark: string;
  accent: string;
};

export type AvatarMotif = "ring" | "crescent" | "shard" | "core";

export type AvatarStyle = {
  palette: AvatarPalette;
  motif: AvatarMotif;
  rotate: number;
};

/** Warm 3D-friendly palettes aligned with the chevrons brand. */
export const AVATAR_PALETTES: readonly AvatarPalette[] = [
  { light: "#FFB4A8", mid: "#FF1B0C", dark: "#7A0E06", accent: "#FF8A17" },
  { light: "#FFC9A0", mid: "#FF4E12", dark: "#7A2808", accent: "#FFBE14" },
  { light: "#FFE0A0", mid: "#FF8A17", dark: "#7A4508", accent: "#FFE05C" },
  { light: "#FFE9A8", mid: "#FFBE14", dark: "#7A5C08", accent: "#FF8A17" },
  { light: "#A7F3D0", mid: "#0D9488", dark: "#064E3B", accent: "#5EEAD4" },
  { light: "#99F6E4", mid: "#0F766E", dark: "#134E4A", accent: "#2DD4BF" },
  { light: "#FCA5A5", mid: "#DC2626", dark: "#7F1D1D", accent: "#FB7185" },
  { light: "#E2E8F0", mid: "#64748B", dark: "#1E293B", accent: "#94A3B8" },
  { light: "#F9A8D4", mid: "#DB2777", dark: "#831843", accent: "#FDA4AF" },
  { light: "#86EFAC", mid: "#16A34A", dark: "#14532D", accent: "#BEF264" },
  { light: "#FDBA74", mid: "#EA580C", dark: "#7C2D12", accent: "#FBBF24" },
  { light: "#FECACA", mid: "#D42800", dark: "#5C1200", accent: "#FF6A05" },
  { light: "#C4B5FD", mid: "#7C3AED", dark: "#4C1D95", accent: "#A78BFA" },
  { light: "#93C5FD", mid: "#2563EB", dark: "#1E3A8A", accent: "#60A5FA" },
  { light: "#67E8F9", mid: "#0891B2", dark: "#164E63", accent: "#22D3EE" },
  { light: "#FDE68A", mid: "#CA8A04", dark: "#713F12", accent: "#FACC15" },
] as const;

const MOTIFS: readonly AvatarMotif[] = ["ring", "crescent", "shard", "core"];

/** FNV-1a 32-bit — stable across JS and Dart. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function resolveAvatarStyle(seed: string): AvatarStyle {
  const h = hashSeed(seed.trim().toLowerCase() || "zunia");
  const palette = AVATAR_PALETTES[h % AVATAR_PALETTES.length]!;
  const motif = MOTIFS[(h >>> 8) % MOTIFS.length]!;
  const rotate = (h >>> 16) % 360;
  return { palette, motif, rotate };
}
