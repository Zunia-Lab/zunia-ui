/**
 * Contrast gate for the semantic themes and for tokens.css.
 * Run: pnpm --filter @zunialab/tokens check:contrast
 *
 * Every pair below is one the products actually paint. Thresholds follow WCAG
 * 2.1 AA: 4.5:1 for normal text (1.4.3) and 3:1 for large text and non-text UI
 * such as focus indicators and control boundaries (1.4.11).
 *
 * Pairs that cannot be fixed inside this package are listed under TRACKED with
 * the reason and the ratio measured today. They are printed on every run and
 * may only improve — they are not silently exempt.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { themes, type SemanticTheme } from "../src/index.ts";

type Rgba = { r: number; g: number; b: number; a: number };
type ThemeName = keyof typeof themes;

const AA_TEXT = 4.5;
/** Large text (>= 24px, or 18.66px bold) and non-text UI: 1.4.3 / 1.4.11. */
const AA_LARGE_OR_UI = 3;

function parseColor(input: string): Rgba {
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
function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
    a,
  };
}

function relLuminance(rgb: Rgba): number {
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
  if (bg.a < 1) bg = composite(bg, { ...parseColor(baseBg ?? "#ffffff"), a: 1 });
  const fgRaw = parseColor(fgInput);
  const fg = fgRaw.a < 1 ? composite(fgRaw, { ...bg, a: 1 }) : fgRaw;
  const L1 = relLuminance(fg);
  const L2 = relLuminance(bg);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

/**
 * Stops of a `linear-gradient(...)`, in order. A centred button label sits
 * mid-gradient, so the first stop alone says nothing about legibility.
 */
function gradientStops(css: string): string[] {
  const body = css.match(/linear-gradient\(([\s\S]+)\)\s*$/);
  if (!body) throw new Error(`Not a linear-gradient: ${css}`);
  const segments: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of body[1]!) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      segments.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  segments.push(current);
  // Drop the direction, then the optional trailing position on each stop.
  return segments
    .slice(1)
    .map((stop) => stop.trim().replace(/\s+[\d.]+%$/, ""));
}

type TokenKey = keyof SemanticTheme;
type StatusName = "danger" | "success" | "warning" | "info";

type Check = {
  name: string;
  fg: TokenKey;
  /** A flat color token, or a gradient token — gradients expand to one row per stop. */
  bg: TokenKey;
  min: number;
  /** Composite a translucent bg over this solid token first. */
  base?: TokenKey;
};

type Tracked = Check & {
  /** Ratio measured when the exclusion was recorded; it may only go up. */
  floor: Record<ThemeName, number>;
  reason: string;
};

function read(theme: SemanticTheme, key: TokenKey): string {
  return String(theme[key]);
}

const SURFACES = ["bg", "surface", "surfaceRaised"] as const;
const STATUSES: StatusName[] = ["danger", "success", "warning", "info"];

/** Status hue and its -fg both render as text, on the page and on their own fill. */
function statusChecks(name: StatusName): Check[] {
  const hue = name;
  const fg = `${name}Fg` as const;
  const fill = `${name}Fill` as const;
  const out: Check[] = [];
  for (const surface of SURFACES) {
    out.push({ name: `${hue} text on ${surface}`, fg: hue, bg: surface, min: AA_TEXT });
    out.push({ name: `${fg} text on ${surface}`, fg, bg: surface, min: AA_TEXT });
  }
  // Pill / Callout / activity row: the tint sits on the page or inside a card.
  for (const base of ["bg", "surfaceRaised"] as const) {
    out.push({
      name: `${hue} text on ${fill} over ${base}`,
      fg: hue,
      bg: fill,
      min: AA_TEXT,
      base,
    });
    out.push({
      name: `${fg} text on ${fill} over ${base}`,
      fg,
      bg: fill,
      min: AA_TEXT,
      base,
    });
  }
  // Status used as a solid background (badge, bar) with page ink on it.
  out.push({ name: `bg text on ${hue} fill`, fg: "bg", bg: hue, min: AA_TEXT });
  return out;
}

