import type { ReactNode } from "react";
import {
  TextInput,
  Text as RNText,
  StyleSheet,
  View,
  type TextInputProps,
} from "react-native";
import { nativeTokens } from "@zunialab/tokens/native";

const t = nativeTokens;

export interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.field}>
      {label ? <RNText style={styles.label}>{label}</RNText> : null}
      <TextInput
        placeholderTextColor={t.themes.dark.fgMuted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: t.themes.dark.fgMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: t.themes.dark.border,
    backgroundColor: t.themes.dark.bgElevated,
    color: t.themes.dark.fg,
    borderRadius: t.radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
});
