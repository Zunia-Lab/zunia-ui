/**
 * WCAG AA contrast check for semantic theme pairs.
 * Run: pnpm --filter @zunialab/tokens check:contrast
 */
import { themes, type SemanticTheme } from "../src/index.ts";

function parseColor(input: string): { r: number; g: number; b: number; a: number } {
  const s = input.trim();
  if (s.startsWith("#")) {
    const h = s.slice(1);
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    if (full.length !== 6) throw new Error(`Bad hex: ${input}`);
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }
  const m = s.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
  );
  if (!m) throw new Error(`Unsupported color: ${input}`);
  return {
    r: Number(m[1]),
    g: Number(m[2]),
    b: Number(m[3]),
    a: m[4] === undefined ? 1 : Number(m[4]),
  };
}

/** Composite foreground over background (both sRGB 0–255). */
function composite(
  fg: { r: number; g: number; b: number; a: number },
  bg: { r: number; g: number; b: number; a: number },
) {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0 };
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
  };
}

function relLuminance(rgb: { r: number; g: number; b: number }) {
  const lin = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

function contrastRatio(
  fgInput: string,
  bgInput: string,
  /** When bg is translucent, composite it over this solid base first. */
  baseBg?: string,
): number {
  let bg = parseColor(bgInput);
  if (bg.a < 1) {
    const base = parseColor(baseBg ?? "#ffffff");
    const composited = composite(bg, { ...base, a: 1 });
    bg = { ...composited, a: 1 };
  }
  const fgRaw = parseColor(fgInput);
  const fg =
    fgRaw.a < 1
      ? composite(fgRaw, { ...bg, a: 1 })
      : { r: fgRaw.r, g: fgRaw.g, b: fgRaw.b };
  const L1 = relLuminance(fg);
  const L2 = relLuminance({ r: bg.r, g: bg.g, b: bg.b });
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

type Pair = {
  name: string;
  fg: keyof SemanticTheme;
  bg: keyof SemanticTheme;
  min: number;
  /** Composite translucent bg over this theme color (defaults to surface). */
  base?: keyof SemanticTheme;
};

const pairs: Pair[] = [
  { name: "fg on bg", fg: "fg", bg: "bg", min: 4.5 },
  { name: "fg on surface", fg: "fg", bg: "surface", min: 4.5 },
  { name: "fgMuted on bg", fg: "fgMuted", bg: "bg", min: 4.5 },
  { name: "fgMuted on surface", fg: "fgMuted", bg: "surface", min: 4.5 },
  { name: "accentFg on accent", fg: "accentFg", bg: "accent", min: 4.5 },
  // Interactive control edges / icons use fgDim (solid ≥ 3:1).
  // Decorative hairlines (line / lineStrong) and fgFaint micro labels are exempt.
  { name: "fgDim on bg (control edge)", fg: "fgDim", bg: "bg", min: 3 },
  { name: "fgDim on surface (control edge)", fg: "fgDim", bg: "surface", min: 3 },
  { name: "dangerFg on bg", fg: "dangerFg", bg: "bg", min: 4.5 },
  { name: "successFg on bg", fg: "successFg", bg: "bg", min: 4.5 },
  // Info badge text sits on tinted fills in callouts / pills.
  {
    name: "infoFg on infoFill",
    fg: "infoFg",
    bg: "infoFill",
    min: 3,
    base: "surface",
  },
];

let failed = 0;

for (const [themeName, theme] of Object.entries(themes)) {
  console.log(`\nTheme: ${themeName}`);
  for (const pair of pairs) {
    const base =
      pair.base !== undefined ? String(theme[pair.base]) : undefined;
    const ratio = contrastRatio(theme[pair.fg], theme[pair.bg], base);
    const ok = ratio >= pair.min;
    const mark = ok ? "OK" : "FAIL";
    console.log(
      `  [${mark}] ${pair.name}: ${ratio.toFixed(2)}:1 (need ≥ ${pair.min})`,
    );
    if (!ok) failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} contrast check(s) failed.`);
  process.exit(1);
}
console.log("\nAll contrast checks passed.");
