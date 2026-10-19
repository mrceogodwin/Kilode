import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  textColor: string;
  mutedColor: string;
  accentColor: string;
};

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  icon = "file-tray-outline",
  textColor,
  mutedColor,
  accentColor,
}: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <Ionicons name={icon} size={36} color={mutedColor} />
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: mutedColor }]}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={[styles.btn, { borderColor: accentColor }]} onPress={onAction}>
          <Text style={[styles.btnText, { color: accentColor }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 32, paddingVertical: 40, gap: 8 },
  title: { fontSize: 16, fontWeight: "700", textAlign: "center", marginTop: 8 },
  body: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  btn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  btnText: { fontSize: 14, fontWeight: "700" },
});
