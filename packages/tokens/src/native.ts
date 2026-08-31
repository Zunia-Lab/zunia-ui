import { colors, fonts, fontWeights, radii, space, themes } from "./index";

/** Numeric / RN-friendly token map for React Native StyleSheet. */
export const nativeColors = { ...colors };

export const nativeSpace = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const nativeRadii = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const nativeFonts = {
  sans: "SpaceGrotesk_500Medium",
  sansRegular: "SpaceGrotesk_400Regular",
  mono: "JetBrainsMono_400Regular",
} as const;

export const nativeThemes = {
  light: {
    bg: colors.paper,
    bgElevated: colors.white,
    fg: colors.black,
    fgMuted: colors.slate,
    accent: colors.cobalt,
    border: colors.hairline,
  },
  dark: {
    bg: colors.ink,
    bgElevated: "#15275C",
    fg: colors.paper,
    fgMuted: colors.muted,
    accent: colors.cobaltSoft,
    border: "rgba(244, 245, 247, 0.12)",
  },
} as const;

export const nativeTokens = {
  colors: nativeColors,
  space: nativeSpace,
  radii: nativeRadii,
  fonts: nativeFonts,
  fontWeights,
  themes: nativeThemes,
  webFonts: fonts,
  webThemes: themes,
} as const;

export default nativeTokens;
