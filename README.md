<p align="center">
  <img src="https://raw.githubusercontent.com/Zunia-Lab/zunia-brand/main/png/icons/app/zunia-icon-256.png" alt="Zunia" width="96" />
</p>

# zunia-ui

Design system for Zunia (web, extension, Flutter mobile) with the chevron brand accent.

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

Accent uses the chevron brand reds (`#FF1B0C` → `#FFC414`) from @zunialab/tokens. Danger / success / warning stay desaturated for security signals only.

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
