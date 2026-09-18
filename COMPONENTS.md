# Component parity matrix

React (`@zunialab/ui`) and Flutter (`zunia_ui`) share one vocabulary.
`pnpm check:parity` fails when a Flutter widget on the required list below is
missing from `packages/ui-flutter/lib`.

A `—` in the Flutter column means the widget genuinely does not exist yet. It is
not a placeholder for "close enough": if a screen needs one, build it rather
than approximating it with a stock Material widget, because the stock widget
resolves Material's `ColorScheme` slots and not the Zunia semantic tokens.

`Avatar` used to read `CircleAvatar` here. `ZuniaAvatar` replaces it because the
cross-chain surfaces need an image that falls back to the seeded orb when a
registry icon is missing, blocked or slow — `CircleAvatar` falls back to nothing,
and two empty circles side by side is how a user picks the wrong chain.

| Component | React | Flutter |
|-----------|-------|---------|
| Button | Button | ZuniaButton |
| IconButton | IconButton | ZuniaIconButton |
| Input | Input | ZuniaInput |
| PasswordInput | PasswordInput | ZuniaInput(obscure) |
| Textarea | Textarea | — |
| Switch | Switch | ZuniaSwitch |
| Checkbox | Checkbox | ZuniaCheckbox |
| Slider | Slider | ZuniaSlider |
| Segmented | Segmented | ZuniaSegmented |
| Tabs | Tabs | — |
| Dialog / Sheet | Dialog / SheetContent | ZuniaDialog / ZuniaSheet |
| Select | Select | — |
| Tooltip | Tooltip | Tooltip via `tooltipTheme` |
| Popover | Popover | — |
| DropdownMenu | DropdownMenu | — |
| Progress | Progress | LinearProgressIndicator via `progressIndicatorTheme` |
| Spinner | Spinner | ZuniaSpinner |
| Skeleton | Skeleton | ZuniaSkeleton |
| Pill | Pill | ZuniaPill |
| Callout | Callout | ZuniaCallout |
| Avatar | Avatar | ZuniaAvatar |
| Card | Card | ZuniaCard |
| Stat | Stat | ZuniaStat |
| KeyValueRow | KeyValueRow | ZuniaKeyValueRow |
| ListRow | ListRow | ZuniaListRow |
| SectionLabel | SectionLabel | ZuniaSectionLabel |
| EmptyState | EmptyState | ZuniaEmptyState |
| Kbd | Kbd | — |
| Text | Text | Text + zuniaSans |
| Toast | Toast | ZuniaToast / showZuniaToast |
| Mark | Mark | — |
| Surface | Surface | ZuniaCard |
| AddressChip | AddressChip | ZuniaAddressChip |
| Amount | Amount | ZuniaAmount |
| TokenLogo | TokenLogo | ZuniaTokenLogo |
| ChainBadge | ChainBadge | ZuniaChainBadge |
| ChainStack | ChainStack | ZuniaChainStack |
| AssetRow | AssetRow | ZuniaAssetRow |
| ValidatorRow | ValidatorRow | — |
| ValidatorLogo | ValidatorLogo | ZuniaValidatorAvatar |
| ActivityRow | ActivityRow | ZuniaActivityRow |
| NotificationRow | NotificationRow | — |
| WalletChip | WalletChip | ZuniaWalletChip |
| WalletOrb | WalletOrb | ZuniaWalletAvatar |
| NetworkChip | NetworkChip | ZuniaNetworkChip |
| ConnectedBanner | ConnectedBanner | — |
| MnemonicGrid | MnemonicGrid | ZuniaMnemonicGrid |
| MnemonicInput | MnemonicInput (hardened) | — |
| NumericKeypad | NumericKeypad | — |
| PasswordStrengthMeter | PasswordStrengthMeter | — |
| SearchField | SearchField | ZuniaSearchField |
| ChainPicker | ChainPicker | — |
| SeedVerifier | SeedVerifier | ZuniaSeedVerifier |
| PasscodeDots | PasscodeDots | ZuniaPasscodeDots |
| StepProgress | StepProgress | ZuniaStepProgress |
| StepHeading | StepHeading | ZuniaStepHeading |
| NetworkOptionCard | NetworkOptionCard | ZuniaNetworkOptionCard |
| QrFrame | QrFrame | — |
| SigningRequest | SigningRequest | ZuniaSigningRequest |
| ApproveSession | ApproveSession | ZuniaApproveSession |
| TransferSent | TransferSent | ZuniaTransferSent |
| MessageDecodeList | MessageDecodeList | ZuniaMessageDecodeList |
| FeeSummary | FeeSummary | ZuniaFeeSummary |
| IbcRouteDiagram | IbcRouteDiagram | — |
| SwapPair | SwapPair | — |
| VoteGrid | VoteGrid | — |
| ProposalCard | ProposalCard | — |
| ProgressTracker | ProgressTracker | ZuniaProgressTracker |
| RoutePreview | RoutePreview | ZuniaRoutePreview |
| PacketTracker | PacketTracker | ZuniaPacketTracker |
| SwapQuotePanel | SwapQuotePanel | ZuniaSwapQuotePanel |
| NftMedia | NftMedia | ZuniaNftMedia |
| NftCard | NftCard | ZuniaNftCard |
| NftGrid | NftGrid | ZuniaNftGrid |
| NftDetail | NftDetail | ZuniaNftDetail |
| StakeSummary | StakeSummary | — |
| MissionRow | MissionRow | — |
| DappRow | DappRow | — |
| Sparkline | Sparkline | ZuniaSparkline |
| AreaChart | AreaChart | — |
| DonutChart | DonutChart | — |
| TallyBar | TallyBar | ZuniaTallyBar |
| BarRow | BarRow | ZuniaBarRow |
| PopupShell | PopupShell | — |
| ScreenScaffold | ScreenScaffold | ZuniaScreenScaffold |
| TabBar | TabBar | ZuniaTabBar |
| Drawer | Drawer | ZuniaDrawerPanel |
| AppShell | AppShell | — |
| ThemeProvider | ThemeProvider | ZuniaTheme |

