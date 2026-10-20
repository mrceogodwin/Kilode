import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { size?: "large" | "medium" | "small" };

/**
 * Kilode wordmark for native iOS.
 * Thick white "Kilode!" with a heavy condensed K feel and gold period accent.
 * Pure text geometry (no broken overlapping figure) so it stays sharp on Retina.
 */
export function KilodeWordmark({ size = "medium" }: Props) {
  const scale = size === "large" ? 1 : size === "small" ? 0.48 : 0.7;
  const fontSize = 44 * scale;
  const gold = "#E5C158";

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Kilode"
      style={[styles.wrap, { height: fontSize * 1.15 }]}
    >
      <View style={styles.row}>
        {/* Heavy K block — signature weight */}
        <Text
          allowFontScaling={false}
          style={[
            styles.k,
            {
              fontSize: fontSize * 1.08,
              lineHeight: fontSize * 1.12,
              marginRight: -fontSize * 0.04,
            },
          ]}
        >
          K
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.rest, { fontSize, lineHeight: fontSize * 1.1 }]}
        >
          ilode
        </Text>
        <Text
          allowFontScaling={false}
          style={[
            styles.bang,
            {
              fontSize: fontSize * 1.05,
              lineHeight: fontSize * 1.1,
              marginLeft: -fontSize * 0.02,
            },
          ]}
        >
          !
        </Text>
        <View
          style={{
            width: Math.max(6, fontSize * 0.16),
            height: Math.max(6, fontSize * 0.16),
            borderRadius: 99,
            backgroundColor: gold,
            marginLeft: 2,
            marginTop: fontSize * 0.62,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "flex-start" },
  k: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -3,
    includeFontPadding: false,
  },
  rest: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -2.4,
    includeFontPadding: false,
  },
  bang: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -1.5,
    includeFontPadding: false,
  },
});
