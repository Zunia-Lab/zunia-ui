/**
 * Fail if required Flutter widget names are missing from ui-flutter.
 * Run: pnpm check:parity
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../packages/ui-flutter/lib");

// Keep in sync with the "Required Flutter exports" list in COMPONENTS.md.
// Entries are only ever added: removing one to make the gate green would
// hide a widget that disappeared from the Flutter package.
//
// The list also carries the data classes a client must construct to call one
// of these widgets (ZuniaRoutePreviewHop, ZuniaNftCardItem, …). A widget whose
// argument type was renamed away is as broken at the call site as a widget that
// was deleted, and only the argument type moves silently.
const required = [
  "ZuniaButton",
  "ZuniaIconButton",
  "ZuniaInput",
  "ZuniaSwitch",
  "ZuniaCheckbox",
  "ZuniaSlider",
  "ZuniaSegmented",
  "ZuniaPill",
  "ZuniaCallout",
  "ZuniaCard",
  "ZuniaKeyValueRow",
  "ZuniaListRow",
  "ZuniaStat",
  "ZuniaSectionLabel",
  "ZuniaEmptyState",
  "ZuniaSkeleton",
  "ZuniaSpinner",
  "ZuniaToast",
  "ZuniaSheet",
  "ZuniaDialog",
  "ZuniaAmount",
  "ZuniaAddressChip",
  "ZuniaTokenLogo",
  "ZuniaAssetRow",
  "ZuniaActivityRow",
  "ZuniaWalletChip",
  "ZuniaWalletAvatar",
  "ZuniaValidatorAvatar",
  "ZuniaNetworkChip",
  "ZuniaMnemonicGrid",
  "ZuniaSeedVerifier",
  "ZuniaPasscodeDots",
  "ZuniaSearchField",
  "ZuniaStepProgress",
  "ZuniaStepHeading",
  "ZuniaNetworkOptionCard",
  "ZuniaSigningRequest",
  "ZuniaApproveSession",
  "ZuniaTransferSent",
  "ZuniaMessageDecodeList",
  "ZuniaProgressTracker",
  "ZuniaSparkline",
  "ZuniaBarRow",
  "ZuniaTallyBar",
  "ZuniaScreenScaffold",
  "ZuniaTabBar",
  "ZuniaDrawerPanel",
  "ZuniaTheme",

  // Shared primitives the cross-chain and NFT surfaces are built from.
  "ZuniaAvatar",
  "ZuniaChainBadge",
  "ZuniaChainStack",
  "ZuniaChainStackItem",
  "ZuniaFeeSummary",
  "ZuniaFeeRow",

  // Cross-chain: route planning, packet tracking, swap quoting.
  "ZuniaRoutePreview",
  "ZuniaRoutePreviewHop",
  "ZuniaPacketTracker",
  "ZuniaPacketTrackerHop",
  "ZuniaSwapQuotePanel",
  "ZuniaSwapQuoteView",
  "ZuniaSwapPoolLeg",

  // NFTs. Media is opt-in; see COMPONENTS.md.
  "ZuniaNftMedia",
  "ZuniaNftCard",
  "ZuniaNftCardItem",
  "ZuniaNftGrid",
  "ZuniaNftDetail",
  "ZuniaNftTrait",

  // Presentation records shared by the three cross-chain widgets. These are the
  // Dart twins of the exported types in src/interchain/interchain.ts, and a
  // client reads their fields directly.
  "ZuniaChannelTrust",
  "ZuniaPacketStatusPresentation",
  "ZuniaPacketFundsSummary",
  "ZuniaSlippageCheck",
  "ZuniaToneStyle",
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
