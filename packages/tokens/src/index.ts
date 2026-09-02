/**
 * Zunia design tokens — product UI follows the chevrons brand kit
 * (orange-red accent, warm paper/ink surfaces).
 */

/** Neutral ramp n0 (near-black) → n1000 (white). Tuned for even steps. */
export const neutral = {
  n0: "#050506",
  n50: "#0A0A0C",
  n100: "#121214",
  n150: "#1A1A1E",
  n200: "#242428",
  n250: "#2E2E34",
  n300: "#3A3A42",
  n400: "#52525C",
  n500: "#6E6E78",
  n600: "#8A8A94",
  n700: "#A8A8B0",
  n800: "#C6C6CC",
  n850: "#D6D6DA",
  n900: "#E8E8EA",
  n950: "#F2F2F3",
  n1000: "#FFFFFF",
} as const;

/** Brand palette from zunia-chevrons / zunia-brand v2. */
export const brand = {
  ink: "#111111",
  paper: "#F1F0EE",
  paperWarm: "#FAF9F7",
  red: "#FF1B0C",
  vermilion: "#FF4E12",
  amber: "#FF8A17",
  gold: "#FFBE14",
  yellow: "#FFE05C",
  void: "#0B0A09",
  panel: "#161311",
  chrome: "#1C1814",
  /** @deprecated Alias for accent red — kept for older imports. */
  cobalt: "#FF1B0C",
  cobaltBright: "#FF4E12",
  cobaltSoft: "#FF8A17",
  cobaltViolet: "#FFBE14",
} as const;

/**
 * Status hues — security / P&L. Danger is cooler than brand red so the two
 * do not collide.
 */
export const status = {
  danger: "#E85A4A",
  dangerFg: "#F5C4BC",
  dangerLine: "rgba(232, 90, 74, 0.45)",
  dangerFill: "rgba(232, 90, 74, 0.12)",
  success: "#4ED8A0",
  successFg: "#B4EFD6",
  successLine: "rgba(78, 216, 160, 0.45)",
  successFill: "rgba(78, 216, 160, 0.12)",
  warning: "#E5A06B",
  warningFg: "#F0D4B6",
  warningLine: "rgba(229, 160, 107, 0.45)",
  warningFill: "rgba(229, 160, 107, 0.1)",
  info: "#FF8A17",
  infoFg: "#FFE0B8",
  infoLine: "rgba(255, 138, 23, 0.45)",
  infoFill: "rgba(255, 138, 23, 0.14)",
} as const;

/**
 * Gradients and glows from the chevrons kit. Actions carry the red→gold ramp.
 */
export const gradients = {
  /** Primary action fill. */
  accent: "linear-gradient(120deg, #FF1B0C 0%, #FF6A10 50%, #FFC414 100%)",
  /** Glow that sits under a primary action. */
  accentGlow: "0 12px 28px rgba(255, 45, 31, 0.28)",
  /** Default card / panel wash. */
  surfaceDark:
    "linear-gradient(180deg, rgba(241, 240, 238, 0.08), rgba(241, 240, 238, 0.028))",
  surfaceRaisedDark:
    "linear-gradient(180deg, rgba(241, 240, 238, 0.1), rgba(241, 240, 238, 0.035))",
  surfaceLight: "linear-gradient(180deg, #FFFFFF 0%, #FAF9F7 100%)",
  surfaceRaisedLight: "linear-gradient(180deg, #FFFFFF 0%, #F1F0EE 100%)",
  /** Elevated accent panel (claimable, in-flight bridge, staking hero). */
  hero: "linear-gradient(150deg, rgba(255, 27, 12, 0.28), rgba(255, 196, 20, 0.1))",
  /** Quieter accent panel for callouts and selected rows. */
  heroSoft:
    "linear-gradient(150deg, rgba(255, 27, 12, 0.2), rgba(255, 138, 23, 0.08))",
  /** Full-bleed mobile screen fill. */
  screenDark:
    "linear-gradient(176deg, #161311 0%, #0B0A09 46%, #050506 100%)",
  screenLight:
    "linear-gradient(176deg, #FFFFFF 0%, #FAF9F7 55%, #F1F0EE 100%)",
  /** Bottom sheets / elevated panels on mobile. */
  sheetDark:
    "linear-gradient(180deg, rgba(22, 19, 17, 0.97), rgba(11, 10, 9, 0.99))",
  sheetLight: "linear-gradient(180deg, #FFFFFF 0%, #F1F0EE 100%)",
  /** Ambient page bloom behind the app chrome. */
  bloom:
    "radial-gradient(circle, rgba(255, 27, 12, 0) 40%, rgba(255, 27, 12, 0.28) 52%, rgba(255, 106, 16, 0.5) 60%, rgba(212, 40, 0, 0.2) 70%, rgba(11, 10, 9, 0) 84%)",
} as const;

/** Flat color map for generators / Flutter (solid hex only). */
export const colors = {
  ...neutral,
  black: neutral.n0,
  white: neutral.n1000,
  ink: brand.ink,
  paper: brand.paper,
  danger: status.danger,
  success: status.success,
  warning: status.warning,
} as const;

