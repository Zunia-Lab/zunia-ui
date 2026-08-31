import type { ReactNode } from "react";
import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from "react-native";
import { nativeTokens } from "@zunialab/tokens/native";

const t = nativeTokens;

export type TextVariant = "title" | "body" | "label";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  children: ReactNode;
}

export function Text({ variant = "body", style, children, ...rest }: TextProps) {
  return (
    <RNText style={[styles.base, styles[variant], style]} {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: { color: t.themes.dark.fg },
  title: {
    fontSize: 24,
    fontWeight: "500",
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: t.themes.dark.fgMuted,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
});
