/**
 * Fail if required Flutter widget names are missing from ui-flutter.
 * Run: pnpm check:parity
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../packages/ui-flutter/lib");

const required = [
  "ZuniaButton",
  "ZuniaInput",
  "ZuniaSwitch",
  "ZuniaSegmented",
  "ZuniaPill",
  "ZuniaCallout",
  "ZuniaCard",
  "ZuniaKeyValueRow",
  "ZuniaSectionLabel",
  "ZuniaEmptyState",
  "ZuniaSkeleton",
  "ZuniaAmount",
  "ZuniaAddressChip",
  "ZuniaAssetRow",
  "ZuniaActivityRow",
  "ZuniaWalletChip",
  "ZuniaMnemonicGrid",
  "ZuniaSeedVerifier",
  "ZuniaPasscodeDots",
  "ZuniaSigningRequest",
  "ZuniaProgressTracker",
  "ZuniaSparkline",
  "ZuniaBarRow",
  "ZuniaTallyBar",
  "ZuniaScreenScaffold",
  "ZuniaTabBar",
  "ZuniaTheme",
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".dart")) out.push(p);
  }
  return out;
}

const blob = walk(root)
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const missing = required.filter((name) => !blob.includes(`class ${name}`));
if (missing.length) {
  console.error("Parity check failed. Missing Flutter widgets:");
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(`Parity OK (${required.length} required Flutter widgets present).`);
