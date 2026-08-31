import type { ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { nativeTokens } from "@zunialab/tokens/native";

const t = nativeTokens;

export interface SurfaceProps extends ViewProps {
  children: ReactNode;
}

export function Surface({ children, style, ...rest }: SurfaceProps) {
  return (
    <View style={[styles.surface, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: t.themes.dark.bgElevated,
    borderWidth: 1,
    borderColor: t.themes.dark.border,
    borderRadius: t.radii.lg,
    padding: t.space[4],
  },
});
