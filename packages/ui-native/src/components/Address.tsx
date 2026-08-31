import { Text as RNText, StyleSheet, View } from "react-native";
import { nativeTokens } from "@zunialab/tokens/native";

const t = nativeTokens;

export interface AddressProps {
  value: string;
  keep?: number;
}

export function truncateAddress(value: string, keep = 6): string {
  if (value.length <= keep * 2 + 1) return value;
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
}

export function Address({ value, keep = 6 }: AddressProps) {
  return (
    <View>
      <RNText style={styles.text} numberOfLines={1}>
        {truncateAddress(value, keep)}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.themes.dark.fgMuted,
  },
});
