import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { size?: "large" | "medium" | "small" };

/**
 * Kilode signature wordmark.
 * The exclamation stem forms the K's upright; two clean diagonal strokes complete
 * the K. Closely kerned, upright letters give the rest of the name a connected
 * signature feel without bending the wordmark. Layered shadows add restrained
 * raised/crayon depth while remaining native, scalable text on iOS.
 */
export function KilodeWordmark({ size = "medium" }: Props) {
  const scale = size === "large" ? 1 : size === "small" ? 0.58 : 0.78;
  const fontSize = 39 * scale;
  const green = "#91C7A0";
  const orange = "#FF8A3D";
  const stemWidth = Math.max(2.8, fontSize * 0.105);
  const stemHeight = fontSize * 0.72;
  const diagonalWidth = fontSize * 0.43;
  const dotSize = Math.max(3.5, fontSize * 0.15);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Kilode"
      style={[styles.wrap, { height: fontSize * 1.15 }]}
    >
      <View style={[styles.row, { height: fontSize * 1.08 }]}>
        <View style={[styles.kMark, { width: fontSize * 0.68, height: fontSize * 1.03, marginRight: -fontSize * 0.02 }]}>
          {/* The exclamation stem is the K's upright stroke. */}
          <View style={[styles.stem, {
            left: fontSize * 0.06,
            top: fontSize * 0.03,
            width: stemWidth,
            height: stemHeight,
            backgroundColor: green,
            shadowColor: "#315D40",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.9,
            shadowRadius: 1.5,
            elevation: 2,
          }]} />
          <View style={[styles.diagonal, {
            left: fontSize * 0.18,
            top: fontSize * 0.27,
            width: diagonalWidth,
            height: stemWidth * 1.18,
            backgroundColor: green,
            transform: [{ rotate: "43deg" }],
          }]} />
          <View style={[styles.diagonal, {
            left: fontSize * 0.18,
            top: fontSize * 0.55,
            width: diagonalWidth,
            height: stemWidth * 1.18,
            backgroundColor: green,
            transform: [{ rotate: "-43deg" }],
          }]} />
          {/* Orange punctuation dot sits below the shared exclamation/K stem. */}
          <View style={[styles.dot, {
            left: fontSize * 0.015,
            top: fontSize * 0.81,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: orange,
            shadowColor: "#A8491C",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.85,
            shadowRadius: 1,
            elevation: 2,
          }]} />
        </View>
        <View style={[styles.wordStack, { minHeight: fontSize * 1.08 }]}>
          <Text allowFontScaling={false} numberOfLines={1} accessible={false}
            style={[styles.word, styles.wordDepth, { fontSize, lineHeight: fontSize * 1.08, letterSpacing: -fontSize * 0.105 }]}>
            ilode
          </Text>
          <Text allowFontScaling={false} numberOfLines={1} accessible={false}
            style={[styles.word, styles.wordHighlight, { fontSize, lineHeight: fontSize * 1.08, letterSpacing: -fontSize * 0.105 }]}>
            ilode
          </Text>
          <Text allowFontScaling={false} numberOfLines={1}
            style={[styles.word, { fontSize, lineHeight: fontSize * 1.08, letterSpacing: -fontSize * 0.105, textShadowColor: "#315D40", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 1.5 }]}>
            ilode
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center", overflow: "visible" },
  row: { flexDirection: "row", alignItems: "center", overflow: "visible" },
  kMark: { position: "relative", alignSelf: "center", overflow: "visible" },
  stem: { position: "absolute", borderRadius: 3 },
  diagonal: { position: "absolute", borderRadius: 3 },
  dot: { position: "absolute" },
  wordStack: { position: "relative", justifyContent: "center", overflow: "visible" },
  wordDepth: { position: "absolute", left: 0, top: 2, color: "#315D40" },
  wordHighlight: { position: "absolute", left: -0.5, top: -1, color: "#C4E6CB", opacity: 0.48 },
  word: {
    color: "#91C7A0",
    fontWeight: "900",
    includeFontPadding: false,
    textShadowOffset: { width: 0, height: 2 },
  },
});
