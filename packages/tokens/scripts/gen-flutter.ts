/**
 * Generate packages/tokens-flutter Dart sources from @zunialab/tokens.
 * pnpm --filter @zunialab/tokens gen:flutter
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  colors,
  space,
  radii,
  themes,
  motion,
  type,
  controlHeights,
  fontWeights,
  focus,
  type SemanticTheme,
} from "../src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../tokens-flutter/lib/src");

function hexToFlutter(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length === 6) return `Color(0xFF${h.toUpperCase()})`;
  throw new Error(`Unsupported color: ${hex}`);
}

/** `rgba(r, g, b, a)` / `#rrggbb` -> `Color(0xAARRGGBB)`. */
function cssColorToFlutter(value: string): string {
  const css = value.trim();
  if (css.startsWith("#")) return hexToFlutter(css);

  const parts = css.match(/rgba?\(([^)]+)\)/);
  if (!parts) throw new Error(`Unsupported color: ${value}`);

  const [r, g, b, a = "1"] = parts[1].split(",").map((n) => Number(n.trim()));
  const channels = [Math.round(a * 255), r, g, b]
    .map((n) => n.toString(16).padStart(2, "0").toUpperCase())
    .join("");
  return `Color(0x${channels})`;
}

/** `linear-gradient(<angle>deg, <stop>, ...)` -> a Flutter `LinearGradient`. */
function linearGradientToFlutter(css: string): string {
  const body = css.match(/linear-gradient\(([\s\S]+)\)\s*$/);
  if (!body) throw new Error(`Unsupported gradient: ${css}`);

  // Split on top-level commas so `rgba(...)` stops survive intact.
  const segments: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of body[1]) {
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

  const [direction, ...rawStops] = segments.map((s) => s.trim());
  const degrees = Number(direction.replace("deg", ""));

  // CSS 0deg points up and rotates clockwise; Flutter alignments are cartesian
  // with y growing downward, so the unit vector is (sin, -cos).
  const radians = (degrees * Math.PI) / 180;
  const x = Number(Math.sin(radians).toFixed(4));
  const y = Number(-Math.cos(radians).toFixed(4));

  const parsed = rawStops.map((stop) => {
    const pct = stop.match(/\s+(\d+(?:\.\d+)?)%\s*$/);
    const color = cssColorToFlutter(stop.replace(/\s+\d+(?:\.\d+)?%\s*$/, ""));
    return {
      color,
      stop: pct ? Number(pct[1]) / 100 : null as number | null,
    };
  });

  const colors = parsed.map((p) => p.color).join(", ");
  const hasStops = parsed.every((p) => p.stop != null);
  const stopsLine = hasStops
    ? `\n    stops: [${parsed.map((p) => p.stop).join(", ")}],`
    : "";

  return `LinearGradient(
    begin: Alignment(${-x}, ${-y}),
    end: Alignment(${x}, ${y}),
    colors: [${colors}],${stopsLine}
  )`;
}

function pxToDouble(v: string): number {
  return Number(String(v).replace("px", "")) || 0;
}

function msToInt(v: string): number {
  return Number(String(v).replace("ms", "")) || 0;
}

mkdirSync(outDir, { recursive: true });

const solidColors = Object.fromEntries(
  Object.entries(colors).filter(([, v]) => typeof v === "string" && v.startsWith("#")),
) as Record<string, string>;

const colorLines = Object.entries(solidColors)
  .map(([k, v]) => `  static const Color ${k} = ${hexToFlutter(v)};`)
  .join("\n");

const spaceLines = Object.entries(space)
  .map(([k, v]) => `  static const double s${k} = ${pxToDouble(v)};`)
  .join("\n");

const radiiLines = Object.entries(radii)
  .map(([k, v]) => {
    const name = k === "none" ? "none_" : k === "2xl" ? "xxl" : k;
    return `  static const double ${name} = ${pxToDouble(v)};`;
  })
  .join("\n");

