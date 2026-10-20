import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { size?: "large" | "medium" | "small" };

/**
 * Official Kilode wordmark — clean white "Kilode!" + gold period.
 * Matches brand mark: bold condensed wordmark, gold accent on the bang period.
 * No overlapping decorative geometry (avoids entangled logo rendering).
 */
export function KilodeWordmark({ size = "medium" }: Props) {
  const scale = size === "large" ? 1 : size === "small" ? 0.5 : 0.72;
  const fontSize = 40 * scale;
  const gold = "#E5C158";

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Kilode"
      style={[styles.wrap, { height: fontSize * 1.2 }]}
    >
      <View style={styles.row}>
        <Text
          allowFontScaling={false}
          style={[styles.word, { fontSize, lineHeight: fontSize * 1.1 }]}
        >
          Kilode
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.bang, { fontSize: fontSize * 0.95, lineHeight: fontSize * 1.05 }]}
        >
          !
        </Text>
        <View
          style={{
            width: Math.max(5, fontSize * 0.15),
            height: Math.max(5, fontSize * 0.15),
            borderRadius: 99,
            backgroundColor: gold,
            marginLeft: 1,
            marginTop: fontSize * 0.58,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "flex-start" },
  word: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -2.2,
    includeFontPadding: false,
  },
  bang: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -1.2,
    includeFontPadding: false,
    marginLeft: -1,
  },
});
