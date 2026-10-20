import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Source = "live" | "mock" | "error";

type Props = {
  source: Source;
  isDark: boolean;
  /** True when auth is guest or local-only (API did not issue a live token). */
  localOnly?: boolean;
};

/**
 * Honest network + session status for native.
 * Never hide offline/seed as if production API is healthy.
 */
export function ConnectionBanner({ source, isDark, localOnly }: Props) {
  // Prefer the strongest disclaimer available.
  if (source === "live" && !localOnly) return null;

  const offline = source === "error";
  const device = !!localOnly;

  let bg: string;
  let fg: string;
  let icon: keyof typeof Ionicons.glyphMap;
  let message: string;

  if (offline) {
    bg = isDark ? "#3F1D1D" : "#FEF2F2";
    fg = isDark ? "#FCA5A5" : "#991B1B";
    icon = "cloud-offline-outline";
    message = "Some Kilode services are unavailable · live actions may fail";
  } else if (device) {
    bg = isDark ? "#2A2419" : "#F1E9D8";
    fg = isDark ? "#E8D5A3" : "#7A5C1E";
    icon = "phone-portrait-outline";
    message = "Device session · account type saved on this phone only";
  } else {
    bg = isDark ? "#2A2419" : "#F1E9D8";
    fg = isDark ? "#E8D5A3" : "#7A5C1E";
    icon = "flask-outline";
    message = "Preview content · not live server data";
  }

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]} accessibilityRole="text">
      <Ionicons name={icon} size={14} color={fg} />
      <Text style={[styles.text, { color: fg }]}>{message}</Text>
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
