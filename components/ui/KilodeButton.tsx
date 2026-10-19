import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { BLUE, BLUE_PRESSED, RADIUS, SPACE } from "../../theme";

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
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : BLUE} />
      ) : (
        <Text style={[styles.text, textVariants[variant], sizeText[size], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  disabled: { opacity: 0.45 },
  text: { fontWeight: "700" },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 12, paddingHorizontal: SPACE.lg },
  lg: { paddingVertical: 14, paddingHorizontal: SPACE.xl },
});

const sizeText = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 16 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: BLUE },
  secondary: { backgroundColor: "#E7F0FE" },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: BLUE,
  },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: "#E11D48" },
});

const textVariants = StyleSheet.create({
  primary: { color: "#fff" },
  secondary: { color: BLUE },
  outline: { color: BLUE },
  ghost: { color: BLUE },
  danger: { color: "#fff" },
});