Flutter-only, with no React counterpart today: `ZuniaQuickAction` (home tile),
`ZuniaDrawerRow`, `ZuniaFocusRing`.

### Activity kinds (shared format)

Every platform uses the same kind → icon + colour map (`activityPresentation` / `zuniaActivityPresentation`):

| Kind | Icon | Tone |
|------|------|------|
| `sent` | ↑ | danger (coral) |
| `received` | ↓ | success (green) |
| `ibc` | ⇄ | info (blue) |
| `swap` | ⇅ | accent |
| `staking` | ◆ | info |
| `claim` | ✦ | success |
| `governance` | ✓ | info |
| `other` | · | muted |
| failed overlay | ✕ | danger |

Pass `kind` into `ActivityRow` / `ZuniaActivityRow`. Indexer-only rows can use `inferActivityKind(summary)`.

### Cross-chain vocabulary (RoutePreview / PacketTracker / SwapQuotePanel)

These three share one presentation module — `src/interchain/interchain.ts` and
`lib/src/interchain/interchain.dart` — so the two languages cannot drift on what
a state is called or what it means. Every enum in it mirrors a string union in
`@zunialab/interchain` name for name, so an engine value can be passed straight
into a prop. `@zunialab/ui` does **not** depend on the engine; the unions are
kept identical by hand and each one names its counterpart in a doc comment.

Channel trust — `channelTrust()` / `zuniaChannelTrust()`:

| Level | When | Loud |
|-------|------|------|
| `verified` | an on-chain check said the channel is open | no |
| `unverified` | we have an id and nothing confirmed it | yes |
| `closed` | the chain reported a state other than `open` | yes |

