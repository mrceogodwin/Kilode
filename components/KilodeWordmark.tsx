import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { size?: "large" | "medium" | "small" };

/**
 * Kilode signature wordmark: bold white lettering with the exclamation stroke
 * tucked into the K instead of a detached punctuation mark.
 */
export function KilodeWordmark({ size = "medium" }: Props) {
  const scale = size === "large" ? 1 : size === "small" ? 0.62 : 0.82;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Kilode"
      style={[styles.wordmark, { height: 49 * scale, width: 190 * scale }]}
    >
      <Text
        allowFontScaling={false}
        style={[styles.word, { fontSize: 39 * scale, lineHeight: 46 * scale }]}
      >
        Kilode
      </Text>
      <View style={[styles.kSignature, { left: 1 * scale, top: -1 * scale }]}>
        <Text allowFontScaling={false} style={[styles.exclamation, { fontSize: 37 * scale, lineHeight: 42 * scale }]}>!</Text>
      </View>
      <View style={[styles.signatureSlash, { left: 8 * scale, top: 13 * scale, width: 21 * scale }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: { position: "relative", justifyContent: "center", overflow: "visible" },
  word: { color: "#FFFFFF", fontWeight: "900", letterSpacing: -2.8, includeFontPadding: false },
  kSignature: { position: "absolute", width: 19, height: 42, alignItems: "center", justifyContent: "flex-start" },
  exclamation: { color: "#FFFFFF", fontWeight: "900", letterSpacing: -2.4, includeFontPadding: false },
  signatureSlash: { position: "absolute", height: 3, borderRadius: 2, backgroundColor: "#FFFFFF", transform: [{ rotate: "-48deg" }] },
});