const CHECKS: Check[] = [
  // Body, headings, secondary and tertiary text on every surface they land on.
  ...SURFACES.flatMap((surface): Check[] => [
    { name: `fg on ${surface}`, fg: "fg", bg: surface, min: AA_TEXT },
    { name: `fgStrong on ${surface}`, fg: "fgStrong", bg: surface, min: AA_TEXT },
    { name: `fgMuted on ${surface}`, fg: "fgMuted", bg: surface, min: AA_TEXT },
    { name: `fgDim on ${surface}`, fg: "fgDim", bg: surface, min: AA_TEXT },
  ]),
  // Input placeholder: fgDim over the glass field fill, on page and in a card.
  {
    name: "fgDim on glass over bg (placeholder)",
    fg: "fgDim",
    bg: "glass",
    min: AA_TEXT,
    base: "bg",
  },
  {
    name: "fgDim on glass over surfaceRaised (placeholder)",
    fg: "fgDim",
    bg: "glass",
    min: AA_TEXT,
    base: "surfaceRaised",
  },
  // Primary CTA. The flat token is the TabBar active tab; the gradient is Button.
  { name: "accentFg on accent", fg: "accentFg", bg: "accent", min: AA_TEXT },
  { name: "accentFg on accentGradient", fg: "accentFg", bg: "accentGradient", min: AA_TEXT },
  // Focus indicator — non-text UI, and it must survive on every surface.
  ...SURFACES.map((surface): Check => ({
    name: `focusRing on ${surface}`,
    fg: "focusRing",
    bg: surface,
    min: AA_LARGE_OR_UI,
  })),
  // Accent panels: Callout info, staking hero, claimable rows.
  ...(["bg", "surfaceRaised"] as const).flatMap((base): Check[] => [
    { name: `fg on heroSoftGradient over ${base}`, fg: "fg", bg: "heroSoftGradient", min: AA_TEXT, base },
    { name: `fgMuted on heroSoftGradient over ${base}`, fg: "fgMuted", bg: "heroSoftGradient", min: AA_TEXT, base },
    { name: `fg on heroGradient over ${base}`, fg: "fg", bg: "heroGradient", min: AA_TEXT, base },
  ]),
  // Full-bleed mobile screen and bottom sheets.
  { name: "fg on screenGradient", fg: "fg", bg: "screenGradient", min: AA_TEXT, base: "bg" },
  { name: "fgMuted on screenGradient", fg: "fgMuted", bg: "screenGradient", min: AA_TEXT, base: "bg" },
  { name: "fg on sheetGradient", fg: "fg", bg: "sheetGradient", min: AA_TEXT, base: "bg" },
  { name: "fgMuted on sheetGradient", fg: "fgMuted", bg: "sheetGradient", min: AA_TEXT, base: "bg" },
  ...STATUSES.flatMap(statusChecks),
];

const TRACKED: Tracked[] = [
  {
    name: "accent as text on bg",
    fg: "accent",
    bg: "bg",
    min: AA_TEXT,
    floor: { dark: 5.1, light: 3.41 },
    reason:
      "brand red is the accent ramp's first stop, so it cannot be darkened without changing every accent fill; text use needs a separate --z-accent-text token adopted by GovernanceScreen/DashboardShell",
  },
  {
    name: "accent as text on surface",
    fg: "accent",
    bg: "surface",
    min: AA_TEXT,
    floor: { dark: 4.77, light: 3.88 },
    reason: "same as accent on bg",
  },
  ...SURFACES.map((surface): Tracked => ({
    name: `fgFaint on ${surface}`,
    fg: "fgFaint",
    bg: surface,
    min: AA_TEXT,
    floor: { dark: { bg: 3.45, surface: 3.22, surfaceRaised: 3.07 }[surface], light: { bg: 2.47, surface: 2.81, surfaceRaised: 2.67 }[surface] },
    reason:
      "raising fgFaint to 4.5:1 lands it within 6/255 of fgDim, i.e. the role stops existing; the call is whether fgFaint may carry text at all",
  })),
  {
    name: "line on surface (control boundary)",
    fg: "line",
    bg: "surface",
    min: AA_LARGE_OR_UI,
    base: "surface",
    floor: { dark: 1.45, light: 1.29 },
    reason:
      "--z-line is both the Input boundary (1.4.11 applies) and the decorative card hairline; splitting them needs a --z-control-line token adopted by Input.tsx",
  },
  {
    name: "lineStrong on surface (control boundary)",
    fg: "lineStrong",
    bg: "surface",
    min: AA_LARGE_OR_UI,
    base: "surface",
    floor: { dark: 1.9, light: 1.55 },
    reason: "same as line on surface; also draws Checkbox, Radio and Segmented edges",
  },
];

/** One printable row per check — gradients expand to one row per stop. */
type Row = { label: string; ratio: number; min: number };

function rows(theme: SemanticTheme, check: Check): Row[] {
  const bgValue = read(theme, check.bg);
  const fgValue = read(theme, check.fg);
  const base = check.base === undefined ? undefined : read(theme, check.base);
  if (!bgValue.startsWith("linear-gradient")) {
    return [{ label: check.name, ratio: contrastRatio(fgValue, bgValue, base), min: check.min }];
  }
  const stops = gradientStops(bgValue);
  return stops.map((stop, i) => ({
    label: `${check.name} (stop ${i + 1}/${stops.length}, ${stop})`,
    ratio: contrastRatio(fgValue, stop, base),
    min: check.min,
  }));
}

let failed = 0;
let trackedCount = 0;

