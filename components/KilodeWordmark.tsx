import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { size?: "large" | "medium" | "small" };

/**
 * Kilode wordmark — bold white "Kilode" with gold "!" accent (brand reference).
 */
export function KilodeWordmark({ size = "medium" }: Props) {
  const scale = size === "large" ? 1 : size === "small" ? 0.55 : 0.78;
  const fontSize = 42 * scale;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Kilode"
      style={[styles.row, { height: fontSize * 1.15 }]}
    >
      <Text allowFontScaling={false} style={[styles.word, { fontSize, lineHeight: fontSize * 1.1 }]}>
        Kilode
      </Text>
      <Text
        allowFontScaling={false}
        style={[styles.bang, { fontSize: fontSize * 0.95, lineHeight: fontSize * 1.05, marginLeft: -2 * scale }]}
      >
        !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
  word: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -2.2,
    includeFontPadding: false,
  },
  bang: {
    color: "#E5C158",
    fontWeight: "900",
    letterSpacing: -1.5,
    includeFontPadding: false,
  },
});
