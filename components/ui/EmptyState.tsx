import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  body: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({
  title,
  body,
  textColor = "#F5F5F5",
  mutedColor = "#9A9A9E",
  accentColor = "#D4AF37",
  icon = "albums-outline",
}: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={[styles.iconWrap, { borderColor: accentColor + "66", backgroundColor: accentColor + "14" }]}>
        <Ionicons name={icon} size={24} color={accentColor} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.body, { color: mutedColor }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 30,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 5,
    maxWidth: 280,
  },
});