for (const themeName of Object.keys(themes) as ThemeName[]) {
  const theme: SemanticTheme = themes[themeName];
  console.log(`\nTheme: ${themeName}`);
  for (const check of CHECKS) {
    for (const row of rows(theme, check)) {
      const ok = row.ratio >= row.min;
      if (!ok) failed += 1;
      console.log(
        `  [${ok ? "OK" : "FAIL"}] ${row.label}: ${row.ratio.toFixed(2)}:1 (need >= ${row.min})`,
      );
    }
  }
  for (const check of TRACKED) {
    for (const row of rows(theme, check)) {
      const floor = check.floor[themeName];
      const measured = Number(row.ratio.toFixed(2));
      if (measured >= row.min) {
        // The gap is closed in this theme; only the other theme still needs it.
        console.log(`  [OK] ${row.label}: ${row.ratio.toFixed(2)}:1 (need >= ${row.min})`);
        continue;
      }
      const regressed = measured < floor;
      if (regressed) failed += 1;
      else trackedCount += 1;
      console.log(
        `  [${regressed ? "REGRESSED" : "TRACKED"}] ${row.label}: ${row.ratio.toFixed(2)}:1 ` +
          `(want >= ${row.min}, floor ${floor.toFixed(2)}) — ${check.reason}`,
      );
    }
  }
}

/*
 * tokens.css is hand-maintained alongside src/index.ts. Everything above reads
 * index.ts, so without this the CSS the products actually load is never checked.
 */
const cssPath = join(dirname(fileURLToPath(import.meta.url)), "../src/tokens.css");
// Comments are stripped first: a selector named inside one would otherwise be
// found by indexOf below. The reduced-motion @media block overrides no colors.
const css = readFileSync(cssPath, "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("@media")[0]!;

function declarations(selector: string): Record<string, string> {
  const at = css.indexOf(selector);
  if (at < 0) throw new Error(`tokens.css: no ${selector} block`);
  const open = css.indexOf("{", at);
  const close = css.indexOf("\n}", open);
  const body = css.slice(open + 1, close);
  const out: Record<string, string> = {};
  for (const decl of body.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const name = decl.slice(0, i).trim();
    if (name.startsWith("--")) out[name] = decl.slice(i + 1).trim();
  }
  return out;
}

const root = declarations(":root");
const cssThemes: Record<ThemeName, Record<string, string>> = {
  dark: declarations('[data-theme="dark"]'),
  light: declarations('[data-theme="light"]'),
};

/** Resolve `var(--x)` chains against the block, then :root, and normalise. */
function resolve(value: string, block: Record<string, string>): string {
  let out = value;
  for (let i = 0; i < 8 && out.includes("var("); i += 1) {
    out = out.replace(/var\((--[\w-]+)\)/g, (whole, name: string) => block[name] ?? root[name] ?? whole);
  }
  return out.replace(/\s+/g, "").toLowerCase();
}

/** `heroSoftGradient` -> `--z-hero-soft-gradient`, `glass2` -> `--z-glass-2`. */
function cssName(key: string): string {
  return `--z-${key.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase()}`;
}

console.log("\ntokens.css vs src/index.ts");
let drift = 0;
for (const themeName of Object.keys(themes) as ThemeName[]) {
  const theme: SemanticTheme = themes[themeName];
  const block = cssThemes[themeName];
  for (const key of Object.keys(theme) as TokenKey[]) {
    const name = cssName(key);
    // A theme block only overrides what differs from :root, so an undeclared
    // token inherits :root — which must itself be the light theme.
    const declared = block[name] ?? root[name];
    if (declared === undefined) {
      drift += 1;
      console.log(`  [MISSING] ${themeName}: ${name} is declared nowhere`);
      continue;
    }
    const expected = resolve(read(theme, key), block);
    const actual = resolve(declared, block);
    if (expected !== actual) {
      drift += 1;
      console.log(`  [DRIFT] ${themeName}: ${name} is ${actual}, index.ts says ${expected}`);
    }
  }
}
// :root paints before ThemeProvider stamps data-theme, so it must be the light theme.
for (const [name, value] of Object.entries(cssThemes.light)) {
  const declared = root[name];
  if (declared === undefined) {
    drift += 1;
    console.log(`  [MISSING] :root does not declare ${name}`);
    continue;
  }
  if (resolve(declared, root) !== resolve(value, cssThemes.light)) {
    drift += 1;
    console.log(
      `  [DRIFT] :root ${name} is ${resolve(declared, root)}, [data-theme="light"] says ${resolve(value, cssThemes.light)}`,
    );
  }
}
if (drift === 0) console.log("  [OK] every semantic token matches, and :root is the light theme");

console.log(
  `\n${failed} failure(s), ${drift} token drift(s), ${trackedCount} tracked gap(s).`,
);
if (failed > 0 || drift > 0) process.exit(1);

// A tracked gap is still a pair that fails AA. It is exempt from the exit code
// because closing it needs a design decision rather than a token edit, not
// because it is acceptable. Saying "all checks passed" here would make twelve
// real failures invisible in CI, which is how they got shipped in the first
// place, so the summary states what is actually true.
if (trackedCount > 0) {
  console.log(
    `No blocking failures. ${trackedCount} pair(s) still fail AA and are tracked above,\n` +
      "each pinned to its current ratio so it cannot regress silently. They need a\n" +
      "design decision; see the reason on each row.",
  );
} else {
  console.log("All contrast checks passed, with no tracked gaps.");
}
