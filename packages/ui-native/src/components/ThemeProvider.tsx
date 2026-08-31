import type { ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { nativeTokens } from "@zunialab/tokens/native";

const t = nativeTokens;

export type ThemeMode = "light" | "dark";

export interface ThemeProviderProps extends ViewProps {
  theme?: ThemeMode;
  children: ReactNode;
}

export function ThemeProvider({
  theme = "dark",
  children,
  style,
  ...rest
}: ThemeProviderProps) {
  const palette = t.themes[theme];
  return (
    <View
      style={[styles.root, { backgroundColor: palette.bg }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