`verified` is never inferred from the id looking plausible or from the route
having been used before. Alongside the level, the trust record carries a
`sourceLabel` for where the id came from ("You entered this" / "Discovered on
chain" / "Shipped default"), because a manually typed channel that has since
been verified is a different thing from one that has not.

Packet lifecycle — `packetStatusPresentation()` / `zuniaPacketStatusPresentation()`
covers `pending`, `relayed`, `received`, `acknowledged`, `timeout`, `failed` and
`unknown` (all from the engine's `PacketStatus`) plus `stalled`, which is a
display state folded in by `resolveHopStatus()` / `zuniaResolveHopStatus()`.

`stalled` is **not** computed from a clock in the UI. `@zunialab/interchain`
already decides it in `isHopStalled`, against a per-hop-kind threshold — four
times the expected duration, floored at five minutes — and publishes the answer
as `RouteHopTrace.stalled`. A flat timer here would disagree with the engine on
the same trace, and would be wrong more often, because a swap hop and a forward
hop do not take the same time. Pass the flag through.

Above the per-hop statuses sits one headline, `packetFundsSummary()` /
`zuniaPacketFundsSummary()`, which answers *where is the money and whose move is
it*:

| State | Reads as | User's next action |
|-------|----------|--------------------|
| `in-flight` | Moving | wait |
| `stalled` | Stuck — funds safe | wait, check back |
| `arrived` | Arrived | none |
| `returned` | Failed / timed out — funds returned | retry if they want |
| `recoverable` | Recoverable — action needed | claim it |
| `unknown` | Status unknown | retry the read |

`recoverable` outranks every other state, because it is the only one that stops
without the user. It comes from the engine's `RouteTrace.failure ===
"swap-delivery-failed"` — what `on_failed_delivery.local_recovery_addr` leaves
behind when a swap succeeds and the outbound delivery fails. The tracker shows
the recover control there and nowhere else. Do not replace this headline with a
percentage: a bar cannot say the difference between four of these six, and all
three products previously rendered a hardcoded one that read "almost there"
while funds sat in a contract.

When `recoveryReady` is false the panel still reports `recoverable` but says the
recover call cannot be built and disables the button, because the
crosschain-swaps contract address is deployment data supplied by host config and
never a constant. Failing closed with the reason on screen is the required
behaviour when it is unset.

**Mapping the engine onto these props.** The three widgets hold no chain logic;
they render facts `@zunialab/interchain` produces:

| Engine value | Prop |
|--------------|------|
| `RoutePlan.hops[i]` (`chainId`, `channelId`, `port`, `counterpartyChainId`, `kind`) | `RoutePreviewHop` — spread, then add names/icons |
| `ChannelRoute.source` | `RoutePreviewHop.channelSource` |
| `ChannelRoute.verifiedAt > 0`, or `IbcChannelCheck.ok` | `RoutePreviewHop.channelVerified` |
| `IbcChannelCheck.state` / `IbcChannelOption.state` | `RoutePreviewHop.channelState` |
| `RoutePlan.warnings`, `.estimatedDurationSeconds`, `.requiresPfm`, `.requiresIbcHooks` | same-named `RoutePreview` props |
| `RouteHopTrace` (`status`, `sequence`, `sendTxHash`, `receiveTxHash`, `error`) | `PacketTrackerHop` — spread, then add names |
| `RouteHopTrace.stalled` | `PacketTrackerHop.stalled` |
| `RouteTrace.failure` | `PacketTracker.failure` |
| `RouteTrace.recovery?.msg !== null` | `PacketTracker.recoveryReady` |
| `buildXcsRecoverMsg(...)` broadcast | `PacketTracker.onRecover` |
| `SwapQuote` (`priceImpact`, `poolFee`, `minReceived`, `route`) | `SwapQuoteView` — amounts formatted by the client |
| `NftToken` (`tokenId`, `name`, `collectionAddress`, `chainId`) | `NftCardItem`; `attributes` → `NftTrait[]` |
| `featureSupport(chain, "cosmwasm")` says no | `NftGrid.unsupportedReason` |

`sourceGasNote(chainName, { venueName })` / `zuniaSourceGasNote()` is the one
sentence all three clients say about fees: the user signs once on the source
chain and pays gas only there, in that chain's token; later hops and any
contract call are executed by relayers. Passing `venueName` adds the answer to
"do I need OSMO?", which is no.

`checkSlippage()` / `zuniaCheckSlippage()` validates against what the contract
accepts: `slippage_percentage` on the Osmosis swaprouter is a 0-100 percentage
and the contract divides by 100 itself, so `0.005` asks for 0.005% and reverts.

### NFT media is opt-in

`NftMedia`, `NftCard`, `NftGrid`, `NftDetail` and their `Zunia*` twins take
`loadMedia`, which defaults to **false**. Nothing is fetched until it is true.

This is a privacy control, not a performance one. `token_uri` and `image` point
at hosts chosen by whoever minted the token, so rendering them is a request from
the user's device to a stranger's server — which learns their IP address and,
because the request only happens for tokens they own, the shape of their
holdings. A hidden `<img>` or a built `Image` still issues that request, so the
element is not mounted at all while the switch is off.

When media is off the frame paints `nftPlaceholder()` / `zuniaNftPlaceholder()`:
a deterministic gradient plus a monogram from the token id, seeded with the same
FNV-1a `hashSeed` in both languages so a token looks identical in the extension
and on mobile. The placeholder is also the floor for a slow, blocked or
malformed image — no surface here ever shows a broken-image glyph.

`NFT_MEDIA_PRIVACY_NOTE` / `kZuniaNftMediaPrivacyNote` is the shared copy for
the switch. `NftGrid` takes `unsupportedReason`, kept separate from `error` and
from the empty state on purpose: "this chain has no CosmWasm, so there can be no
NFTs here" is a different sentence from "you hold none" and from "we could not
read", and only 118 of the 332 registry chains declare `cosmwasm`.

### Superseded by the cross-chain set

`IbcRouteDiagram` draws a single decorative from → to line with one channel
label and no trust state; use `RoutePreview` for anything a user will sign.
`ProgressTracker` is a generic done/current/pending stepper and stays right for
onboarding; use `PacketTracker` for a transfer, where "current" is not a status
and the funds' location is the point. `SwapPair` is the two-field input control
and pairs with `SwapQuotePanel` rather than competing with it. Nothing is
removed here — these still have call sites.

### Material ColorScheme mapping

`ZuniaTheme` maps the semantic tokens onto Material's `ColorScheme`. Material
resolves those slots by role, and every slot left null falls back to another
slot rather than to nothing — so a stock widget can paint a token in a place the
design never reviewed. The mapping and the measured contrast for each pair are
documented inline in `packages/ui-flutter/lib/src/theme/zunia_theme.dart`; change
a slot there rather than overriding colours at a call site.

Known gap: `outline` / `outlineVariant` measure 1.55:1 / 1.29:1 (light) and
1.90:1 / 1.46:1 (dark) against `surface`. Material asks 3:1 of `outline`. The
hairline is deliberate in this design and focus is carried by `focusRing`, but
closing the gap needs new values in `@zunialab/tokens`, not a change here.

## Required Flutter exports (parity check)

These names must appear in `packages/ui-flutter/lib/`. The list holds widgets
and the data classes a client has to construct to use one, because a widget
whose argument type vanished is as broken as a widget that vanished. Entries are
only ever added: removing one to make the gate green would hide a regression.

```
ZuniaButton
ZuniaIconButton
ZuniaInput
ZuniaSwitch
ZuniaCheckbox
ZuniaSlider
ZuniaSegmented
ZuniaPill
ZuniaCallout
ZuniaCard
ZuniaKeyValueRow
ZuniaListRow
ZuniaStat
ZuniaSectionLabel
ZuniaEmptyState
ZuniaSkeleton
ZuniaSpinner
ZuniaToast
ZuniaSheet
ZuniaDialog
ZuniaAmount
ZuniaAddressChip
ZuniaTokenLogo
ZuniaAssetRow
ZuniaActivityRow
ZuniaWalletChip
ZuniaWalletAvatar
ZuniaValidatorAvatar
ZuniaNetworkChip
ZuniaMnemonicGrid
ZuniaSeedVerifier
ZuniaPasscodeDots
ZuniaSearchField
ZuniaStepProgress
ZuniaStepHeading
ZuniaNetworkOptionCard
ZuniaSigningRequest
ZuniaApproveSession
ZuniaTransferSent
ZuniaMessageDecodeList
ZuniaProgressTracker
ZuniaSparkline
ZuniaBarRow
ZuniaTallyBar
ZuniaScreenScaffold
ZuniaTabBar
ZuniaDrawerPanel
ZuniaTheme
ZuniaAvatar
ZuniaChainBadge
ZuniaChainStack
ZuniaChainStackItem
ZuniaFeeSummary
ZuniaFeeRow
ZuniaRoutePreview
ZuniaRoutePreviewHop
ZuniaPacketTracker
ZuniaPacketTrackerHop
ZuniaSwapQuotePanel
ZuniaSwapQuoteView
ZuniaSwapPoolLeg
ZuniaNftMedia
ZuniaNftCard
ZuniaNftCardItem
ZuniaNftGrid
ZuniaNftDetail
ZuniaNftTrait
ZuniaChannelTrust
ZuniaPacketStatusPresentation
ZuniaPacketFundsSummary
ZuniaSlippageCheck
ZuniaToneStyle
```
