import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { GREEN } from "../../theme";

export type KilodeButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type KilodeButtonSize = "sm" | "md" | "lg";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: KilodeButtonVariant;
  size?: KilodeButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** Override primary fill (defaults to Kilode green) */
  accent?: string;
};

export function KilodeButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  style,
  textStyle,
  accent = GREEN,
}: Props) {
  const isDisabled = disabled || loading;
  const fill =
    variant === "primary"
      ? { backgroundColor: accent }
      : variant === "secondary"
        ? { backgroundColor: "#0F2A1A" }
        : variant === "outline"
          ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: accent }
          : variant === "danger"
            ? { backgroundColor: "#F43F5E" }
            : { backgroundColor: "transparent" };

  const textColor =
    variant === "primary" || variant === "danger"
      ? "#fff"
      : variant === "secondary" || variant === "outline" || variant === "ghost"
        ? accent
        : "#fff";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, sizeStyles[size], fill, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : accent} />
      ) : (
        <Text style={[styles.text, { color: textColor }, sizeText[size], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  disabled: { opacity: 0.45 },
  text: { fontWeight: "700" },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 12, paddingHorizontal: 16 },
  lg: { paddingVertical: 14, paddingHorizontal: 20 },
});

const sizeText = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 16 },
});
