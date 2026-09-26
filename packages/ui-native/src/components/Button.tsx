import type { ReactNode } from "react";
import {
  Pressable,
  Text as RNText,
  StyleSheet,
  type PressableProps,
} from "react-native";
import { nativeTokens } from "@zunialab/tokens/native";

const t = nativeTokens;

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.base,
        styles[variant],
        size === "sm" && styles.sm,
        size === "lg" && styles.lg,
        disabled && styles.disabled,
        state.pressed && !disabled && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <RNText style={[styles.label, variant !== "primary" && styles.onSurfaceLabel]}>
        {children}
      </RNText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: t.radii.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: "#A81818" },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: t.colors.hairline,
  },
  ghost: { backgroundColor: "transparent", paddingHorizontal: 12 },
  sm: { paddingVertical: 8, paddingHorizontal: 14 },
  lg: { paddingVertical: 14, paddingHorizontal: 24 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.88 },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  onSurfaceLabel: { color: t.colors.ink },
});
