# Component parity matrix

React (`@zunialab/ui`) and Flutter (`zunia_ui`) share one vocabulary.
`pnpm check:parity` fails when a listed React export is missing from Flutter.

| Component | React | Flutter |
|-----------|-------|---------|
| Button | Button | ZuniaButton |
| IconButton | IconButton | — |
| Input | Input | ZuniaInput |
| PasswordInput | PasswordInput | ZuniaInput(obscure) |
| Textarea | Textarea | — |
| Switch | Switch | ZuniaSwitch |
| Checkbox | Checkbox | — |
| Slider | Slider | — |
| Segmented | Segmented | ZuniaSegmented |
| Tabs | Tabs | — |
| Dialog / Sheet | Dialog / SheetContent | — |
| Select | Select | — |
| Tooltip | Tooltip | — |
| Popover | Popover | — |
| DropdownMenu | DropdownMenu | — |
| Progress | Progress | LinearProgressIndicator via tracker |
| Spinner | Spinner | — |
| Skeleton | Skeleton | ZuniaSkeleton |
| Pill | Pill | ZuniaPill |
| Callout | Callout | ZuniaCallout |
| Avatar | Avatar | CircleAvatar |
| Card | Card | ZuniaCard |
| Stat | Stat | — |
| KeyValueRow | KeyValueRow | ZuniaKeyValueRow |
| ListRow | ListRow | — |
| SectionLabel | SectionLabel | ZuniaSectionLabel |
| EmptyState | EmptyState | ZuniaEmptyState |
| Kbd | Kbd | — |
| Text | Text | Text + zuniaSans |
| Toast | Toast | — |
| Mark | Mark | — |
| Surface | Surface | ZuniaCard |
| AddressChip | AddressChip | ZuniaAddressChip |
| Amount | Amount | ZuniaAmount |
| TokenLogo | TokenLogo | — |
| ChainBadge | ChainBadge | — |
| ChainStack | ChainStack | — |
| AssetRow | AssetRow | ZuniaAssetRow |
| ValidatorRow | ValidatorRow | — |
| ActivityRow | ActivityRow | ZuniaActivityRow |

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
| NotificationRow | NotificationRow | — |
| WalletChip | WalletChip | ZuniaWalletChip |
| NetworkChip | NetworkChip | — |
| ConnectedBanner | ConnectedBanner | — |
| MnemonicGrid | MnemonicGrid | ZuniaMnemonicGrid |
| MnemonicInput | MnemonicInput (hardened) | — |
| NumericKeypad | NumericKeypad | — |
| PasswordStrengthMeter | PasswordStrengthMeter | — |
| ChainPicker | ChainPicker | — |
| SeedVerifier | SeedVerifier | ZuniaSeedVerifier |
| PasscodeDots | PasscodeDots | ZuniaPasscodeDots |
| QrFrame | QrFrame | — |
| SigningRequest | SigningRequest | ZuniaSigningRequest |
| MessageDecodeList | MessageDecodeList | — |
| FeeSummary | FeeSummary | — |
| IbcRouteDiagram | IbcRouteDiagram | — |
| SwapPair | SwapPair | — |
| VoteGrid | VoteGrid | — |
| ProposalCard | ProposalCard | — |
| ProgressTracker | ProgressTracker | ZuniaProgressTracker |
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
| Drawer | Drawer | — |
| AppShell | AppShell | — |
| ThemeProvider | ThemeProvider | ZuniaTheme |

## Required Flutter exports (parity check)

These names must appear in `packages/ui-flutter/lib/`:

```
ZuniaButton
ZuniaInput
ZuniaSwitch
ZuniaSegmented
ZuniaPill
ZuniaCallout
ZuniaCard
ZuniaKeyValueRow
ZuniaSectionLabel
ZuniaEmptyState
ZuniaSkeleton
ZuniaAmount
ZuniaAddressChip
ZuniaAssetRow
ZuniaActivityRow
ZuniaWalletChip
ZuniaMnemonicGrid
ZuniaSeedVerifier
ZuniaPasscodeDots
ZuniaSigningRequest
ZuniaProgressTracker
ZuniaSparkline
ZuniaBarRow
ZuniaTallyBar
ZuniaScreenScaffold
ZuniaTabBar
ZuniaTheme
```
