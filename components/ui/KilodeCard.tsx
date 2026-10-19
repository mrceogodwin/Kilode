import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
  isDark?: boolean;
};

export function KilodeCard({ children, style, onPress, padded = true, isDark = true }: Props) {
  const body = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "#141414" : "#FFFFFF",
          borderColor: isDark ? "#2A2A2A" : "#E4E4E7",
        },
        padded && styles.pad,
        style,
      ]}
    >
      {children}
    </View>
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pad: { padding: 14 },
});
