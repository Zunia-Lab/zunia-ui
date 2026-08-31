# zunia-ui

> Shared design system for Zunia — website, dashboard, browser extension, and mobile.

[![License](https://img.shields.io/github/license/Zunia-Lab/zunia-ui)](LICENSE)
[![Website](https://img.shields.io/badge/website-zuniawallet.com-2050C4)](https://zuniawallet.com)

## Why this repo

One visual language across every surface. Brand tokens live once; React packages cover web and the extension. The mobile app is **Flutter** and mirrors the same tokens in Dart (`lib/theme/zunia_theme.dart`).

```
packages/
  tokens/           @zunialab/tokens       colors, type, space, themes (JS + CSS)
  tokens-flutter/   zunia_tokens           Flutter Dart tokens (use with zunia-mobile)
  ui/               @zunialab/ui           React — website, dashboard, extension
  ui-native/        @zunialab/ui-native    Optional React Native kit (not used by Flutter mobile)
```

## Packages

| Package | Used by |
|---------|---------|
| `@zunialab/tokens` | Web apps + extension |
| `@zunialab/ui` | `zunia-website`, `zunia-dashboard`, `zunia-extension` |
| `zunia_tokens` (`packages/tokens-flutter`) | `zunia-mobile` (Flutter) |
| `@zunialab/ui-native` | Optional RN only — **not** the mobile wallet stack |

### Shared components (same API on web + native)

| Component | Role |
|-----------|------|
| `ThemeProvider` | Light / dark shell |
| `Button` | primary / secondary / ghost |
| `TextField` | Labeled input |
| `Text` | title / body / label |
| `Address` | Truncated bech32 / 0x |
| `Amount` | Mono amount + denom |
| `ChainBadge` | Chain name + icon |
| `Surface` | Interaction panel |
| `Mark` | Brand mark image |

## Quick start

```bash
pnpm install
pnpm build
```

### Website / dashboard / extension

```tsx
import "@zunialab/ui/styles.css";
import {
  ThemeProvider,
  Button,
  Text,
  Address,
  Amount,
  ChainBadge,
  Surface,
  Mark,
} from "@zunialab/ui";

export function PortfolioHeader() {
  return (
    <ThemeProvider theme="dark">
      <Surface>
        <Mark size={28} />
        <Text variant="title">Portfolio</Text>
        <Address value="cosmos1abcdefghijklmnopqrstuvwxyz" />
        <Amount value="612.40" denom="ATOM" />
        <ChainBadge name="Cosmos Hub" iconUrl="https://..." />
        <Button variant="primary">Send</Button>
      </Surface>
    </ThemeProvider>
  );
}
```

Local workspace (before npm publish):

```json
{
  "dependencies": {
    "@zunialab/ui": "workspace:*"
  }
}
```

Or path dependency:

```json
{
  "dependencies": {
    "@zunialab/ui": "file:../zunia-ui/packages/ui"
  }
}
```

### Mobile (Expo)

```tsx
import {
  ThemeProvider,
  Button,
  Text,
  Address,
  Amount,
  Surface,
  Mark,
} from "@zunialab/ui-native";

export function HomeScreen() {
  return (
    <ThemeProvider theme="dark">
      <Surface>
        <Mark />
        <Text variant="title">zunia</Text>
        <Address value="cosmos1abcdefghijklmnopqrstuvwxyz" />
        <Amount value="120.5" denom="OSMO" />
        <Button>Connect</Button>
      </Surface>
    </ThemeProvider>
  );
}
```

Load **Space Grotesk** and **JetBrains Mono** in each app (Expo: `@expo-google-fonts/...`, web: Google Fonts / `next/font`).

## Tokens

```ts
import { colors, themes, space } from "@zunialab/tokens";
import { nativeTokens } from "@zunialab/tokens/native";
```

CSS:

```css
@import "@zunialab/tokens/css";
```

Brand reference: [zunia-brand](https://github.com/Zunia-Lab/zunia-brand).

## Design rules (enforced in components)

- Palette: Cobalt Ink `#10214F`, Paper `#F4F5F7`, Live Cobalt `#2050C4`, near-black `#101012`
- Type: Space Grotesk (UI) + JetBrains Mono (addresses, amounts, chain IDs)
- No decorative gradients or extra brand colors
- `Surface` only for interactive panels, not marketing card spam

## Related repositories

| Repo | Role |
|------|------|
| [zunia-website](https://github.com/Zunia-Lab/zunia-website) | Marketing |
| [zunia-dashboard](https://github.com/Zunia-Lab/zunia-dashboard) | Web portfolio |
| [zunia-extension](https://github.com/Zunia-Lab/zunia-extension) | Browser extension |
| [zunia-mobile](https://github.com/Zunia-Lab/zunia-mobile) | iOS / Android |
| [zunia-brand](https://github.com/Zunia-Lab/zunia-brand) | Logos & guidelines |

## Contributing

1. Change tokens first when adjusting color or type.
2. Mirror web API changes in `ui-native`.
3. Run `pnpm build` before opening a PR.

## License

Apache-2.0. © Zunia Lab.
