import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Source = "live" | "mock" | "error";

type Props = {
  source: Source;
  isDark: boolean;
};

/**
 * Honest network status — never hide offline/seed as if production API is healthy.
 * Live = no banner. mock/error = visible disclaimer.
 */
export function ConnectionBanner({ source, isDark }: Props) {
  if (source === "live") return null;

  const offline = source === "error";
  const bg = offline
    ? isDark
      ? "#3F1D1D"
      : "#FEF2F2"
    : isDark
      ? "#2A2419"
      : "#F1E9D8";
  const fg = offline
    ? isDark
      ? "#FCA5A5"
      : "#991B1B"
    : isDark
      ? "#E8D5A3"
      : "#7A5C1E";

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]} accessibilityRole="text">
      <Ionicons
        name={offline ? "cloud-offline-outline" : "flask-outline"}
        size={14}
        color={fg}
      />
      <Text style={[styles.text, { color: fg }]}>
        {offline
          ? "API offline · seed layout only · actions stay local"
          : "Demo seed data · not live server content"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: { fontSize: 12, fontWeight: "600", flex: 1 },
});
