import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BORDER, TEXT } from "../../theme";

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
  isDark?: boolean;
};

export function KilodeIconButton({
  name,
  onPress,
  size = 22,
  color = TEXT,
  style,
  accessibilityLabel,
  isDark = true,
}: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || name}
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.btn, { backgroundColor: isDark ? "rgba(255,255,255,0.045)" : "rgba(130,105,48,0.055)", borderColor: isDark ? "rgba(212,175,55,0.16)" : "rgba(130,105,48,0.2)" }, style]}
    >
      <Ionicons name={name} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(212,175,55,0.16)",
  },
});
