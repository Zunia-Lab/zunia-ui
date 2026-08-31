import { Image, StyleSheet, Text as RNText, View } from "react-native";
import { nativeTokens } from "@zunialab/tokens/native";

const t = nativeTokens;

export interface ChainBadgeProps {
  name: string;
  iconUrl?: string;
}

export function ChainBadge({ name, iconUrl }: ChainBadgeProps) {
  return (
    <View style={styles.badge}>
      {iconUrl ? (
        <Image source={{ uri: iconUrl }} style={styles.icon} />
      ) : (
        <View style={styles.icon} />
      )}
      <RNText style={styles.name}>{name}</RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: t.radii.full,
    borderWidth: 1,
    borderColor: t.themes.dark.border,
    backgroundColor: t.themes.dark.bgElevated,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: t.colors.wash,
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    color: t.themes.dark.fg,
  },
});
