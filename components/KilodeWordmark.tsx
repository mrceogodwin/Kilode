import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { size?: "large" | "medium" | "small" };

/**
 * Official Kilode wordmark (brand asset):
 * Bold white "Kilode" with signature K figure + gold "!" and gold period dot.
 * Matches the transparent-bg logo mark used across Kilode.
 */
export function KilodeWordmark({ size = "medium" }: Props) {
  const scale = size === "large" ? 1 : size === "small" ? 0.52 : 0.72;
  const fontSize = 40 * scale;
  const gold = "#E5C158";

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Kilode"
      style={[styles.wrap, { height: fontSize * 1.25 }]}
    >
      <View style={styles.row}>
        {/* K block with figure mark */}
        <View style={{ position: "relative" }}>
          <Text
            allowFontScaling={false}
            style={[styles.word, { fontSize, lineHeight: fontSize * 1.08 }]}
          >
            K
          </Text>
          {/* Person figure integrated into K (head + torso) */}
          <View
            style={{
              position: "absolute",
              left: fontSize * 0.22,
              top: fontSize * 0.02,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: fontSize * 0.22,
                height: fontSize * 0.22,
                borderRadius: fontSize * 0.11,
                backgroundColor: "#fff",
              }}
            />
            <View
              style={{
                width: fontSize * 0.12,
                height: fontSize * 0.28,
                marginTop: -1,
                backgroundColor: "#fff",
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
              }}
            />
          </View>
        </View>
        <Text
          allowFontScaling={false}
          style={[styles.word, { fontSize, lineHeight: fontSize * 1.08, marginLeft: -fontSize * 0.06 }]}
        >
          ilode
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.bang, { fontSize: fontSize * 0.92, lineHeight: fontSize * 1.05, color: "#fff" }]}
        >
          !
        </Text>
        {/* Gold period dot under / beside bang — brand accent */}
        <View
          style={{
            width: Math.max(5, fontSize * 0.16),
            height: Math.max(5, fontSize * 0.16),
            borderRadius: 99,
            backgroundColor: gold,
            marginLeft: 1,
            marginTop: fontSize * 0.55,
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
    letterSpacing: -2.4,
    includeFontPadding: false,
  },
  bang: {
    fontWeight: "900",
    letterSpacing: -1.2,
    includeFontPadding: false,
    marginLeft: -2,
  },
});