writeFileSync(
  join(outDir, "colors.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)
import 'package:flutter/painting.dart';

/// Brand / neutral colors — generated from @zunialab/tokens
abstract final class ZuniaColors {
${colorLines}
}
`,
);

writeFileSync(
  join(outDir, "space.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)

/// Spacing scale in logical pixels — generated from @zunialab/tokens
abstract final class ZuniaSpace {
${spaceLines}
}
`,
);

writeFileSync(
  join(outDir, "radii.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)

/// Border radii — generated from @zunialab/tokens
abstract final class ZuniaRadii {
${radiiLines}
}
`,
);

/** Semantic fields emitted as plain colors, in declaration order. */
const COLOR_FIELDS = [
  "bg",
  "screenMid",
  "surface",
  "surfaceRaised",
  "surfaceSunken",
  "line",
  "lineStrong",
  "fg",
  "fgStrong",
  "fgMuted",
  "fgDim",
  "fgFaint",
  "accent",
  "accentFg",
  "overlay",
  "shadow",
  "glass",
  "glass2",
  "tabBarBg",
  "scrim",
  "stateHover",
  "statePress",
  "stateSelected",
  "focusRing",
  "danger",
  "dangerFg",
  "dangerLine",
  "dangerFill",
  "success",
  "successFg",
  "successLine",
  "successFill",
  "warning",
  "warningFg",
  "warningLine",
  "warningFill",
  "info",
  "infoFg",
  "infoLine",
  "infoFill",
] as const satisfies readonly (keyof SemanticTheme)[];

/** Semantic fields emitted as Flutter LinearGradients. */
const GRADIENT_FIELDS = [
  "accentGradient",
  "surfaceGradient",
  "surfaceRaisedGradient",
  "heroGradient",
  "heroSoftGradient",
  "screenGradient",
  "sheetGradient",
] as const satisfies readonly (keyof SemanticTheme)[];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function emitThemeBlock(name: "dark" | "light"): string {
  const theme = themes[name];
  const lines = COLOR_FIELDS.map(
    (field) =>
      `  static const Color ${name}${capitalize(field)} = ${cssColorToFlutter(theme[field])};`,
  );

  lines.push(
    `  static const double ${name}DisabledOpacity = ${theme.disabledOpacity};`,
    `  static const double ${name}Bloom = ${theme.bloom};`,
    `  static const Color ${name}Elevated = ${cssColorToFlutter(theme.surfaceRaised)};`,
  );

  for (const field of GRADIENT_FIELDS) {
    lines.push(
      `  static const Gradient ${name}${capitalize(field)} = ${linearGradientToFlutter(theme[field])};`,
    );
  }

  return lines.join("\n") + "\n";
}

const darkBlock = emitThemeBlock("dark");
const lightBlock = emitThemeBlock("light");

writeFileSync(
  join(outDir, "themes.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)
import 'package:flutter/painting.dart';

/// Theme surfaces — generated from @zunialab/tokens (monochrome)
abstract final class ZuniaThemeTokens {
${lightBlock}
${darkBlock}
}
`,
);

const semanticFields = COLOR_FIELDS.map(
  (field) => `  final Color ${field};`,
).join("\n");
const semanticParams = COLOR_FIELDS.map(
  (field) => `    required this.${field},`,
).join("\n");
const semanticFor = (name: "dark" | "light") =>
  COLOR_FIELDS.map(
    (field) => `    ${field}: ZuniaThemeTokens.${name}${capitalize(field)},`,
  ).join("\n");
const gradientFields = GRADIENT_FIELDS.map(
  (field) => `  final Gradient ${field};`,
).join("\n");
const gradientParams = GRADIENT_FIELDS.map(
  (field) => `    required this.${field},`,
).join("\n");
const gradientFor = (name: "dark" | "light") =>
  GRADIENT_FIELDS.map(
    (field) => `    ${field}: ZuniaThemeTokens.${name}${capitalize(field)},`,
  ).join("\n");

writeFileSync(
  join(outDir, "semantic.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)
import 'package:flutter/painting.dart';
import 'themes.dart';

/// Resolved semantic colors for a brightness.
class ZuniaSemantic {
  const ZuniaSemantic({
${semanticParams}
${gradientParams}
    required this.disabledOpacity,
    required this.bloom,
  });

${semanticFields}
${gradientFields}
  final double disabledOpacity;
  final double bloom;

  static const dark = ZuniaSemantic(
${semanticFor("dark")}
${gradientFor("dark")}
    disabledOpacity: ZuniaThemeTokens.darkDisabledOpacity,
    bloom: ZuniaThemeTokens.darkBloom,
  );

  static const light = ZuniaSemantic(
${semanticFor("light")}
${gradientFor("light")}
    disabledOpacity: ZuniaThemeTokens.lightDisabledOpacity,
    bloom: ZuniaThemeTokens.lightBloom,
  );
}
`,
);

writeFileSync(
  join(outDir, "motion.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)
import 'package:flutter/material.dart';

/// Motion tokens — generated from @zunialab/tokens
abstract final class ZuniaMotion {
  static const Duration fast = Duration(milliseconds: ${msToInt(motion.fast)});
  static const Duration base = Duration(milliseconds: ${msToInt(motion.base)});
  static const Duration slow = Duration(milliseconds: ${msToInt(motion.slow)});
  static const Curve easing = Cubic(0.2, 0.7, 0.2, 1.0);
}
`,
);

writeFileSync(
  join(outDir, "type.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)
import 'package:flutter/painting.dart';

/// Typography roles — sizes in logical pixels
abstract final class ZuniaType {
  static const double display = ${pxToDouble(type.display.size)};
  static const double title = ${pxToDouble(type.title.size)};
  static const double heading = ${pxToDouble(type.heading.size)};
  static const double body = ${pxToDouble(type.body.size)};
  static const double label = ${pxToDouble(type.label.size)};
  static const double caption = ${pxToDouble(type.caption.size)};
  static const double labelCaps = ${pxToDouble(type.labelCaps.size)};
  static const double mono = ${pxToDouble(type.mono.size)};
  static const double amount = ${pxToDouble(type.amount.size)};
  static const double monoMicro = ${pxToDouble(type.monoMicro.size)};
  static const FontWeight medium = FontWeight.w${fontWeights.medium};
  static const FontWeight regular = FontWeight.w${fontWeights.regular};
}
`,
);

writeFileSync(
  join(outDir, "controls.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)

/// Control metrics — generated from @zunialab/tokens
abstract final class ZuniaControls {
  static const double heightDesktop = ${pxToDouble(controlHeights.desktop)};
  static const double heightSm = ${pxToDouble(controlHeights.sm)};
  static const double heightMd = ${pxToDouble(controlHeights.md)};
  static const double heightPopup = ${pxToDouble(controlHeights.popup)};
  static const double heightLg = ${pxToDouble(controlHeights.lg)};
  static const double heightMobileCta = ${pxToDouble(controlHeights.mobileCta)};
  static const double focusWidth = ${pxToDouble(focus.width)};
  static const double focusOffset = ${pxToDouble(focus.offset)};
}
`,
);

writeFileSync(
  join(__dirname, "../../tokens-flutter/lib/zunia_tokens.dart"),
  `/// Design tokens for Flutter — generated from \`@zunialab/tokens\`.
library;

export 'src/colors.dart';
export 'src/space.dart';
export 'src/radii.dart';
export 'src/themes.dart';
export 'src/semantic.dart';
export 'src/motion.dart';
export 'src/type.dart';
export 'src/controls.dart';
`,
);

console.log("Wrote tokens-flutter from @zunialab/tokens (monochrome semantic)");
