import {
  colors,
  fonts,
  fontWeights,
  radii,
  space,
  themes,
  controlHeights,
  motion,
} from "./index";

/** Numeric / RN-friendly token map (legacy RN package; Flutter uses zunia_tokens). */
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
  xs: 6,
  sm: 9,
  md: 11,
  lg: 14,
  xl: 18,
  "2xl": 20,
  sheet: 30,
  full: 9999,
} as const;

export const nativeFonts = {
  sans: "SpaceGrotesk_500Medium",
  sansRegular: "SpaceGrotesk_400Regular",
  mono: "JetBrainsMono_400Regular",
} as const;

export const nativeThemes = {
  light: themes.light,
  dark: themes.dark,
} as const;

export const nativeTokens = {
  colors: nativeColors,
  space: nativeSpace,
  radii: nativeRadii,
  fonts: nativeFonts,
  fontWeights,
  controlHeights,
  motion,
  themes: nativeThemes,
  webFonts: fonts,
  webThemes: themes,
  webSpace: space,
  webRadii: radii,
} as const;

export default nativeTokens;
