import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BLUE, BLUE_SOFT, RADIUS } from "../../theme";

type Props = {
  label: string;
  tone?: "blue" | "neutral" | "success" | "danger";
};

const tones = {
  blue: { bg: BLUE_SOFT, fg: BLUE },
  neutral: { bg: "#F1F5F9", fg: "#64748B" },
  success: { bg: "#DCFCE7", fg: "#16A34A" },
  danger: { bg: "#FFE4E6", fg: "#E11D48" },
};

export function KilodeBadge({ label, tone = "blue" }: Props) {
  const t = tones[tone];
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: "flex-start",
  },
  text: { fontSize: 11, fontWeight: "700" },
});
