# zunia-ui

Monochrome design system for Zunia (web, extension, Flutter mobile).

## Packages

| Package | Role |
|---------|------|
| `@zunialab/tokens` | Neutral ramp, semantic themes, motion, control metrics |
| `@zunialab/fonts` | Self-hosted Space Grotesk + JetBrains Mono (no CDN) |
| `@zunialab/ui` | React + Radix + Tailwind v4 + CVA |
| `zunia_tokens` | Generated Flutter tokens (`pnpm gen:flutter`) |
| `zunia_ui` | Flutter widgets (`packages/ui-flutter`) |
| `@zunialab/storybook` | State matrix + a11y (`apps/storybook`) |
| `@zunialab/ui-native` | **Retired** — see [docs/adr/0001-retire-ui-native.md](./docs/adr/0001-retire-ui-native.md) |

Accent is pure inversion (white on dark / black on light). Cobalt is not used in product UI. Danger / success / warning stay desaturated for security signals only.

## Commands

```bash
pnpm install
pnpm check:contrast
pnpm check:parity
pnpm typecheck
pnpm build
pnpm gen:flutter
pnpm storybook
```

Flutter gallery:

```bash
cd packages/ui-flutter/example && flutter run
```

See [COMPONENTS.md](./COMPONENTS.md) for React ↔ Flutter parity.

## License

Apache-2.0 (fonts: OFL).
