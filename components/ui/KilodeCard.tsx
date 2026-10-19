import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import { BORDER, RADIUS, WHITE } from "../../theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
};

export function KilodeCard({ children, style, onPress, padded = true }: Props) {
  const body = (
    <View style={[styles.card, padded && styles.pad, style]}>{children}</View>
  );
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
        {body}
      </TouchableOpacity>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WHITE,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    // iOS-like soft elevation without heavy shadow
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pad: { padding: 14 },
});
