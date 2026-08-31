/** Zunia brand tokens — single source of truth for all surfaces. */

export const colors = {
  ink: "#10214F",
  paper: "#F4F5F7",
  cobalt: "#2050C4",
  cobaltBright: "#3B6BFF",
  cobaltSoft: "#6FA8FF",
  black: "#101012",
  slate: "#4A5468",
  grey: "#6E7280",
  muted: "#A8BADE",
  hairline: "#C7D2EA",
  wash: "#E4E9F4",
  white: "#FFFFFF",
  danger: "#C23B3B",
  success: "#2F8F5B",
  warning: "#C48A1A",
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

export const radii = {
  none: "0",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "20px",
  full: "9999px",
} as const;

export const type = {
  display: { size: "40px", lineHeight: "1.1", tracking: "-0.04em", weight: fontWeights.medium },
  title: { size: "24px", lineHeight: "1.2", tracking: "-0.03em", weight: fontWeights.medium },
  body: { size: "15px", lineHeight: "1.55", tracking: "-0.01em", weight: fontWeights.regular },
  label: { size: "13px", lineHeight: "1.4", tracking: "0", weight: fontWeights.medium },
  caption: { size: "12px", lineHeight: "1.4", tracking: "0", weight: fontWeights.regular },
  mono: { size: "12px", lineHeight: "1.4", tracking: "0", weight: fontWeights.regular },
} as const;

export const shadows = {
  none: "none",
  soft: "0 8px 24px rgba(16, 33, 79, 0.08)",
} as const;

export const themes = {
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

export type ColorToken = keyof typeof colors;
export type ThemeName = keyof typeof themes;

export const tokens = {
  colors,
  fonts,
  fontWeights,
  space,
  radii,
  type,
  shadows,
  themes,
} as const;

export default tokens;