export const fonts = {
  sans: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const fontWeights = {
  light: "300",
  regular: "400",
  medium: "500",
  bold: "700",
} as const;

export const space = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

/** Radii from mockup extraction: 9 control, 11 icon, 14 card, 18 sheet-card, 30 sheet, 999 pill. */
export const radii = {
  none: "0",
  xs: "6px",
  sm: "9px",
  md: "11px",
  lg: "14px",
  xl: "18px",
  "2xl": "20px",
  sheet: "30px",
  full: "9999px",
} as const;

export const controlHeights = {
  desktop: "30px",
  sm: "34px",
  md: "36px",
  popup: "42px",
  lg: "44px",
  mobileCta: "46px",
} as const;

export type SemanticTheme = {
  bg: string;
  /** Mid-tone under the mobile screen gradient (status bar / safe area). */
  screenMid: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  line: string;
  lineStrong: string;
  fg: string;
  /** One step under `fg` — numeric secondary, body on accent panels. */
  fgStrong: string;
  fgMuted: string;
  fgDim: string;
  fgFaint: string;
  accent: string;
  accentFg: string;
  accentGradient: string;
  accentGlow: string;
  /** Card / panel wash. */
  surfaceGradient: string;
  surfaceRaisedGradient: string;
  /** Elevated accent panel. */
  heroGradient: string;
  heroSoftGradient: string;
  /** Full-bleed phone screen background. */
  screenGradient: string;
  /** Bottom sheet / modal panel fill. */
  sheetGradient: string;
  /** Floating tab bar glass fill. */
  tabBarBg: string;
  /** Modal / drawer scrim. */
  scrim: string;
  /** Opacity multiplier for the ambient page bloom. */
  bloom: number;
  overlay: string;
  shadow: string;
  glass: string;
  glass2: string;
  stateHover: string;
  statePress: string;
  stateSelected: string;
  focusRing: string;
  focusRingInner: string;
  disabledOpacity: number;
  danger: string;
  dangerFg: string;
  dangerLine: string;
  dangerFill: string;
  success: string;
  successFg: string;
  successLine: string;
  successFill: string;
  warning: string;
  warningFg: string;
  warningLine: string;
  warningFill: string;
  info: string;
  infoFg: string;
  infoLine: string;
  infoFill: string;
};

export const themes = {
  dark: {
    bg: brand.void,
    screenMid: "#161311",
    surface: brand.panel,
    surfaceRaised: brand.chrome,
    surfaceSunken: "#0F0D0B",
    line: "rgba(241, 240, 238, 0.14)",
    lineStrong: "rgba(241, 240, 238, 0.22)",
    fg: brand.paper,
    fgStrong: "#E8E4DE",
    fgMuted: "#C9C6C1",
    fgDim: "#8A8A8A",
    fgFaint: "#666666",
    accent: brand.red,
    accentFg: neutral.n1000,
    accentGradient: gradients.accent,
    accentGlow: gradients.accentGlow,
    surfaceGradient: gradients.surfaceDark,
    surfaceRaisedGradient: gradients.surfaceRaisedDark,
    heroGradient: gradients.hero,
    heroSoftGradient: gradients.heroSoft,
    screenGradient: gradients.screenDark,
    sheetGradient: gradients.sheetDark,
    tabBarBg: "rgba(11, 10, 9, 0.55)",
    scrim: "rgba(11, 10, 9, 0.66)",
    bloom: 1,
    overlay: "rgba(11, 10, 9, 0.72)",
    shadow: "rgba(0, 0, 0, 0.55)",
    glass: "rgba(241, 240, 238, 0.045)",
    glass2: "rgba(241, 240, 238, 0.1)",
    stateHover: "rgba(255, 78, 18, 0.12)",
    statePress: "rgba(255, 78, 18, 0.2)",
    stateSelected: "rgba(255, 27, 12, 0.28)",
    focusRing: "rgba(255, 138, 23, 0.45)",
    focusRingInner: "transparent",
    disabledOpacity: 0.45,
    danger: status.danger,
    dangerFg: status.dangerFg,
    dangerLine: status.dangerLine,
    dangerFill: status.dangerFill,
    success: status.success,
    successFg: status.successFg,
    successLine: status.successLine,
    successFill: status.successFill,
    warning: status.warning,
    warningFg: status.warningFg,
    warningLine: status.warningLine,
    warningFill: status.warningFill,
    info: status.info,
    infoFg: status.infoFg,
    infoLine: status.infoLine,
    infoFill: status.infoFill,
  } satisfies SemanticTheme,
  light: {
    bg: brand.paper,
    screenMid: brand.paperWarm,
    surface: neutral.n1000,
    surfaceRaised: brand.paperWarm,
    surfaceSunken: "#E2E0DC",
    line: "rgba(17, 17, 17, 0.12)",
    lineStrong: "rgba(17, 17, 17, 0.2)",
    fg: brand.ink,
    fgStrong: "#1A1A1A",
    fgMuted: "#444444",
    fgDim: "#666666",
    fgFaint: "#9A9A9A",
    accent: brand.red,
    accentFg: neutral.n1000,
    accentGradient: gradients.accent,
    accentGlow: gradients.accentGlow,
    surfaceGradient: gradients.surfaceLight,
    surfaceRaisedGradient: gradients.surfaceRaisedLight,
    heroGradient:
      "linear-gradient(150deg, rgba(255, 27, 12, 0.14), rgba(255, 196, 20, 0.06))",
    heroSoftGradient:
      "linear-gradient(150deg, rgba(255, 27, 12, 0.08), rgba(255, 138, 23, 0.04))",
    screenGradient: gradients.screenLight,
    sheetGradient: gradients.sheetLight,
    tabBarBg: "rgba(255, 255, 255, 0.88)",
    scrim: "rgba(17, 17, 17, 0.3)",
    bloom: 0.25,
    overlay: "rgba(17, 17, 17, 0.4)",
    shadow: "rgba(17, 17, 17, 0.1)",
    glass: "rgba(17, 17, 17, 0.05)",
    glass2: "rgba(17, 17, 17, 0.09)",
    stateHover: "rgba(255, 27, 12, 0.08)",
    statePress: "rgba(255, 27, 12, 0.14)",
    stateSelected: "rgba(255, 27, 12, 0.12)",
    focusRing: "rgba(255, 27, 12, 0.4)",
    focusRingInner: "transparent",
    disabledOpacity: 0.45,
    danger: "#C4402F",
    dangerFg: "#8A3524",
    dangerLine: "rgba(196, 64, 47, 0.4)",
    dangerFill: "rgba(196, 64, 47, 0.08)",
    success: "#17845E",
    successFg: "#0D5B40",
    successLine: "rgba(23, 132, 94, 0.4)",
    successFill: "rgba(23, 132, 94, 0.08)",
    warning: "#B86A3C",
    warningFg: "#8A4A24",
    warningLine: "rgba(184, 106, 60, 0.4)",
    warningFill: "rgba(184, 106, 60, 0.08)",
    info: "#C45A0A",
    infoFg: "#5A3A18",
    infoLine: "rgba(196, 90, 10, 0.4)",
    infoFill: "rgba(196, 90, 10, 0.08)",
  } satisfies SemanticTheme,
} as const;

export const motion = {
  fast: "120ms",
  base: "180ms",
  slow: "240ms",
  easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
  reduced: "0ms",
} as const;

export const type = {
  display: {
    size: "34px",
    lineHeight: "1.05",
    tracking: "-0.04em",
    weight: fontWeights.medium,
    fontFamily: fonts.sans,
  },
  title: {
    size: "20px",
    lineHeight: "1.2",
    tracking: "-0.025em",
    weight: fontWeights.medium,
    fontFamily: fonts.sans,
  },
  heading: {
    size: "15px",
    lineHeight: "1.3",
    tracking: "-0.02em",
    weight: fontWeights.medium,
    fontFamily: fonts.sans,
  },
  body: {
    size: "14px",
    lineHeight: "1.55",
    tracking: "-0.01em",
    weight: fontWeights.regular,
    fontFamily: fonts.sans,
  },
  label: {
    size: "13px",
    lineHeight: "1.4",
    tracking: "0",
    weight: fontWeights.medium,
    fontFamily: fonts.sans,
  },
  caption: {
    size: "12px",
    lineHeight: "1.4",
    tracking: "0",
    weight: fontWeights.regular,
    fontFamily: fonts.sans,
  },
  /** Caps labels: JetBrains Mono 9.5 / +14–16% tracking */
  labelCaps: {
    size: "9.5px",
    lineHeight: "1.2",
    tracking: "0.14em",
    weight: fontWeights.medium,
    fontFamily: fonts.mono,
  },
  mono: {
    size: "12px",
    lineHeight: "1.4",
    tracking: "0",
    weight: fontWeights.regular,
    fontFamily: fonts.mono,
    fontVariantNumeric: "tabular-nums",
  },
  amount: {
    size: "32px",
    lineHeight: "1.05",
    tracking: "-0.04em",
    weight: fontWeights.medium,
    fontFamily: fonts.sans,
    fontVariantNumeric: "tabular-nums",
  },
  monoMicro: {
    size: "9px",
    lineHeight: "1.3",
    tracking: "0.12em",
    weight: fontWeights.regular,
    fontFamily: fonts.mono,
    fontVariantNumeric: "tabular-nums",
  },
} as const;

export const shadows = {
  none: "none",
  soft: "0 8px 24px var(--z-shadow)",
  sheet: "0 24px 48px var(--z-shadow)",
  toast: "0 16px 34px var(--z-shadow)",
} as const;

export const focus = {
  width: "1px",
  offset: "0px",
  innerWidth: "0px",
} as const;

export type ColorToken = keyof typeof colors;
export type ThemeName = keyof typeof themes;
export type NeutralToken = keyof typeof neutral;

export const tokens = {
  neutral,
  brand,
  status,
  colors,
  fonts,
  fontWeights,
  space,
  radii,
  controlHeights,
  type,
  shadows,
  motion,
  focus,
  themes,
} as const;

export default tokens;
