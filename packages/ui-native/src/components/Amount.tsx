import { Text as RNText, StyleSheet, View } from "react-native";
import { nativeTokens } from "@zunialab/tokens/native";

const t = nativeTokens;

export interface AmountProps {
  value: string | number;
  denom?: string;
}

export function Amount({ value, denom }: AmountProps) {
  return (
    <View style={styles.row}>
      <RNText style={styles.value}>{value}</RNText>
      {denom ? <RNText style={styles.denom}>{denom}</RNText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  value: {
    fontFamily: t.fonts.mono,
    fontSize: 15,
    fontWeight: "500",
    color: t.themes.dark.fg,
  },
  denom: {
    fontFamily: t.fonts.mono,
    fontSize: 13,
    color: t.themes.dark.fgMuted,
  },
});
