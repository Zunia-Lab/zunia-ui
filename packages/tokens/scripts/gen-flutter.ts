/**
 * Generate packages/tokens-flutter Dart sources from @zunialab/tokens.
 * pnpm --filter @zunialab/tokens gen:flutter
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { colors, space, radii } from "../src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../tokens-flutter/lib/src");

function hexToFlutter(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length === 6) return `Color(0xFF${h.toUpperCase()})`;
  throw new Error(`Unsupported color: ${hex}`);
}

function pxToDouble(v: string): number {
  return Number(String(v).replace("px", "")) || 0;
}

mkdirSync(outDir, { recursive: true });

const colorLines = Object.entries(colors)
  .map(([k, v]) => `  static const Color ${k} = ${hexToFlutter(v)};`)
  .join("\n");

const spaceLines = Object.entries(space)
  .map(([k, v]) => `  static const double s${k} = ${pxToDouble(v)};`)
  .join("\n");

const radiiLines = Object.entries(radii)
  .map(([k, v]) => {
    const name = k === "none" ? "none_" : k;
    return `  static const double ${name} = ${pxToDouble(v)};`;
  })
  .join("\n");

writeFileSync(
  join(outDir, "colors.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)
import 'package:flutter/painting.dart';

/// Brand colors — generated from @zunialab/tokens
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

writeFileSync(
  join(outDir, "themes.dart"),
  `// GENERATED — do not edit. Run: pnpm gen:flutter (from @zunialab/tokens)
import 'package:flutter/painting.dart';
import 'colors.dart';

/// Theme surfaces — generated from @zunialab/tokens
abstract final class ZuniaThemeTokens {
  static const Color lightBg = ZuniaColors.paper;
  static const Color lightFg = ZuniaColors.black;
  static const Color lightAccent = ZuniaColors.cobalt;
  static const Color darkBg = ZuniaColors.ink;
  static const Color darkFg = ZuniaColors.paper;
  static const Color darkAccent = ZuniaColors.cobaltSoft;
  static const Color darkElevated = Color(0xFF15275C);
}
`,
);

writeFileSync(
  join(__dirname, "../../tokens-flutter/lib/zunia_tokens.dart"),
  `/// Design tokens for Flutter — generated from \`@zunialab/tokens\`.
///
/// \`@zunialab/ui-native\` is React Native only. Flutter mobile uses this package.
library;

export 'src/colors.dart';
export 'src/space.dart';
export 'src/radii.dart';
export 'src/themes.dart';
`,
);

console.log("Wrote tokens-flutter from @zunialab/tokens");
